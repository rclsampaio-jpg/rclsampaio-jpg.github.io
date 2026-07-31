-- Registro leve de consumo de conteúdo (áudio/vídeo/pdf), para a aba
-- Analytics do admin. Cada linha é "esta usuária abriu este asset nesta
-- hora" — não guarda histórico de reprodução minuto a minuto, só eventos
-- de abertura/play, o suficiente para ranking de mais/menos consumidos.
create table engagement_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('daily_audio', 'library_audio', 'library_video', 'library_pdf', 'weekly_video')),
  asset_id text not null,
  day_number integer,
  created_at timestamptz not null default now()
);

create index engagement_events_asset_idx on engagement_events (media_type, asset_id, created_at desc);
create index engagement_events_user_idx on engagement_events (user_id, created_at desc);

alter table engagement_events enable row level security;

-- Cada usuária só pode inserir eventos com o próprio user_id (nada de
-- select/update/delete pelo client — a leitura agregada é feita pela
-- Edge Function admin-analytics via service_role, que ignora RLS).
create policy "own events insert" on engagement_events
  for insert with check (auth.uid() = user_id);

-- Realtime não é necessário aqui (a aba Analytics apenas recarrega sob
-- demanda), então não entra na publication supabase_realtime.
