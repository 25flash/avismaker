import Stripe from 'stripe';

async function seedProducts() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY environment variable is not set');

  const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' as any });

  console.log('Seeding AvisMaker subscription plans...\n');

  const plans = [
    {
      planId: 'premium',
      name: 'AvisMaker Premium',
      description: '3 cartes actives, 1 profil business, Scans illimités, Réponses IA aux avis',
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

    const existingPrices = await stripe.prices.list({ product: product.id, active: true });

    const hasMonthly = existingPrices.data.some(p => p.metadata?.billing === 'monthly');
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

    const hasAnnual = existingPrices.data.some(p => p.metadata?.billing === 'annual');
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

  console.log('\n✅ Done!');
}

seedProducts().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
