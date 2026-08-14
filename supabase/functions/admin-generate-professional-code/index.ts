import { requireAdmin, makeAdminClient } from '../_shared/authAdmin.ts';

const supabaseAdmin = makeAdminClient();

function randomCode(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem O/0/I/1, evita confusão visual
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const auth = await requireAdmin(req, supabaseAdmin);
  if (!auth.ok) return auth.response;

  const code = randomCode();
  const { error } = await supabaseAdmin.from('professional_access_codes').insert({ code });
  if (error) {
    return new Response(
      JSON.stringify({ error: 'Não foi possível gerar o código.' }),
      { status: 500, headers: corsHeaders },
    );
  }
  return new Response(JSON.stringify({ code }), { status: 200, headers: corsHeaders });
});
