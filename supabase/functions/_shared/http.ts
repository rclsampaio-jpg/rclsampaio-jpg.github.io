// CORS headers e resposta JSON padrão, compartilhados entre Edge Functions.
// Antes cada função reimplementava isso na mão, o que já causou
// inconsistência (uma delas devolvendo mensagem de erro genérica escondendo
// o status real). Novo helper, aplicado por enquanto só nas funções mais
// recentes (professional-code) pra não mexer nas que já estão estáveis.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
};

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

// Chame no topo do handler: `const preflight = handlePreflight(req); if (preflight) return preflight;`
export function handlePreflight(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response('ok', { headers: corsHeaders }) : null;
}
