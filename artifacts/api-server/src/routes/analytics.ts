import { Router, type IRouter } from "express";
import { eq, and, count, gte, sql } from "drizzle-orm";
import { db, cardsTable, scanLogsTable, businessProfilesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { GetCardStatsParams, ListScanLogsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/dashboard", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;

  const cards = await db.select().from(cardsTable).where(eq(cardsTable.ownerId, userId));
  const cardIds = cards.map(c => c.id);

  const activeCards = cards.filter(c => c.status === "active").length;
  const totalScans = cards.reduce((sum, c) => sum + c.scanCount, 0);

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let scansThisMonth = 0;
  const recentScansAll: Array<{ id: number; cardId: number; cardCode: string; timestamp: Date; country: string | null; deviceType: string | null; ratingGiven: number | null; wasNegative: boolean }> = [];

  if (cardIds.length > 0) {
    for (const cardId of cardIds) {
      const [monthly] = await db.select({ count: count() }).from(scanLogsTable).where(
        and(eq(scanLogsTable.cardId, cardId), gte(scanLogsTable.timestamp, firstOfMonth))
      );
      scansThisMonth += Number(monthly?.count ?? 0);
    }

    for (const cardId of cardIds) {
      const logs = await db.select().from(scanLogsTable).where(eq(scanLogsTable.cardId, cardId));
      const card = cards.find(c => c.id === cardId);
      for (const log of logs) {
        recentScansAll.push({
          id: log.id,
          cardId: log.cardId,
          cardCode: card?.code ?? "",
          businessProfileId: card?.businessProfileId ?? null,
          timestamp: log.timestamp,
          country: log.country,
          deviceType: log.deviceType,
          ratingGiven: log.ratingGiven,
          wasNegative: log.wasNegative,
        });
      }
    }
  }

  recentScansAll.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const recentScans = recentScansAll.slice(0, 10).map(s => ({
    ...s,
    timestamp: s.timestamp.toISOString(),
  }));

  const topCards = cards.sort((a, b) => b.scanCount - a.scanCount).slice(0, 5).map(c => ({
    id: c.id,
    code: c.code,
    status: c.status,
    platform: c.platform,
    targetUrl: c.targetUrl,
    businessProfileId: c.businessProfileId,
    ownerId: c.ownerId,
    scanCount: c.scanCount,
    smartReviewEnabled: c.smartReviewEnabled,
    negativeAlertEnabled: c.negativeAlertEnabled,
    createdAt: c.createdAt.toISOString(),
    activatedAt: c.activatedAt?.toISOString() ?? null,
  }));

  const [profileCount] = await db.select({ count: count() }).from(businessProfilesTable).where(eq(businessProfilesTable.ownerId, userId));

  res.json({
    totalCards: cards.length,
    activeCards,
    totalScans,
    scansThisMonth,
    totalProfiles: Number(profileCount?.count ?? 0),
    recentScans,
    topCards,
  });
});

router.get("/analytics/cards/:id/stats", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetCardStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [card] = await db.select().from(cardsTable).where(
    and(eq(cardsTable.id, params.data.id), eq(cardsTable.ownerId, req.userId!))
  );
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const allLogs = await db.select().from(scanLogsTable).where(eq(scanLogsTable.cardId, card.id));

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  const scansThisMonth = allLogs.filter(l => l.timestamp >= firstOfMonth).length;
  const scansThisWeek = allLogs.filter(l => l.timestamp >= firstOfWeek).length;
  const negativeCount = allLogs.filter(l => l.wasNegative).length;

  const ratingsWithValue = allLogs.filter(l => l.ratingGiven != null);
  const averageRating = ratingsWithValue.length > 0
    ? ratingsWithValue.reduce((sum, l) => sum + (l.ratingGiven ?? 0), 0) / ratingsWithValue.length
    : null;

  const dayMap = new Map<string, number>();
  for (const log of allLogs) {
    const day = log.timestamp.toISOString().split("T")[0];
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const scansByDay = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

  const countryMap = new Map<string, number>();
  for (const log of allLogs) {
    const country = log.country ?? "Unknown";
    countryMap.set(country, (countryMap.get(country) ?? 0) + 1);
  }
  const scansByCountry = Array.from(countryMap.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count);

  res.json({
    cardId: card.id,
    totalScans: allLogs.length,
    scansThisMonth,
    scansThisWeek,
    averageRating,
    negativeCount,
    scansByDay,
    scansByCountry,
  });
});

router.get("/scan-logs", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = ListScanLogsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userCards = await db.select({ id: cardsTable.id, code: cardsTable.code }).from(cardsTable).where(eq(cardsTable.ownerId, req.userId!));
  const cardIds = userCards.map(c => c.id);
  const codeMap = new Map(userCards.map(c => [c.id, c.code]));

  if (cardIds.length === 0) {
    res.json([]);
    return;
  }

  const allLogs: typeof scanLogsTable.$inferSelect[] = [];
  const targetCardId = params.data.cardId;

  if (targetCardId != null && cardIds.includes(targetCardId)) {
    const logs = await db.select().from(scanLogsTable).where(eq(scanLogsTable.cardId, targetCardId));
    allLogs.push(...logs);
  } else {
    for (const cardId of cardIds) {
      const logs = await db.select().from(scanLogsTable).where(eq(scanLogsTable.cardId, cardId));
      allLogs.push(...logs);
    }
  }

  allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const limit = params.data.limit ?? 100;
  const sliced = allLogs.slice(0, limit);

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

export default router;
