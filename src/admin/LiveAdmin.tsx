import { useCallback, useEffect, useMemo, useState } from 'react'
import { liveMinute, toMatch } from '../data/build'
import { club } from '../data/club'
import { splitFfcm } from '../data/names'
import type { Lineup, MatchRow, PlayerRow } from '../data/types'
import { supabase } from '../lib/supabase'
import { useNow } from '../lib/useNow'
import { Button, Input, Notice, Select } from './ui'

type Action = null | 'goal' | 'rivalGoal' | 'subOut' | { subOut: string }

const empty = (): Lineup => ({ starters: [], bench: [], subs: [], goals: [], rivalGoals: [] })
// En el campo: titulares + los que entraron − los que salieron
const onField = (l: Lineup) =>
  [...l.starters.map(([, n]) => n), ...l.subs.map((s) => s.in)].filter((n) => !l.subs.some((s) => s.out === n))
const unusedBench = (l: Lineup) => l.bench.map(([, n]) => n).filter((n) => !l.subs.some((s) => s.in === n))

const big = 'min-h-14 w-full text-base'

export function LiveAdmin({ team }: { team: 'primer' | 'juvenil' }) {
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const [id, setId] = useState<number | null>(null)
  const [action, setAction] = useState<Action>(null)
  const [minute, setMinute] = useState('')
  const [rivalName, setRivalName] = useState('')
  const [error, setError] = useState('')
  const now = useNow(1000)

  const load = useCallback(async () => {
    const [m, p] = await Promise.all([
      supabase.from('matches').select('*').eq('team_id', team).order('date'),
      supabase.from('players').select('*').eq('team_id', team).order('number', { nullsFirst: false }),
    ])
    const ms = (m.data as MatchRow[]) ?? []
    setMatches(ms)
    setPlayers((p.data as PlayerRow[]) ?? [])
    // Por defecto: el que está en directo o el próximo sin resultado
    setId((cur) => cur ?? (ms.find((x) => x.live_status && x.live_status !== 'finished') ?? ms.find((x) => x.score_us == null))?.id ?? null)
  }, [team])
  useEffect(() => {
    load()
  }, [load])

  const row = matches.find((x) => x.id === id)
  const match = useMemo(() => (row ? toMatch(row) : null), [row])
  const lineup = row?.lineup ?? empty()
  const name = (raw: string) => players.find((p) => p.ffcm === raw)?.display_name || splitFfcm(raw).short
  const clock = match ? liveMinute(match, now) : null

  const save = async (patch: Partial<MatchRow>) => {
    if (!row) return
    const { data, error } = await supabase.from('matches').update(patch).eq('id', row.id).select().single()
    if (error) return setError(error.message)
    setError('')
    setMatches((ms) => ms.map((x) => (x.id === row.id ? (data as MatchRow) : x)))
  }

  const open = (a: Action) => {
    setAction(a)
    setMinute(String(clock?.minute ?? ''))
    setRivalName('')
  }
  const min = () => Number(minute) || clock?.minute || 0

  if (!matches.length) return <p className="text-sm text-white/50">Cargando…</p>

  const selectable = matches.filter((x) => x.score_us == null || (x.live_status && x.live_status !== 'finished') || x.id === id)
  const status = row?.live_status ?? null
  const [homeName, awayName] = row?.home ? [club.shortName, row.opponent] : [row?.opponent, club.shortName]
  const [homeGoals, awayGoals] = row?.home ? [row.score_us, row.score_them] : [row?.score_them, row?.score_us]

  // --- Convocatoria (antes de empezar) ---
  const roleOf = (raw: string) => (lineup.starters.some(([, n]) => n === raw) ? 'T' : lineup.bench.some(([, n]) => n === raw) ? 'S' : '')
  const cycle = (p: PlayerRow) => {
    const r = roleOf(p.ffcm)
    const entry: [number, string] = [p.number ?? 0, p.ffcm]
    const starters = lineup.starters.filter(([, n]) => n !== p.ffcm)
    const bench = lineup.bench.filter(([, n]) => n !== p.ffcm)
    if (r === '') starters.push(entry)
    if (r === 'T') bench.push(entry)
    save({ lineup: { ...lineup, starters, bench } })
  }

  // --- Eventos ---
  const addGoal = (raw: string | null) => {
    save({ lineup: { ...lineup, goals: [...lineup.goals, { min: min(), player: raw }] }, score_us: (row!.score_us ?? 0) + 1 })
    setAction(null)
  }
  const addRivalGoal = () => {
    const player = rivalName.trim().toUpperCase()
    save({ lineup: { ...lineup, rivalGoals: [...(lineup.rivalGoals ?? []), { min: min(), player }] }, score_them: (row!.score_them ?? 0) + 1 })
    setAction(null)
  }
  const addSub = (out: string, inn: string) => {
    save({ lineup: { ...lineup, subs: [...lineup.subs, { min: min(), in: inn, out }] } })
    setAction(null)
  }
  const events = [
    ...lineup.goals.map((g, i) => ({ min: g.min, text: `⚽ ${g.player ? name(g.player) : 'Propia puerta (a favor)'}`, del: () => save({ lineup: { ...lineup, goals: lineup.goals.filter((_, j) => j !== i) }, score_us: Math.max(0, (row!.score_us ?? 1) - 1) }) })),
    ...(lineup.rivalGoals ?? []).map((g, i) => ({ min: g.min, text: `⚽ ${row!.opponent}${g.player ? ` (${splitFfcm(g.player).short})` : ''}`, del: () => save({ lineup: { ...lineup, rivalGoals: (lineup.rivalGoals ?? []).filter((_, j) => j !== i) }, score_them: Math.max(0, (row!.score_them ?? 1) - 1) }) })),
    ...lineup.subs.map((s, i) => ({ min: s.min, text: `🔁 ▲ ${name(s.in)} ▼ ${name(s.out)}`, del: () => save({ lineup: { ...lineup, subs: lineup.subs.filter((_, j) => j !== i) } }) })),
  ].sort((a, b) => b.min - a.min)

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Select value={id ?? ''} onChange={(e) => (setId(Number(e.target.value)), setAction(null))} aria-label="Partido">
        {selectable.map((x) => (
          <option key={x.id} value={x.id}>J{x.round} · {x.home ? 'vs' : 'en'} {x.opponent} · {x.date}{x.live_status && x.live_status !== 'finished' ? ' · EN DIRECTO' : ''}</option>
        ))}
      </Select>
      {error && <Notice kind="error">{error}</Notice>}
      {row && (
        <>
          {/* Marcador y reloj */}
          <div className="clip-corner bg-club-600 p-4 text-center">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 font-display font-extrabold uppercase">
              <span className="truncate text-sm">{homeName}</span>
              <span className="text-5xl tabular-nums">{homeGoals ?? 0}-{awayGoals ?? 0}</span>
              <span className="truncate text-sm">{awayName}</span>
            </div>
            <p className="mt-1 font-display text-2xl font-extrabold">
              {!status ? 'Sin empezar' : status === 'finished' ? 'Final' : clock?.label}
            </p>
          </div>

          {/* Fases */}
          {!status && (
            <>
              <Notice>
                1. Marca la convocatoria: toca un jugador una vez para <b>titular</b>, otra para <b>suplente</b> y otra para quitarlo. 2. Pulsa «Empezar
                partido» con el pitido inicial.
              </Notice>
              <p className="font-display text-sm font-bold uppercase tracking-wider text-white/60">
                Titulares {lineup.starters.length} · Suplentes {lineup.bench.length}
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {players.map((p) => {
                  const r = roleOf(p.ffcm)
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => cycle(p)}
                        className={`flex w-full items-center gap-2 rounded-md border px-3 py-3 text-left text-sm font-semibold ${
                          r === 'T' ? 'border-club-500 bg-club-500' : r === 'S' ? 'border-white/30 bg-white/10' : 'border-white/10 text-white/60'
                        }`}
                      >
                        <span className="w-6 font-display text-base font-extrabold">{p.number ?? ''}</span>
                        <span className="min-w-0 flex-1 truncate">{p.display_name || splitFfcm(p.ffcm).short}</span>
                        <span className="font-display text-xs font-extrabold">{r === 'T' ? 'TIT' : r === 'S' ? 'SUP' : ''}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <Button
                className={big}
                onClick={() => save({ live_status: 'first_half', first_half_at: new Date().toISOString(), score_us: 0, score_them: 0, lineup })}
              >
                ▶ Empezar partido
              </Button>
            </>
          )}

          {status && status !== 'finished' && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <Button className={big} onClick={() => open('goal')}>⚽ Gol nuestro</Button>
                <Button className={big} variant="ghost" onClick={() => open('rivalGoal')}>⚽ Gol rival</Button>
                <Button className={big} variant="ghost" onClick={() => open('subOut')}>🔁 Cambio</Button>
              </div>

              {action && (
                <div className="panel space-y-3 p-4">
                  <label className="flex items-center gap-2 text-sm">
                    Minuto <Input type="number" className="!w-20" value={minute} onChange={(e) => setMinute(e.target.value)} />
                    <button onClick={() => setAction(null)} className="ml-auto text-white/60">Cancelar</button>
                  </label>
                  {action === 'goal' && (
                    <div className="grid grid-cols-2 gap-2">
                      {onField(lineup).map((raw) => (
                        <Button key={raw} variant="ghost" className="!rounded-md" onClick={() => addGoal(raw)}>{name(raw)}</Button>
                      ))}
                      <Button variant="ghost" className="col-span-2 !rounded-md" onClick={() => addGoal(null)}>Propia puerta del rival</Button>
                    </div>
                  )}
                  {action === 'rivalGoal' && (
                    <div className="flex gap-2">
                      <Input placeholder="Goleador (opcional)" value={rivalName} onChange={(e) => setRivalName(e.target.value)} />
                      <Button onClick={addRivalGoal}>Añadir</Button>
                    </div>
                  )}
                  {action === 'subOut' && (
                    <>
                      <p className="text-sm font-semibold">¿Quién sale?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {onField(lineup).map((raw) => (
                          <Button key={raw} variant="ghost" className="!rounded-md" onClick={() => setAction({ subOut: raw })}>{name(raw)}</Button>
                        ))}
                      </div>
                    </>
                  )}
                  {typeof action === 'object' && (
                    <>
                      <p className="text-sm font-semibold">Sale {name(action.subOut)}. ¿Quién entra?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {unusedBench(lineup).map((raw) => (
                          <Button key={raw} variant="ghost" className="!rounded-md" onClick={() => addSub(action.subOut, raw)}>{name(raw)}</Button>
                        ))}
                      </div>
                      {unusedBench(lineup).length === 0 && <p className="text-sm text-white/50">No quedan suplentes en la convocatoria.</p>}
                    </>
                  )}
                </div>
              )}

              {status === 'first_half' && <Button className={big} variant="ghost" onClick={() => save({ live_status: 'half_time' })}>⏸ Descanso</Button>}
              {status === 'half_time' && (
                <Button className={big} onClick={() => save({ live_status: 'second_half', second_half_at: new Date().toISOString() })}>▶ Empieza la 2ª parte</Button>
              )}
              {status === 'second_half' && (
                <Button className={big} variant="danger" onClick={() => confirm('¿Terminar el partido?') && save({ live_status: 'finished' })}>■ Final del partido</Button>
              )}
            </>
          )}

          {status === 'finished' && (
            <Notice kind="ok">Partido terminado: ya cuenta en las estadísticas. Cuando salga el acta puedes leerla en «Partidos» para dejar los datos oficiales.</Notice>
          )}

          {events.length > 0 && (
            <ul className="panel divide-y divide-white/5">
              {events.map((e, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="w-9 font-display font-extrabold">{e.min}'</span>
                  <span className="min-w-0 flex-1 truncate">{e.text}</span>
                  {status !== 'finished' && (
                    <button onClick={() => confirm('¿Borrar esta acción?') && e.del()} className="px-2 text-white/50 hover:text-white" aria-label="Borrar">✕</button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {status && (
            <button
              onClick={() =>
                confirm('¿Deshacer el directo? Se borran el marcador, la convocatoria y las acciones de este partido.') &&
                save({ live_status: null, first_half_at: null, second_half_at: null, score_us: null, score_them: null, lineup: null })
              }
              className="w-full py-2 text-xs text-white/40 underline"
            >
              Deshacer el directo de este partido
            </button>
          )}
        </>
      )}
    </div>
  )
}
