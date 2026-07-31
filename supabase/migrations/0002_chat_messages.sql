create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_user_id_created_at_idx
  on chat_messages (user_id, created_at desc);

alter table chat_messages enable row level security;

create policy "own messages select" on chat_messages
  for select using (auth.uid() = user_id);
create policy "own messages insert" on chat_messages
  for insert with check (auth.uid() = user_id);
