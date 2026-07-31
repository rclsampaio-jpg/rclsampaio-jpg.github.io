# Renata OS — Design

## Contexto

O repositório `rclsampaio-jpg/rclsampaio-jpg.github.io` já tem um float button "Renata OS" com um backend parcial funcionando:

- **`renata-os-worker`**: Cloudflare Worker que faz proxy pro Gemini 2.0 Flash, protegendo a API key. System prompt em PT/EN/ES já escrito, definindo a Renata OS como mentora calorosa e direta dentro do "programa de 30 dias contra medo de exposição online". Injeta contexto de progresso (`dayNumber`, `completedDays`, `currentStreak`). É **stateless** — nenhuma mensagem é persistida.
- **`supabase/migrations/0001_init.sql`**: tabelas `profiles`, `user_progress`, `invite_codes`, todas com RLS habilitado.
- **`referencias/`** (num diretório de skills local, não no repo do app): frameworks de conteúdo já escritos — ganchos, formatos, SEO, thumbnail/título. Vou colar o conteúdo desses arquivos à parte se precisar.

Este spec cobre a evolução da Renata OS de "mentora do programa de 30 dias" para **copiloto geral de crescimento no Instagram e criação de conteúdo**, com memória de conversa.

## Decisões

1. **Escopo**: expandir além do programa de 30 dias. A Renata OS deve responder sobre qualquer dúvida de crescimento/conteúdo, usando os frameworks de `referencias/` como conhecimento base, mantendo o tom caloroso/direto já definido.
2. **Memória**: a IA deve lembrar do histórico de conversa do usuário entre sessões (persistido no Supabase), não só dentro da sessão aberta.
3. **Modelos**: via **OpenRouter**, com Gemini (versão mais recente) como modelo primário e um modelo GPT barato (ex: GPT-4o mini) como fallback automático em caso de falha/rate-limit.
4. **Orquestração**: sem n8n. Tudo direto no Worker + Supabase — é um chat em tempo real, não uma automação por etapas, e a stack atual já resolve isso sem camada extra.

## Arquitetura

```
Frontend (React/TS, GitHub Pages)
│  chat widget (float button)
▼
Cloudflare Worker (renata-os-worker)
│  1. autentica usuário via Supabase (JWT)
│  2. busca histórico recente (chat_messages) + progresso (user_progress)
│  3. monta prompt: system prompt expandido + referencias/ + histórico
│  4. chama OpenRouter → Gemini (primário) → GPT barato (fallback)
│  5. salva pergunta + resposta em chat_messages
▼
OpenRouter → Gemini 2.5 Flash (ou mais recente) / GPT-4o mini (fallback)
```

## Componentes e mudanças

### 1. System prompt expandido (`renata-os-worker/src/index.js`)
Passa a cobrir crescimento de Instagram e criação de conteúdo em geral, incorporando os frameworks de `referencias/` (ganchos, formatos, SEO, thumbnail/título) como conhecimento de base, além do conteúdo já existente sobre o programa de 30 dias. Mantém o tom já validado (caloroso, direto, breve — 2 a 5 frases salvo quando o tema pede mais detalhe).

### 2. Nova tabela `chat_messages` (nova migration Supabase)
```sql
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
-- RLS: usuário só lê/escreve as próprias mensagens (mesmo padrão de profiles/user_progress)
```

### 3. Worker passa a ser stateful
- Antes de chamar o modelo: busca as últimas 20 mensagens do user_id autenticado.
- Injeta esse histórico no prompt, junto do contexto de progresso já existente.
- Depois de obter a resposta: grava as duas mensagens (user + assistant) em `chat_messages`.

### 4. Troca de provedor: Gemini direto → OpenRouter
- Secret do Worker passa de `GEMINI_API_KEY` para `OPENROUTER_API_KEY`.
- Request usa formato OpenAI-compatível do OpenRouter, com lista de modelos [gemini-primário, gpt-fallback] para fallback automático.

## Tratamento de erro

- Supabase indisponível ao buscar histórico → segue sem histórico (degrada, não quebra o chat).
- OpenRouter/ambos os modelos falham → mensagem de fallback amigável no chat, sem vazar erro técnico ao usuário.
- Usuário não autenticado → Worker rejeita a requisição (rota protegida por JWT, RLS garante isolamento de dados).

## Teste

- `wrangler dev` local, mockando resposta do Supabase e do OpenRouter.
- Verificar que o histórico é injetado corretamente (ex: a IA lembra de uma informação dada na mensagem anterior).
- Verificar isolamento via RLS (um usuário não consegue ler `chat_messages` de outro).
- Verificar fallback: simular falha do modelo primário e confirmar que o fallback responde.

## Fora de escopo (por ora)

- Fine-tuning de modelo.
- Automações fora do chat (ex: sync agendado de métricas do Instagram) — candidato a usar n8n no futuro, mas não faz parte deste spec.
- Autenticação/onboarding — já resolvido pelas tabelas existentes (`profiles`, `invite_codes`).

---

## Decisões de implementação confirmadas (pós-conferência com o código real)

Conferido em 2026-07-31 contra `renata-os-worker/src/index.js`, `renata-os-worker/wrangler.toml`, `src/components/RenataOSChat.tsx`, `src/config.ts` e `supabase/migrations/`. A arquitetura acima bate com o código atual; os pontos abaixo eram premissas do spec que não existiam ainda e foram decididos nesta conversa:

- **Autenticação JWT é uma peça nova, não um ajuste**: hoje o frontend não envia nenhum token pro Worker, e o Worker não valida nada — precisa ser implementado do zero (frontend passa a enviar o token de sessão do Supabase Auth; Worker passa a validá-lo).
- **RLS a partir do Worker usa o JWT do próprio usuário**, não a chave `service_role` — diferente do padrão usado nas Edge Functions da autenticação (`validate-invite-and-signup`, `admin-generate-invite`), que sempre usam `service_role`. Aqui o cliente Supabase do Worker deve ser criado por requisição, com o JWT do usuário autenticado, para que o RLS do Postgres aplique `auth.uid()` naturalmente — decisão confirmada com a dona do produto: mantém o isolamento garantido pelo banco, não pela lógica do Worker.
- **`referencias/`** hoje mora fora do repo do app, em `~/Desktop/BRABO/referencias/` (ganchos.md, formatos.md, seo.md, thumbnail-titulo.md). Decisão: copiar esses 4 arquivos para dentro de `renata-os-worker/`, e o código lê o conteúdo deles em runtime pra montar o system prompt — mais fácil de atualizar depois sem mexer em código.
- **`@supabase/supabase-js` não é dependência do Worker ainda** — precisa ser adicionada.
- **O Worker já está publicado e em produção** (`https://renata-os-worker.renaser.workers.dev`), respondendo requisições reais do site ao vivo. `wrangler` já está autenticado nesta máquina (`rcl.sampaio@gmail.com`), então publicar mudanças e configurar secrets (`wrangler secret put`) é possível sem nova autenticação — exceto colar a chave da OpenRouter em si, que só a dona tem.
- **Evidência ao vivo do problema que este spec resolve**: testado em 2026-07-31, o Worker atual retornou `502` com `"Gemini API error"` e detalhe `"code": 429, quota exceeded"` — confirma que o fallback de modelo (Gemini → GPT via OpenRouter) resolve um problema real acontecendo agora, não hipotético.
