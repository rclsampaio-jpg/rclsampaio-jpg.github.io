-- Profile photos were previously stored as base64 data URLs inside the
-- user_progress.data jsonb blob, bloating that row on every upload with no
-- real size cap. Move them to a dedicated Storage bucket instead: each user
-- can only read/write/delete objects under a path prefixed with their own
-- auth.uid(), mirroring the "own events insert" pattern used for
-- engagement_events.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar public read"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatar own insert"
on storage.objects for insert
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatar own update"
on storage.objects for update
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatar own delete"
on storage.objects for delete
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
