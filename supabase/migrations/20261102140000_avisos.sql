-- Avisos (notificaciones push): votación del MVP abierta y resultado final del partido.
-- Las suscripciones solo se escriben con funciones; nadie las puede leer desde la web.
-- Las envía la función edge "avisos", que llama el panel y comprueba que quien llama es administrador.

create table public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  teams text[] not null default '{}', -- equipos de los que quiere avisos: 'primer', 'juvenil'
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security; -- sin políticas

-- Avisos ya enviados, para no repetir uno al volver a guardar un partido o reabrir una votación
create table public.push_sent (
  kind text not null check (kind in ('mvp', 'result')),
  ref bigint not null,
  sent_at timestamptz not null default now(),
  primary key (kind, ref)
);
alter table public.push_sent enable row level security; -- sin políticas

-- Los partidos ya jugados no avisan si se vuelven a guardar
insert into public.push_sent (kind, ref) select 'result', id from public.matches where score_us is not null;
insert into public.push_sent (kind, ref) select 'mvp', id from public.mvp_polls;

create function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text, p_team text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_team not in ('primer', 'juvenil') then raise exception 'Equipo no válido'; end if;
  if p_endpoint !~ '^https://' or length(p_endpoint) > 1000 then raise exception 'Suscripción no válida'; end if;
  insert into public.push_subscriptions (endpoint, p256dh, auth, teams)
  values (p_endpoint, p_p256dh, p_auth, array[p_team])
  on conflict (endpoint) do update
    set p256dh = excluded.p256dh, auth = excluded.auth,
        teams = (select array_agg(distinct t) from unnest(public.push_subscriptions.teams || p_team) t);
end $$;

create function public.push_unsubscribe(p_endpoint text, p_team text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.push_subscriptions set teams = array_remove(teams, p_team) where endpoint = p_endpoint;
  delete from public.push_subscriptions where endpoint = p_endpoint and teams = '{}';
end $$;

revoke all on function public.push_subscribe(text, text, text, text) from public;
revoke all on function public.push_unsubscribe(text, text) from public;
grant execute on function public.push_subscribe(text, text, text, text) to anon, authenticated;
grant execute on function public.push_unsubscribe(text, text) to anon, authenticated;
