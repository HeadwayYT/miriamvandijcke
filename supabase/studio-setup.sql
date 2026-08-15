-- Run once in the Supabase SQL editor for the Miriam Studio preview project.
create table if not exists public.site_content (
  content_key text primary key check (content_key in ('spotify', 'instagram')),
  title text,
  class_name text,
  event_date date,
  focus text,
  url text not null,
  label text,
  published boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id),
  constraint site_content_shape check (
    (
      content_key = 'spotify'
      and title is not null
      and class_name is not null
      and focus is not null
      and url ~ '^https://open\.spotify\.com/playlist/[A-Za-z0-9]+$'
    )
    or
    (
      content_key = 'instagram'
      and url ~ '^https://www\.instagram\.com/(p|reel)/[A-Za-z0-9_-]+/$'
    )
  )
);

alter table public.site_content enable row level security;

create index if not exists site_content_updated_by_idx
on public.site_content (updated_by);

revoke all on table public.site_content from anon, authenticated;
grant select on table public.site_content to anon;
grant select, insert, update, delete on table public.site_content to authenticated;

drop policy if exists "published content is public" on public.site_content;
create policy "published content is public"
on public.site_content
for select
to anon, authenticated
using (
  published = true
  or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
);

drop policy if exists "studio admin can insert content" on public.site_content;
create policy "studio admin can insert content"
on public.site_content
for insert
to authenticated
with check (
  coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
  and updated_by = (select auth.uid())
);

drop policy if exists "studio admin can update content" on public.site_content;
create policy "studio admin can update content"
on public.site_content
for update
to authenticated
using (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false))
with check (
  coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
  and updated_by = (select auth.uid())
);

drop policy if exists "studio admin can delete content" on public.site_content;
create policy "studio admin can delete content"
on public.site_content
for delete
to authenticated
using (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false));

-- Repeatable professional Moments for the public "Miriam in Action" section.
create table if not exists public.site_moments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  moment_type text not null check (moment_type in (
    'Weekly class', 'Special ride', 'Fitness event', 'Guest class',
    'Studio collaboration', 'Brand collaboration', 'Other'
  )),
  event_date date,
  location text not null check (char_length(location) between 1 and 100),
  caption text not null check (char_length(caption) between 1 and 240),
  media_url text not null check (media_url ~* '^https://[^[:space:]]+\.(jpg|jpeg|png|webp|avif)(\?[^[:space:]]*)?$'),
  external_url text check (external_url is null or external_url ~ '^https://[^[:space:]]+$'),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id)
);

alter table public.site_content
add column if not exists cover_url text;

alter table public.site_content
drop constraint if exists site_content_cover_url_check;

alter table public.site_content
add constraint site_content_cover_url_check check (
  cover_url is null
  or cover_url ~* '^https://[^[:space:]]+\.(jpg|jpeg|png|webp|avif)(\?[^[:space:]]*)?$'
);

alter table public.site_moments enable row level security;

-- Private weekly history for the Studio momentum cockpit.
-- Completion is derived from real content actions; duplicate saves in one week stay one action.
create table if not exists public.studio_activity (
  id uuid primary key default gen_random_uuid(),
  action_type text not null check (action_type in ('capture', 'share', 'connect')),
  week_key text not null check (week_key ~ '^[0-9]{4}-W[0-9]{2}$'),
  source_id text not null check (char_length(source_id) between 1 and 100),
  occurred_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id),
  unique (action_type, week_key, source_id)
);

alter table public.studio_activity enable row level security;

create index if not exists studio_activity_week_idx
on public.studio_activity (week_key desc, occurred_at desc);

create index if not exists studio_activity_updated_by_idx
on public.studio_activity (updated_by);

revoke all on table public.studio_activity from anon, authenticated;
grant select, insert on table public.studio_activity to authenticated;

drop policy if exists "studio admin can inspect momentum activity" on public.studio_activity;
create policy "studio admin can inspect momentum activity"
on public.studio_activity
for select
to authenticated
using (
  coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
  and updated_by = (select auth.uid())
);

drop policy if exists "studio admin can record momentum activity" on public.studio_activity;
create policy "studio admin can record momentum activity"
on public.studio_activity
for insert
to authenticated
with check (
  coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
  and updated_by = (select auth.uid())
);

-- Public delivery with authenticated, admin-only uploads from Miriam Studio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'moment-images',
  'moment-images',
  true,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Optional clean cover selected for the public About section.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'about-images',
  'about-images',
  true,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create index if not exists site_moments_published_date_idx
on public.site_moments (published, event_date desc);

create index if not exists site_moments_updated_by_idx
on public.site_moments (updated_by);

revoke all on table public.site_moments from anon, authenticated;
grant select on table public.site_moments to anon;
grant select, insert, update, delete on table public.site_moments to authenticated;

drop policy if exists "published moments are public" on public.site_moments;
create policy "published moments are public"
on public.site_moments
for select
to anon, authenticated
using (
  published = true
  or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
);

drop policy if exists "studio admin can insert moments" on public.site_moments;
create policy "studio admin can insert moments"
on public.site_moments
for insert
to authenticated
with check (
  coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
  and updated_by = (select auth.uid())
);

drop policy if exists "studio admin can update moments" on public.site_moments;
create policy "studio admin can update moments"
on public.site_moments
for update
to authenticated
using (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false))
with check (
  coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
  and updated_by = (select auth.uid())
);

drop policy if exists "studio admin can delete moments" on public.site_moments;
create policy "studio admin can delete moments"
on public.site_moments
for delete
to authenticated
using (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false));

drop policy if exists "studio admin can upload moment images" on storage.objects;
create policy "studio admin can upload moment images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'moment-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
);

drop policy if exists "studio admin can inspect moment images" on storage.objects;
create policy "studio admin can inspect moment images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'moment-images'
  and owner_id = (select auth.uid()::text)
  and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
);

drop policy if exists "studio admin can delete moment images" on storage.objects;
create policy "studio admin can delete moment images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'moment-images'
  and owner_id = (select auth.uid()::text)
  and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
);

drop policy if exists "studio admin can upload about images" on storage.objects;
create policy "studio admin can upload about images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'about-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
);

drop policy if exists "studio admin can inspect about images" on storage.objects;
create policy "studio admin can inspect about images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'about-images'
  and owner_id = (select auth.uid()::text)
  and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
);

drop policy if exists "studio admin can delete about images" on storage.objects;
create policy "studio admin can delete about images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'about-images'
  and owner_id = (select auth.uid()::text)
  and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'studio_admin')::boolean, false)
);
