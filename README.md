# ColdScore.ai — AI Cold Email Scorer

> "Know if your cold email is good — before you hit send."

Paste any cold email → Claude AI scores it 0–100 across 6 dimensions → AI rewrite → shareable score URL.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Jaiprathap26/coldscore-ai&env=ANTHROPIC_API_KEY,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET,STRIPE_PRO_PRICE_ID,STRIPE_TEAM_PRICE_ID,NEXT_PUBLIC_APP_URL&envDescription=API%20keys%20needed%20for%20ColdScore.ai&project-name=coldscore-ai&repository-name=coldscore-ai)

## Features

- **6-Dimension Scoring** — Personalization, Subject Line, Clarity of Offer, CTA Strength, Length & Readability, Tone
- **AI Rewrite** — Shows how to score 90+ with Claude
- **Shareable Score URL** — `/share/[id]` for every scored email  
- **Free Tier** — 5 grades/day (IP-based)
- **Pro** ($9/mo) + **Team** ($29/mo) via Stripe

## Quick Deploy

### Option 1 — One-Click Vercel Deploy (5 minutes)
Click the "Deploy with Vercel" button above. You'll be prompted for env vars.

### Option 2 — CLI Deploy
```bash
git clone https://github.com/Jaiprathap26/coldscore-ai
cd coldscore-ai
npm install
cp .env.example .env.local
# Fill in .env.local with your keys
npx vercel --prod
```

## Required Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key (sk-ant-...) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth public key |
| `CLERK_SECRET_KEY` | Clerk auth secret key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro ($9/mo) |
| `STRIPE_TEAM_PRICE_ID` | Stripe price ID for Team ($29/mo) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (after deploy) |

## Tech Stack

- Next.js 14 (App Router)
- TypeScript + TailwindCSS
- Claude claude-sonnet-4-5 API (Anthropic)
- Clerk Auth
- Supabase (PostgreSQL)
- Stripe
- Vercel

## Database Setup

See `SUPABASE-SCHEMA.sql` for the full schema. Run in Supabase SQL editor before first launch.

## Scoring Dimensions

1. **Personalization** (0-20) — Is it specific to the recipient?
2. **Subject Line** (0-20) — Open-worthy, curiosity-driving?
3. **Clarity of Offer** (0-20) — Is the offer obvious?
4. **CTA Strength** (0-20) — Single, clear, low-friction ask?
5. **Length & Readability** (0-10) — Under 150 words, short paragraphs?
6. **Tone** (0-10) — Human/conversational vs. corporate?

---

Built by Amelia Forge for prathap's SaaS portfolio.
