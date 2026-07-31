create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table invite_codes (
  code text primary key,
  used_by uuid references auth.users(id),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table user_progress enable row level security;
alter table invite_codes enable row level security;

create policy "own profile" on profiles
  for select using (auth.uid() = id);

create policy "own progress select" on user_progress
  for select using (auth.uid() = user_id);
create policy "own progress upsert" on user_progress
  for insert with check (auth.uid() = user_id);
create policy "own progress update" on user_progress
  for update using (auth.uid() = user_id);

-- invite_codes: sem policy de select/insert/update para o client role
-- (authenticated/anon). Só as Edge Functions, usando a service_role key,
-- acessam esta tabela — service_role ignora RLS por padrão no Supabase.
