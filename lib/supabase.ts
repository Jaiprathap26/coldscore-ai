import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase (uses service role key — only use in API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScoreRecord {
  id: string
  email_content: string
  recipient_context: string | null
  total_score: number
  dimensions: {
    personalization: DimensionScore
    subject_line: DimensionScore
    clarity_of_offer: DimensionScore
    cta_strength: DimensionScore
    length_readability: DimensionScore
    tone: DimensionScore
  }
  predicted_open_rate: string
  predicted_reply_rate: string
  rewritten_email: string
  top_3_improvements: string[]
  user_id: string | null
  ip_hash: string | null
  created_at: string
}

export interface DimensionScore {
  score: number
  max: number
  feedback: string
}

// ─── Supabase SQL Schema (run in Supabase SQL editor) ──────────────────────────
/*
create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  email_content text not null,
  recipient_context text,
  total_score integer not null,
  dimensions jsonb not null,
  predicted_open_rate text,
  predicted_reply_rate text,
  rewritten_email text,
  top_3_improvements text[],
  user_id text,
  ip_hash text,
  created_at timestamptz default now()
);

-- Index for fast lookups by user
create index scores_user_id_idx on scores(user_id);
create index scores_ip_hash_idx on scores(ip_hash);
create index scores_created_at_idx on scores(created_at desc);

-- Row Level Security
alter table scores enable row level security;

-- Users can read their own scores
create policy "users can read own scores"
  on scores for select
  using (user_id = auth.uid()::text);

-- Service role can insert/read all (API routes use service role)
create policy "service role full access"
  on scores for all
  using (true)
  with check (true);
*/
