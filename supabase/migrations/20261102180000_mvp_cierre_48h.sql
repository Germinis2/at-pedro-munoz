-- Las votaciones del MVP se cierran solas a las 48 horas de abrirse (el admin puede cerrarlas antes).
-- Al reabrir una votación desde el panel se pone opened_at = ahora, así que vuelve a tener 48 horas.

-- 1) Votar solo dentro de las 48 horas, aunque el cierre programado aún no haya pasado
create or replace function public.vote_mvp(p_poll bigint, p_player text, p_voter text) returns void
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
  where p.id = p_poll and p.status = 'open' and p.opened_at > now() - interval '48 hours';
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

-- 2) Cierre programado cada 5 minutos: marca como cerradas las que pasaron de 48 horas
create function public.close_expired_mvp_polls() returns void
language sql security definer set search_path = ''
as $$
  update public.mvp_polls
  set status = 'closed', closed_at = opened_at + interval '48 hours'
  where status = 'open' and opened_at <= now() - interval '48 hours';
$$;
revoke all on function public.close_expired_mvp_polls() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('cerrar-votaciones-mvp', '*/5 * * * *', 'select public.close_expired_mvp_polls()');

select public.close_expired_mvp_polls();
