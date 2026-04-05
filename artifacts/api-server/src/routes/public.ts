import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cardsTable, scanLogsTable, businessProfilesTable } from "@workspace/db";
import { PublicScanQueryParams, GetPublicCardParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/public/scan", async (req, res): Promise<void> => {
  const params = PublicScanQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [card] = await db.select().from(cardsTable).where(eq(cardsTable.code, params.data.code.toUpperCase()));
  if (!card || card.status !== "active") {
    res.status(404).json({ error: "Card not found or not active" });
    return;
  }

  const userAgent = req.headers["user-agent"] ?? "";
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const deviceType = isMobile ? "mobile" : "desktop";

  await db.insert(scanLogsTable).values({
    cardId: card.id,
    timestamp: new Date(),
    ipAddress: req.ip,
    country: null,
    deviceType,
    browser: userAgent.split(" ")[0] ?? "unknown",
    wasNegative: false,
  });

  await db.update(cardsTable).set({ scanCount: card.scanCount + 1 }).where(eq(cardsTable.id, card.id));

  res.json({
    redirectUrl: card.targetUrl ?? "",
    platform: card.platform ?? "google",
    smartReviewEnabled: card.smartReviewEnabled,
    cardCode: card.code,
  });
});

router.post("/public/scan/:code", async (req, res): Promise<void> => {
  const code = (req.params.code ?? "").toUpperCase();
  const wasNegative = typeof req.body?.wasNegative === "boolean" ? req.body.wasNegative : false;

  const [card] = await db.select().from(cardsTable).where(eq(cardsTable.code, code));
  if (!card || card.status !== "active") {
    res.status(404).json({ error: "Card not found or not active" });
    return;
  }

  const userAgent = req.headers["user-agent"] ?? "";
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const deviceType = isMobile ? "mobile" : "desktop";

  await db.insert(scanLogsTable).values({
    cardId: card.id,
    timestamp: new Date(),
    ipAddress: req.ip,
    country: null,
    deviceType,
    browser: userAgent.split(" ")[0] ?? "unknown",
    wasNegative,
  });

  await db.update(cardsTable).set({ scanCount: card.scanCount + 1 }).where(eq(cardsTable.id, card.id));

  res.json({ ok: true });
});

router.get("/public/card/:code", async (req, res): Promise<void> => {
  const params = GetPublicCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [card] = await db.select().from(cardsTable).where(eq(cardsTable.code, params.data.code.toUpperCase()));
  if (!card || card.status !== "active") {
    res.status(404).json({ error: "Card not found or not active" });
    return;
  }

  let businessName: string | null = null;
  let businessLogoUrl: string | null = null;
  let showPoweredBy = true;
  let customBannerText: string | null = null;
  let customBannerColor: string | null = null;

  if (card.businessProfileId) {
    const [profile] = await db.select().from(businessProfilesTable).where(eq(businessProfilesTable.id, card.businessProfileId));
    if (profile) {
      businessName = profile.name;
      businessLogoUrl = profile.logoUrl;
      showPoweredBy = profile.showPoweredBy;
      customBannerText = profile.customBannerText;
      customBannerColor = profile.customBannerColor;
    }
  }

  res.json({
    code: card.code,
    platform: card.platform ?? "google",
    targetUrl: card.targetUrl ?? "",
    businessName,
    businessLogoUrl,
    smartReviewEnabled: card.smartReviewEnabled,
    showPoweredBy,
    customBannerText,
    customBannerColor,
  });
});

export default router;
