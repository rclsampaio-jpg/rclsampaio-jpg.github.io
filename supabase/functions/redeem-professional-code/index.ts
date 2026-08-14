import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
};

/**
 * Redeems a professional_access_codes code for the caller, one-time use,
 * and sets profiles.professional_unlocked = true so the gate in App.tsx
 * persists across devices (not just the localStorage flag on the device
 * that redeemed it). Mirrors redeem-invite's shape exactly.
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: 'Não autenticado.' }), { status: 401, headers: corsHeaders });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ success: false, error: 'Sessão inválida.' }), { status: 401, headers: corsHeaders });
  }
  const userId = userData.user.id;

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'JSON inválido.' }), { status: 400, headers: corsHeaders });
  }

  const code = (body.code || '').trim().toUpperCase();
  if (!code) {
    return new Response(JSON.stringify({ success: false, error: 'Código é obrigatório.' }), { status: 400, headers: corsHeaders });
  }

  const { data: accessCode, error: codeError } = await supabaseAdmin
    .from('professional_access_codes')
    .select('code, used_by')
    .eq('code', code)
    .maybeSingle();

  if (codeError || !accessCode || accessCode.used_by) {
    return new Response(JSON.stringify({ success: false, error: 'Código inválido ou já utilizado.' }), { status: 400, headers: corsHeaders });
  }

  await supabaseAdmin
    .from('professional_access_codes')
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq('code', code);

  await supabaseAdmin.from('profiles').upsert({ id: userId, professional_unlocked: true });

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
});
