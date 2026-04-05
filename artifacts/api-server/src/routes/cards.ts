import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, cardsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import {
  ListCardsQueryParams,
  GetCardParams,
  UpdateCardParams,
  UpdateCardBody,
  ActivateCardParams,
  DeactivateCardParams,
  ActivateCardByCodeBody,
} from "@workspace/api-zod";

const MAX_ACTIVE_CARDS: Record<string, number | null> = {
  free: 1,
  premium: 3,
  business: null,
};

const router: IRouter = Router();

function formatCard(card: typeof cardsTable.$inferSelect) {
  return {
    id: card.id,
    code: card.code,
    nickname: card.nickname ?? null,
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

router.get("/cards", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = ListCardsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(cardsTable).where(eq(cardsTable.ownerId, req.userId!));

  if (params.data.businessProfileId != null) {
    query = db.select().from(cardsTable).where(
      and(eq(cardsTable.ownerId, req.userId!), eq(cardsTable.businessProfileId, params.data.businessProfileId))
    );
  }

  const cards = await query;
  res.json(cards.map(formatCard));
});

router.get("/cards/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetCardParams.safeParse(req.params);
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

  res.json(formatCard(card));
});

router.patch("/cards/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.nickname !== undefined) updates.nickname = parsed.data.nickname;
  if (parsed.data.platform !== undefined) updates.platform = parsed.data.platform;
  if (parsed.data.targetUrl !== undefined) updates.targetUrl = parsed.data.targetUrl;
  if (parsed.data.businessProfileId !== undefined) updates.businessProfileId = parsed.data.businessProfileId;
  if (parsed.data.smartReviewEnabled != null) updates.smartReviewEnabled = parsed.data.smartReviewEnabled;
  if (parsed.data.negativeAlertEnabled != null) updates.negativeAlertEnabled = parsed.data.negativeAlertEnabled;

  const [card] = await db.update(cardsTable)
    .set(updates)
    .where(and(eq(cardsTable.id, params.data.id), eq(cardsTable.ownerId, req.userId!)))
    .returning();

  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  res.json(formatCard(card));
});

router.post("/cards/:id/activate", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = ActivateCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const plan = req.userPlan ?? "free";
  const maxActive = MAX_ACTIVE_CARDS[plan] ?? null;
  if (maxActive !== null) {
    const [activeCount] = await db.select({ count: count() }).from(cardsTable).where(
      and(eq(cardsTable.ownerId, req.userId!), eq(cardsTable.status, "active"))
    );
    if (Number(activeCount?.count ?? 0) >= maxActive) {
      res.status(403).json({
        error: `Your ${plan} plan allows a maximum of ${maxActive} active card(s). Upgrade to activate more cards.`,
        code: "ACTIVE_CARD_LIMIT_REACHED",
      });
      return;
    }
  }

  const [card] = await db.update(cardsTable)
    .set({ status: "active", activatedAt: new Date() })
    .where(and(eq(cardsTable.id, params.data.id), eq(cardsTable.ownerId, req.userId!)))
    .returning();

  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  res.json(formatCard(card));
});

router.post("/cards/:id/deactivate", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeactivateCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [card] = await db.update(cardsTable)
    .set({ status: "inactive" })
    .where(and(eq(cardsTable.id, params.data.id), eq(cardsTable.ownerId, req.userId!)))
    .returning();

  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  res.json(formatCard(card));
});

router.post("/cards/activate-by-code", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = ActivateCardByCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const plan = req.userPlan ?? "free";
  const maxActive = MAX_ACTIVE_CARDS[plan] ?? null;
  if (maxActive !== null) {
    const [activeCount] = await db.select({ count: count() }).from(cardsTable).where(
      and(eq(cardsTable.ownerId, req.userId!), eq(cardsTable.status, "active"))
    );
    if (Number(activeCount?.count ?? 0) >= maxActive) {
      res.status(403).json({
        error: `Your ${plan} plan allows a maximum of ${maxActive} active card(s). Upgrade to activate more cards.`,
        code: "ACTIVE_CARD_LIMIT_REACHED",
      });
      return;
    }
  }

  const [card] = await db.select().from(cardsTable).where(eq(cardsTable.code, parsed.data.code.toUpperCase()));
  if (!card) {
    res.status(404).json({ error: "Card code not found" });
    return;
  }

  if (card.ownerId && card.ownerId !== req.userId) {
    res.status(400).json({ error: "This card is already claimed by another user" });
    return;
  }

  const [updated] = await db.update(cardsTable)
    .set({
      ownerId: req.userId!,
      ...(parsed.data.businessProfileId != null ? { businessProfileId: parsed.data.businessProfileId } : {}),
      status: "active",
      activatedAt: new Date(),
    })
    .where(eq(cardsTable.id, card.id))
    .returning();

  res.json(formatCard(updated));
});

export default router;
