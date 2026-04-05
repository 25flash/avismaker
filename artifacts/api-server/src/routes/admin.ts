import { Router, type IRouter } from "express";
import { eq, count, gte, sql } from "drizzle-orm";
import { db, usersTable, cardsTable, scanLogsTable, businessProfilesTable, supportMessagesTable } from "@workspace/db";
import { requireAdmin, type AuthRequest } from "../lib/auth";
import {
  ListAdminUsersQueryParams,
  UpdateAdminUserParams,
  UpdateAdminUserBody,
  CreateAdminCardBody,
  ListAdminScanLogsQueryParams,
  ReplyToSupportMessageParams,
  ReplyToSupportMessageBody,
} from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

function generateCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function formatCard(card: typeof cardsTable.$inferSelect) {
  return {
    id: card.id,
    code: card.code,
    status: card.status,
    platform: card.platform,
    targetUrl: card.targetUrl,
    businessProfileId: card.businessProfileId,
    ownerId: card.ownerId,
    scanCount: card.scanCount,
    smartReviewEnabled: card.smartReviewEnabled,
    negativeAlertEnabled: card.negativeAlertEnabled,
    createdAt: card.createdAt.toISOString(),
    activatedAt: card.activatedAt?.toISOString() ?? null,
  };
}

router.get("/admin/stats", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const [totalUsersResult] = await db.select({ count: count() }).from(usersTable);
  const [totalCardsResult] = await db.select({ count: count() }).from(cardsTable);

  const activeCards = await db.select({ count: count() }).from(cardsTable).where(eq(cardsTable.status, "active"));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [scansTodayResult] = await db.select({ count: count() }).from(scanLogsTable).where(gte(scanLogsTable.timestamp, today));

  const [totalScansResult] = await db.select({ count: count() }).from(scanLogsTable);

  const users = await db.select({ plan: usersTable.plan }).from(usersTable);
  const usersByPlan = { free: 0, premium: 0, pro: 0, business: 0 };
  let revenueMonthly = 0;
  const priceMap: Record<string, number> = { free: 0, premium: 19, pro: 39, business: 79 };

  for (const user of users) {
    const plan = user.plan as keyof typeof usersByPlan;
    if (plan in usersByPlan) {
      usersByPlan[plan]++;
      revenueMonthly += priceMap[plan] ?? 0;
    }
  }

  const [totalProfilesResult] = await db.select({ count: count() }).from(businessProfilesTable);

  res.json({
    totalUsers: Number(totalUsersResult?.count ?? 0),
    totalCards: Number(totalCardsResult?.count ?? 0),
    activeCards: Number(activeCards[0]?.count ?? 0),
    totalScans: Number(totalScansResult?.count ?? 0),
    scansToday: Number(scansTodayResult?.count ?? 0),
    totalProfiles: Number(totalProfilesResult?.count ?? 0),
    planBreakdown: usersByPlan,
    revenueMonthly,
  });
});

router.get("/admin/users", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = ListAdminUsersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let users = await db.select().from(usersTable);

  if (params.data.plan) {
    users = users.filter(u => u.plan === params.data.plan);
  }
  if (params.data.search) {
    const search = params.data.search.toLowerCase();
    users = users.filter(u => u.email.toLowerCase().includes(search) || u.name.toLowerCase().includes(search));
  }

  const results = await Promise.all(users.map(async user => {
    const [cardCount] = await db.select({ count: count() }).from(cardsTable).where(eq(cardsTable.ownerId, user.id));
    const userCards = await db.select({ id: cardsTable.id }).from(cardsTable).where(eq(cardsTable.ownerId, user.id));
    let totalScans = 0;
    for (const card of userCards) {
      const [scanCount] = await db.select({ count: count() }).from(scanLogsTable).where(eq(scanLogsTable.cardId, card.id));
      totalScans += Number(scanCount?.count ?? 0);
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
      cardCount: Number(cardCount?.count ?? 0),
      totalScans,
      createdAt: user.createdAt.toISOString(),
    };
  }));

  res.json(results);
});

router.patch("/admin/users/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateAdminUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAdminUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, string> = {};
  if (parsed.data.role) updates.role = parsed.data.role;
  if (parsed.data.plan) updates.plan = parsed.data.plan;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [cardCount] = await db.select({ count: count() }).from(cardsTable).where(eq(cardsTable.ownerId, user.id));
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    plan: user.plan,
    cardCount: Number(cardCount?.count ?? 0),
    totalScans: 0,
    createdAt: user.createdAt.toISOString(),
  });
});

router.get("/admin/cards", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const cards = await db.select().from(cardsTable);
  res.json(cards.map(formatCard));
});

router.post("/admin/cards", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateAdminCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const cards = [];
  for (let i = 0; i < Math.min(parsed.data.count, 100); i++) {
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const [existing] = await db.select().from(cardsTable).where(eq(cardsTable.code, code));
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const [card] = await db.insert(cardsTable).values({
      code,
      status: "inactive",
      platform: parsed.data.platform ?? null,
    }).returning();
    cards.push(card);
  }

  res.status(201).json(cards.map(formatCard));
});

router.get("/admin/scan-logs", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = ListAdminScanLogsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const allCards = await db.select({ id: cardsTable.id, code: cardsTable.code }).from(cardsTable);
  const codeMap = new Map(allCards.map(c => [c.id, c.code]));

  const logs = await db.select().from(scanLogsTable);
  logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const limit = params.data.limit ?? 200;
  const sliced = logs.slice(0, limit);

  res.json(sliced.map(log => ({
    id: log.id,
    cardId: log.cardId,
    cardCode: codeMap.get(log.cardId) ?? "",
    timestamp: log.timestamp.toISOString(),
    country: log.country,
    deviceType: log.deviceType,
    ratingGiven: log.ratingGiven,
    wasNegative: log.wasNegative,
  })));
});

router.get("/admin/support-messages", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const messages = await db.select().from(supportMessagesTable);
  messages.sort((a, b) => b.sentDate.getTime() - a.sentDate.getTime());
  res.json(messages.map(msg => ({
    id: msg.id,
    senderId: msg.senderId,
    messageText: msg.messageText,
    sentDate: msg.sentDate.toISOString(),
    isRead: msg.isRead,
    repliedByAdmin: msg.repliedByAdmin,
    replyDate: msg.replyDate?.toISOString() ?? null,
  })));
});

router.post("/admin/support-messages/:id/reply", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = ReplyToSupportMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ReplyToSupportMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [msg] = await db.update(supportMessagesTable)
    .set({ repliedByAdmin: parsed.data.reply, replyDate: new Date(), isRead: true })
    .where(eq(supportMessagesTable.id, params.data.id))
    .returning();

  if (!msg) {
    res.status(404).json({ error: "Support message not found" });
    return;
  }

  res.json({
    id: msg.id,
    senderId: msg.senderId,
    messageText: msg.messageText,
    sentDate: msg.sentDate.toISOString(),
    isRead: msg.isRead,
    repliedByAdmin: msg.repliedByAdmin,
    replyDate: msg.replyDate?.toISOString() ?? null,
  });
});

export default router;
