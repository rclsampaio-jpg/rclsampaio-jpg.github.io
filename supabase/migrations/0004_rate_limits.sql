-- Generic rate-limiting log, used by public/low-auth endpoints (signup,
-- Renata OS chat, support email) to throttle abuse. `key` is caller-defined
-- (e.g. "signup:<ip>", "chat:<user_id>", "support:<ip>") — callers count
-- rows within a time window instead of relying on per-endpoint state,
-- since both the Cloudflare Worker and the Supabase Edge Functions are
-- stateless per-request and have no shared in-memory store between them.
create table rate_limit_events (
  key text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_events_key_created_idx on rate_limit_events (key, created_at desc);

alter table rate_limit_events enable row level security;
-- No policies: only the service_role (Edge Functions / Worker) touches this
-- table, same pattern as invite_codes.

-- Old rows are cheap to keep, but nothing needs them past the widest
-- window any caller uses (currently 15 minutes) — periodic manual cleanup
-- is fine for now given the low expected volume; revisit with a cron/pg_cron
-- job if this table grows large.
