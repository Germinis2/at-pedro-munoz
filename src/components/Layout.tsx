import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { club } from '../data/club'
import { useTeam } from '../data/teams'
import { Crest } from './Crest'
import { BallIcon, ChartIcon, HomeIcon, ShirtIcon, TrophyIcon } from './Icons'

const nav = [
  { to: '', label: 'Inicio', Icon: HomeIcon },
  { to: '/partidos', label: 'Partidos', Icon: BallIcon },
  { to: '/clasificacion', label: 'Tabla', Icon: TrophyIcon },
  { to: '/plantilla', label: 'Plantilla', Icon: ShirtIcon },
  { to: '/estadisticas', label: 'Stats', Icon: ChartIcon },
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

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-32 pt-5 md:px-8 md:pb-16 md:pt-10">
        <Outlet />
      </main>

      <footer className="hidden border-t border-white/5 py-6 text-center font-display text-sm uppercase tracking-widest text-white/40 md:block">
        {club.name} · {club.town} · Temporada {club.season}
      </footer>

      {/* Barra flotante en el móvil */}
      <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 overflow-hidden rounded-xl border border-white/10 bg-club-950/90 shadow-2xl shadow-black/60 backdrop-blur-lg md:hidden">
        <ul className="grid grid-cols-5">
          {nav.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={href(to)}
                end={to === ''}
                className={({ isActive }) =>
                  `relative flex h-15 flex-col items-center justify-center gap-0.5 font-display text-[12px] font-bold uppercase tracking-wider transition-colors ${
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
