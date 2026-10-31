-- Partido en directo, llevado a mano por un administrador desde el panel.
-- El reloj se calcula con la hora de inicio de cada parte; goles y cambios van en matches.lineup como siempre.

alter table public.matches
  add column live_status text check (live_status in ('first_half', 'half_time', 'second_half', 'finished')),
  add column first_half_at timestamptz,
  add column second_half_at timestamptz;

-- Tiempo real: la web recibe los cambios de los partidos al momento (respeta la RLS: lectura pública)
alter publication supabase_realtime add table public.matches;
