import { Router, type IRouter } from "express";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { getUncachableStripeClient, getStripePublishableKey } from "../stripeClient";
import { db, usersTable, subscriptionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stripe/config", requireAuth, async (_req, res): Promise<void> => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch {
    res.status(503).json({ error: "Stripe not configured" });
  }
});

router.post("/stripe/checkout", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { planId, billing = "monthly" } = req.body as { planId: string; billing?: string };

  if (!planId || !["premium", "business"].includes(planId)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find or create Stripe customer
    // If stored ID is stale (e.g. from sandbox), create a fresh one
    let customerId = user.stripeCustomerId;
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch {
        // Customer not found in this Stripe account — clear stale ID and create new
        customerId = null;
        await db.update(usersTable).set({ stripeCustomerId: null }).where(eq(usersTable.id, user.id));
      }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: String(user.id) },
      });
      await db.update(usersTable).set({ stripeCustomerId: customer.id }).where(eq(usersTable.id, user.id));
      customerId = customer.id;
    }

    // Find the Stripe price for this plan + billing period
    // Try synced DB tables first, fall back to Stripe API directly
    let priceId: string | null = null;
    try {
      const priceRow = await db.execute(
        sql`
          SELECT pr.id as price_id
          FROM stripe.products p
          JOIN stripe.prices pr ON pr.product = p.id
          WHERE p.metadata->>'planId' = ${planId}
            AND pr.metadata->>'billing' = ${billing}
            AND p.active = true
            AND pr.active = true
          LIMIT 1
        `
      );
      if (priceRow.rows[0]) {
        priceId = (priceRow.rows[0] as any).price_id as string;
      }
    } catch {
      // DB tables not yet synced — fall back to Stripe API
    }

    if (!priceId) {
      // Fallback: query Stripe API directly
      const products = await stripe.products.search({
        query: `metadata['planId']:'${planId}'`,
      });
      if (products.data.length === 0) {
        res.status(404).json({ error: "Plan not found in Stripe. Please run seed-products first." });
        return;
      }
      const prices = await stripe.prices.list({ product: products.data[0].id, active: true });
      const matchedPrice = prices.data.find((p) => p.metadata?.billing === billing);
      if (!matchedPrice) {
        res.status(404).json({ error: `No ${billing} price found for ${planId} plan.` });
        return;
      }
      priceId = matchedPrice.id;
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    const baseUrl = domain ? `https://${domain}` : `${req.protocol}://${req.get("host")}`;

    // Check if user already has a subscription and upgrade it
    const [existingSub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, user.id));

    if (existingSub?.stripeSubscriptionId) {
      // Upgrade existing subscription via Stripe API
      const sub = await stripe.subscriptions.retrieve(existingSub.stripeSubscriptionId);
      if (sub.status === "active") {
        const updatedSub = await stripe.subscriptions.update(existingSub.stripeSubscriptionId, {
          items: [{ id: sub.items.data[0].id, price: priceId }],
          metadata: { userId: String(user.id), planId, billing },
          proration_behavior: "create_prorations",
        });
        // Trigger plan update immediately
        const basePrice = planId === "business" ? 49 : 19;
        const discountFactor = billing === "annual" ? 0.75 : 1;
        const renewsAt = new Date(updatedSub.current_period_end * 1000);
        await db.update(usersTable).set({ plan: planId }).where(eq(usersTable.id, user.id));
        await db
          .update(subscriptionsTable)
          .set({
            plan: planId,
            monthlyPrice: Number((basePrice * discountFactor).toFixed(2)),
            renewsAt,
            status: "active",
            stripeSubscriptionId: updatedSub.id,
          })
          .where(eq(subscriptionsTable.userId, user.id));
        res.json({ upgraded: true });
        return;
      }
    }

    // Create new checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/billing?success=1&plan=${planId}`,
      cancel_url: `${baseUrl}/billing`,
      metadata: { userId: String(user.id), planId, billing },
      subscription_data: {
        metadata: { userId: String(user.id), planId, billing },
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: error.message ?? "Checkout failed" });
  }
});

router.post("/stripe/portal", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const stripe = await getUncachableStripeClient();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));

    if (!user?.stripeCustomerId) {
      res.status(404).json({ error: "No billing account found" });
      return;
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    const baseUrl = domain ? `https://${domain}` : `${req.protocol}://${req.get("host")}`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/billing`,
    });

    res.json({ url: portalSession.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message ?? "Portal failed" });
  }
});

export default router;
