import { Link } from 'react-router-dom'
import { PlayerImage } from '../components/PlayerImage'
import { positionLabel } from '../data/build'
import { useTeam } from '../data/teams'
import type { StatKey } from '../data/types'

export function Leaderboard({ title, stat, limit = 5, compact = false }: { title: string; stat: StatKey; limit?: number; compact?: boolean }) {
  const team = useTeam()
  const pool = stat === 'cleanSheets' || stat === 'saves' ? team.players.filter((p) => p.position === 'POR') : team.players
  const ranked = [...pool].filter((p) => p[stat] > 0).sort((a, b) => b[stat] - a[stat]).slice(0, limit)

  return (
    <div className="panel p-4 md:p-5">
      <h3 className="label-caps mb-3">{title}</h3>
      {ranked.length === 0 ? (
        <p className="py-3 text-sm text-white/40">Sin datos todavía</p>
      ) : (
        <ol className="space-y-1">
          {ranked.map((p, i) => (
            <li key={p.id}>
              <Link to={`${team.base}/jugador/${p.id}`} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-white/5">
                <span className="w-4 text-sm font-bold text-white/40">{i + 1}</span>
                {!compact && (
                  <span className="size-10 shrink-0 overflow-hidden rounded-full bg-club-800">
                    <PlayerImage player={p} className="size-full" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.firstName} {p.lastName}</span>
                  {!compact && <span className="text-[11px] text-white/50">{positionLabel(p.position)}</span>}
                </span>
                <span className="text-lg font-bold tabular-nums">
                  {p[stat]}
                  {stat === 'minutes' && <span className="ml-0.5 text-xs font-medium text-white/50">'</span>}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function Stats() {
  const team = useTeam()
  return (
    <section>
      <p className="label-caps">{team.label} · Temporada 2026/27</p>
      <h1 className="text-3xl font-bold md:text-4xl">Estadísticas</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Leaderboard title="Goleadores" stat="goals" limit={10} />
        {team.full && <Leaderboard title="Asistencias" stat="assists" limit={10} />}
        <Leaderboard title="Más minutos" stat="minutes" limit={10} />
        {team.full && (
          <>
            <Leaderboard title="Tarjetas amarillas" stat="yellowCards" limit={10} />
            <Leaderboard title="Porterías a 0" stat="cleanSheets" limit={5} />
            <Leaderboard title="Paradas" stat="saves" limit={5} />
            <Leaderboard title="Tarjetas rojas" stat="redCards" limit={5} />
          </>
        )}
      </div>
      <p className="mt-6 text-xs text-white/40">
        Partidos, minutos y goles calculados a partir de las actas oficiales de la FFCM.
        {team.full && ' Asistencias, paradas y tarjetas: datos del club.'}
      </p>
    </section>
  )
}
