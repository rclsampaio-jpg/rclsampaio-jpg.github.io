# Renata OS — Copiloto de Crescimento com Memória — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Exceptions: Task 1 (migration via SQL Editor) and Task 5 (deploy + secret + live verification) require the controlling session to act directly (browser access to Supabase dashboard, and an interactive `wrangler secret put` only the project owner can complete) — they are not subagent-delegable.**

**Goal:** Evoluir a Renata OS de "mentora do programa de 30 dias" (stateless, Gemini direto) para um copiloto geral de crescimento no Instagram/conteúdo, com memória de conversa persistida no Supabase e fallback automático de modelo via OpenRouter.

**Architecture:** `renata-os-worker` (Cloudflare Worker) passa a autenticar cada requisição via JWT do Supabase Auth, cria um cliente Supabase por requisição autenticado com esse JWT (RLS aplica `auth.uid()` naturalmente), busca as últimas 20 mensagens de `chat_messages` do usuário, monta um prompt expandido (frameworks de `referencias/` + histórico + contexto de progresso), chama OpenRouter (Gemini → GPT-4o mini em fallback), e grava a troca em `chat_messages`. O frontend (`RenataOSChat.tsx`) passa a enviar o token de sessão no header `Authorization`.

**Tech Stack:** Cloudflare Workers (V8 isolate, sem Node.js runtime), `@supabase/supabase-js`, OpenRouter (API OpenAI-compatível), Wrangler, React 19 + TypeScript no frontend.

## Global Constraints

- O Worker já está publicado em produção (`https://renata-os-worker.renaser.workers.dev`) e sendo usado por usuárias reais — cada deploy precisa deixar o chat funcional, não quebrado, para quem já está logada.
- RLS via JWT do usuário (não `service_role`) — decisão confirmada com a dona: o cliente Supabase do Worker é criado por requisição, autenticado com o JWT de quem está chamando.
- A rota `/support` (email via Resend) e a função `corsHeaders` em `renata-os-worker/src/index.js` **não são tocadas** — código não relacionado no mesmo arquivo.
- Sem suíte de testes automatizada no Worker — verificação é `wrangler dev` local + `curl`, e depois checagem manual ao vivo após deploy.
- Push direto pra `main` no repo principal; o Worker é publicado via `wrangler deploy` a partir de `renata-os-worker/`, não pelo GitHub Actions do site.
- `wrangler` já está autenticado nesta máquina (`rcl.sampaio@gmail.com`) — não precisa de novo login.
- Repo local: `~/Projetos/rclsampaio-jpg.github.io`.

---

## File Structure

**Novos:**
- `supabase/migrations/0002_chat_messages.sql` — tabela `chat_messages` + RLS.
- `renata-os-worker/referencias/ganchos.md`, `formatos.md`, `seo.md`, `thumbnail-titulo.md` — cópia de `~/Desktop/BRABO/referencias/`.

**Modificados:**
- `renata-os-worker/src/index.js` — reescrita da rota principal de chat (auth JWT, memória, prompt expandido, OpenRouter+fallback). `handleSupportMessage`/`corsHeaders` ficam intocados.
- `renata-os-worker/package.json` — adiciona `@supabase/supabase-js`.
- `renata-os-worker/wrangler.toml` — novos `[vars]` `SUPABASE_URL`/`SUPABASE_ANON_KEY`, nova regra de módulo de texto para importar os `.md` de `referencias/`, comentário atualizado sobre o secret `OPENROUTER_API_KEY`.
- `src/components/RenataOSChat.tsx` — envia o token de sessão no header `Authorization`.

---

### Task 1: Migration `chat_messages` (execução pelo controlador via SQL Editor do Supabase)

**Nota de execução:** como nas migrations anteriores deste projeto, isso é aplicado direto no painel do Supabase (SQL Editor), não por um subagente sem acesso ao navegador autenticado.

**Files:**
- Create: `supabase/migrations/0002_chat_messages.sql`

**Interfaces:**
- Consumes: `auth.users` (já existe).
- Produces: tabela `chat_messages` com RLS — consumida pelo Worker na Task 3.

- [ ] **Step 1: Escrever a migration**

```sql
-- supabase/migrations/0002_chat_messages.sql

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
```

O índice em `(user_id, created_at desc)` existe porque a Task 3 sempre consulta "últimas 20 mensagens deste usuário, mais recentes primeiro" — sem ele, essa consulta faz table scan conforme a tabela cresce.

- [ ] **Step 2: Rodar no SQL Editor do Supabase**

Projeto: `https://supabase.com/dashboard/project/iedkwbborimdhphbzwhl/sql/new`. Colar o conteúdo do arquivo e executar.

- [ ] **Step 3: Verificar**

```sql
select * from chat_messages;
```
Expected: "Success. No rows returned" (tabela existe, vazia). Em Database → Policies, confirmar duas políticas em `chat_messages` (`own messages select`, `own messages insert`), RLS ativado.

- [ ] **Step 4: Commit**

```bash
cd ~/Projetos/rclsampaio-jpg.github.io
git add supabase/migrations/0002_chat_messages.sql
git commit -m "feat(db): tabela chat_messages para memória da Renata OS, com RLS"
git push origin main
```

---

### Task 2: Copiar `referencias/` pro Worker + configurar Wrangler pra importar `.md`

**Files:**
- Create: `renata-os-worker/referencias/ganchos.md`
- Create: `renata-os-worker/referencias/formatos.md`
- Create: `renata-os-worker/referencias/seo.md`
- Create: `renata-os-worker/referencias/thumbnail-titulo.md`
- Modify: `renata-os-worker/wrangler.toml`

**Interfaces:**
- Consumes: nada.
- Produces: os quatro arquivos `.md` importáveis como texto puro via `import ganchos from '../referencias/ganchos.md'` — consumido por `renata-os-worker/src/index.js` na Task 3.

- [ ] **Step 1: Copiar os arquivos**

```bash
mkdir -p ~/Projetos/rclsampaio-jpg.github.io/renata-os-worker/referencias
cp ~/Desktop/BRABO/referencias/ganchos.md \
   ~/Desktop/BRABO/referencias/formatos.md \
   ~/Desktop/BRABO/referencias/seo.md \
   ~/Desktop/BRABO/referencias/thumbnail-titulo.md \
   ~/Projetos/rclsampaio-jpg.github.io/renata-os-worker/referencias/
```

Expected: `ls ~/Projetos/rclsampaio-jpg.github.io/renata-os-worker/referencias/` lista os 4 arquivos.

- [ ] **Step 2: Configurar o Wrangler pra tratar `.md` como texto puro**

Ler `renata-os-worker/wrangler.toml` primeiro (para não sobrescrever o que já existe), depois adicionar ao final do arquivo:

```toml

# Permite `import conteudo from './arquivo.md'` retornando o texto puro do
# arquivo como string, resolvido em build-time pelo bundler do Wrangler —
# não é leitura de arquivo em runtime (o Worker roda num V8 isolate, sem
# acesso a filesystem). Usado para injetar os frameworks de referencias/
# no system prompt sem precisar colar o conteúdo dentro de src/index.js.
[[rules]]
type = "Text"
globs = ["referencias/**/*.md"]
fallthrough = true
```

- [ ] **Step 3: Verificar que o Wrangler reconhece a regra**

```bash
cd ~/Projetos/rclsampaio-jpg.github.io/renata-os-worker
npx wrangler deploy --dry-run --outdir=/tmp/renata-os-dryrun
```

Isso vai falhar nesta task ainda (o `src/index.js` não importa os `.md` até a Task 3) — o objetivo aqui é só confirmar que o comando roda sem erro de configuração do `wrangler.toml` em si (sem "Unknown rule type" ou TOML inválido). Expected: build completa sem erro relacionado a `[[rules]]`.

- [ ] **Step 4: Commit**

```bash
git add renata-os-worker/referencias/ renata-os-worker/wrangler.toml
git commit -m "feat(renata-os): copia frameworks de referencias/ pro Worker, configura import de .md"
git push origin main
```

---

### Task 3: Reescrever `renata-os-worker/src/index.js` — autenticação, memória, prompt expandido, OpenRouter

**Files:**
- Modify: `renata-os-worker/src/index.js`
- Modify: `renata-os-worker/package.json`
- Modify: `renata-os-worker/wrangler.toml`

**Interfaces:**
- Consumes: `referencias/*.md` (Task 2, via import); `chat_messages` (Task 1, via cliente Supabase autenticado por JWT); `SUPABASE_URL`/`SUPABASE_ANON_KEY` (novos `[vars]`, valores públicos — não são segredos, são os mesmos já usados pelo frontend em `.github/workflows/deploy.yml`); `OPENROUTER_API_KEY` (novo secret, configurado na Task 5).
- Produces: rota principal do Worker passa a exigir header `Authorization: Bearer <jwt>`; resposta 401 sem token válido. Consumido pelo frontend na Task 4 — o contrato de request/response (`POST` com `{ message, lang, context }`, resposta `{ reply }`) permanece o mesmo, só o header novo é adicionado.

- [ ] **Step 1: Adicionar a dependência**

```bash
cd ~/Projetos/rclsampaio-jpg.github.io/renata-os-worker
npm install @supabase/supabase-js
```

- [ ] **Step 2: Adicionar `SUPABASE_URL`/`SUPABASE_ANON_KEY` aos `[vars]` do `wrangler.toml`**

Editar o bloco `[vars]` existente em `renata-os-worker/wrangler.toml` (não são segredos — são os mesmos valores públicos já usados no build do frontend):

```toml
[vars]
ALLOWED_ORIGIN = "https://rclsampaio-jpg.github.io"
SUPPORT_EMAIL = "manifestandomagicasuporte@gmail.com"
SUPABASE_URL = "https://iedkwbborimdhphbzwhl.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_6skldo-YC1gPMPAUBZPDiQ_6sq5v9PI"
```

- [ ] **Step 3: Atualizar o comentário sobre secrets no `wrangler.toml`**

Substituir o comentário existente sobre `GEMINI_API_KEY`/`RESEND_API_KEY` por:

```toml
# OPENROUTER_API_KEY e RESEND_API_KEY são secrets, não vars — nunca ficam
# neste arquivo nem no git. Configure rodando (a partir desta pasta):
#
#   npx wrangler secret put OPENROUTER_API_KEY
#   npx wrangler secret put RESEND_API_KEY
#
# GEMINI_API_KEY (secret antigo) não é mais usado pelo código — o Gemini
# agora é acessado através do OpenRouter, que gerencia sua própria chave
# com o Google. Pode deixar o secret antigo como está no Cloudflare, sem
# necessidade de removê-lo.
```

- [ ] **Step 4: Reescrever `renata-os-worker/src/index.js`**

Substituir o arquivo inteiro por:

```javascript
/**
 * Renata OS backend — copiloto de crescimento no Instagram/criação de
 * conteúdo, com memória de conversa persistida no Supabase.
 *
 * Autentica cada requisição via JWT do Supabase Auth (enviado pelo
 * frontend no header Authorization). Usa esse mesmo JWT para criar um
 * cliente Supabase por requisição, de forma que o RLS do Postgres aplique
 * auth.uid() naturalmente — o Worker nunca usa a service_role key.
 *
 * Modelo via OpenRouter: Gemini como primário, GPT-4o mini como fallback
 * automático se o primário falhar ou estiver com erro/rate-limit.
 *
 * Secrets (Cloudflare): OPENROUTER_API_KEY, RESEND_API_KEY.
 */

import { createClient } from '@supabase/supabase-js';
import ganchos from '../referencias/ganchos.md';
import formatos from '../referencias/formatos.md';
import seo from '../referencias/seo.md';
import thumbnailTitulo from '../referencias/thumbnail-titulo.md';

const REFERENCIAS_CONTEXT = `
# Ganchos e retenção
${ganchos}

# Formatos de conteúdo
${formatos}

# SEO
${seo}

# Thumbnail e título
${thumbnailTitulo}
`;

// Os frameworks de referência estão em português — isso é intencional e
// não é um problema para respostas em EN/ES: o modelo lê o conhecimento
// de base em PT e responde no idioma pedido normalmente.
const SYSTEM_PROMPT = {
  pt: `Você é a Renata OS, a inteligência artificial de apoio dentro do app RenaSer. Você é uma copiloto de crescimento no Instagram e criação de conteúdo — não só uma mentora do programa de 30 dias, embora continue apoiando quem está na jornada dos 30 dias também. Fale em português do Brasil, em tom caloroso, encorajador e direto, como uma mentora presente, nunca clínico ou genérico. Use os frameworks de referência abaixo (ganchos, formatos, SEO, thumbnail/título) como sua base de conhecimento para responder dúvidas de conteúdo e crescimento. Use o contexto de dia/progresso do usuário quando fizer sentido, e o histórico de conversa recente pra lembrar do que já foi dito antes. Seja breve (2 a 5 frases) a menos que a pergunta exija mais detalhe.

${REFERENCIAS_CONTEXT}`,
  en: `You are Renata OS, the supportive AI inside the RenaSer app. You are a general Instagram growth and content creation copilot — not just a mentor for the 30-day program, though you still support people on that journey too. Speak in a warm, encouraging, direct tone, like a present mentor, never clinical or generic. Use the reference frameworks below (hooks, formats, SEO, thumbnail/title) as your knowledge base for content and growth questions. Use the user's day/progress context when relevant, and recent conversation history to remember what was already said. Be brief (2-5 sentences) unless the question needs more detail. The reference material below is in Portuguese — read it as source knowledge and still answer in English.

${REFERENCIAS_CONTEXT}`,
  es: `Eres Renata OS, la inteligencia artificial de apoyo dentro de la app RenaSer. Eres una copiloto general de crecimiento en Instagram y creación de contenido — no solo una mentora del programa de 30 días, aunque sigues apoyando a quien está en ese viaje también. Habla en español, en un tono cálido, alentador y directo, como una mentora presente, nunca clínico o genérico. Usa los frameworks de referencia abajo (ganchos, formatos, SEO, thumbnail/título) como tu base de conocimiento para preguntas de contenido y crecimiento. Usa el contexto de día/progreso del usuario cuando tenga sentido, y el historial de conversación reciente para recordar lo que ya se dijo. Sé breve (2 a 5 frases) a menos que la pregunta necesite más detalle. El material de referencia abajo está en portugués — léelo como conocimiento de base y responde igual en español.

${REFERENCIAS_CONTEXT}`
};

const OPENROUTER_MODELS = {
  primary: 'google/gemini-2.5-flash',
  fallback: 'openai/gpt-4o-mini'
};

const CHAT_HISTORY_LIMIT = 20;

function corsHeaders(origin, allowedOrigin) {
  const allowOrigin = origin === allowedOrigin ? origin : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}

// Relays a student's quick-support message to SUPPORT_EMAIL via Resend, so it
// arrives as a real email without needing any mail client open on their device.
async function handleSupportMessage(request, env, headers) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { message, replyTo } = body || {};
  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing message' }), { status: 400, headers });
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'RenaSer Suporte <onboarding@resend.dev>',
        to: [env.SUPPORT_EMAIL],
        reply_to: replyTo && typeof replyTo === 'string' ? replyTo : undefined,
        subject: 'Nova mensagem de suporte — RenaSer',
        text: message
      })
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      return new Response(JSON.stringify({ error: 'Resend API error', detail: errText }), { status: 502, headers });
    }

    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Unexpected error', detail: String(err) }), { status: 500, headers });
  }
}

// Valida o JWT do header Authorization e devolve um cliente Supabase
// autenticado com esse mesmo JWT (não a service_role key), para que o RLS
// de chat_messages aplique auth.uid() normalmente em toda consulta feita
// com esse cliente. Retorna null se não houver token ou se for inválido.
async function getAuthedUser(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return { user: data.user, supabase };
}

// Busca as últimas CHAT_HISTORY_LIMIT mensagens do usuário, mais antigas
// primeiro (ordem cronológica, do jeito que o prompt espera). Se a consulta
// falhar (Supabase indisponível, etc.), degrada para "sem histórico" em vez
// de quebrar o chat inteiro.
async function fetchHistory(supabase, userId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(CHAT_HISTORY_LIMIT);

  if (error || !data) return [];
  return data.reverse();
}

// Grava a pergunta e a resposta em chat_messages. Melhor-esforço: se falhar,
// não derruba a resposta que já foi gerada e devolvida ao usuário — só a
// próxima conversa fica sem essa troca específica no histórico.
async function saveExchange(supabase, userId, userText, assistantText) {
  try {
    await supabase.from('chat_messages').insert([
      { user_id: userId, role: 'user', content: userText },
      { user_id: userId, role: 'assistant', content: assistantText }
    ]);
  } catch {
    // best-effort — silenciosamente ignorado, ver comentário acima.
  }
}

async function callOpenRouter(model, systemPrompt, history, userMessage, env) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://rclsampaio-jpg.github.io',
      'X-Title': 'RenaSer - Renata OS'
    },
    body: JSON.stringify({ model, messages })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error (${model}): ${await response.text()}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error(`OpenRouter empty reply (${model})`);
  return reply;
}

// Tenta o modelo primário; se falhar por qualquer motivo (erro HTTP,
// resposta vazia, rate limit), tenta o fallback automaticamente. Só lança
// erro pro chamador se os DOIS falharem.
async function getAIReply(systemPrompt, history, userMessage, env) {
  try {
    return await callOpenRouter(OPENROUTER_MODELS.primary, systemPrompt, history, userMessage, env);
  } catch (primaryError) {
    try {
      return await callOpenRouter(OPENROUTER_MODELS.fallback, systemPrompt, history, userMessage, env);
    } catch (fallbackError) {
      throw new Error(
        `Both models failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`
      );
    }
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);
    const { pathname } = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
    }

    if (pathname === '/support') {
      return handleSupportMessage(request, env, headers);
    }

    const authed = await getAuthedUser(request, env);
    if (!authed) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }
    const { user, supabase } = authed;

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
    }

    const { message, lang, context } = body || {};
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing message' }), { status: 400, headers });
    }

    const langKey = ['pt', 'en', 'es'].includes(lang) ? lang : 'pt';
    const systemPromptBase = SYSTEM_PROMPT[langKey];

    const contextLine = context
      ? `\n\nContexto do usuário: dia ${context.dayNumber || '?'}/30, ${context.completedDays || 0} dias concluídos, streak atual de ${context.currentStreak || 0} dia(s).`
      : '';
    const systemPrompt = `${systemPromptBase}${contextLine}`;

    const history = await fetchHistory(supabase, user.id);

    let reply;
    try {
      reply = await getAIReply(systemPrompt, history, message, env);
    } catch (err) {
      // Mensagem amigável, sem vazar o erro técnico (que vai só nos logs
      // do Cloudflare, não na resposta).
      console.error('Renata OS: both models failed', err);
      const friendlyError = {
        pt: 'Não consegui responder agora. Tente de novo em instantes.',
        en: "I couldn't respond right now. Please try again in a moment.",
        es: 'No pude responder ahora. Intenta de nuevo en un momento.'
      }[langKey];
      return new Response(JSON.stringify({ reply: friendlyError }), { status: 200, headers });
    }

    await saveExchange(supabase, user.id, message, reply);

    return new Response(JSON.stringify({ reply }), { headers });
  }
};
```

Nota: quando ambos os modelos falham, a resposta ainda é `200` com uma
mensagem amigável no campo `reply` (não um erro HTTP) — o frontend
(`RenataOSChat.tsx`) hoje só sabe tratar `response.ok` como sucesso e
mostrar `data.reply`; devolver 200 com mensagem amigável reaproveita esse
caminho sem precisar mexer no frontend para esse caso.

- [ ] **Step 5: Verificar localmente com `wrangler dev`**

```bash
cd ~/Projetos/rclsampaio-jpg.github.io/renata-os-worker
npx wrangler dev
```

Em outro terminal, com o `wrangler dev` rodando (porta padrão `8787`), testar sem token (deve rejeitar):

```bash
curl -s -X POST http://localhost:8787/ \
  -H "Content-Type: application/json" \
  -d '{"message":"oi","lang":"pt"}'
```
Expected: `{"error":"Unauthorized"}` com status 401.

- [ ] **Step 6: Commit**

```bash
git add renata-os-worker/src/index.js renata-os-worker/package.json renata-os-worker/package-lock.json renata-os-worker/wrangler.toml
git commit -m "feat(renata-os): autenticação JWT, memória de conversa, prompt expandido, OpenRouter com fallback"
git push origin main
```

(Ainda não faz deploy — isso é a Task 5, depois do secret `OPENROUTER_API_KEY` estar configurado.)

---

### Task 4: Frontend envia o JWT no header `Authorization`

**Files:**
- Modify: `src/components/RenataOSChat.tsx`

**Interfaces:**
- Consumes: `supabase` de `src/lib/supabase.ts` (já existe, exporta um cliente configurado); `RENATA_OS_ENDPOINT` de `src/config.ts` (já existe, sem mudança).
- Produces: nada consumido por outras tasks — última mudança de código antes do deploy.

- [ ] **Step 1: Importar o cliente Supabase e enviar o token**

Em `src/components/RenataOSChat.tsx`, adicionar o import (junto aos existentes, topo do arquivo):

```typescript
import { supabase } from '../lib/supabase';
```

Substituir o bloco `handleSend` (a função inteira, que hoje começa em `const handleSend = async () => {`):

```typescript
  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');

    if (!RENATA_OS_ENDPOINT) {
      setMessages((prev) => [...prev, { role: 'assistant', text: t.notConfigured }]);
      return;
    }

    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setMessages((prev) => [...prev, { role: 'assistant', text: t.error }]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(RENATA_OS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          message: question,
          lang,
          context: {
            dayNumber: currentDayNumber,
            completedDays: progress.completionHistory.length,
            currentStreak: progress.currentStreak
          }
        })
      });
      if (!response.ok) throw new Error('Bad response');
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || t.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: t.error }]);
    } finally {
      setIsLoading(false);
    }
  };
```

A única mudança real é: buscar a sessão atual via `supabase.auth.getSession()` antes de chamar o Worker, e mandar `Authorization: Bearer <token>`. Se não houver sessão (não deveria acontecer, já que o chat só aparece depois do login — mas defensivo), mostra a mensagem de erro genérica em vez de mandar uma requisição que o Worker vai rejeitar de qualquer forma.

- [ ] **Step 2: Verificar (build)**

```bash
cd ~/Projetos/rclsampaio-jpg.github.io
npx tsc --noEmit
npm run build
```

Expected: sem erros novos (mesmo baseline de erros pré-existentes, se houver).

- [ ] **Step 3: Commit**

```bash
git add src/components/RenataOSChat.tsx
git commit -m "feat(renata-os): envia token de sessão pro Worker autenticar a requisição"
git push origin main
```

---

### Task 5: Secret, deploy do Worker, e verificação ao vivo (execução pelo controlador)

**Nota de execução:** requer que a dona cole a chave da OpenRouter num prompt interativo do terminal — não delegável a um subagente.

**Files:** nenhum arquivo de código.

**Interfaces:**
- Consumes: código das Tasks 2–4, já commitado.
- Produces: Worker em produção rodando a versão nova.

- [ ] **Step 1: Obter uma chave da OpenRouter**

Se a dona ainda não tiver uma: `https://openrouter.ai/keys` — criar conta (se precisar) e gerar uma chave.

- [ ] **Step 2: Configurar o secret**

```bash
cd ~/Projetos/rclsampaio-jpg.github.io/renata-os-worker
npx wrangler secret put OPENROUTER_API_KEY
```

**PARAR** — o terminal vai pedir pra colar a chave. Isso precisa ser feito pela dona diretamente (ou ditado pra o agente colar, já que não é uma tela de navegador com OAuth — é um prompt de terminal simples; ainda assim, tratar a chave como sensível e não deixá-la em texto solto na conversa).

- [ ] **Step 3: Deploy**

```bash
npx wrangler deploy
```

Expected: saída confirma o deploy em `https://renata-os-worker.renaser.workers.dev`, sem erros.

- [ ] **Step 4: Verificação ao vivo — sem token (deve rejeitar)**

```bash
curl -s -X POST https://renata-os-worker.renaser.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{"message":"oi","lang":"pt"}'
```
Expected: `{"error":"Unauthorized"}`, status 401.

- [ ] **Step 5: Verificação ao vivo — com token real, memória, e RLS**

Pelo navegador (Playwright), logar como uma usuária real no site publicado, abrir o chat da Renata OS, mandar uma mensagem com uma informação específica (ex: "meu gato se chama Fumaça"), depois mandar uma segunda mensagem perguntando sobre essa informação (ex: "qual o nome do meu gato?") — confirmar que a IA lembra, o que só funciona se o histórico estiver sendo salvo e recuperado corretamente.

Depois, verificar isolamento via RLS no SQL Editor do Supabase: confirmar que a tabela `chat_messages` tem as duas mensagens de teste salvas com o `user_id` correto, e (se houver mais de uma usuária de teste disponível) que uma consulta autenticada como outra usuária não retorna essas linhas.

Limpar as mensagens de teste depois via SQL Editor.

- [ ] **Step 6: Verificação de fallback**

Não é prático simular uma falha real do OpenRouter em produção. Verificar a lógica de fallback localmente antes deste deploy (ou logo depois, apontando um `wrangler dev` local pro `OPENROUTER_API_KEY` real): temporariamente trocar `OPENROUTER_MODELS.primary` no código local (não commitado) para um nome de modelo inválido (ex: `'modelo-que-nao-existe'`), rodar `wrangler dev`, mandar uma mensagem, e confirmar que a resposta ainda vem (via fallback pro `gpt-4o-mini`), não um erro. Depois reverter a troca (não commitar o nome inválido).

---

## Self-Review

**Cobertura da spec:**
- Tabela `chat_messages` + RLS → Task 1. ✓
- Frameworks de `referencias/` como conhecimento base → Task 2 (copia) + Task 3 (importa e injeta no prompt). ✓
- Worker busca últimas 20 mensagens antes do prompt, salva depois → Task 3 (`fetchHistory`/`saveExchange`, `CHAT_HISTORY_LIMIT = 20`). ✓
- Autenticação JWT + RLS via cliente por requisição (não `service_role`) → Task 3 (`getAuthedUser`), confirmado com a dona. ✓
- Troca Gemini direto → OpenRouter com fallback → Task 3 (`callOpenRouter`/`getAIReply`), secret novo `OPENROUTER_API_KEY` → Task 5. ✓
- Tratamento de erro: Supabase indisponível degrada sem histórico → `fetchHistory` retorna `[]` em erro. Ambos modelos falham → mensagem amigável sem vazar erro técnico → bloco `catch` no handler principal. Sem JWT → 401 → `getAuthedUser` + checagem no handler. ✓
- Rota `/support` não tocada → confirmado, `handleSupportMessage` e `corsHeaders` (exceto o header `Authorization` adicionado ao CORS, necessário pro POST autenticado funcionar) permanecem como estavam. ✓
- Frontend manda o token → Task 4. ✓
- Teste local via `wrangler dev` antes de publicar → Task 3 Step 5 (checagem 401) e Task 5 Step 6 (checagem de fallback). ✓

**Placeholders:** nenhum "TBD"/"implementar depois" — todo step de código tem o conteúdo completo. As únicas notas de "execução pelo controlador" (Tasks 1 e 5) são inerentes ao processo (acesso a navegador autenticado / chave que só a dona possui), não lacunas de especificação.

**Consistência de tipos:** `fetchHistory(supabase, userId)` retorna `Array<{ role: string, content: string }>`, consumido por `callOpenRouter` que espera exatamente esse formato (`m.role`, `m.content`) — bate. `getAuthedUser` retorna `{ user, supabase } | null`, e o handler principal desestrutura exatamente esses dois campos.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-31-renata-os-copiloto.md`.**

Duas opções de execução:

1. **Subagent-driven (recomendado)** — Tasks 2, 3 e 4 vão para subagentes com revisão; Tasks 1 e 5 eu (controlador) executo diretamente, por precisarem de navegador autenticado / chave da OpenRouter.
2. **Execução inline** — eu mesmo executo as cinco tasks nesta sessão, em sequência, com checkpoints pra revisão.

Qual prefere?
