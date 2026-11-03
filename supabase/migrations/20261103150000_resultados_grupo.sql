-- Resultados de todo el grupo (todos los partidos, no solo los nuestros): con ellos se calcula
-- la clasificación y se muestran las jornadas. Se cargan pegando la tabla cruzada y el calendario de la FFCM.
create table public.group_results (
  team_id text not null references public.teams on delete cascade,
  round int not null check (round > 0),
  date date,
  home text not null,
  away text not null,
  home_goals int check (home_goals >= 0),
  away_goals int check (away_goals >= 0),
  primary key (team_id, home, away),
  check ((home_goals is null) = (away_goals is null))
);

alter table public.group_results enable row level security;
create policy "lectura pública" on public.group_results for select to anon, authenticated using (true);
create policy "admin inserta" on public.group_results for insert to authenticated with check (public.is_admin());
create policy "admin modifica" on public.group_results for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin borra" on public.group_results for delete to authenticated using (public.is_admin());
grant select on public.group_results to anon, authenticated;
grant insert, update, delete on public.group_results to authenticated;
