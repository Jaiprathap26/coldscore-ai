import { createHash } from 'crypto'
import { supabaseAdmin } from './supabase'

const FREE_DAILY_LIMIT = parseInt(process.env.FREE_DAILY_LIMIT || '5', 10)

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + process.env.CLERK_SECRET_KEY).digest('hex')
}

export async function checkRateLimit(
  ip: string,
  userId: string | null
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  // Pro/Team users — unlimited
  if (userId) {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .single()

    if (sub?.plan === 'pro' || sub?.plan === 'team') {
      return { allowed: true, remaining: 999, resetAt: '' }
    }
  }

  const ipHash = hashIp(ip)
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { count } = await supabaseAdmin
    .from('scores')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`)

  const used = count || 0
  const remaining = Math.max(0, FREE_DAILY_LIMIT - used)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  return {
    allowed: used < FREE_DAILY_LIMIT,
    remaining,
    resetAt: tomorrow.toISOString(),
  }
}

export { hashIp }
