import { kickoff } from '../data/build'
import { club } from '../data/club'
import type { Match, Result } from '../data/types'
import { Crest } from './Crest'

export const fmtDay = (m: Match) =>
  kickoff(m).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase()
export const fmtLongDay = (m: Match) =>
  kickoff(m).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
export const fmtTime = (m: Match) => m.time ?? 'Por confirmar'

function Team({ name, ours }: { name: string; ours: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <Crest club={ours} team={name} className="size-12" />
      <p className="line-clamp-2 text-xs font-semibold leading-tight">{name}</p>
    </div>
  )
}

export function MatchCard({ match, className = '' }: { match: Match; className?: string }) {
  const us = <Team name={club.shortName} ours />
  const them = <Team name={match.opponent} ours={false} />
  const score = match.score && (match.home ? `${match.score.us} - ${match.score.them}` : `${match.score.them} - ${match.score.us}`)
  const result = match.score && (match.score.us > match.score.them ? 'G' : match.score.us === match.score.them ? 'E' : 'P')
  return (
    <article className={`panel flex items-center gap-2 px-3 py-5 ${className}`}>
      {match.home ? us : them}
      <div className="flex w-24 shrink-0 flex-col items-center gap-1.5">
        <p className="text-[11px] font-semibold tracking-wider text-white/60">{fmtDay(match)}</p>
        {score ? (
          <p className="text-2xl font-semibold tabular-nums">{score}</p>
        ) : (
          <p className={match.time ? 'text-2xl font-semibold tabular-nums' : 'text-center text-xs font-semibold leading-tight text-white/70'}>
            {fmtTime(match)}
          </p>
        )}
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-club-300">
          {result && <ResultDot r={result} />}
          Jornada {match.round}
        </p>
      </div>
      {match.home ? them : us}
    </article>
  )
}

export function ResultDot({ r, big = false }: { r: Result; big?: boolean }) {
  const color = r === 'G' ? 'bg-emerald-500' : r === 'E' ? 'bg-amber-400 text-club-950' : 'bg-white/25'
  return big ? (
    <span className={`grid size-8 place-items-center rounded-full text-xs font-bold ${color}`}>{r === 'G' ? 'V' : r}</span>
  ) : (
    <span className={`size-2 rounded-full ${color}`} aria-label={r === 'G' ? 'Victoria' : r === 'E' ? 'Empate' : 'Derrota'} />
  )
}
