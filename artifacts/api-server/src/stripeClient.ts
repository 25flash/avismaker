import Stripe from 'stripe';
import { StripeSync } from 'stripe-replit-sync';

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  return key;
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  return new Stripe(getSecretKey(), { apiVersion: '2025-08-27.basil' as any });
}

export async function getStripePublishableKey(): Promise<string> {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is not set');
  return key;
}

export async function getStripeSecretKey(): Promise<string> {
  return getSecretKey();
}

let stripeSync: InstanceType<typeof StripeSync> | null = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const secretKey = getSecretKey();
    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
