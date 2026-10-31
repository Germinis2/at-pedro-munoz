import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { BallIcon } from '../components/Icons'
import { LiveBadge } from '../components/LiveBadge'
import { fmtLongDay, fmtTime } from '../components/MatchCard'
import { MvpCard } from '../components/MvpCard'
import { PlayerImage } from '../components/PlayerImage'
import { actaUrl, isLive } from '../data/build'
import { club } from '../data/club'
import { splitFfcm } from '../data/names'
import { useTeam, useTeams } from '../data/teams'
import type { Match, Player } from '../data/types'

type Event =
  | { kind: 'goal'; min: number; ours: boolean; who: string; id?: string; ownGoal?: boolean }
  | { kind: 'sub'; min: number; ours: boolean; inName: string; outName: string }

function useNames(players: Player[]) {
  return (raw: string) => {
    const p = players.find((x) => x.ffcm === raw)
    return { name: p ? `${p.firstName} ${p.lastName}` : splitFfcm(raw).short, player: p }
  }
}

function buildEvents(m: Match, name: ReturnType<typeof useNames>): Event[] {
  const l = m.lineup!
  const events: Event[] = [
    ...l.goals.map((g) =>
      g.player
        ? ({ kind: 'goal', min: g.min, ours: true, who: name(g.player).name, id: name(g.player).player?.id } as const)
        : ({ kind: 'goal', min: g.min, ours: true, who: 'Gol en propia puerta', ownGoal: true } as const),
    ),
    ...(l.rivalGoals ?? []).map((g) => ({ kind: 'goal', min: g.min, ours: false, who: g.player ? splitFfcm(g.player).short : 'Gol del rival' }) as const),
    ...l.subs.map((s) => ({ kind: 'sub', min: s.min, ours: true, inName: name(s.in).name, outName: name(s.out).name }) as const),
    ...(l.rival?.subs ?? []).map(
      (s) => ({ kind: 'sub', min: s.min, ours: false, inName: splitFfcm(s.in).short, outName: splitFfcm(s.out).short }) as const,
    ),
  ]
  // Los de minuto desconocido (0) van al final
  return events.sort((a, b) => (a.min || 999) - (b.min || 999))
}

function Header({ m }: { m: Match }) {
  const us = { name: club.shortName, ours: true }
  const them = { name: m.opponent, ours: false }
  const [home, away] = m.home ? [us, them] : [them, us]
  const score = m.score && (m.home ? [m.score.us, m.score.them] : [m.score.them, m.score.us])
  const side = (t: typeof us) => (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <Crest club={t.ours} team={t.name} className="size-16 drop-shadow-[0_4px_10px_rgb(0_0_0/0.4)] md:size-24" />
      <p className="line-clamp-2 font-display text-base font-extrabold uppercase leading-tight md:text-xl">{t.name}</p>
    </div>
  )
  return (
    <section className="clip-corner relative overflow-hidden bg-club-600 px-4 pb-6 pt-4 md:px-8 md:pb-8">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_46px,rgb(0_0_0/0.12)_46px_92px)]" aria-hidden />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
          <span className="-skew-x-12 bg-club-950/60 px-3 py-1">Jornada {m.round}</span>
          <span className="capitalize text-white/80">{fmtLongDay(m)}</span>
        </div>
        <div className="mt-5 flex items-center gap-2 md:gap-6">
          {side(home)}
          <div className="shrink-0 text-center">
            {score ? (
              <p className="-skew-x-6 bg-club-950/70 px-4 py-1 font-display text-5xl font-extrabold tabular-nums md:px-6 md:text-7xl">
                {score[0]}<span className="mx-1 text-white/40">-</span>{score[1]}
              </p>
            ) : (
              <p className="font-display text-3xl font-extrabold md:text-5xl">{fmtTime(m)}</p>
            )}
            {isLive(m) ? (
              <LiveBadge match={m} className="mt-2" />
            ) : (
              <p className="mt-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-white/70">{score ? 'Final' : 'Próximo'}</p>
            )}
          </div>
          {side(away)}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/75">
          {m.venue && <span>🏟 {m.venue}</span>}
          {m.acta && m.score && !isLive(m) && (
            <a href={actaUrl(m.acta)} target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-white/30 underline-offset-4 hover:decoration-white">
              Acta oficial FFCM ↗
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// Sin los goles del rival el marcador parcial sería falso: entonces solo se pone "Gol"
function Timeline({ m, events, base, running: showRunning }: { m: Match; events: Event[]; base: string; running: boolean }) {
  // Marcador acumulado tras cada gol, visto como local - visitante
  let us = 0
  let them = 0
  const ourSide = m.home ? 'left' : 'right'
  return (
    <ol className="relative space-y-2 before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-white/15">
      {events.map((e, i) => {
        // Lo nuestro en nuestro lado (izquierda si somos locales); lo del rival, en el otro
        const left = e.ours === (ourSide === 'left')
        let body
        if (e.kind === 'goal') {
          if (e.ours) us++
          else them++
          const running = m.home ? `${us}-${them}` : `${them}-${us}`
          body = (
            <div className={`flex items-center gap-2 ${left ? 'flex-row-reverse text-right' : ''}`}>
              <BallIcon className={`size-5 shrink-0 ${e.ours ? 'text-white' : 'text-white/50'}`} />
              <div className="min-w-0">
                {e.id ? (
                  <Link to={`${base}/jugador/${e.id}`} className="block font-semibold leading-tight hover:underline">{e.who}</Link>
                ) : (
                  <p className={`font-semibold leading-tight ${e.ours ? '' : 'text-white/70'}`}>{e.who}</p>
                )}
                <p className="font-display text-xs font-bold uppercase tracking-wider text-club-300">Gol{showRunning && ` · ${running}`}</p>
              </div>
            </div>
          )
        } else {
          body = (
            <div className={`text-sm ${left ? 'text-right' : ''}`}>
              <p className="leading-tight"><span className="font-bold text-emerald-400">▲</span> {e.inName}</p>
              <p className="leading-tight text-white/50"><span className="font-bold text-red-400">▼</span> {e.outName}</p>
            </div>
          )
        }
        return (
          <li key={i} className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="min-w-0">{left && body}</div>
            <span className="z-10 grid h-7 min-w-10 -skew-x-12 place-items-center bg-club-500 px-1.5 font-display text-sm font-extrabold">
              {e.min ? `${e.min}'` : '?'}
            </span>
            <div className="min-w-0">{!left && body}</div>
          </li>
        )
      })}
    </ol>
  )
}

type Side = {
  label: string
  ours: boolean
  starters: [number, string][]
  bench: [number, string][]
  subs: { min: number; in: string; out: string }[]
  scorers: string[]
}

// Titulares y suplentes de un equipo; los nuestros con foto y enlace a su ficha
function TeamLineup({ side, base }: { side: Side; base: string }) {
  const team = useTeam()
  const name = useNames(team.players)
  const row = ([n, raw]: [number, string], bench: boolean) => {
    const { name: label, player } = side.ours ? name(raw) : { name: splitFfcm(raw).short, player: undefined }
    const out = side.subs.find((s) => s.out === raw)
    const inn = side.subs.find((s) => s.in === raw)
    const goals = side.scorers.filter((s) => s === raw).length
    const content = (
      <>
        <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-club-800">
          {player ? <PlayerImage player={player} className="size-full" /> : <span className="font-display text-sm font-bold">{n}</span>}
        </span>
        {player && <span className="w-6 text-right font-display text-sm font-bold text-white/40">{n}</span>}
        <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${bench && !inn ? 'text-white/45' : ''}`}>{label}</span>
        {Array.from({ length: goals }, (_, k) => <BallIcon key={k} className="size-4" />)}
        {out && <span className="font-display text-xs font-bold text-red-400">▼ {out.min}'</span>}
        {inn && <span className="font-display text-xs font-bold text-emerald-400">▲ {inn.min}'</span>}
      </>
    )
    return (
      <li key={raw}>
        {player ? (
          <Link to={`${base}/jugador/${player.id}`} className="flex items-center gap-2 rounded-sm px-1.5 py-1.5 hover:bg-white/5">{content}</Link>
        ) : (
          <div className="flex items-center gap-2 px-1.5 py-1.5">{content}</div>
        )}
      </li>
    )
  }
  return (
    <div className="space-y-4">
      <div>
        <h3 className="label-caps mb-2">Titulares</h3>
        <ul className="panel divide-y divide-white/5 p-1">{side.starters.map((p) => row(p, false))}</ul>
      </div>
      {side.bench.length > 0 && (
        <div>
          <h3 className="label-caps mb-2">Suplentes</h3>
          <ul className="panel divide-y divide-white/5 p-1">{side.bench.map((p) => row(p, true))}</ul>
        </div>
      )}
    </div>
  )
}

// Los dos equipos: lado a lado en escritorio y con pestañas en el móvil (local primero)
function Lineups({ m, base }: { m: Match; base: string }) {
  const l = m.lineup!
  const us: Side = { label: club.shortName, ours: true, starters: l.starters, bench: l.bench, subs: l.subs, scorers: l.goals.flatMap((g) => (g.player ? [g.player] : [])) }
  const them: Side | null = l.rival
    ? { label: m.opponent, ours: false, ...l.rival, scorers: (l.rivalGoals ?? []).map((g) => g.player) }
    : null
  const sides = them ? (m.home ? [us, them] : [them, us]) : [us]
  const [active, setActive] = useState(sides.indexOf(us))

  return (
    <>
      {sides.length > 1 && (
        <div className="mb-4 grid grid-cols-2 gap-2 md:hidden">
          {sides.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setActive(i)}
              className={`-skew-x-12 border py-2 font-display text-sm font-extrabold uppercase italic ${
                active === i ? 'border-club-500 bg-club-500' : 'border-white/15 text-white/55'
              }`}
            >
              <span className="flex skew-x-12 items-center justify-center gap-2 px-2">
                <Crest club={s.ours} team={s.label} className="size-5 shrink-0" />
                <span className="truncate">{s.label}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      <div className={`grid gap-6 ${sides.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {sides.map((s, i) => (
          <div key={s.label} className={i === active ? '' : 'hidden md:block'}>
            <p className="mb-3 hidden items-center gap-2 font-display text-lg font-extrabold uppercase italic md:flex">
              <Crest club={s.ours} team={s.label} className="size-7" />
              {s.label}
            </p>
            <TeamLineup side={s} base={base} />
          </div>
        ))}
      </div>
    </>
  )
}

export function MatchPage() {
  const { id } = useParams()
  const team = useTeam()
  const { live } = useTeams()
  const name = useNames(team.players)
  const m = team.matches.find((x) => String(x.id) === id)

  // Los ids son los de Supabase: con la copia local aún cargada, esperar en vez de dar "no encontrado"
  if (!m && !live) return <p className="py-20 text-center text-white/50">Cargando…</p>
  if (!m) {
    return (
      <div className="py-20 text-center">
        <p className="text-white/60">Partido no encontrado.</p>
        <Link to={`${team.base}/partidos`} className="mt-4 inline-block font-semibold underline">Volver a partidos</Link>
      </div>
    )
  }

  const events = m.lineup && m.score ? buildEvents(m, name) : []
  const missingRival = !!m.score && m.score.them > 0 && !m.lineup?.rivalGoals?.length

  return (
    <article className="space-y-8">
      <Link to={`${team.base}/partidos`} className="font-display text-sm font-bold uppercase tracking-wider text-white/60 hover:text-white">← Partidos</Link>
      <Header m={m} />
      <MvpCard matchId={m.id} />

      {!m.score && <p className="panel p-6 text-center text-white/60">Aún no se ha jugado. Aquí aparecerán los goles y la alineación cuando esté el acta.</p>}
      {m.score && !m.lineup && <p className="panel p-6 text-center text-white/60">Todavía no hay acta de este partido.</p>}

      {events.length > 0 && (
        <section>
          <h2 className="section-title mb-4">Cronología</h2>
          <div className="panel p-4 md:p-6">
            <Timeline m={m} events={events} base={team.base} running={!missingRival} />
            {missingRival && <p className="mt-4 text-center text-xs text-white/40">Los goles del rival no tienen detalle en el acta guardada.</p>}
          </div>
        </section>
      )}

      {m.lineup && m.score && (
        <section>
          <h2 className="section-title mb-4">Alineaciones</h2>
          <Lineups m={m} base={team.base} />
        </section>
      )}
    </article>
  )
}
