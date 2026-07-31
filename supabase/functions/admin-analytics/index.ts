import { requireAdmin, makeAdminClient } from '../_shared/authAdmin.ts';

const supabaseAdmin = makeAdminClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

interface EngagementEvent {
  user_id: string;
  media_type: string;
  asset_id: string;
  day_number: number | null;
  created_at: string;
}

async function getAnalytics() {
  // Events are small rows and this is an admin-only, on-demand report —
  // a full table read is fine at this scale; revisit with a DB view/
  // aggregation if the table grows large.
  const { data: events, error } = await supabaseAdmin
    .from('engagement_events')
    .select('user_id, media_type, asset_id, day_number, created_at')
    .order('created_at', { ascending: false })
    .limit(20000);
  if (error) return json({ error: error.message }, 500);

  const rows = (events ?? []) as EngagementEvent[];

  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (authError) return json({ error: authError.message }, 500);
  const emailById = new Map(authUsers.users.map((u) => [u.id, u.email ?? u.id]));

  const byAssetMap = new Map<string, { mediaType: string; assetId: string; count: number; users: Set<string>; lastEventAt: string }>();
  const byUserMap = new Map<string, { userId: string; email: string; count: number; lastEventAt: string }>();

  for (const row of rows) {
    const assetKey = `${row.media_type}:${row.asset_id}`;
    const assetEntry = byAssetMap.get(assetKey);
    if (assetEntry) {
      assetEntry.count += 1;
      assetEntry.users.add(row.user_id);
      if (row.created_at > assetEntry.lastEventAt) assetEntry.lastEventAt = row.created_at;
    } else {
      byAssetMap.set(assetKey, {
        mediaType: row.media_type,
        assetId: row.asset_id,
        count: 1,
        users: new Set([row.user_id]),
        lastEventAt: row.created_at,
      });
    }

    const userEntry = byUserMap.get(row.user_id);
    if (userEntry) {
      userEntry.count += 1;
      if (row.created_at > userEntry.lastEventAt) userEntry.lastEventAt = row.created_at;
    } else {
      byUserMap.set(row.user_id, {
        userId: row.user_id,
        email: emailById.get(row.user_id) ?? row.user_id,
        count: 1,
        lastEventAt: row.created_at,
      });
    }
  }

  const byAsset = Array.from(byAssetMap.values())
    .map((a) => ({ mediaType: a.mediaType, assetId: a.assetId, count: a.count, uniqueUsers: a.users.size, lastEventAt: a.lastEventAt }))
    .sort((a, b) => b.count - a.count);

  const byUser = Array.from(byUserMap.values()).sort((a, b) => b.count - a.count);

  return json({
    totals: { totalEvents: rows.length, uniqueUsers: byUserMap.size, uniqueAssets: byAssetMap.size },
    byAsset,
    byUser,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const auth = await requireAdmin(req, supabaseAdmin);
  if (!auth.ok) return auth.response;

  return getAnalytics();
});
