import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Verifies the caller's JWT (from the Authorization header) and confirms
 * their `profiles.is_admin` flag is true. Used by every privileged Edge
 * Function (invite generation, user management) — previously these
 * functions trusted any request bearing the public anon key, which meant
 * anyone could call them without being an admin at all.
 */
export async function requireAdmin(
  req: Request,
  supabaseAdmin: SupabaseClient,
): Promise<{ ok: true } | { ok: false; response: Response }> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  };

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Não autenticado.' }), { status: 401, headers: corsHeaders }),
    };
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Sessão inválida.' }), { status: 401, headers: corsHeaders }),
    };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError || !profile?.is_admin) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Acesso restrito a administradores.' }), { status: 403, headers: corsHeaders }),
    };
  }

  return { ok: true };
}

export function makeAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}
