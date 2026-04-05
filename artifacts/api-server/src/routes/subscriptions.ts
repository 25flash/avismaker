import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subscriptionsTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { UpgradePlanBody } from "@workspace/api-zod";

const router: IRouter = Router();

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "billing.features.basicAnalytics",
    ],
    maxProfiles: 1,
    maxActiveCards: 1,
    aiReply: false,
    customBranding: false,
    advancedAnalytics: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 19,
    features: [
      "billing.features.unlimitedScans",
      "billing.features.aiReplies",
      "billing.features.negativeReviewDetection",
    ],
    maxProfiles: 1,
    maxActiveCards: 3,
    aiReply: true,
    customBranding: false,
    advancedAnalytics: true,
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    features: [
      "billing.features.unlimitedScans",
      "billing.features.aiReplies",
      "billing.features.negativeReviewDetection",
      "billing.features.advancedAnalyticsPdf",
      "billing.features.customBranding",
      "billing.features.prioritySupport",
    ],
    maxProfiles: null,
    maxActiveCards: null,
    aiReply: true,
    customBranding: true,
    advancedAnalytics: true,
  },
];

router.get("/subscriptions/current", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.userId!));

  if (!sub) {
    res.json({
      id: 0,
      userId: req.userId!,
      plan: "free",
      status: "active",
      billingPeriod: "monthly",
      renewsAt: null,
      monthlyPrice: 0,
    });
    return;
  }

  res.json({
    id: sub.id,
    userId: sub.userId,
    plan: sub.plan,
    status: sub.status,
    billingPeriod: sub.stripePriceId === "annual" ? "annual" : "monthly",
    renewsAt: sub.renewsAt?.toISOString() ?? null,
    monthlyPrice: sub.monthlyPrice,
  });
});

router.get("/subscriptions/plans", async (_req, res): Promise<void> => {
  res.json(PLANS);
});

router.post("/subscriptions/upgrade", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = UpgradePlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { plan } = parsed.data;
  const billing: string = (req.body as Record<string, unknown>).billing === "annual" ? "annual" : "monthly";

  const planInfo = PLANS.find(p => p.id === plan);
  if (!planInfo) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  const discountFactor = billing === "annual" ? 0.75 : 1;
  const effectiveMonthlyPrice = Number((planInfo.price * discountFactor).toFixed(2));

  await db.update(usersTable).set({ plan }).where(eq(usersTable.id, req.userId!));

  const renewsAt = new Date();
  if (billing === "annual") {
    renewsAt.setFullYear(renewsAt.getFullYear() + 1);
  } else {
    renewsAt.setMonth(renewsAt.getMonth() + 1);
  }

  const [existingSub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.userId!));
  if (existingSub) {
    await db.update(subscriptionsTable)
      .set({
        plan,
        monthlyPrice: effectiveMonthlyPrice,
        renewsAt,
        status: "active",
        stripePriceId: billing,
      })
      .where(eq(subscriptionsTable.userId, req.userId!));
  } else {
    await db.insert(subscriptionsTable).values({
      userId: req.userId!,
      plan,
      monthlyPrice: effectiveMonthlyPrice,
      renewsAt,
      status: "active",
      stripePriceId: billing,
    });
  }

  res.json({ success: true, plan, billingPeriod: billing });
});

export default router;
