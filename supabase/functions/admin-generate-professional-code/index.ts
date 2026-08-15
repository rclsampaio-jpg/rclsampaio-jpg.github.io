import { requireAdmin, makeAdminClient } from '../_shared/authAdmin.ts';
import { jsonResponse, handlePreflight } from '../_shared/http.ts';

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
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const auth = await requireAdmin(req, supabaseAdmin);
  if (!auth.ok) return auth.response;

  const code = randomCode();
  const { error } = await supabaseAdmin.from('professional_access_codes').insert({ code });
  if (error) {
    return jsonResponse({ error: 'Não foi possível gerar o código.' }, 500);
  }
  return jsonResponse({ code });
});
