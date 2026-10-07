-- Run in your existing Supabase project before enabling shared publishing.
-- Does not delete existing dishes or loosen owner-only access.
alter table public.menu_items add column if not exists glb_model_url text;
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'menu_items' and column_name = 'model_3d_url') then
    execute 'update public.menu_items set glb_model_url = model_3d_url where glb_model_url is null';
  end if;
end $$;

create table if not exists public.ar_markers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  image_url text not null,
  target_url text not null,
  created_at timestamptz not null default now()
);
alter table public.menu_items add column if not exists marker_id uuid references public.ar_markers(id) on delete set null;
alter table public.ar_markers enable row level security;
drop policy if exists "Public marker read" on public.ar_markers;
create policy "Public marker read" on public.ar_markers for select using (true);
drop policy if exists "Restaurant owners manage markers" on public.ar_markers;
create policy "Restaurant owners manage markers" on public.ar_markers for all to authenticated
  using (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()))
  with check (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()));

insert into storage.buckets (id, name, public) values
  ('menu-images', 'menu-images', true), ('menu-models', 'menu-models', true), ('menu-markers', 'menu-markers', true)
on conflict (id) do nothing;
drop policy if exists "DineVista public media read" on storage.objects;
create policy "DineVista public media read" on storage.objects for select
  using (bucket_id in ('menu-images', 'menu-models', 'menu-markers'));
drop policy if exists "DineVista owners upload media" on storage.objects;
create policy "DineVista owners upload media" on storage.objects for insert to authenticated
  with check (bucket_id in ('menu-images', 'menu-models', 'menu-markers') and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.restaurants where owner_id = auth.uid()));
