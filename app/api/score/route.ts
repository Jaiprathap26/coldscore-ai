import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit, hashIp } from '@/lib/rate-limit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SCORING_SYSTEM = `You are an expert cold email coach and conversion rate optimizer. Your job is to objectively score cold emails and provide actionable feedback.

Score the email across exactly these 6 dimensions and return ONLY valid JSON, no markdown, no explanation outside the JSON:

{
  "total_score": <sum of all dimension scores, 0-100>,
  "dimensions": {
    "personalization": {
      "score": <0-20>,
      "max": 20,
      "feedback": "<1-2 sentences: what they did well or what's missing>"
    },
    "subject_line": {
      "score": <0-20>,
      "max": 20,
      "feedback": "<1-2 sentences>"
    },
    "clarity_of_offer": {
      "score": <0-20>,
      "max": 20,
      "feedback": "<1-2 sentences>"
    },
    "cta_strength": {
      "score": <0-20>,
      "max": 20,
      "feedback": "<1-2 sentences>"
    },
    "length_readability": {
      "score": <0-10>,
      "max": 10,
      "feedback": "<1-2 sentences>"
    },
    "tone": {
      "score": <0-10>,
      "max": 10,
      "feedback": "<1-2 sentences>"
    }
  },
  "predicted_open_rate": "<realistic % based on subject line score and personalization, e.g. '24%'>",
  "predicted_reply_rate": "<realistic % based on total score, e.g. '5%'>",
  "rewritten_email": "<complete improved version of the email that would score 90+, ready to send>",
  "top_3_improvements": [
    "<most impactful change they should make>",
    "<second most impactful change>",
    "<third most impactful change>"
  ]
}

Scoring guidelines:
- Personalization (0-20): Mentions specific company/person details = high. Generic "I noticed your company" = low.
- Subject Line (0-20): Curiosity + specificity + under 50 chars = high. "Quick question" = low.
- Clarity of Offer (0-20): Instantly clear what is being offered = high. Vague or buried = low.
- CTA Strength (0-20): One specific, low-friction ask = high. Multiple asks or vague "let me know" = low.
- Length & Readability (0-10): Under 150 words, short paragraphs, scannable = high.
- Tone (0-10): Conversational, human, not salesy = high. Corporate jargon = low.

Be honest and critical. Most cold emails score 40-65. A score of 80+ means it's genuinely excellent.`

export async function POST(req: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'

    // Get auth status
    const { userId } = await auth()

    // Rate limit check
    const { allowed, remaining } = await checkRateLimit(ip, userId)
    if (!allowed) {
      return NextResponse.json(
        {
          error: "You've used your 5 free grades today. Upgrade to Pro for unlimited grading.",
          upgradeUrl: '/sign-up?plan=pro',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + 86400000).toISOString(),
          },
        }
      )
    }

    const body = await req.json()
    const { email, recipient } = body

    if (!email || typeof email !== 'string' || email.trim().length < 20) {
      return NextResponse.json({ error: 'Please paste a full cold email (at least 20 characters).' }, { status: 400 })
    }

    const userPrompt = `Please score this cold email${recipient ? ` (targeting: ${recipient})` : ''}:

---
${email.trim()}
---

Return only JSON.`

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: SCORING_SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawContent = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response
    let scoreData
    try {
      // Strip markdown code blocks if Claude adds them
      const cleaned = rawContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      scoreData = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse Claude response:', rawContent)
      return NextResponse.json({ error: 'AI response parsing failed. Please try again.' }, { status: 500 })
    }

    // Validate required fields
    const required = ['total_score', 'dimensions', 'predicted_open_rate', 'predicted_reply_rate', 'rewritten_email', 'top_3_improvements']
    for (const field of required) {
      if (!(field in scoreData)) {
        return NextResponse.json({ error: 'Incomplete AI response. Please try again.' }, { status: 500 })
      }
    }

    // Save to Supabase
    const ipHash = hashIp(ip)
    const { data: record, error: dbError } = await supabaseAdmin
      .from('scores')
      .insert({
        email_content: email.trim(),
        recipient_context: recipient?.trim() || null,
        total_score: scoreData.total_score,
        dimensions: scoreData.dimensions,
        predicted_open_rate: scoreData.predicted_open_rate,
        predicted_reply_rate: scoreData.predicted_reply_rate,
        rewritten_email: scoreData.rewritten_email,
        top_3_improvements: scoreData.top_3_improvements,
        user_id: userId,
        ip_hash: ipHash,
      })
      .select('id')
      .single()

    if (dbError || !record) {
      console.error('Supabase insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save results. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(
      {
        id: record.id,
        ...scoreData,
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining - 1),
        },
      }
    )
  } catch (err) {
    console.error('Score API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
