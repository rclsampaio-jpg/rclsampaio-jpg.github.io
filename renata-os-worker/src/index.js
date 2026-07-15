/**
 * Renata OS backend — proxies chat requests to the Gemini API.
 *
 * The Gemini API key lives only here, as a Cloudflare secret (GEMINI_API_KEY).
 * It is never sent to or stored in the browser, so the RenaSer frontend
 * (static site on GitHub Pages) can call this Worker safely.
 */

const SYSTEM_PROMPT = {
  pt: `Você é a Renata OS, a inteligência artificial de apoio dentro do app RenaSer — uma jornada de 30 dias para superar o medo de aparecer e se expressar online. Fale em português do Brasil, em tom caloroso, encorajador e direto, como uma mentora presente, nunca clínico ou genérico. Use o contexto do dia/progresso do usuário quando fizer sentido. Seja breve (2 a 5 frases) a menos que a pergunta exija mais detalhe.`,
  en: `You are Renata OS, the supportive AI inside the RenaSer app — a 30-day journey to overcome the fear of showing up and expressing yourself online. Speak in a warm, encouraging, direct tone, like a present mentor, never clinical or generic. Use the user's day/progress context when relevant. Be brief (2-5 sentences) unless the question needs more detail.`,
  es: `Eres Renata OS, la inteligencia artificial de apoyo dentro de la app RenaSer — un viaje de 30 días para superar el miedo a mostrarte y expresarte en línea. Habla en español, en un tono cálido, alentador y directo, como una mentora presente, nunca clínico o genérico. Usa el contexto del día/progreso del usuario cuando tenga sentido. Sé breve (2 a 5 frases) a menos que la pregunta necesite más detalle.`
};

function corsHeaders(origin, allowedOrigin) {
  const allowOrigin = origin === allowedOrigin ? origin : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    const systemPrompt = SYSTEM_PROMPT[langKey];

    const contextLine = context
      ? `\n\nContexto do usuário: dia ${context.dayNumber || '?'}/30, ${context.completedDays || 0} dias concluídos, streak atual de ${context.currentStreak || 0} dia(s).`
      : '';

    const prompt = `${systemPrompt}${contextLine}\n\nMensagem do usuário: ${message}`;

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        return new Response(JSON.stringify({ error: 'Gemini API error', detail: errText }), { status: 502, headers });
      }

      const data = await geminiResponse.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      return new Response(JSON.stringify({ reply }), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Unexpected error', detail: String(err) }), { status: 500, headers });
    }
  }
};
