import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { MatchCard, ResultDot, fmtLongDay, fmtTime } from '../components/MatchCard'
import { Silhouette } from '../components/Silhouette'
import { club, teamSummary } from '../data/club'
import { kickoff, played, upcoming } from '../data/matches'
import { sortedPlayers } from '../data/players'
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
    <div className="mb-3 flex items-center justify-between">
      <h2 className="label-caps">{title}</h2>
      {to && <Link to={to} className="text-xs font-semibold text-white/70 hover:text-white">{cta} →</Link>}
    </div>
  )
}

export function Home() {
  const next = upcoming()[0]
  const results = played().slice(0, 3)
  const cd = useCountdown(next?.time ? kickoff(next) : undefined)
  const s = teamSummary

  const tiles = [
    { label: 'Posición', value: `${s.position}º`, hint: `de ${s.teams}` },
    { label: 'Puntos', value: s.points, hint: `${s.played} jugados` },
    { label: 'A favor', value: s.goalsFor, hint: 'goles' },
    { label: 'En contra', value: s.goalsAgainst, hint: 'goles' },
  ]

  return (
    <div className="space-y-10 md:space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-club-600 via-club-800 to-club-950 p-5 md:p-10">
        <img src={club.crest} alt="" aria-hidden className="pointer-events-none absolute -right-16 -top-10 w-72 opacity-[0.07] md:-right-10 md:w-[420px]" />
        <div className="relative md:flex md:items-end md:justify-between md:gap-10">
          <div className="flex items-center gap-4 md:gap-6">
            <Crest className="size-20 shrink-0 drop-shadow-xl md:size-36" />
            <div>
              <p className="label-caps text-club-100/80">{club.league} · {club.group}</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">{club.shortName}</h1>
              <p className="text-sm text-white/70">{club.region} · Temporada {club.season}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2 md:mt-0 md:w-[440px] md:gap-3">
            {tiles.map((t, i) => (
              <div key={t.label} className={`rounded-2xl px-1 py-3 text-center md:p-4 ${i === 0 ? 'bg-white text-club-800' : 'bg-white/10'}`}>
                <p className="text-2xl font-bold md:text-4xl">{t.value}</p>
                <p className={`mt-0.5 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide md:text-[10px] md:tracking-wider ${i === 0 ? 'text-club-600' : 'text-white/60'}`}>{t.label}</p>
                <p className={`text-[10px] ${i === 0 ? 'text-club-700/70' : 'text-white/40'}`}>{t.hint}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative mt-4 text-center text-xs text-white/70 md:text-right">
          <b className="text-white">{s.won}</b> victorias · <b className="text-white">{s.drawn}</b> empates · <b className="text-white">{s.lost}</b> derrotas · diferencia{' '}
          <b className="text-white">{s.goalsFor - s.goalsAgainst > 0 ? '+' : ''}{s.goalsFor - s.goalsAgainst}</b>
        </p>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        {/* Próximo partido */}
        {next && (
          <section>
            <SectionHead title="Próximo partido" to="/partidos" cta="Calendario" />
            <div className="panel p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Jornada {next.round}</span>
                <span className="rounded-full bg-club-500 px-3 py-1 text-xs font-semibold">{next.home ? 'En casa' : 'Fuera'}</span>
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
          <SectionHead title="Últimos resultados" to="/partidos" />
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
        <Leaderboard title="Más minutos" stat="minutes" limit={5} />
      </section>

      {/* Plantilla */}
      <section>
        <SectionHead title="Plantilla" to="/plantilla" />
        <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {sortedPlayers.map((p) => (
            <li key={p.id} className="w-32 shrink-0 snap-start md:w-40">
              <Link to={`/jugador/${p.id}`} className="panel group relative block overflow-hidden pt-3">
                <span className="absolute left-2.5 top-1.5 text-xl font-bold text-white/30">{p.number ?? ''}</span>
                <Silhouette className="mx-auto h-28 w-full transition-transform group-hover:scale-105 md:h-36" />
                <p className="truncate border-t border-white/10 bg-club-950/40 px-2.5 py-2 text-xs font-semibold">{p.firstName} {p.lastName}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
