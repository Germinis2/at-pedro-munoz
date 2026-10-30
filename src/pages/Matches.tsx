import { MatchCard } from '../components/MatchCard'
import { played, upcoming } from '../data/matches'

export function Matches() {
  const next = upcoming()
  const past = played()
  return (
    <section className="space-y-10">
      <div>
        <p className="label-caps">Temporada 2026/27</p>
        <h1 className="text-3xl font-bold md:text-4xl">Partidos</h1>
      </div>
      <div>
        <h2 className="label-caps mb-3">Próximos</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {next.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      </div>
      <div>
        <h2 className="label-caps mb-3">Resultados</h2>
        {past.length ? (
          <div className="grid gap-3 md:grid-cols-2">{past.map((m) => <MatchCard key={m.id} match={m} />)}</div>
        ) : (
          <p className="panel p-6 text-center text-sm text-white/50">Aún no hay resultados esta temporada.</p>
        )}
      </div>
    </section>
  )
}
