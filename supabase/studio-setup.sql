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
