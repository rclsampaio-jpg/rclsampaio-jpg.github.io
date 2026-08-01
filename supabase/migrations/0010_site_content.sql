-- Generic key/value store for editable site copy/images. Lets a real
-- server-side admin (profiles.is_admin, see 0003_admin_flag.sql) edit
-- content that shows up for every visitor, instead of the old CMS
-- (CmsView.tsx) which only ever wrote to localStorage and so only ever
-- changed what was visible in the editor's own browser.
--
-- Reading is public (anon included) so every visitor's page render can
-- pick up overrides; writing is restricted to admins via RLS, mirroring
-- the exists-subquery style used for admin checks elsewhere in this repo.

create table site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table site_content enable row level security;

create policy "site_content public read" on site_content
  for select using (true);

create policy "site_content admin write" on site_content
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  )
  with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
