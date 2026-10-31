import { liveMinute } from '../data/build'
import type { Match } from '../data/types'
import { useNow } from '../lib/useNow'

// "● EN DIRECTO · 23'" con el minuto corriendo
export function LiveBadge({ match, className = '' }: { match: Match; className?: string }) {
  const now = useNow(10_000)
  const min = liveMinute(match, now)
  return (
    <span className={`inline-flex -skew-x-12 items-center gap-1.5 bg-red-600 px-2 py-0.5 font-display text-xs font-extrabold uppercase tracking-wider text-white ${className}`}>
      <span className="relative flex size-2 skew-x-12">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-white" />
      </span>
      <span className="skew-x-12">En directo{min && ` · ${min.label}`}</span>
    </span>
  )
}
