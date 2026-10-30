import { Crest } from '../components/Crest'
import { ResultDot } from '../components/MatchCard'
import { useTeam } from '../data/teams'

export function Table() {
  const team = useTeam()
  return (
    <section>
      <p className="label-caps">{team.league} · {team.group}</p>
      <h1 className="text-3xl font-bold md:text-4xl">Clasificación</h1>
      <p className="mt-1 text-sm text-white/50">Tras la jornada {team.standingsRound}</p>
      <div className="panel mt-6 overflow-hidden">
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
            {team.standings.map((r, i) => {
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
      <p className="mt-3 text-xs text-white/40">Ordenada por puntos por partido jugado, como publica la FFCM.</p>
    </section>
  )
}
