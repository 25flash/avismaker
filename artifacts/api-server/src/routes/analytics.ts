import { Router, type IRouter } from "express";
import { eq, and, count, gte, inArray } from "drizzle-orm";
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

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  // Single query for all scan logs — eliminates N+1
  const allScanLogs = cardIds.length > 0
    ? await db.select().from(scanLogsTable).where(inArray(scanLogsTable.cardId, cardIds))
    : [];

  const scansThisMonth = allScanLogs.filter(l => l.timestamp >= firstOfMonth).length;

  const cardMap = new Map(cards.map(c => [c.id, c]));
  const recentScansAll = allScanLogs.map(log => {
    const card = cardMap.get(log.cardId);
    return {
      id: log.id,
      cardId: log.cardId,
      cardCode: card?.code ?? "",
      platform: card?.platform ?? null,
      businessProfileId: card?.businessProfileId ?? null,
      timestamp: log.timestamp,
      country: log.country,
      deviceType: log.deviceType,
      ratingGiven: log.ratingGiven,
      wasNegative: log.wasNegative,
    };
  });

  recentScansAll.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const recentScans = recentScansAll.slice(0, 10).map(s => ({
    ...s,
    timestamp: s.timestamp.toISOString(),
  }));

  const topCards = [...cards]
    .sort((a, b) => b.scanCount - a.scanCount)
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      code: c.code,
      nickname: c.nickname ?? null,
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

  const [profileCount] = await db
    .select({ count: count() })
    .from(businessProfilesTable)
    .where(eq(businessProfilesTable.ownerId, userId));

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
  const firstOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

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
  const scansByDay = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const countryMap = new Map<string, number>();
  for (const log of allLogs) {
    const country = log.country ?? "Unknown";
    countryMap.set(country, (countryMap.get(country) ?? 0) + 1);
  }
  const scansByCountry = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

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

  const userCards = await db
    .select({ id: cardsTable.id, code: cardsTable.code })
    .from(cardsTable)
    .where(eq(cardsTable.ownerId, req.userId!));

  const cardIds = userCards.map(c => c.id);
  const codeMap = new Map(userCards.map(c => [c.id, c.code]));

  if (cardIds.length === 0) {
    res.json([]);
    return;
  }

  const limit = params.data.limit ?? 100;
  const targetCardId = params.data.cardId;

  // Single query — eliminates N+1
  const whereClause = targetCardId != null && cardIds.includes(targetCardId)
    ? eq(scanLogsTable.cardId, targetCardId)
    : inArray(scanLogsTable.cardId, cardIds);

  const allLogs = await db.select().from(scanLogsTable).where(whereClause);
  allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  res.json(allLogs.slice(0, limit).map(log => ({
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

// ── Business Analytics (all authenticated users — plan check on frontend) ──
router.get("/business-analytics", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);

  const cards = await db.select().from(cardsTable).where(eq(cardsTable.ownerId, userId));
  const cardIds = cards.map(c => c.id);

  const allLogs = cardIds.length > 0
    ? await db.select().from(scanLogsTable).where(inArray(scanLogsTable.cardId, cardIds))
    : [];

  const now = new Date();
  const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

  const recentLogs = allLogs.filter(l => l.timestamp >= periodStart);
  const prevLogs = allLogs.filter(l => l.timestamp >= prevStart && l.timestamp < periodStart);

  const totalScans = allLogs.length;
  const recentScans = recentLogs.length;
  const prevScans = prevLogs.length;
  const growth = prevScans > 0 ? Math.round(((recentScans - prevScans) / prevScans) * 100) : (recentScans > 0 ? 100 : 0);
  const positiveScans = allLogs.filter(l => !l.wasNegative).length;
  const conversionRate = totalScans > 0 ? Math.round((positiveScans / totalScans) * 100) : 0;
  const recentActivity = recentLogs.length;

  // Scan timeline — last N days by day
  const dayMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(periodStart.getTime() + i * 24 * 60 * 60 * 1000);
    dayMap.set(d.toISOString().split("T")[0], 0);
  }
  for (const log of recentLogs) {
    const day = log.timestamp.toISOString().split("T")[0];
    if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const scanTimeline = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Source distribution (platform)
  const cardMap = new Map(cards.map(c => [c.id, c]));
  const sourceMap = new Map<string, number>();
  for (const log of allLogs) {
    const card = cardMap.get(log.cardId);
    const platform = card?.platform ?? "other";
    sourceMap.set(platform, (sourceMap.get(platform) ?? 0) + 1);
  }
  const sourceDistribution = Array.from(sourceMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Top cards
  const topCards = [...cards]
    .sort((a, b) => b.scanCount - a.scanCount)
    .slice(0, 10)
    .map(c => ({
      id: c.id,
      name: c.nickname ?? c.code,
      platform: c.platform ?? "other",
      scans: c.scanCount,
      status: c.status,
      performance: c.scanCount > 50 ? "high" : c.scanCount > 10 ? "medium" : "low",
    }));

  res.json({
    kpis: { totalScans, conversionRate, growth, recentActivity },
    scanTimeline,
    sourceDistribution,
    topCards,
  });
});

export default router;
