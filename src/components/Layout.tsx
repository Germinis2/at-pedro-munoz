import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { club } from '../data/club'
import { useTeam } from '../data/teams'
import { Crest } from './Crest'
import { BagIcon, BallIcon, ChartIcon, FacebookIcon, HomeIcon, InstagramIcon, ShirtIcon, TrophyIcon } from './Icons'
import { Sponsors } from './Sponsors'

const nav = [
  { to: '', label: 'Inicio', Icon: HomeIcon },
  { to: '/partidos', label: 'Partidos', Icon: BallIcon },
  { to: '/clasificacion', label: 'Tabla', Icon: TrophyIcon },
  { to: '/plantilla', label: 'Plantilla', Icon: ShirtIcon },
  { to: '/estadisticas', label: 'Stats', Icon: ChartIcon },
  { to: '/tienda', label: 'Tienda', Icon: BagIcon },
]

export function Layout() {
  const { pathname } = useLocation()
  const team = useTeam()
  const href = (to: string) => team.base + to || '/'
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 bg-club-950/90 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-10 px-4 md:h-20 md:px-8">
          <NavLink to={href('')} className="flex items-center gap-3">
            <Crest className="size-11 md:size-13" />
            <div className="leading-none">
              <p className="font-display text-xl font-extrabold uppercase italic tracking-wide md:text-2xl">
                {club.shortName}
                {!team.full && <span className="ml-2 inline-block -skew-x-12 bg-club-500 px-1.5 py-0.5 align-middle text-[11px] not-italic tracking-wider">Juvenil</span>}
              </p>
              <p className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-club-300">{team.league} · {team.group}</p>
            </div>
          </NavLink>
          <nav className="ml-auto hidden md:block">
            <ul className="flex gap-1">
              {nav.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={href(to)}
                    end={to === ''}
                    className={({ isActive }) =>
                      `block -skew-x-12 px-4 py-2 font-display text-base font-bold uppercase tracking-wider transition-colors ${
                        isActive ? 'bg-club-500 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <span className="block skew-x-12">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Franja del club bajo la cabecera */}
        <div className="h-1 bg-[linear-gradient(90deg,var(--color-club-500)_0_60%,white_60%_63%,var(--color-club-500)_63%_66%,transparent_66%)]" />
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-5 md:px-8 md:pb-16 md:pt-10">
        <Outlet />
      </main>

      {/* En el móvil deja hueco abajo para la barra flotante */}
      <footer className="border-t border-white/10 bg-club-950/70 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-8 md:pb-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 text-center md:flex-row md:justify-between md:px-8 md:text-left">
          <div className="flex flex-col items-center gap-3 md:flex-row">
            <Crest className="size-12" />
            <div>
              <p className="font-display text-xl font-extrabold uppercase italic tracking-wide">{club.name}</p>
              <p className="font-display text-sm font-semibold uppercase tracking-widest text-white/50">
                {club.town} · Temporada {club.season}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 md:items-end">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-club-300">Síguenos</p>
            <div className="flex gap-3">
              {[
                { href: club.social.instagram, label: 'Instagram', Icon: InstagramIcon },
                { href: club.social.facebook, label: 'Facebook', Icon: FacebookIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${club.shortName} en ${label}`}
                  className="flex -skew-x-12 items-center gap-2 border border-white/15 px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-white/80 transition hover:border-club-500 hover:bg-club-500 hover:text-white"
                >
                  <span className="flex skew-x-12 items-center gap-2">
                    <Icon className="size-5" />
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
        {/* Patrocinadores: lo último de la página */}
        <Sponsors />
      </footer>

      {/* Barra flotante en el móvil */}
      <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 overflow-hidden rounded-xl border border-white/10 bg-club-950/90 shadow-2xl shadow-black/60 backdrop-blur-lg md:hidden">
        <ul className="grid grid-cols-6">
          {nav.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={href(to)}
                end={to === ''}
                className={({ isActive }) =>
                  `relative flex h-15 flex-col items-center justify-center gap-0.5 font-display text-[11px] font-bold uppercase tracking-wide transition-colors ${
                    isActive ? 'bg-club-500 text-white' : 'text-white/55'
                  }`
                }
              >
                <Icon className="size-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
