-- 0003_admin_flag.sql usava um UPDATE, que não faz nada se a conta ainda
-- não tinha linha em profiles. Contas criadas via login Google nunca
-- ganham essa linha (só o fluxo de signup por convite insere em
-- profiles), então a Renata provavelmente nunca teve is_admin=true de
-- fato — daí as Edge Functions admin-generate-invite/admin-manage-users
-- rejeitarem com 403 mesmo estando logada como admin.

-- 1) Garante a linha da Renata existir e estar marcada como admin,
--    sem depender de já existir (upsert em vez de update).
insert into profiles (id, is_admin)
select id, true
from auth.users
where email = 'rcl.sampaio@gmail.com'
on conflict (id) do update set is_admin = true;

-- 2) Trigger para que toda conta nova (inclusive login Google, que
--    pula o fluxo de signup por convite) ganhe automaticamente uma
--    linha em profiles, evitando este mesmo bug para futuras contas.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, is_admin)
  values (new.id, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
