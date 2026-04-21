-- ============================================================
-- ColdScore.ai — Supabase SQL Schema
-- Run this in your Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- ── scores table ─────────────────────────────────────────────
create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  email_content text not null,
  recipient_context text,
  total_score integer not null check (total_score >= 0 and total_score <= 100),
  dimensions jsonb not null,
  predicted_open_rate text,
  predicted_reply_rate text,
  rewritten_email text,
  top_3_improvements text[],
  user_id text,            -- Clerk user ID (null for anonymous)
  ip_hash text,            -- SHA-256 of IP (for rate limiting)
  created_at timestamptz default now()
);

create index if not exists scores_user_id_idx   on scores(user_id);
create index if not exists scores_ip_hash_idx   on scores(ip_hash, created_at);
create index if not exists scores_created_at_idx on scores(created_at desc);

-- Row Level Security
alter table scores enable row level security;

-- Authenticated users can read their own scores
create policy "users read own scores"
  on scores for select
  using (user_id = auth.uid()::text);

-- Service role has full access (used by API routes)
create policy "service role full access"
  on scores for all
  using (true)
  with check (true);

-- ── subscriptions table ───────────────────────────────────────
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,           -- Clerk user ID
  plan text not null default 'free',      -- 'free' | 'pro' | 'team'
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'active',           -- 'active' | 'canceled' | 'past_due'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists subscriptions_user_id_idx on subscriptions(user_id);

alter table subscriptions enable row level security;

create policy "users read own subscription"
  on subscriptions for select
  using (user_id = auth.uid()::text);

create policy "service role full subscription access"
  on subscriptions for all
  using (true)
  with check (true);
