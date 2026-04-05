import { getStripeSync } from './stripeClient';
import { db, usersTable, subscriptionsTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

const PLAN_PRICES: Record<string, number> = { free: 0, premium: 19, business: 49 };

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    let event: Stripe.Event;
    try {
      event = JSON.parse(payload.toString()) as Stripe.Event;
    } catch {
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await WebhookHandlers.handleCheckoutCompleted(session);
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      await WebhookHandlers.handleSubscriptionDeleted(sub);
    }
  }

  private static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const billing = session.metadata?.billing ?? 'monthly';

    if (!userId || !planId) return;

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) return;

    const basePrice = PLAN_PRICES[planId] ?? 0;
    const discountFactor = billing === 'annual' ? 0.75 : 1;
    const effectiveMonthlyPrice = Number((basePrice * discountFactor).toFixed(2));

    const renewsAt = new Date();
    if (billing === 'annual') {
      renewsAt.setFullYear(renewsAt.getFullYear() + 1);
    } else {
      renewsAt.setMonth(renewsAt.getMonth() + 1);
    }

    const stripeSubscriptionId =
      typeof session.subscription === 'string' ? session.subscription : null;

    // Save Stripe customer ID — collected by Stripe during checkout
    const stripeCustomerId =
      typeof session.customer === 'string' ? session.customer : null;

    await db
      .update(usersTable)
      .set({ plan: planId, ...(stripeCustomerId ? { stripeCustomerId } : {}) })
      .where(eq(usersTable.id, userIdNum));

    const [existingSub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, userIdNum));

    if (existingSub) {
      await db
        .update(subscriptionsTable)
        .set({ plan: planId, monthlyPrice: effectiveMonthlyPrice, renewsAt, status: 'active', stripeSubscriptionId })
        .where(eq(subscriptionsTable.userId, userIdNum));
    } else {
      await db.insert(subscriptionsTable).values({
        userId: userIdNum,
        plan: planId,
        monthlyPrice: effectiveMonthlyPrice,
        renewsAt,
        status: 'active',
        stripeSubscriptionId,
      });
    }
  }

  private static async handleSubscriptionDeleted(sub: Stripe.Subscription) {
    const customerId = typeof sub.customer === 'string' ? sub.customer : null;
    if (!customerId) return;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.stripeCustomerId, customerId));

    if (!user) return;

    await db.update(usersTable).set({ plan: 'free' }).where(eq(usersTable.id, user.id));
    await db
      .update(subscriptionsTable)
      .set({ plan: 'free', status: 'cancelled', monthlyPrice: 0 })
      .where(eq(subscriptionsTable.userId, user.id));
  }
}
