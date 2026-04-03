import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, businessProfilesTable, cardsTable, scanLogsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import {
  CreateBusinessProfileBody,
  UpdateBusinessProfileBody,
  GetBusinessProfileParams,
  UpdateBusinessProfileParams,
  DeleteBusinessProfileParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const PLAN_LIMITS: Record<string, number | null> = {
  free: 1,
  premium: 3,
  pro: 10,
  business: null,
};

async function buildProfile(profile: typeof businessProfilesTable.$inferSelect) {
  const [cardCountResult] = await db
    .select({ count: count() })
    .from(cardsTable)
    .where(eq(cardsTable.businessProfileId, profile.id));

  const cards = await db.select({ id: cardsTable.id }).from(cardsTable).where(eq(cardsTable.businessProfileId, profile.id));
  let totalScans = 0;
  for (const card of cards) {
    const [scanCount] = await db.select({ count: count() }).from(scanLogsTable).where(eq(scanLogsTable.cardId, card.id));
    totalScans += Number(scanCount?.count ?? 0);
  }

  return {
    id: profile.id,
    ownerId: profile.ownerId,
    name: profile.name,
    address: profile.address,
    category: profile.category,
    logoUrl: profile.logoUrl,
    coverImageUrl: profile.coverImageUrl,
    customBannerText: profile.customBannerText,
    customBannerColor: profile.customBannerColor,
    showPoweredBy: profile.showPoweredBy,
    cardCount: Number(cardCountResult?.count ?? 0),
    totalScans,
    createdAt: profile.createdAt.toISOString(),
  };
}

router.get("/business-profiles", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const profiles = await db.select().from(businessProfilesTable).where(eq(businessProfilesTable.ownerId, req.userId!));
  const results = await Promise.all(profiles.map(buildProfile));
  res.json(results);
});

router.post("/business-profiles", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateBusinessProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const plan = req.userPlan ?? "free";
  const limit = PLAN_LIMITS[plan];
  if (limit !== null) {
    const [existing] = await db.select({ count: count() }).from(businessProfilesTable).where(eq(businessProfilesTable.ownerId, req.userId!));
    if (Number(existing?.count ?? 0) >= limit) {
      res.status(400).json({ error: `Your ${plan} plan allows a maximum of ${limit} business profile(s). Upgrade to add more.` });
      return;
    }
  }

  const [profile] = await db.insert(businessProfilesTable).values({
    ownerId: req.userId!,
    name: parsed.data.name,
    address: parsed.data.address ?? null,
    category: parsed.data.category ?? null,
    logoUrl: parsed.data.logoUrl ?? null,
    coverImageUrl: parsed.data.coverImageUrl ?? null,
  }).returning();

  res.status(201).json(await buildProfile(profile));
});

router.get("/business-profiles/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetBusinessProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [profile] = await db.select().from(businessProfilesTable).where(
    and(eq(businessProfilesTable.id, params.data.id), eq(businessProfilesTable.ownerId, req.userId!))
  );
  if (!profile) {
    res.status(404).json({ error: "Business profile not found" });
    return;
  }

  res.json(await buildProfile(profile));
});

router.patch("/business-profiles/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateBusinessProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateBusinessProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name != null) updates.name = parsed.data.name;
  if (parsed.data.address !== undefined) updates.address = parsed.data.address;
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.logoUrl !== undefined) updates.logoUrl = parsed.data.logoUrl;
  if (parsed.data.coverImageUrl !== undefined) updates.coverImageUrl = parsed.data.coverImageUrl;
  if (parsed.data.customBannerText !== undefined) updates.customBannerText = parsed.data.customBannerText;
  if (parsed.data.customBannerColor !== undefined) updates.customBannerColor = parsed.data.customBannerColor;
  if (parsed.data.showPoweredBy != null) updates.showPoweredBy = parsed.data.showPoweredBy;

  const [profile] = await db.update(businessProfilesTable)
    .set(updates)
    .where(and(eq(businessProfilesTable.id, params.data.id), eq(businessProfilesTable.ownerId, req.userId!)))
    .returning();

  if (!profile) {
    res.status(404).json({ error: "Business profile not found" });
    return;
  }

  res.json(await buildProfile(profile));
});

router.delete("/business-profiles/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteBusinessProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(businessProfilesTable)
    .where(and(eq(businessProfilesTable.id, params.data.id), eq(businessProfilesTable.ownerId, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Business profile not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
