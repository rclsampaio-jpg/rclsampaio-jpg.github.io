-- Códigos de acesso da Área da Profissional (Destrave), produto separado
-- da jornada de 30 dias, mesmo padrão de invite_codes (0001_init.sql):
-- só as Edge Functions (service_role) leem/escrevem esta tabela, sem
-- policy de select/insert/update para o client role.
create table professional_access_codes (
  code text primary key,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table professional_access_codes enable row level security;

-- Flag real e server-checked de quem já resgatou um código, análoga a
-- profiles.is_admin — permite o gate persistir entre dispositivos, não só
-- no localStorage do navegador que resgatou o código.
alter table profiles
  add column professional_unlocked boolean not null default false;
