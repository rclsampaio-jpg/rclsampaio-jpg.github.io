import { requireAdmin, makeAdminClient } from '../_shared/authAdmin.ts';

const supabaseAdmin = makeAdminClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

// A far-future ban expiry. Supabase's admin.updateUserById has no direct
// "banned: true" flag — banned_until is the mechanism, so "permanent" here
// means "until the year 2999", not a separate boolean state.
const PERMANENT_BAN_UNTIL = '2999-01-01T00:00:00.000Z';

async function listUsers() {
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (authError) return json({ error: authError.message }, 500);

  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, is_admin, created_at');
  const { data: progressRows } = await supabaseAdmin.from('user_progress').select('user_id, data, updated_at');

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const progressById = new Map((progressRows ?? []).map((p) => [p.user_id, p]));

  const users = authUsers.users.map((u) => {
    const progress = progressById.get(u.id);
    const data = (progress?.data ?? {}) as Record<string, unknown>;
    return {
      id: u.id,
      email: u.email,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
      bannedUntil: u.banned_until ?? null,
      isAdmin: profileById.get(u.id)?.is_admin ?? false,
      displayName: (data.displayName as string | null) ?? null,
      currentDay: (data.currentDay as number | undefined) ?? 1,
      completedDaysCount: Array.isArray(data.completionHistory) ? (data.completionHistory as unknown[]).length : 0,
      currentStreak: (data.currentStreak as number | undefined) ?? 0,
      progressUpdatedAt: progress?.updated_at ?? null,
    };
  });

  return json({ users });
}

async function blockUser(userId: string, block: boolean) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    // @ts-ignore — banned_until is supported by the GoTrue admin API but
    // not yet typed in this version of supabase-js.
    banned_until: block ? PERMANENT_BAN_UNTIL : 'none',
  });
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}

async function resetProgress(userId: string) {
  const { error } = await supabaseAdmin.from('user_progress').delete().eq('user_id', userId);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}

async function deleteAccount(userId: string) {
  // profiles/user_progress/chat_messages all reference auth.users with
  // "on delete cascade", so deleting the auth user is enough to clean up
  // everything else.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}

async function awardDay(userId: string) {
  const { data: row, error: fetchError } = await supabaseAdmin
    .from('user_progress')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  if (fetchError) return json({ error: fetchError.message }, 500);

  const data = (row?.data ?? {}) as Record<string, unknown>;
  const currentDay = (data.currentDay as number | undefined) ?? 1;
  const history = Array.isArray(data.completionHistory) ? [...(data.completionHistory as number[])] : [];
  if (!history.includes(currentDay)) history.push(currentDay);

  const updated = {
    ...data,
    completionHistory: history,
    currentDay: currentDay + 1,
    currentStreak: ((data.currentStreak as number | undefined) ?? 0) + 1,
    longestStreak: Math.max(
      ((data.longestStreak as number | undefined) ?? 0),
      ((data.currentStreak as number | undefined) ?? 0) + 1,
    ),
  };

  const { error: upsertError } = await supabaseAdmin
    .from('user_progress')
    .upsert({ user_id: userId, data: updated, updated_at: new Date().toISOString() });
  if (upsertError) return json({ error: upsertError.message }, 500);
  return json({ ok: true, currentDay: updated.currentDay });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const auth = await requireAdmin(req, supabaseAdmin);
  if (!auth.ok) return auth.response;

  let body: { action?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON inválido.' }, 400);
  }

  const { action, userId } = body;

  if (action === 'list') return listUsers();

  if (!userId) return json({ error: 'userId é obrigatório para esta ação.' }, 400);

  switch (action) {
    case 'block':
      return blockUser(userId, true);
    case 'unblock':
      return blockUser(userId, false);
    case 'resetProgress':
      return resetProgress(userId);
    case 'deleteAccount':
      return deleteAccount(userId);
    case 'awardDay':
      return awardDay(userId);
    default:
      return json({ error: 'Ação desconhecida.' }, 400);
  }
});
