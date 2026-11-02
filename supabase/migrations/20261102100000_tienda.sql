-- Tienda del club: artículos con fotos y precio, editables desde el panel. Los pedidos van por WhatsApp.

create table public.products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price numeric(8, 2) check (price >= 0), -- null = "Consultar precio"
  -- [{ path, label }]: path de Storage (bucket "shop") o ruta pública ("/tienda/x.webp"); label = modelo
  images jsonb not null default '[]',
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
create policy "lectura pública" on public.products for select to anon, authenticated using (true);
create policy "admin inserta" on public.products for insert to authenticated with check (public.is_admin());
create policy "admin modifica" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin borra" on public.products for delete to authenticated using (public.is_admin());
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop', 'shop', true, 5242880, array['image/webp', 'image/png', 'image/jpeg']);
create policy "admin sube fotos tienda" on storage.objects
  for insert to authenticated with check (bucket_id = 'shop' and public.is_admin());
create policy "admin cambia fotos tienda" on storage.objects
  for update to authenticated using (bucket_id = 'shop' and public.is_admin());
create policy "admin borra fotos tienda" on storage.objects
  for delete to authenticated using (bucket_id = 'shop' and public.is_admin());

-- Artículos iniciales (precios de banderas y camiseta pendientes de confirmar)
insert into public.products (name, description, price, images, sort) values
  ('Camiseta oficial', 'Primera equipación de la temporada 2026/27.', null,
   '[{"path": "/tienda/camiseta.webp", "label": "Primera equipación"}]', 1),
  ('Bufanda', 'Bufanda oficial del Atlético Pedro Muñoz.', 10,
   '[{"path": "/tienda/bufanda.webp", "label": "Bufanda"}]', 2),
  ('Banderas', 'Elige modelo: colores de España o rojiblanca, con el escudo del club o con los escudos del club y de Pedro Muñoz.', null,
   '[{"path": "/tienda/bandera-espana-escudos.webp", "label": "España · escudos del club y del pueblo"},
     {"path": "/tienda/bandera-espana.webp", "label": "España · escudo del club"},
     {"path": "/tienda/bandera-rojiblanca-escudos.webp", "label": "Rojiblanca · escudos del club y del pueblo"},
     {"path": "/tienda/bandera-rojiblanca.webp", "label": "Rojiblanca · escudo del club"}]', 3);
