-- Habilita Realtime na tabela user_progress: sem isso o app da aluna só
-- lê o progresso da nuvem uma vez, no login, e uma ação de admin (ex.:
-- "premiar dia") feita enquanto o app dela já está aberto (comum no PWA
-- do iPhone) nunca chega até a tela — e pode até ser sobrescrita depois.
alter publication supabase_realtime add table user_progress;
