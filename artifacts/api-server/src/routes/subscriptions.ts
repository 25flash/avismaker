import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subscriptionsTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { UpgradePlanBody } from "@workspace/api-zod";

const router: IRouter = Router();

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "1 business profile",
      "Unlimited scans",
      "Basic analytics",
      "QR code generation",
    ],
    maxProfiles: 1,
    aiReply: false,
    customBranding: false,
    advancedAnalytics: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 19,
    features: [
      "3 business profiles",
      "Unlimited scans",
      "AI review replies",
      "Negative review auto-detection",
      "Advanced analytics + PDF export",
      "Custom banner on public pages",
      "Priority support",
    ],
    maxProfiles: 3,
    aiReply: true,
    customBranding: false,
    advancedAnalytics: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 39,
    features: [
      "10 business profiles",
      "All Premium features",
      "Custom branding (remove AvisMakers badge)",
      "Live preview editor",
    ],
    maxProfiles: 10,
    aiReply: true,
    customBranding: true,
    advancedAnalytics: true,
  },
  {
    id: "business",
    name: "Business",
    price: 79,
    features: [
      "Unlimited business profiles",
      "All Pro features",
      "White-label option",
      "Dedicated support",
    ],
    maxProfiles: null,
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
  const planInfo = PLANS.find(p => p.id === plan);
  if (!planInfo) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  await db.update(usersTable).set({ plan }).where(eq(usersTable.id, req.userId!));

  const renewsAt = new Date();
  renewsAt.setMonth(renewsAt.getMonth() + 1);

  const [existingSub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.userId!));
  if (existingSub) {
    await db.update(subscriptionsTable)
      .set({ plan, monthlyPrice: planInfo.price, renewsAt, status: "active" })
      .where(eq(subscriptionsTable.userId, req.userId!));
  } else {
    await db.insert(subscriptionsTable).values({
      userId: req.userId!,
      plan,
      monthlyPrice: planInfo.price,
      renewsAt,
      status: "active",
    });
  }

  res.json({ success: true, plan });
});

export default router;
