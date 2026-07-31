# Autenticação de usuário com sincronização de progresso

## Contexto

Hoje o app RenaSer é uma SPA estática (React + Vite, sem backend) hospedada
no GitHub Pages. Todo o acesso é controlado por um `ACCESS_PASSPHRASE`
compartilhado (`src/App.tsx`), e o progresso de cada usuária (`UserProgress`)
vive só em `localStorage` do dispositivo — sem conta individual e sem
sincronização entre aparelhos.

Objetivo: substituir a senha compartilhada por contas individuais
(email + senha), manter o controle de quem pode se cadastrar via código de
convite, e sincronizar o progresso na nuvem.

## Backend escolhido: Supabase

Supabase fornece, num único serviço gerenciado:
- **Auth**: cadastro/login por email+senha, sessão, recuperação de senha.
- **Postgres**: banco de dados relacional com **Row Level Security (RLS)** —
  cada usuária só pode ler/escrever as próprias linhas, aplicado no nível do
  banco (não depende de checagem no front-end).
- **Edge Functions / RPC**: lógica que precisa rodar no servidor (como
  validar um código de convite) sem precisar hospedar um servidor próprio.

O front-end continua 100% estático no GitHub Pages; o Supabase é acessado
via `supabase-js` direto do navegador, usando a `anon key` pública (segura
de expor — a proteção real vem das políticas de RLS, não do sigilo da
chave).

## Modelo de dados (Postgres)

```sql
-- Perfis de usuária (espelha auth.users, guarda campos extras se precisar)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Progresso de cada usuária (substitui o localStorage como fonte de verdade)
create table user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,           -- serializa o UserProgress existente (src/types.ts) sem remodelar
  updated_at timestamptz not null default now()
);

-- Códigos de convite (um código = uma conta)
create table invite_codes (
  code text primary key,
  used_by uuid references auth.users(id),
  used_at timestamptz,
  created_at timestamptz not null default now()
);
```

RLS: `profiles` e `user_progress` — usuária só acessa a própria linha
(`auth.uid() = id` / `auth.uid() = user_id`). `invite_codes` — sem acesso
direto do cliente; só a Edge Function de cadastro pode ler/gravar (usa a
`service_role` key, que fica só no servidor da função, nunca no bundle).

Guardar o progresso como um único campo `jsonb` (em vez de normalizar em
várias tabelas) é proposital: o formato de `UserProgress` já existe e é
usado extensivamente no front-end (`src/types.ts`); serializar o objeto
inteiro evita reescrever toda a lógica de leitura/escrita hoje espalhada
em `HomeView.tsx`, `DailyMissionView.tsx`, `JourneyView.tsx` etc.
Se um campo específico precisar virar consulta/relatório no futuro, essa é
uma migração separada — fora do escopo aqui (YAGNI).

## Fluxo de cadastro

1. Tela de cadastro pede **email, senha, código de convite**.
2. O front-end chama uma **Edge Function** (`validate-invite-and-signup`)
   em vez de checar o código direto contra a tabela — assim o código nunca
   fica legível no navegador de quem está tentando adivinhar.
3. A função: valida o código existe e `used_by IS NULL`; se válido, cria a
   conta via Supabase Auth Admin API, marca o código como usado
   (`used_by`, `used_at`), cria a linha em `profiles`.
4. Se o código for inválido/já usado, retorna erro amigável
   ("código inválido ou já utilizado").

Login subsequente é email+senha padrão do Supabase Auth — não pede código
de novo.

## Geração de códigos (admin)

Nova tela dentro do app, protegida pelo `ADMIN_PASSPHRASE` já existente
(`src/App.tsx`, ~linha 92). Um botão "Gerar código" chama uma Edge Function
(`admin-generate-invite`) que insere uma linha em `invite_codes` com um
código aleatório (ex: 8 caracteres alfanuméricos) e devolve pra copiar.

A rota de admin continua gated pela passphrase existente — não estamos
trocando o mecanismo de admin, só adicionando uma ação nova a ele.

## Sincronização de progresso

- Ao logar, o app busca `user_progress.data` no Supabase e usa como fonte
  de verdade; grava uma cópia em `localStorage` como cache (permite abrir
  rápido e funcionar com internet instável).
- Toda alteração de progresso salva localmente **e** envia pro Supabase
  (debounced, para não gerar uma escrita por clique).
- **Migração de quem já tinha progresso local antes da conta existir**: no
  primeiro login de uma conta nova, se `user_progress` estiver vazio na
  nuvem e existir progresso em `localStorage`, o app faz upload desse
  progresso local uma única vez antes de passar a tratar a nuvem como
  fonte de verdade.
- **Conflito entre dispositivos** (ex: mesma conta logada em dois
  aparelhos): resolvido por "o save mais recente vence"
  (`updated_at` mais novo sobrescreve) — sem merge de campo a campo, que
  seria complexidade desnecessária para o padrão de uso esperado (uma
  pessoa, uso ocasional em mais de um aparelho).

## O que muda no código existente

- `ACCESS_PASSPHRASE` (`src/App.tsx`) é **removido** — substituído pelo
  gate de login do Supabase Auth.
- `ADMIN_PASSPHRASE` **permanece como está** — continua gatekeeping a área
  administrativa, que agora inclui a geração de códigos de convite.
- Novo módulo `src/lib/supabase.ts` — cliente Supabase configurado com
  `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (variáveis de ambiente
  públicas, injetadas no build).
- Novo contexto de autenticação (`src/contexts/AuthContext.tsx` ou
  equivalente) expondo usuária atual, estado de login/logout, e as funções
  de cadastro/login.
- Pontos de leitura/escrita de `UserProgress` (`HomeView.tsx`,
  `DailyMissionView.tsx`, `JourneyView.tsx`) passam a ler/escrever via um
  hook que sincroniza local + nuvem, em vez de só `localStorage` direto.

## Fora de escopo (explicitamente não fazendo agora)

- Login social (Google) — não pedido, adiciona complexidade de OAuth
  dentro do PWA standalone do iOS sem necessidade clara agora.
- Link mágico por email — email+senha já resolve o caso de uso.
- Merge de progresso campo a campo entre dispositivos — "último save
  vence" é suficiente para o padrão de uso.
- Recuperação de senha customizada — usar o fluxo padrão do Supabase Auth
  (email de reset), sem tela própria por enquanto.
