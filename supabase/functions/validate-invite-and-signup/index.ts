import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email, password, code } = await req.json();
    if (!email || !password || !code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email, senha e código são obrigatórios.' }),
        { status: 400, headers: corsHeaders },
      );
    }

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invite_codes')
      .select('code, used_by')
      .eq('code', code)
      .maybeSingle();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código inválido ou já utilizado.' }),
        { status: 400, headers: corsHeaders },
      );
    }
    if (invite.used_by) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código inválido ou já utilizado.' }),
        { status: 400, headers: corsHeaders },
      );
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      return new Response(
        JSON.stringify({ success: false, error: createError?.message ?? 'Não foi possível criar a conta.' }),
        { status: 400, headers: corsHeaders },
      );
    }

    await supabaseAdmin.from('profiles').insert({ id: created.user.id, is_admin: false });
    await supabaseAdmin
      .from('invite_codes')
      .update({ used_by: created.user.id, used_at: new Date().toISOString() })
      .eq('code', code);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: 'Erro inesperado ao criar conta.' }),
      { status: 500, headers: corsHeaders },
    );
  }
});
