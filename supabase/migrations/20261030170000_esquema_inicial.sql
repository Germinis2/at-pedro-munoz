-- Esquema de la web del At. Pedro Muñoz C.F.
-- Lectura pública; escritura solo para administradores (tabla admins). RLS en todas las tablas.

-- Administradores --------------------------------------------------------------
create table public.admins (
  email text primary key
);
alter table public.admins enable row level security;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where email = (auth.jwt() ->> 'email'))
$$;

create policy "admins se ven a sí mismos" on public.admins
  for select to authenticated using (email = (auth.jwt() ->> 'email'));

-- Equipos ----------------------------------------------------------------------
create table public.teams (
  id text primary key check (id in ('primer', 'juvenil')),
  label text not null,
  league text not null,
  grp text not null,
  full_stats boolean not null default true, -- el juvenil solo lleva goles y minutos
  standings_round int not null default 0
);

-- Jugadores --------------------------------------------------------------------
-- Partidos, minutos, goles y porterías a 0 se calculan de las alineaciones (matches.lineup).
-- Asistencias, paradas y tarjetas no salen en las actas: se apuntan aquí a mano.
create table public.players (
  id text primary key, -- slug de "nombre apellidos"
  team_id text not null references public.teams on delete cascade,
  ffcm text not null, -- "APELLIDOS, NOMBRE" tal cual en las actas
  display_name text, -- nombre deportivo ("Samu Escudero")
  nickname text,
  number int check (number between 1 and 99),
  position text check (position in ('POR', 'DEF', 'MED', 'DEL')),
  assists int not null default 0 check (assists >= 0),
  saves int not null default 0 check (saves >= 0),
  yellow_cards int not null default 0 check (yellow_cards >= 0),
  red_cards int not null default 0 check (red_cards >= 0),
  unique (team_id, ffcm)
);
create index on public.players (team_id);

-- Partidos ---------------------------------------------------------------------
create table public.matches (
  id bigint generated always as identity primary key,
  team_id text not null references public.teams on delete cascade,
  round int not null,
  date date not null,
  time time,
  home boolean not null,
  opponent text not null,
  venue text,
  score_us int check (score_us >= 0),
  score_them int check (score_them >= 0),
  acta int,
  -- { starters: [dorsal, nombre][], bench: [...], subs: {min,in,out}[], goals: {min,player|null}[] }
  lineup jsonb,
  unique (team_id, round),
  check ((score_us is null) = (score_them is null))
);
create index on public.matches (team_id, date);

-- Clasificación ----------------------------------------------------------------
create table public.standings (
  team_id text not null references public.teams on delete cascade,
  rank int not null,
  team text not null,
  ours boolean not null default false,
  pts int not null, pj int not null, g int not null, e int not null, p int not null,
  gf int not null, gc int not null,
  form text[] not null default '{}', -- 'G' | 'E' | 'P', de más antiguo a más reciente
  primary key (team_id, team)
);

-- Votación MVP -----------------------------------------------------------------
create table public.mvp_polls (
  id bigint generated always as identity primary key,
  match_id bigint not null unique references public.matches on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.mvp_votes (
  poll_id bigint not null references public.mvp_polls on delete cascade,
  player_id text not null references public.players on delete cascade,
  voter text not null, -- identificador anónimo del dispositivo
  created_at timestamptz not null default now(),
  primary key (poll_id, voter)
);
alter table public.mvp_votes enable row level security; -- sin políticas: solo vía funciones

-- Votar: comprueba que la votación esté abierta y que el jugador jugó ese partido
create function public.vote_mvp(p_poll bigint, p_player text, p_voter text) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_lineup jsonb;
  v_ffcm text;
begin
  if length(p_voter) < 16 or length(p_voter) > 64 then
    raise exception 'Votante no válido';
  end if;

  select m.lineup into v_lineup
  from public.mvp_polls p join public.matches m on m.id = p.match_id
  where p.id = p_poll and p.status = 'open';
  if not found then
    raise exception 'La votación no está abierta';
  end if;

  select ffcm into v_ffcm from public.players where id = p_player;
  if v_ffcm is null or not (
    exists (select 1 from jsonb_array_elements(v_lineup -> 'starters') s where s ->> 1 = v_ffcm)
    or exists (select 1 from jsonb_array_elements(v_lineup -> 'subs') s where s ->> 'in' = v_ffcm)
  ) then
    raise exception 'Ese jugador no jugó el partido';
  end if;

  insert into public.mvp_votes (poll_id, player_id, voter) values (p_poll, p_player, p_voter);
exception
  when unique_violation then raise exception 'Ya has votado en esta votación';
end;
$$;

-- Resultados agregados (sin exponer quién vota)
create function public.mvp_results(p_poll bigint)
returns table (player_id text, votes bigint)
language sql stable security definer set search_path = ''
as $$
  select player_id, count(*) from public.mvp_votes where poll_id = p_poll group by player_id order by 2 desc
$$;

-- RLS: lectura pública, escritura de administradores --------------------------
do $$
declare t text;
begin
  foreach t in array array['teams', 'players', 'matches', 'standings', 'mvp_polls'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "lectura pública" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin inserta" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin modifica" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin borra" on public.%I for delete to authenticated using (public.is_admin())', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

grant select on public.admins to authenticated;
revoke all on function public.vote_mvp(bigint, text, text) from public;
revoke all on function public.mvp_results(bigint) from public;
revoke all on function public.is_admin() from public;
grant execute on function public.vote_mvp(bigint, text, text) to anon, authenticated;
grant execute on function public.mvp_results(bigint) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
