-- Varios administradores gestionados desde el panel, alta restringida y ranking de MVPs

-- Administradores ---------------------------------------------------------------
update public.admins set email = lower(trim(email));
alter table public.admins
  add constraint admins_email_minusculas check (email = lower(email)),
  add column created_at timestamptz not null default now();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where email = lower(auth.jwt() ->> 'email'))
$$;

drop policy "admins se ven a sí mismos" on public.admins;
create policy "admins ven la lista" on public.admins
  for select to authenticated using (public.is_admin());
create policy "admins añaden" on public.admins
  for insert to authenticated with check (public.is_admin());
-- Nadie puede quitarse a sí mismo: así nunca os quedáis sin administradores
create policy "admins quitan a otros" on public.admins
  for delete to authenticated using (public.is_admin() and email <> lower(auth.jwt() ->> 'email'));
grant insert, delete on public.admins to authenticated;

-- Solo pueden crearse cuenta los emails autorizados en public.admins
create function public.solo_emails_autorizados() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.admins where email = lower(new.email)) then
    raise exception 'Email no autorizado';
  end if;
  return new;
end;
$$;

create trigger solo_emails_autorizados
  before insert on auth.users
  for each row execute function public.solo_emails_autorizados();

-- Ranking de MVPs: votaciones cerradas ganadas (en empate, cuenta para todos los empatados)
create function public.mvp_winners()
returns table (player_id text, wins bigint)
language sql stable security definer set search_path = ''
as $$
  with counts as (
    select v.poll_id, v.player_id, count(*) as n
    from public.mvp_votes v
    join public.mvp_polls p on p.id = v.poll_id and p.status = 'closed'
    group by v.poll_id, v.player_id
  ),
  ranked as (
    select poll_id, player_id, rank() over (partition by poll_id order by n desc) as r from counts
  )
  select player_id, count(*) from ranked where r = 1 group by player_id order by 2 desc
$$;

revoke all on function public.mvp_winners() from public;
grant execute on function public.mvp_winners() to anon, authenticated;
revoke all on function public.solo_emails_autorizados() from public;
