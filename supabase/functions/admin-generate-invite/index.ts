import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function randomCode(length = 8): string {
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

  const code = randomCode();
  const { error } = await supabaseAdmin.from('invite_codes').insert({ code });
  if (error) {
    return new Response(
      JSON.stringify({ error: 'Não foi possível gerar o código.' }),
      { status: 500, headers: corsHeaders },
    );
  }
  return new Response(JSON.stringify({ code }), { status: 200, headers: corsHeaders });
});
