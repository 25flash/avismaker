import Stripe from 'stripe';

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) throw new Error('X-Replit-Token not found');

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', 'development');

  const response = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json', 'X-Replit-Token': xReplitToken },
  });

  const data = await response.json();
  const conn = data.items?.[0];
  if (!conn?.settings?.secret) throw new Error('Stripe connection not found');
  return conn.settings.secret as string;
}

async function seedProducts() {
  const secretKey = await getCredentials();
  const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' as any });

  console.log('Seeding AvisMaker subscription plans...\n');

  const plans = [
    {
      planId: 'premium',
      name: 'AvisMaker Premium',
      description: '3 cartes, 1 profil business, Scans illimités, Réponses IA aux avis',
      monthlyAmount: 1900,
      annualAmount: 17100,
    },
    {
      planId: 'business',
      name: 'AvisMaker Business',
      description: 'Cartes et profils illimités, Analytics avancées, Branding personnalisé',
      monthlyAmount: 4900,
      annualAmount: 44100,
    },
  ];

  for (const plan of plans) {
    // Check if product already exists
    const existing = await stripe.products.search({
      query: `metadata['planId']:'${plan.planId}'`,
    });

    let product: Stripe.Product;
    if (existing.data.length > 0) {
      product = existing.data[0];
      console.log(`✓ Product already exists: ${product.name} (${product.id})`);
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { planId: plan.planId },
      });
      console.log(`✓ Created product: ${product.name} (${product.id})`);
    }

    // Monthly price
    const existingMonthly = await stripe.prices.list({
      product: product.id,
      active: true,
    });
    const hasMonthly = existingMonthly.data.some(p => p.metadata?.billing === 'monthly');
    if (!hasMonthly) {
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthlyAmount,
        currency: 'eur',
        recurring: { interval: 'month' },
        metadata: { billing: 'monthly', planId: plan.planId },
      });
      console.log(`  ✓ Monthly price: €${plan.monthlyAmount / 100}/month (${monthlyPrice.id})`);
    } else {
      console.log(`  ✓ Monthly price already exists`);
    }

    // Annual price
    const hasAnnual = existingMonthly.data.some(p => p.metadata?.billing === 'annual');
    if (!hasAnnual) {
      const annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.annualAmount,
        currency: 'eur',
        recurring: { interval: 'year' },
        metadata: { billing: 'annual', planId: plan.planId },
      });
      console.log(`  ✓ Annual price: €${plan.annualAmount / 100}/year (${annualPrice.id})`);
    } else {
      console.log(`  ✓ Annual price already exists`);
    }
  }

  console.log('\n✅ Done! Webhooks will sync these products to the database automatically.');
}

seedProducts().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
