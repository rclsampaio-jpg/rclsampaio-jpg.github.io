import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, handlePreflight } from '../_shared/http.ts';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

/**
 * Redeems a professional_access_codes code for the caller, one-time use,
 * and sets profiles.professional_unlocked = true so the gate in App.tsx
 * persists across devices (not just the localStorage flag on the device
 * that redeemed it). Mirrors redeem-invite's shape exactly.
 */
Deno.serve(async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return jsonResponse({ success: false, error: 'Não autenticado.' }, 401);
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return jsonResponse({ success: false, error: 'Sessão inválida.' }, 401);
  }
  const userId = userData.user.id;

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ success: false, error: 'JSON inválido.' }, 400);
  }

  const code = (body.code || '').trim().toUpperCase();
  if (!code) {
    return jsonResponse({ success: false, error: 'Código é obrigatório.' }, 400);
  }

  const { data: accessCode, error: codeError } = await supabaseAdmin
    .from('professional_access_codes')
    .select('code, used_by')
    .eq('code', code)
    .maybeSingle();

  if (codeError || !accessCode || accessCode.used_by) {
    return jsonResponse({ success: false, error: 'Código inválido ou já utilizado.' }, 400);
  }

  await supabaseAdmin
    .from('professional_access_codes')
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq('code', code);

  await supabaseAdmin.from('profiles').upsert({ id: userId, professional_unlocked: true });

  return jsonResponse({ success: true });
});
