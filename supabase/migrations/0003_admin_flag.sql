-- Marca a conta da Renata como admin real, para que as Edge Functions
-- privilegiadas (admin-generate-invite, admin-manage-users) reconheçam a
-- conta via checagem server-side de profiles.is_admin, em vez de depender
-- só do ADMIN_PASSPHRASE client-side (que qualquer pessoa lendo o bundle
-- consegue ver).
update profiles
set is_admin = true
where id = (select id from auth.users where email = 'rcl.sampaio@gmail.com');
