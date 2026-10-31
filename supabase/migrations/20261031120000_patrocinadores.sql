-- Patrocinadores: logos gestionados desde el panel, visibles en el pie de todas las páginas

create table public.sponsors (
  id bigint generated always as identity primary key,
  name text not null,
  logo_path text not null, -- ruta dentro del bucket "sponsors"
  tier text not null default 'normal' check (tier in ('principal', 'normal')),
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sponsors enable row level security;
create policy "lectura pública" on public.sponsors for select to anon, authenticated using (true);
create policy "admin inserta" on public.sponsors for insert to authenticated with check (public.is_admin());
create policy "admin modifica" on public.sponsors for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin borra" on public.sponsors for delete to authenticated using (public.is_admin());
grant select on public.sponsors to anon, authenticated;
grant insert, update, delete on public.sponsors to authenticated;

-- Bucket público para los logos (lectura pública por URL; subir y borrar solo administradores)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sponsors', 'sponsors', true, 2097152, array['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml']);

create policy "admin sube logos" on storage.objects
  for insert to authenticated with check (bucket_id = 'sponsors' and public.is_admin());
create policy "admin cambia logos" on storage.objects
  for update to authenticated using (bucket_id = 'sponsors' and public.is_admin());
create policy "admin borra logos" on storage.objects
  for delete to authenticated using (bucket_id = 'sponsors' and public.is_admin());
