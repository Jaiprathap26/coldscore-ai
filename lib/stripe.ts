import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// ─── Pricing ──────────────────────────────────────────────────────────────────
// Pro:  $9/month  → STRIPE_PRO_PRICE_ID
// Team: $29/month → STRIPE_TEAM_PRICE_ID

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Unlimited email grades',
      'AI rewrite suggestions',
      'Score history',
      'Shareable score cards',
      'PDF export',
    ],
  },
  team: {
    name: 'Team',
    price: 29,
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: [
      'Everything in Pro',
      'Up to 10 team seats',
      'Manager dashboard',
      'Team benchmarks',
      'CSV export',
      'Team invite link',
    ],
  },
} as const

export type PlanId = keyof typeof PLANS

export async function createCheckoutSession({
  userId,
  planId,
  successUrl,
  cancelUrl,
  email,
}: {
  userId: string
  planId: PlanId
  successUrl: string
  cancelUrl: string
  email?: string
}): Promise<string> {
  const plan = PLANS[planId]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, planId },
    subscription_data: {
      metadata: { userId, planId },
    },
  })

  return session.url!
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session.url
}
