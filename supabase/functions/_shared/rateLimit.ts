import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Checks and records a rate-limit hit against `rate_limit_events`. Returns
 * `limited: true` if the caller has already made `max` or more requests
 * with this `key` in the last `windowSeconds` — the caller should then
 * reject the request with 429 instead of proceeding.
 */
export async function checkRateLimit(
  supabaseAdmin: SupabaseClient,
  key: string,
  max: number,
  windowSeconds: number,
): Promise<{ limited: boolean }> {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from('rate_limit_events')
    .select('*', { count: 'exact', head: true })
    .eq('key', key)
    .gte('created_at', since);

  if ((count ?? 0) >= max) return { limited: true };

  await supabaseAdmin.from('rate_limit_events').insert({ key });
  return { limited: false };
}
