import { logoUrl, useSponsors, type Sponsor } from '../data/sponsors'

// Mosaico de logos sobre fichas blancas, como el cartel de cada partido
function Tile({ s, big }: { s: Sponsor; big: boolean }) {
  return (
    <li className={`overflow-hidden rounded-sm bg-white ${big ? 'h-20 p-2.5 md:h-24 md:p-3' : 'h-14 p-1.5 md:h-16 md:p-2'}`}>
      <img src={logoUrl(s.logo_path)} alt={s.name} title={s.name} loading="lazy" className="size-full object-contain" />
    </li>
  )
}

export function Sponsors() {
  const sponsors = useSponsors()
  if (!sponsors.length) return null
  const main = sponsors.filter((s) => s.tier === 'principal')
  const rest = sponsors.filter((s) => s.tier !== 'principal')
  return (
    <section aria-label="Patrocinadores" className="mx-auto max-w-7xl px-4 md:px-8">
      <h2 className="section-title mb-4 text-lg">Patrocinadores</h2>
      {main.length > 0 && (
        <ul className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {main.map((s) => <Tile key={s.id} s={s} big />)}
        </ul>
      )}
      {rest.length > 0 && (
        <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 md:gap-2 lg:grid-cols-8">
          {rest.map((s) => <Tile key={s.id} s={s} big={false} />)}
        </ul>
      )}
    </section>
  )
}
