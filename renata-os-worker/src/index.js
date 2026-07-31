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
