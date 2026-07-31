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
 * Links an already-authenticated caller (e.g. someone who just signed in
 * via Google, which creates a Supabase auth.users row with no invite check
 * at all) to a real invite code, gating actual app access behind it — the
 * same guarantee email/password signup already gets via
 * validate-invite-and-signup, just applied after the fact instead of
 * before account creation.
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

  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('invite_codes')
    .select('code, used_by')
    .eq('code', code)
    .maybeSingle();

  if (inviteError || !invite || invite.used_by) {
    return new Response(JSON.stringify({ success: false, error: 'Código inválido ou já utilizado.' }), { status: 400, headers: corsHeaders });
  }

  await supabaseAdmin
    .from('invite_codes')
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq('code', code);

  await supabaseAdmin.from('profiles').upsert({ id: userId, is_admin: false });

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
});
