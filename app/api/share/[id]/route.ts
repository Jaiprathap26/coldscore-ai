import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid score ID.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('scores')
    .select(
      'id, total_score, dimensions, predicted_open_rate, predicted_reply_rate, top_3_improvements, created_at'
    )
    // NOTE: email_content and rewritten_email are intentionally excluded from public share endpoint
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Score not found.' }, { status: 404 })
  }

  return NextResponse.json(data)
}
