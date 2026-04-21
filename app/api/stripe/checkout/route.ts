import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createCheckoutSession, PlanId } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  try {
    const { planId } = await req.json()

    if (!planId || !['pro', 'team'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://coldscoreai.com'

    const url = await createCheckoutSession({
      userId,
      planId: planId as PlanId,
      successUrl: `${appUrl}/dashboard?upgraded=true`,
      cancelUrl: `${appUrl}/`,
      email,
    })

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
