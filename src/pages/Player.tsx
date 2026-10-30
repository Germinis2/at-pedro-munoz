import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from '../components/Icons'
import { MatchCard } from '../components/MatchCard'
import { Shirt } from '../components/Shirt'
import { Silhouette } from '../components/Silhouette'
import { StatRing } from '../components/StatRing'
import { upcoming } from '../data/matches'
import { assistsTracked, players, positionLabels, sortedPlayers } from '../data/players'

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <p className="text-4xl font-semibold tabular-nums md:text-5xl">{value}</p>
      <p className="mt-1 text-sm font-medium text-club-300">{label}</p>
    </div>
  )
}

export function Player() {
  const { id } = useParams()
  const index = sortedPlayers.findIndex((p) => p.id === id)
  const p = sortedPlayers[index]

  if (!p) {
    return (
      <div className="py-20 text-center">
        <p className="text-white/60">Jugador no encontrado.</p>
        <Link to="/plantilla" className="mt-4 inline-block font-semibold underline">Volver a la plantilla</Link>
      </div>
    )
  }

  const prev = sortedPlayers[index - 1]
  const next = sortedPlayers[index + 1]
  const isGK = p.position === 'POR'
  const maxOf = (key: 'goals' | 'assists' | 'cleanSheets' | 'appearances' | 'saves') => Math.max(...players.map((x) => x[key]))

  const stats = isGK
    ? [
        { value: p.appearances, label: 'Partidos' },
        { value: p.minutes, label: 'Minutos' },
        { value: p.cleanSheets, label: 'Porterías a 0' },
        { value: p.saves, label: 'Paradas' },
      ]
    : [
        { value: p.appearances, label: 'Partidos' },
        { value: p.minutes, label: 'Minutos' },
        { value: p.goals, label: 'Goles' },
        { value: assistsTracked ? p.assists : '–', label: 'Asistencias' },
      ]

  const rings = isGK
    ? [
        { value: p.cleanSheets, max: maxOf('cleanSheets'), label: 'Porterías a 0' },
        { value: p.saves, max: maxOf('saves'), label: 'Paradas' },
      ]
    : [
        { value: p.goals, max: maxOf('goals'), label: 'Goles' },
        assistsTracked
          ? { value: p.assists, max: maxOf('assists'), label: 'Asistencias' }
          : { value: p.appearances, max: maxOf('appearances'), label: 'Partidos' },
      ]

  const navBtn = 'grid size-12 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20'

  return (
    <article className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_auto] lg:gap-4">
      {/* Columna izquierda: nombre + panel */}
      <div className="order-2 min-w-0 lg:order-1">
        <div className="flex items-center gap-3">
          <span className="rounded bg-club-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
            {positionLabels[p.position].one}
          </span>
          {p.number && <span className="text-sm font-medium text-white/70">Dorsal {p.number}</span>}
          {p.nickname && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">“{p.nickname}”</span>}
        </div>

        <div className="mt-3 flex items-center gap-5">
          <h1 className="text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
            {p.firstName}
            <br />
            {p.lastName}
          </h1>
          <div className="hidden size-28 shrink-0 place-items-center rounded-full bg-white/[0.06] sm:grid xl:size-32">
            <Shirt number={p.number} name={p.lastName} className="size-20 xl:size-24" />
          </div>
        </div>
        <p className="mt-2 text-sm text-white/50">{p.fullName}</p>

        <div className="panel mt-8 p-5 md:p-7">
          <p className="label-caps mb-5">Temporada 2026/27</p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => <Stat key={s.label} {...s} />)}
          </div>
          <div className="mt-6 flex gap-5 border-t border-white/10 pt-5 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-5 w-3.5 rounded-[3px] bg-amber-400" aria-hidden />
              <b className="text-lg tabular-nums">{p.yellowCards}</b>
              <span className="text-club-300">Amarillas</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-5 w-3.5 rounded-[3px] bg-red-600" aria-hidden />
              <b className="text-lg tabular-nums">{p.redCards}</b>
              <span className="text-club-300">Rojas</span>
            </span>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="label-caps">Próximos partidos</p>
          </div>
          <div className="no-scrollbar -mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 md:-mx-7 md:px-7">
            {upcoming().slice(0, 4).map((m) => (
              <MatchCard key={m.id} match={m} className="w-[260px] shrink-0 snap-start" />
            ))}
          </div>
        </div>
      </div>

      {/* Columna central: silueta */}
      <div className="relative order-1 -mx-4 h-[340px] overflow-hidden sm:h-[420px] lg:order-2 lg:mx-0 lg:h-auto lg:min-h-[620px]">
        <span className="absolute inset-x-0 top-0 text-center text-[180px] font-extrabold leading-none text-white/[0.05] lg:text-[260px]">
          {p.number}
        </span>
        <Silhouette className="absolute inset-x-0 bottom-0 mx-auto h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-club-950 to-transparent lg:hidden" />
        {/* Flechas en móvil */}
        <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between lg:hidden">
          {prev ? <Link to={`/jugador/${prev.id}`} className={navBtn} aria-label="Anterior"><ChevronLeft className="size-5" /></Link> : <span />}
          {next ? <Link to={`/jugador/${next.id}`} className={navBtn} aria-label="Siguiente"><ChevronRight className="size-5" /></Link> : <span />}
        </div>
      </div>

      {/* Columna derecha: flechas + anillos */}
      <aside className="order-3 flex flex-col items-center gap-8 lg:justify-between lg:py-6">
        <div className="hidden flex-col gap-4 lg:flex">
          {prev && <Link to={`/jugador/${prev.id}`} className={navBtn} aria-label="Anterior"><ChevronLeft className="size-5" /></Link>}
          {next && <Link to={`/jugador/${next.id}`} className={navBtn} aria-label="Siguiente"><ChevronRight className="size-5" /></Link>}
        </div>
        <div className="flex w-full justify-around gap-6 lg:flex-col lg:gap-12">
          {rings.map((r) => <StatRing key={r.label} {...r} />)}
        </div>
      </aside>
    </article>
  )
}
