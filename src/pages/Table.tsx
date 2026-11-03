import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { ResultDot } from '../components/MatchCard'
import { isClub } from '../data/clasificacion'
import { computeStandings, lastRound, playedResults, type GroupResult } from '../data/resultados'
import { useTeam } from '../data/teams'
import type { Standing } from '../data/types'

type View = 'tabla' | 'jornadas'
type Side = 'total' | 'home' | 'away'

const shortDate = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })

function Switch<T extends string>({ value, options, onChange, small = false }: { value: T; options: [T, string][]; onChange: (v: T) => void; small?: boolean }) {
  return (
    <div className="flex gap-1.5" role="tablist">
      {options.map(([v, label]) => (
        <button
          key={v}
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={`-skew-x-12 border font-display font-bold uppercase tracking-wider transition-colors ${small ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'} ${
            value === v ? 'border-club-500 bg-club-500 text-white' : 'border-white/15 text-white/55 hover:border-white/30 hover:text-white'
          }`}
        >
          <span className="inline-block skew-x-12">{label}</span>
        </button>
      ))}
    </div>
  )
}

export function Table() {
  const team = useTeam()
  const [view, setView] = useState<View>('tabla')
  const [side, setSide] = useState<Side>('total')
  const ours = team.standings.find((s) => s.ours)?.team
  const isOurs = (t: string) => t === ours || isClub(t)
  const hasResults = playedResults(team.results).length > 0

  // La total es la guardada (la oficial); local y visitante se calculan con los resultados del grupo
  const rows = useMemo(
    () => (side === 'total' || !hasResults ? team.standings : computeStandings(team.results, (t) => t === ours || isClub(t), side)),
    [side, hasResults, team.standings, team.results, ours],
  )

  return (
    <section>
      <p className="label-caps">{team.league} · {team.group}</p>
      <h1 className="font-display text-5xl font-extrabold uppercase italic leading-none md:text-6xl">Clasificación</h1>
      <p className="mt-1 text-sm text-white/50">Tras la jornada {team.standingsRound}</p>

      {team.results.length > 0 && (
        <div className="mt-5">
          <Switch value={view} onChange={setView} options={[['tabla', 'Clasificación'], ['jornadas', 'Jornadas']]} />
        </div>
      )}

      {view === 'tabla' ? (
        <>
          {hasResults && (
            <div className="mt-4">
              <Switch small value={side} onChange={setSide} options={[['total', 'Total'], ['home', 'Local'], ['away', 'Visitante']]} />
            </div>
          )}
          <StandingsTable rows={rows} />
          <p className="mt-3 text-xs text-white/40">
            Ordenada por puntos por partido jugado, como publica la FFCM.
            {side !== 'total' && ' Solo cuenta los partidos jugados ' + (side === 'home' ? 'en casa.' : 'fuera.')}
          </p>
        </>
      ) : (
        <Rounds results={team.results} isOurs={isOurs} />
      )}
    </section>
  )
}

function StandingsTable({ rows }: { rows: Standing[] }) {
  return (
    <div className="panel mt-4 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-club-950/40 text-[11px] uppercase tracking-wider text-white/50">
          <tr>
            <th className="w-8 py-3 pl-3 text-left md:w-10 md:pl-4">#</th>
            <th className="py-3 text-left">Equipo</th>
            <th className="w-8 text-center md:w-10">PJ</th>
            <th className="hidden w-10 text-center sm:table-cell">G</th>
            <th className="hidden w-10 text-center sm:table-cell">E</th>
            <th className="hidden w-10 text-center sm:table-cell">P</th>
            <th className="hidden w-16 text-center md:table-cell">Goles</th>
            <th className="w-10 text-center">DG</th>
            <th className="hidden w-36 text-center lg:table-cell">Forma</th>
            <th className="w-12 pr-3 text-center md:pr-4">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const dg = r.gf - r.gc
            return (
              <tr key={r.team} className={`border-t border-white/5 ${r.ours ? 'bg-club-500/25 font-semibold' : ''}`}>
                <td className="py-3 pl-3 text-white/60 md:pl-4">{i + 1}</td>
                <td className="max-w-0 py-3">
                  <span className="flex items-center gap-2.5">
                    <Crest club={!!r.ours} team={r.team} className="size-7 shrink-0" />
                    <span className="truncate">{r.team}</span>
                  </span>
                </td>
                <td className="text-center text-white/70">{r.pj}</td>
                <td className="hidden text-center text-white/70 sm:table-cell">{r.g}</td>
                <td className="hidden text-center text-white/70 sm:table-cell">{r.e}</td>
                <td className="hidden text-center text-white/70 sm:table-cell">{r.p}</td>
                <td className="hidden text-center text-white/70 md:table-cell">{r.gf}:{r.gc}</td>
                <td className="text-center text-white/70">{dg > 0 ? `+${dg}` : dg}</td>
                <td className="hidden lg:table-cell">
                  <span className="flex justify-center gap-1.5">{r.form.map((f, k) => <ResultDot key={k} r={f} />)}</span>
                </td>
                <td className="pr-3 text-center text-base font-bold md:pr-4">{r.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Rounds({ results, isOurs }: { results: GroupResult[]; isOurs: (t: string) => boolean }) {
  const team = useTeam()
  const rounds = [...new Set(results.map((r) => r.round))].sort((a, b) => a - b)
  const [shown, setShown] = useState(() => Math.max(rounds[0] ?? 1, lastRound(results)))
  const games = results.filter((r) => r.round === shown)
  const date = games.find((g) => g.date)?.date
  const our = team.matches.find((m) => m.round === shown)
  const i = rounds.indexOf(shown)
  // Con un número impar de equipos, cada jornada descansa uno
  const resting = [...new Set(results.flatMap((r) => [r.home, r.away]))].filter((t) => !games.some((g) => g.home === t || g.away === t))

  return (
    <div className="mt-4">
      <div className="panel flex items-center justify-between px-2 py-2">
        <button onClick={() => setShown(rounds[i - 1])} disabled={i <= 0} aria-label="Jornada anterior" className="grid size-10 place-items-center text-2xl text-white/70 hover:text-white disabled:opacity-20">‹</button>
        <div className="text-center">
          <p className="font-display text-xl font-extrabold uppercase italic leading-none">Jornada {shown}</p>
          {date && <p className="mt-1 text-xs text-white/50">{shortDate(date)}</p>}
        </div>
        <button onClick={() => setShown(rounds[i + 1])} disabled={i >= rounds.length - 1} aria-label="Jornada siguiente" className="grid size-10 place-items-center text-2xl text-white/70 hover:text-white disabled:opacity-20">›</button>
      </div>
      <ul className="panel mt-3 divide-y divide-white/5">
        {games.map((g) => {
          const mine = isOurs(g.home) || isOurs(g.away)
          const body = (
            <>
              <span className="flex min-w-0 items-center justify-end gap-2 text-right">
                <span className={`line-clamp-2 leading-tight ${isOurs(g.home) ? 'font-bold' : ''}`}>{g.home}</span>
                <Crest club={isOurs(g.home)} team={g.home} className="size-7 shrink-0" />
              </span>
              <span
                className={`-skew-x-12 px-1.5 py-1 text-center font-display text-lg font-extrabold tabular-nums ${g.hg === null ? 'text-sm text-white/40' : mine ? 'bg-club-500' : 'bg-white/10'}`}
              >
                <span className="inline-block skew-x-12">{g.hg === null ? 'vs' : `${g.hg} - ${g.ag}`}</span>
              </span>
              <span className="flex min-w-0 items-center gap-2">
                <Crest club={isOurs(g.away)} team={g.away} className="size-7 shrink-0" />
                <span className={`line-clamp-2 leading-tight ${isOurs(g.away) ? 'font-bold' : ''}`}>{g.away}</span>
              </span>
            </>
          )
          const cls = 'grid grid-cols-[1fr_4rem_1fr] items-center gap-2 px-2.5 py-3 text-[13px] sm:px-4 sm:text-sm'
          return (
            <li key={`${g.home}|${g.away}`}>
              {mine && our ? (
                <Link to={`${team.base}/partido/${our.id}`} className={`${cls} bg-club-500/15 transition hover:bg-club-500/25`}>{body}</Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          )
        })}
      </ul>
      {resting.length > 0 && <p className="mt-3 text-xs text-white/50">Descansa: {resting.join(', ')}</p>}
    </div>
  )
}
