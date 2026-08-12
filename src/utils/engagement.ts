import { supabase } from '../lib/supabase';

export type EngagementMediaType = 'daily_audio' | 'library_audio' | 'library_video' | 'library_pdf' | 'weekly_video' | 'daily_support_video';

// One event per asset per page load is enough signal for "who's
// consuming what" analytics — avoids spamming the table on every
// play/pause toggle of the same audio.
const loggedThisSession = new Set<string>();

export function logEngagementEvent(mediaType: EngagementMediaType, assetId: string, dayNumber?: number): void {
  const dedupeKey = `${mediaType}:${assetId}`;
  if (loggedThisSession.has(dedupeKey)) return;
  loggedThisSession.add(dedupeKey);

  supabase.auth.getUser().then(({ data }) => {
    const user = data.user;
    if (!user) return;
    supabase.from('engagement_events').insert({
      user_id: user.id,
      media_type: mediaType,
      asset_id: assetId,
      day_number: dayNumber ?? null,
    }).then(({ error }) => {
      if (error) console.error('logEngagementEvent failed:', error);
    });
  });
}
