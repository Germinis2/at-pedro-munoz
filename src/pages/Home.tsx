import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { MatchCard, ResultDot, fmtLongDay, fmtTime } from '../components/MatchCard'
import { MvpCard } from '../components/MvpCard'
import { PlayerImage } from '../components/PlayerImage'
import { LiveBadge } from '../components/LiveBadge'
import { kickoff, liveMatch, played, sortPlayers, summary, upcoming } from '../data/build'
import { club } from '../data/club'
import { useTeam, useTeams } from '../data/teams'
import { Leaderboard } from './Stats'

function useCountdown(target?: Date) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])
  if (!target) return null
  const diff = Math.max(0, target.getTime() - now)
  return { d: Math.floor(diff / 86_400_000), h: Math.floor(diff / 3_600_000) % 24, m: Math.floor(diff / 60_000) % 60 }
}

function SectionHead({ title, to, cta = 'Ver todo' }: { title: string; to?: string; cta?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="section-title">{title}</h2>
      {to && <Link to={to} className="font-display text-sm font-bold uppercase tracking-wider text-white/60 hover:text-white">{cta} →</Link>}
    </div>
  )
}

function TeamSwitch() {
  const { teams } = useTeams()
  return (
    <div className="grid grid-cols-2 gap-2 md:inline-grid md:w-96">
      {Object.values(teams).map((t) => (
        <NavLink
          key={t.id}
          to={t.base || '/'}
          end
          className={({ isActive }) =>
            `-skew-x-12 border py-2.5 text-center font-display text-lg font-extrabold uppercase italic tracking-wide transition-colors ${
              isActive ? 'border-club-500 bg-club-500 text-white' : 'border-white/15 text-white/55 hover:border-white/30 hover:text-white'
            }`
          }
        >
          <span className="inline-block skew-x-12">{t.label}</span>
        </NavLink>
      ))}
    </div>
  )
}

export function Home() {
  const team = useTeam()
  const live = liveMatch(team.matches)
  const next = upcoming(team.matches)[0]
  const results = played(team.matches).slice(0, 3)
  const cd = useCountdown(next?.time ? kickoff(next) : undefined)
  const s = summary(team.standings)

  const diff = s.goalsFor - s.goalsAgainst
  const board = [
    { label: 'Puntos', value: s.points },
    { label: 'Jugados', value: s.played },
    { label: 'Goles', value: `${s.goalsFor}-${s.goalsAgainst}` },
    { label: 'Dif.', value: `${diff > 0 ? '+' : ''}${diff}` },
  ]

  return (
    <div className="space-y-10 md:space-y-14">
      <TeamSwitch />

      {/* Cabecera: bloque diagonal con el escudo y marcador de la temporada */}
      <section className="clip-corner relative -mt-4 overflow-hidden bg-club-600 md:-mt-6">
        {/* Franjas diagonales y posición gigante de fondo */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_46px,rgb(0_0_0/0.12)_46px_92px)]" aria-hidden />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-club-800 [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]" aria-hidden />
        <span
          className="pointer-events-none absolute -bottom-8 right-3 font-display text-[11rem] font-extrabold italic leading-none text-transparent [-webkit-text-stroke:2px_rgb(255_255_255/0.14)] md:-bottom-12 md:text-[17rem]"
          aria-hidden
        >
          {s.position}º
        </span>

        <div className="relative p-5 md:p-10">
          <div className="flex items-center gap-4 md:gap-7">
            <Crest className="size-20 shrink-0 drop-shadow-[0_6px_16px_rgb(0_0_0/0.45)] md:size-36" />
            <div className="min-w-0">
              <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-club-100/80">{team.league} · {team.group}</p>
              <h1 className="font-display text-4xl font-extrabold uppercase italic leading-[0.9] md:text-7xl">{club.shortName}</h1>
              <p className="mt-1 text-sm text-white/75">{team.full ? club.region : team.label} · Temporada {club.season}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-stretch gap-3 md:mt-10">
            <div className="flex -skew-x-12 items-center gap-2 bg-white px-4 py-2 text-club-800">
              <span className="skew-x-12 font-display text-4xl font-extrabold italic leading-none md:text-5xl">{s.position}º</span>
              <span className="skew-x-12 font-display text-xs font-bold uppercase leading-tight tracking-wider">
                de {s.teams}
                <br />
                equipos
              </span>
            </div>
            <dl className="flex flex-1 divide-x divide-white/15 bg-club-950/45 backdrop-blur-sm">
              {board.map((b) => (
                <div key={b.label} className="flex-1 px-2 py-2 text-center md:px-4">
                  <dd className="font-display text-2xl font-extrabold tabular-nums md:text-4xl">{b.value}</dd>
                  <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-white/60">{b.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-3 font-display text-sm font-bold uppercase tracking-widest text-white/70">
            {s.won}V · {s.drawn}E · {s.lost}D
          </p>
        </div>
      </section>

      {live && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="section-title">Ahora mismo</h2>
            <LiveBadge match={live} />
          </div>
          <MatchCard match={live} className="border-red-500/40 bg-red-500/10" />
        </section>
      )}

      <MvpCard />

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        {/* Próximo partido */}
        {next && (
          <section>
            <SectionHead title="Próximo partido" to={`${team.base}/partidos`} cta="Calendario" />
            <div className="panel p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="-skew-x-12 bg-white/10 px-3 py-1 font-display text-sm font-bold uppercase tracking-wider">Jornada {next.round}</span>
                <span className="-skew-x-12 bg-club-500 px-3 py-1 font-display text-sm font-bold uppercase tracking-wider">{next.home ? 'En casa' : 'Fuera'}</span>
              </div>
              <MatchCard match={next} className="mt-4 border-none bg-transparent p-0" />
              {cd && (
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  {[
                    { v: cd.d, l: 'días' },
                    { v: cd.h, l: 'horas' },
                    { v: cd.m, l: 'min' },
                  ].map((x) => (
                    <div key={x.l} className="rounded-xl bg-club-950/50 py-3">
                      <p className="text-2xl font-bold tabular-nums">{x.v}</p>
                      <p className="text-[10px] uppercase tracking-wider text-white/50">{x.l}</p>
                    </div>
                  ))}
                </div>
              )}
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-sm">
                <div>
                  <dt className="label-caps">Fecha</dt>
                  <dd className="mt-1 font-medium capitalize">{fmtLongDay(next)}</dd>
                </div>
                <div>
                  <dt className="label-caps">Hora</dt>
                  <dd className="mt-1 font-medium">{fmtTime(next)}</dd>
                </div>
                <div>
                  <dt className="label-caps">Campo</dt>
                  <dd className="mt-1 font-medium">{next.venue ?? 'Por confirmar'}</dd>
                </div>
              </dl>
            </div>
          </section>
        )}

        {/* Últimos resultados */}
        <section>
          <SectionHead title="Últimos resultados" to={`${team.base}/partidos`} />
          <div className="space-y-3">{results.map((m) => <MatchCard key={m.id} match={m} />)}</div>
          <div className="panel mt-4 flex items-center justify-between gap-3 p-4">
            <div>
              <p className="label-caps">Forma</p>
              <p className="mt-0.5 text-[11px] text-white/40">Más antiguo → más reciente</p>
            </div>
            <div className="flex gap-1.5">{s.form.map((r, i) => <ResultDot key={i} r={r} big />)}</div>
          </div>
        </section>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <Leaderboard title="Goleadores" stat="goals" limit={5} />
        <Leaderboard title="MVPs" stat="mvps" limit={5} />
      </section>

      {/* Plantilla */}
      <section>
        <SectionHead title="Plantilla" to={`${team.base}/plantilla`} />
        <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {sortPlayers(team.players).map((p) => (
            <li key={p.id} className="w-32 shrink-0 snap-start md:w-40">
              <Link to={`${team.base}/jugador/${p.id}`} className="panel group relative block overflow-hidden pt-3">
                <span className="absolute left-2.5 top-1.5 text-xl font-bold text-white/30">{p.number ?? ''}</span>
                <PlayerImage player={p} className="mx-auto h-28 w-full transition-transform group-hover:scale-105 md:h-36" photoClassName="-mt-3 h-31 w-full transition-transform group-hover:scale-105 md:h-39" />
                <p className="truncate border-t border-white/10 bg-club-950/40 px-2.5 py-2 text-xs font-semibold">{p.firstName} {p.lastName}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
