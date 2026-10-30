import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from '../components/Icons'
import { PlayerImage } from '../components/PlayerImage'
import { positionLabel, positionLabels, positionOrder, sortPlayers } from '../data/build'
import { useTeam } from '../data/teams'
import type { Position } from '../data/types'

type Filter = 'ALL' | Position

export function Squad() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const touchX = useRef<number | null>(null)
  const team = useTeam()
  const sorted = useMemo(() => sortPlayers(team.players), [team])

  const list = useMemo(
    () => (filter === 'ALL' ? sorted : sorted.filter((p) => p.position === filter)),
    [filter, sorted],
  )
  const current = list[active]
  const go = (d: number) => setActive((i) => Math.max(0, Math.min(list.length - 1, i + d)))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Solo las posiciones que tienen jugadores (en el juvenil aún faltan por asignar)
  const present = positionOrder.filter((pos) => sorted.some((p) => p.position === pos))
  const filters: Filter[] = ['ALL', ...present]
  const groups: (Position | null)[] = [...present, ...(sorted.some((p) => !p.position) ? [null] : [])]

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label-caps">{team.label} · Temporada 2026/27</p>
          <h1 className="text-3xl font-bold md:text-4xl">Plantilla</h1>
        </div>
        <p className="text-sm text-white/50">{list.length} jugadores</p>
      </div>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:justify-end md:px-0">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f)
              setActive(0)
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === f ? 'bg-white text-club-800' : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            {f === 'ALL' ? 'Todos' : positionLabels[f].many}
          </button>
        ))}
      </div>

      {/* Carrusel tipo coverflow */}
      <div
        className="relative mt-4 h-[310px] select-none overflow-hidden [--step:112px] sm:[--step:170px] md:h-[480px] md:[--step:230px]"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return
          const dx = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
          touchX.current = null
        }}
      >
        {list.map((p, i) => {
          const offset = i - active
          if (Math.abs(offset) > 3) return null
          const isActive = offset === 0
          return (
            <button
              key={p.id}
              onClick={() => (isActive ? navigate(`${team.base}/jugador/${p.id}`) : setActive(i))}
              aria-label={isActive ? `Ver ficha de ${p.fullName}` : `Mostrar a ${p.fullName}`}
              className="absolute bottom-0 left-1/2 w-[200px] transition-all duration-500 ease-out md:w-[260px]"
              style={{
                transform: `translateX(calc(-50% + ${offset} * var(--step))) scale(${1 - Math.min(Math.abs(offset), 3) * 0.17})`,
                transformOrigin: 'bottom center',
                zIndex: 10 - Math.abs(offset),
                opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.15,
              }}
            >
              <div
                className={`relative overflow-hidden rounded-[28px] border transition-colors ${
                  isActive ? 'border-white/20 bg-gradient-to-b from-club-600 to-club-900' : 'border-white/10 bg-gradient-to-b from-club-700/80 to-club-900/80'
                }`}
              >
                <span className="absolute -right-2 top-2 text-[120px] font-extrabold leading-none text-white/[0.06] md:text-[150px]">
                  {p.number ?? ''}
                </span>
                <PlayerImage player={p} className="relative mx-auto mt-6 h-[260px] w-full md:h-[330px]" photoClassName="relative h-[286px] w-full md:h-[356px]" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-club-950 via-club-950/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-4 text-center">
                  <span className="mx-auto mb-2 grid size-9 place-items-center rounded-full bg-club-500 text-sm font-bold shadow-lg shadow-club-950/50">
                    {p.number ?? '–'}
                  </span>
                  {!isActive && <p className="text-sm font-semibold">{p.firstName} {p.lastName}</p>}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {current && (
        <div className="relative mt-5 text-center">
          <p className="text-lg font-medium text-white/80 md:text-2xl">
            {current.firstName}
            {current.nickname && <span className="text-club-300"> “{current.nickname}”</span>}
          </p>
          <h2 className="text-5xl font-bold leading-none tracking-tight md:text-7xl">{current.lastName}</h2>
          <p className="label-caps mt-3">{positionLabel(current.position)}{current.number && ` · Dorsal ${current.number}`}</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button onClick={() => go(-1)} disabled={active === 0} className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-30" aria-label="Anterior">
              <ChevronLeft className="size-5" />
            </button>
            <Link to={`${team.base}/jugador/${current.id}`} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-club-800 transition hover:bg-club-100">
              Ver ficha
            </Link>
            <button onClick={() => go(1)} disabled={active === list.length - 1} className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-30" aria-label="Siguiente">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Lista completa por posiciones */}
      <div className="mt-14 space-y-10">
        {groups
          .filter((pos) => filter === 'ALL' || filter === pos)
          .map((pos) => (
            <div key={pos ?? 'none'}>
              <h3 className="label-caps mb-3">{pos ? positionLabels[pos].many : 'Jugadores'}</h3>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {sorted
                  .filter((p) => p.position === pos)
                  .map((p) => (
                    <li key={p.id}>
                      <Link to={`${team.base}/jugador/${p.id}`} className="panel group relative block overflow-hidden pt-3 transition hover:bg-white/10">
                        <span className="absolute left-3 top-2 text-2xl font-bold text-white/30">{p.number ?? ''}</span>
                        <PlayerImage player={p} className="mx-auto h-28 w-full transition-transform duration-300 group-hover:scale-105" photoClassName="-mt-3 h-31 w-full transition-transform duration-300 group-hover:scale-105" />
                        <div className="border-t border-white/10 bg-club-950/40 px-3 py-2.5">
                          <p className="truncate text-sm font-semibold">{p.firstName} {p.lastName}</p>
                          <p className="text-[11px] text-white/50">{positionLabel(p.position)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
      </div>
    </section>
  )
}
