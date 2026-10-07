-- Align the existing 3D menu Viewer project with DineVista. No data is deleted.
alter table public.restaurants add column if not exists qr_code_url text;
alter table public.menu_items add column if not exists glb_model_url text not null default '';
alter table public.menu_items add column if not exists legacy_id text;
update public.menu_items set glb_model_url = model_url where glb_model_url = '' and model_url <> '';
create unique index if not exists menu_items_restaurant_legacy_idx on public.menu_items(restaurant_id, legacy_id);
create index if not exists menu_items_restaurant_idx on public.menu_items(restaurant_id);
create table if not exists public.ar_markers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null, image_url text not null, target_url text not null,
  created_at timestamptz not null default now()
);
create index if not exists ar_markers_restaurant_idx on public.ar_markers(restaurant_id);
alter table public.menu_items add column if not exists marker_id uuid references public.ar_markers(id) on delete set null;
create index if not exists menu_items_marker_idx on public.menu_items(marker_id);
alter table public.restaurants enable row level security;
alter table public.menu_items enable row level security;
alter table public.ar_markers enable row level security;
create policy "Published restaurant markers" on public.ar_markers for select to anon, authenticated
  using (exists (select 1 from public.restaurants r where r.id = restaurant_id and (r.is_published or r.owner_id = (select auth.uid()))));
create policy "Owners manage markers" on public.ar_markers for all to authenticated
  using (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = (select auth.uid())));
-- Limit Data API grants; RLS continues to enforce restaurant ownership.
revoke all on public.restaurants, public.menu_items, public.ar_markers from anon, authenticated;
grant select on public.restaurants, public.menu_items, public.ar_markers to anon;
grant select, insert, update, delete on public.restaurants, public.menu_items, public.ar_markers to authenticated;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
 values ('menu-markers','menu-markers',true,52428800,array['application/octet-stream']) on conflict (id) do nothing;
update storage.buckets set file_size_limit = 52428800 where id = 'menu-models';
create policy "Read marker targets" on storage.objects for select to anon, authenticated using (bucket_id = 'menu-markers');
create policy "Owners upload marker targets" on storage.objects for insert to authenticated
 with check (bucket_id = 'menu-markers' and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.restaurants where owner_id = (select auth.uid())));
create policy "Owners update marker targets" on storage.objects for update to authenticated
 using (bucket_id = 'menu-markers' and (storage.foldername(name))[1] = (select auth.uid())::text)
 with check (bucket_id = 'menu-markers' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners delete marker targets" on storage.objects for delete to authenticated
 using (bucket_id = 'menu-markers' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Trigger functions are invoked by Postgres, never through the public RPC API.
revoke execute on function public.create_restaurant_for_new_user() from public, anon, authenticated;
