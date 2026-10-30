import { club } from '../data/club'
import type { Match } from '../data/matches'
import { Crest } from './Crest'

export const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase()
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

function Team({ name, ours }: { name: string; ours: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <Crest club={ours} className="h-12 w-11" />
      <p className="line-clamp-2 text-xs font-semibold leading-tight">{name}</p>
    </div>
  )
}

export function MatchCard({ match, className = '' }: { match: Match; className?: string }) {
  const us = <Team name={club.shortName} ours />
  const them = <Team name={match.opponent} ours={false} />
  const score = match.score && (match.home ? `${match.score.us} - ${match.score.them}` : `${match.score.them} - ${match.score.us}`)
  return (
    <article className={`panel flex items-center gap-2 px-3 py-5 ${className}`}>
      {match.home ? us : them}
      <div className="flex shrink-0 flex-col items-center gap-1.5 px-1">
        <p className="text-[11px] font-semibold tracking-wider text-white/60">{fmtDay(match.date)}</p>
        <p className="text-2xl font-semibold tabular-nums">{score ?? fmtTime(match.date)}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-club-300">Jornada {match.round}</p>
      </div>
      {match.home ? them : us}
    </article>
  )
}
