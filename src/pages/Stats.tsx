import { Link } from 'react-router-dom'
import { Silhouette } from '../components/Silhouette'
import { players, positionLabels } from '../data/players'

type StatKey = 'goals' | 'assists' | 'cleanSheets'

export function Leaderboard({ title, stat, limit = 5, compact = false }: { title: string; stat: StatKey; limit?: number; compact?: boolean }) {
  const pool = stat === 'cleanSheets' ? players.filter((p) => p.position === 'POR') : players
  const ranked = [...pool].filter((p) => p[stat] > 0).sort((a, b) => b[stat] - a[stat]).slice(0, limit)

  return (
    <div className="panel p-4 md:p-5">
      <h3 className="label-caps mb-3">{title}</h3>
      {ranked.length === 0 ? (
        <p className="py-3 text-sm text-white/40">Sin datos todavía</p>
      ) : (
        <ol className="space-y-2">
          {ranked.map((p, i) => (
            <li key={p.id}>
              <Link to={`/jugador/${p.id}`} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-white/5">
                <span className="w-4 text-sm font-bold text-white/40">{i + 1}</span>
                {!compact && (
                  <span className="size-10 overflow-hidden rounded-full bg-club-800">
                    <Silhouette className="size-full" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.firstName} {p.lastName}</span>
                  {!compact && <span className="text-[11px] text-white/50">{positionLabels[p.position].one}</span>}
                </span>
                <span className="text-lg font-bold tabular-nums">{p[stat]}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function Stats() {
  return (
    <section>
      <p className="label-caps">Temporada 2026/27</p>
      <h1 className="text-3xl font-bold md:text-4xl">Estadísticas</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Leaderboard title="Goleadores" stat="goals" limit={10} />
        <Leaderboard title="Asistencias" stat="assists" limit={10} />
        <Leaderboard title="Porterías a 0" stat="cleanSheets" limit={5} />
      </div>
    </section>
  )
}
