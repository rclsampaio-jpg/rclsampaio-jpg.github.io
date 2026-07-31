-- invite_codes.used_by referenciava auth.users(id) sem "on delete
-- cascade"/"on delete set null" (diferente de profiles, user_progress e
-- chat_messages, que já tinham cascade). Isso trava a exclusão de contas
-- que se cadastraram via código de convite: o Postgres recusa o delete
-- em auth.users por violar essa FK, e o admin-manage-users/deleteAccount
-- recebe um erro sem mensagem legível (aparece como "{}" no painel).
--
-- Troca para "on delete set null": o código de convite continua existindo
-- no histórico, só perde a referência a quem o usou.
alter table invite_codes
  drop constraint invite_codes_used_by_fkey;

alter table invite_codes
  add constraint invite_codes_used_by_fkey
  foreign key (used_by) references auth.users(id) on delete set null;
