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
      <header className="sticky top-0 z-40 border-b border-white/5 bg-club-950/70 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-10 px-4 md:h-20 md:px-8">
          <NavLink to={href('')} className="flex items-center gap-3">
            <Crest className="size-11 md:size-13" />
            <div className="leading-tight">
              <p className="text-sm font-bold md:text-base">
                {club.name}
                {!team.full && <span className="ml-2 rounded bg-white/15 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wider">Juvenil</span>}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-club-300">{team.league} · {team.group}</p>
            </div>
          </NavLink>
          <nav className="ml-auto hidden md:block">
            <ul className="flex gap-9">
              {nav.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={href(to)}
                    end={to === ''}
                    className={({ isActive }) =>
                      `relative py-2 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors hover:text-white ${
                        isActive
                          ? 'text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-club-500'
                          : 'text-white/60'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-16 md:pt-10">
        <Outlet />
      </main>

      <footer className="hidden border-t border-white/5 py-6 text-center text-xs text-white/40 md:block">
        {club.name} · {club.town} · Temporada {club.season}
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-club-950/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
        <ul className="grid grid-cols-5">
          {nav.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={href(to)}
                end={to === ''}
                className={({ isActive }) =>
                  `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-white/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${isActive ? 'bg-club-500' : ''}`}>
                      <Icon className="size-5" />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
