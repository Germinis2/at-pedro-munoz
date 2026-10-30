import { Crest } from '../components/Crest'
import { club } from '../data/club'

// PROVISIONAL: filas de ejemplo hasta tener la clasificación real
const rows = Array.from({ length: 14 }, (_, i) => ({
  name: i === 5 ? club.shortName : `Equipo ${i + 1}`,
  ours: i === 5,
}))

export function Table() {
  return (
    <section>
      <p className="label-caps">{club.league}</p>
      <h1 className="text-3xl font-bold md:text-4xl">Clasificación</h1>
      <div className="panel mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-club-950/40 text-[11px] uppercase tracking-wider text-white/50">
            <tr>
              <th className="w-10 py-3 pl-4 text-left">#</th>
              <th className="py-3 text-left">Equipo</th>
              <th className="w-10 text-center">PJ</th>
              <th className="hidden w-10 text-center sm:table-cell">G</th>
              <th className="hidden w-10 text-center sm:table-cell">E</th>
              <th className="hidden w-10 text-center sm:table-cell">P</th>
              <th className="w-12 text-center">DG</th>
              <th className="w-14 pr-4 text-center">PTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name} className={`border-t border-white/5 ${r.ours ? 'bg-club-500/25 font-semibold' : ''}`}>
                <td className="py-3 pl-4 text-white/60">{i + 1}</td>
                <td className="py-3">
                  <span className="flex items-center gap-2.5">
                    <Crest club={r.ours} className="h-7 w-6 shrink-0" />
                    <span className="truncate">{r.name}</span>
                  </span>
                </td>
                <td className="text-center text-white/50">–</td>
                <td className="hidden text-center text-white/50 sm:table-cell">–</td>
                <td className="hidden text-center text-white/50 sm:table-cell">–</td>
                <td className="hidden text-center text-white/50 sm:table-cell">–</td>
                <td className="text-center text-white/50">–</td>
                <td className="pr-4 text-center font-bold">–</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
