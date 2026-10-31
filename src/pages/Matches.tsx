import { MatchCard } from '../components/MatchCard'
import { liveMatch, played, upcoming } from '../data/build'
import { useTeam } from '../data/teams'

export function Matches() {
  const team = useTeam()
  const next = upcoming(team.matches)
  const past = played(team.matches)
  const live = liveMatch(team.matches)
  return (
    <section className="space-y-10">
      <div>
        <p className="label-caps">{team.label} · Temporada 2026/27</p>
        <h1 className="font-display text-5xl font-extrabold uppercase italic leading-none md:text-6xl">Partidos</h1>
      </div>
      {live && (
        <div>
          <h2 className="section-title mb-4">En directo</h2>
          <MatchCard match={live} className="border-red-500/40 bg-red-500/10" />
        </div>
      )}
      <div>
        <h2 className="section-title mb-4">Próximos</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {next.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      </div>
      <div>
        <h2 className="section-title mb-4">Resultados</h2>
        {past.length ? (
          <div className="grid gap-3 md:grid-cols-2">{past.map((m) => <MatchCard key={m.id} match={m} />)}</div>
        ) : (
          <p className="panel p-6 text-center text-sm text-white/50">Aún no hay resultados esta temporada.</p>
        )}
      </div>
    </section>
  )
}
