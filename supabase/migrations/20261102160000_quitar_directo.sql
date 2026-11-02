-- Se quita el modo directo (lo decidió el club): fuera sus columnas y la difusión en tiempo real de los partidos
alter publication supabase_realtime drop table public.matches;
alter table public.matches drop column live_status, drop column first_half_at, drop column second_half_at;

-- Fotos de jugadores subidas desde el panel.
-- photo: null = la foto incluida en la web (si la hay); 'none' = sin foto; otro valor = ruta en el bucket "players"
alter table public.players add column photo text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('players', 'players', true, 5242880, array['image/webp', 'image/png', 'image/jpeg']);
create policy "fotos de jugadores: admins suben" on storage.objects
  for insert to authenticated with check (bucket_id = 'players' and public.is_admin());
create policy "fotos de jugadores: admins borran" on storage.objects
  for delete to authenticated using (bucket_id = 'players' and public.is_admin());
