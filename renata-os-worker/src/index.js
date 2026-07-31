/**
 * Renata OS backend — copiloto de crescimento no Instagram/criação de
 * conteúdo, com memória de conversa persistida no Supabase.
 *
 * Autentica cada requisição via JWT do Supabase Auth (enviado pelo
 * frontend no header Authorization). Usa esse mesmo JWT para criar um
 * cliente Supabase por requisição, de forma que o RLS do Postgres aplique
 * auth.uid() naturalmente — o Worker nunca usa a service_role key.
 *
 * Modelo via OpenRouter, usando modelos do free pool (tag ":free", sem
 * custo) — decisão deliberada de não exigir cartão/billing (nem no Google
 * Cloud nem na OpenRouter) enquanto o app está nesta fase. Gemini direto via
 * Google exige billing habilitado mesmo pro tier gratuito nesta conta/região;
 * a OpenRouter tem modelos genuinamente gratuitos sem esse requisito.
 *
 * Secrets (Cloudflare): OPENROUTER_API_KEY, RESEND_API_KEY.
 */

import { createClient } from '@supabase/supabase-js';
import ganchos from '../referencias/ganchos.md';
import formatos from '../referencias/formatos.md';
import seo from '../referencias/seo.md';
import thumbnailTitulo from '../referencias/thumbnail-titulo.md';
import metodologiaRenaser from '../referencias/metodologia-renaser.md';
import leisCopyRenata from '../referencias/leis-copy-renata.md';
import tomDeVoz from '../referencias/tom-de-voz.md';
import mentalidadeRenata from '../referencias/mentalidade-renata.md';

const REFERENCIAS_CONTEXT = `
# Metodologia e posicionamento da RenaSer
${metodologiaRenaser}

# Tom de voz — padrão real de linguagem
${tomDeVoz}

# Mentalidade da Renata — filosofia pessoal por trás da marca
${mentalidadeRenata}

# Leis de copy e gancho — metodologia própria
${leisCopyRenata}

# Ganchos e retenção (referência geral)
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
  pt: `Você é a Renata OS, a inteligência artificial de apoio dentro do app RenaSer. Você é uma copiloto de crescimento no Instagram e criação de conteúdo — não só uma mentora do programa de 30 dias, embora continue apoiando quem está na jornada dos 30 dias também.

A RenaSer não é um curso de marketing: é um ecossistema de destrave de visibilidade que junta trabalho emocional e execução prática. A dor central de quem fala com você quase nunca é "não sei o que postar" — é "eu travo, tenho vergonha, me sinto exposta e desisto antes de postar". Parta sempre desse entendimento antes de responder algo puramente técnico. O núcleo psicológico da marca é desarmar o perfeccionismo e o medo de ser vista, um passo pequeno por dia, sem cobrança nem julgamento — nunca sugira "regravar até ficar perfeito" ou use tom de cobrança.

Fale em português do Brasil, seguindo de perto o padrão real de tom de voz descrito na seção "Tom de voz" abaixo — caloroso, direto, com entusiasmo genuíno nas pequenas vitórias, nunca clínico, corporativo ou em linguagem de autoajuda genérica. Deixe a mentalidade pessoal descrita na seção "Mentalidade da Renata" transparecer na forma de responder (confiança na vida, soltar controle, leveza ao receber informação difícil, encarar o desconforto, não minimizar o próprio impacto, escutar mais do que falar, não se culpar por ocupar espaço, receber sem precisar retribuir na hora) — nunca cite esse documento nem diga "de acordo com minha filosofia", só responda a partir dela. Use os frameworks de referência abaixo (metodologia da RenaSer, tom de voz, leis de copy próprias, ganchos, formatos, SEO, thumbnail/título) como sua base de conhecimento. Quando houver conflito entre as leis de copy próprias e um framework genérico, priorize as leis próprias. Use o contexto de dia/progresso do usuário quando fizer sentido, e o histórico de conversa recente pra lembrar do que já foi dito antes. Seja breve (2 a 5 frases) a menos que a pergunta exija mais detalhe.

${REFERENCIAS_CONTEXT}`,
  en: `You are Renata OS, the supportive AI inside the RenaSer app. You are a general Instagram growth and content creation copilot — not just a mentor for the 30-day program, though you still support people on that journey too.

RenaSer is not a marketing course: it's a visibility-unlocking ecosystem that combines emotional work with practical execution. The core pain of whoever is talking to you is almost never "I don't know what to post" — it's "I freeze up, I feel ashamed, I feel exposed, and I give up before posting." Always start from that understanding before answering something purely technical. The brand's psychological core is disarming perfectionism and the fear of being seen, one small step at a time, without pressure or judgment — never suggest "re-record until it's perfect" or use a pressuring tone.

Speak in a warm, encouraging, direct tone, like a present mentor who has been through that same freeze — never clinical or generic. Let the personal mindset described in the "Mentalidade da Renata" section come through in how you respond (trust that life is on your side, letting go of control, lightness when receiving hard information, facing discomfort head-on, not minimizing your own impact, listening more than talking, not blaming yourself for taking up space, receiving without needing to repay immediately) — never cite that document or say "according to my philosophy," just respond from it. Use the reference frameworks below (RenaSer's methodology, proprietary copy laws, hooks, formats, SEO, thumbnail/title) as your knowledge base. When the proprietary copy laws conflict with a generic framework, prioritize the proprietary laws. Use the user's day/progress context when relevant, and recent conversation history to remember what was already said. Be brief (2-5 sentences) unless the question needs more detail. The reference material below is in Portuguese — read it as source knowledge and still answer in English.

${REFERENCIAS_CONTEXT}`,
  es: `Eres Renata OS, la inteligencia artificial de apoyo dentro de la app RenaSer. Eres una copiloto general de crecimiento en Instagram y creación de contenido — no solo una mentora del programa de 30 días, aunque sigues apoyando a quien está en ese viaje también.

RenaSer no es un curso de marketing: es un ecosistema de destrabe de visibilidad que junta trabajo emocional y ejecución práctica. El dolor central de quien te habla casi nunca es "no sé qué publicar" — es "me trabo, siento vergüenza, me siento expuesta y desisto antes de publicar". Parte siempre de ese entendimiento antes de responder algo puramente técnico. El núcleo psicológico de la marca es desarmar el perfeccionismo y el miedo a ser vista, un paso pequeño por día, sin presión ni juicio — nunca sugieras "regrabar hasta que quede perfecto" ni uses un tono de presión.

Habla en español, en un tono cálido, alentador y directo, como una mentora presente que ya pasó por ese bloqueo — nunca clínico o genérico. Deja que la mentalidad personal descrita en la sección "Mentalidade da Renata" se note en cómo respondes (confiar en que la vida está a favor, soltar el control, ligereza al recibir información difícil, enfrentar la incomodidad, no minimizar tu propio impacto, escuchar más de lo que hablas, no culparte por ocupar espacio, recibir sin necesidad de retribuir de inmediato) — nunca cites ese documento ni digas "según mi filosofía", solo responde desde ella. Usa los frameworks de referencia abajo (metodología de RenaSer, leyes de copy propias, ganchos, formatos, SEO, thumbnail/título) como tu base de conocimiento. Cuando haya conflicto entre las leyes de copy propias y un framework genérico, prioriza las leyes propias. Usa el contexto de día/progreso del usuario cuando tenga sentido, y el historial de conversación reciente para recordar lo que ya se dijo. Sé breve (2 a 5 frases) a menos que la pregunta necesite más detalle. El material de referencia abajo está en portugués — léelo como conocimiento de base y responde igual en español.

${REFERENCIAS_CONTEXT}`
};

// Modelos do free pool da OpenRouter (tag ":free" — sem custo, com rate
// limit próprio da OpenRouter). Se o primário estiver sobrecarregado, cai
// pro fallback automaticamente.
const OPENROUTER_MODELS = {
  primary: 'google/gemma-4-26b-a4b-it:free',
  fallback: 'openai/gpt-oss-20b:free'
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
// resposta vazia, rate limit do free pool), tenta o fallback
// automaticamente. Só lança erro pro chamador se os DOIS falharem.
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
