import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('scores')
    .select('id, total_score, predicted_open_rate, predicted_reply_rate, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Scores fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch scores.' }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
