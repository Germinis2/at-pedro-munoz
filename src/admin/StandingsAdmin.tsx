import { useCallback, useEffect, useState } from 'react'
import { toResult } from '../data/build'
import { isClub, matchName, parseClasificacion } from '../data/clasificacion'
import { club, ffcmPages } from '../data/club'
import { capitalize } from '../data/names'
import {
  compareStandings,
  computeStandings,
  detectPaste,
  lastRound,
  mergeResults,
  parseCalendario,
  parseCruzada,
  playedResults,
  type GroupResult,
} from '../data/resultados'
import { useTeams } from '../data/teams'
import type { GroupResultRow, Result, StandingRow } from '../data/types'
import { supabase } from '../lib/supabase'
import { Button, Field, Input, Notice, inputCls, num } from './ui'

const cols = ['pts', 'pj', 'g', 'e', 'p', 'gf', 'gc'] as const

type Msg = { kind: 'error' | 'ok' | 'info'; text: string }

export function StandingsAdmin({ team }: { team: 'primer' | 'juvenil' }) {
  const { teams, reload } = useTeams()
  const [rows, setRows] = useState<StandingRow[]>([])
  const [round, setRound] = useState(0)
  const [results, setResults] = useState<GroupResult[]>([])
  const [resultsDirty, setResultsDirty] = useState(false)
  const [shown, setShown] = useState(1) // jornada abierta en «Resultados por jornada»
  const [msg, setMsg] = useState<Msg | null>(null)
  const [pasted, setPasted] = useState('')
  const [loading, setLoading] = useState(true) // los nombres guardados hacen falta para leer lo pegado
  const pages = ffcmPages(team)

  const load = useCallback(async () => {
    setLoading(true)
    const [s, t, g] = await Promise.all([
      supabase.from('standings').select('*').eq('team_id', team).order('rank'),
      supabase.from('teams').select('standings_round').eq('id', team).single(),
      supabase.from('group_results').select('*').eq('team_id', team),
    ])
    const res = ((g.data as GroupResultRow[]) ?? []).map(toResult).sort((a, b) => a.round - b.round || a.home.localeCompare(b.home))
    setRows((s.data as StandingRow[]) ?? [])
    setRound(t.data?.standings_round ?? 0)
    setResults(res)
    setResultsDirty(false)
    setLoading(false)
    setShown(Math.max(res[0]?.round ?? 1, lastRound(res)))
  }, [team])
  useEffect(() => {
    load()
  }, [load])

  const set = (i: number, patch: Partial<StandingRow>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const move = (i: number, d: number) =>
    setRows((r) => {
      const j = i + d
      if (j < 0 || j >= r.length) return r
      const copy = [...r]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })

  // Nombres: los que ya usa la web (escudos y guardado), no los de la FFCM, que llevan patrocinadores
  const oursName = rows.find((x) => x.ours)?.team ?? club.name
  const isOurs = (t: string) => t === oursName || isClub(t)
  const namer = () => {
    const candidates = [...rows.map((r) => r.team), ...results.flatMap((r) => [r.home, r.away]), ...teams[team].matches.map((m) => m.opponent), club.name]
    const unknown = new Set<string>()
    const name = (ffcm: string) => {
      if (isClub(ffcm)) return oursName
      const n = matchName(ffcm, candidates)
      if (n) return n
      unknown.add(capitalize(ffcm))
      return capitalize(ffcm)
    }
    return { name, unknown }
  }

  const toRows = (computed: ReturnType<typeof computeStandings>): StandingRow[] =>
    computed.map((s, i) => ({ ...s, team_id: team, rank: i + 1, ours: !!s.ours }))

  // Nuestros marcadores ya están en «Partidos» (acta): se avisa si la FFCM dice otra cosa
  const checkOurs = (res: GroupResult[]) =>
    teams[team].matches.flatMap((m) => {
      if (!m.score) return []
      const r = res.find((x) => (m.home ? isOurs(x.home) && x.away === m.opponent : isOurs(x.away) && x.home === m.opponent))
      if (!r || r.hg === null) return []
      const [us, them] = m.home ? [r.hg, r.ag] : [r.ag, r.hg]
      return us === m.score.us && them === m.score.them ? [] : [`Jornada ${m.round} contra ${m.opponent}: en «Partidos» pone ${m.score.us}-${m.score.them} y en la FFCM ${us}-${them}.`]
    })

  const applyResults = (res: GroupResult[], notes: string[]) => {
    setResults(res)
    setResultsDirty(true)
    if (!playedResults(res).length) return [...notes, 'Ahora pega la tabla cruzada para tener los resultados.']
    const computed = computeStandings(res, isOurs)
    setRows(toRows(computed))
    setRound(lastRound(res))
    return [...notes, ...checkOurs(res), `Clasificación calculada tras la jornada ${lastRound(res)}. Revisa y pulsa «Guardar».`]
  }

  const readPaste = () => {
    try {
      const kind = detectPaste(pasted)
      const { name, unknown } = namer()
      const notes: string[] = []
      if (kind === 'clasificacion') {
        const c = parseClasificacion(pasted)
        const next = c.rows.map((r, i): StandingRow => {
          const ours = isClub(r.name)
          const team_ = name(r.name)
          const prev = rows.find((x) => x.team === team_)
          return {
            team_id: team, rank: i + 1, team: team_, ours, pts: r.pts, pj: r.pj, g: r.g, e: r.e, p: r.p,
            // Sin la tabla detallada no hay goles: se dejan los de antes
            gf: r.gf ?? prev?.gf ?? 0, gc: r.gc ?? prev?.gc ?? 0, form: r.form,
          }
        })
        // Dos equipos de la FFCM con el mismo nombre de la web se pisarían al guardar
        const dup = next.map((r) => r.team).filter((t, i, all) => all.indexOf(t) !== i)
        if (dup.length) throw new Error(`Dos equipos de la FFCM encajan con el mismo nombre (${[...new Set(dup)].join(', ')}). Corrígelo a mano.`)
        setRows(next)
        setRound(c.round)
        notes.push(`Leída la clasificación oficial de la jornada ${c.round}: ${next.length} equipos.`, ...c.warnings)
        // Comprobación con los resultados: así se ve si falta alguno o se metió mal
        if (results.some((r) => r.hg !== null)) {
          const diffs = compareStandings(next, computeStandings(results, isOurs))
          notes.push(diffs.length ? `No cuadra con los resultados guardados: ${diffs.join('; ')}.` : 'Coincide con la calculada con los resultados.')
        }
        notes.push('Revisa la lista y pulsa «Guardar».')
        if (unknown.size) notes.push(`Equipos nuevos, revisa el nombre: ${[...unknown].join(', ')}.`)
        setMsg({ kind: c.detailed && !unknown.size ? 'info' : 'error', text: notes.join(' ') })
      } else {
        const paste = kind === 'calendario' ? { fixtures: parseCalendario(pasted) } : { cells: parseCruzada(pasted).cells }
        const { results: res, missingRound } = mergeResults(results, paste, name)
        notes.push(
          kind === 'calendario'
            ? `Leído el calendario: ${res.length} partidos en ${new Set(res.map((r) => r.round)).size} jornadas.`
            : `Leída la tabla cruzada: ${res.filter((r) => r.hg !== null).length} partidos jugados.`,
        )
        // Sin la jornada de cada partido no se puede calcular la forma ni mostrar las jornadas: no se toca nada
        if (missingRound.length) {
          throw new Error(
            `No se sabe en qué jornada se jugaron ${missingRound.length} partidos. Pega primero el calendario de la FFCM (enlace de arriba) y luego otra vez la tabla cruzada. Solo hace falta una vez por temporada.`,
          )
        }
        if (unknown.size) notes.push(`Equipos nuevos, revisa el nombre: ${[...unknown].join(', ')}.`)
        const text = applyResults(res, notes)
        setShown(Math.max(1, lastRound(res)))
        setMsg({ kind: unknown.size ? 'error' : 'info', text: text.join(' ') })
      }
      setPasted('')
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'No se pudo leer el texto' })
    }
  }

  const setScore = (r: GroupResult, side: 'hg' | 'ag', v: string) => {
    setResults(results.map((x) => (x === r ? { ...x, [side]: num(v) } : x)))
    setResultsDirty(true)
  }

  const recompute = () => {
    const half = results.filter((r) => (r.hg === null) !== (r.ag === null))
    if (half.length) return setMsg({ kind: 'error', text: `Falta un marcador en: ${half.map((r) => `${r.home} - ${r.away}`).join(', ')}.` })
    setMsg({ kind: 'info', text: applyResults(results, []).join(' ') })
  }

  const save = async () => {
    const half = results.filter((r) => (r.hg === null) !== (r.ag === null))
    if (half.length) return setMsg({ kind: 'error', text: `Falta un marcador en: ${half.map((r) => `${r.home} - ${r.away}`).join(', ')}.` })
    const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }))
    const up = await supabase.from('standings').upsert(ranked)
    const keep = ranked.map((r) => r.team)
    const old = (await supabase.from('standings').select('team').eq('team_id', team)).data ?? []
    const gone = old.map((o) => o.team).filter((t) => !keep.includes(t))
    const del = gone.length ? await supabase.from('standings').delete().eq('team_id', team).in('team', gone) : { error: null }
    const t = await supabase.from('teams').update({ standings_round: round }).eq('id', team)
    let error = up.error ?? del.error ?? t.error
    if (!error && resultsDirty) error = await saveResults()
    setMsg(error ? { kind: 'error', text: error.message } : { kind: 'ok', text: resultsDirty ? 'Resultados y clasificación guardados' : 'Clasificación guardada' })
    if (!error) {
      setResultsDirty(false)
      reload()
    }
  }

  const saveResults = async () => {
    const data: GroupResultRow[] = results.map((r) => ({ team_id: team, round: r.round, date: r.date, home: r.home, away: r.away, home_goals: r.hg, away_goals: r.ag }))
    const up = await supabase.from('group_results').upsert(data)
    if (up.error) return up.error
    // Partidos que ya no están (otro calendario): se borran
    const old = ((await supabase.from('group_results').select('home, away').eq('team_id', team)).data ?? []) as { home: string; away: string }[]
    for (const o of old.filter((o) => !results.some((r) => r.home === o.home && r.away === o.away))) {
      const d = await supabase.from('group_results').delete().eq('team_id', team).eq('home', o.home).eq('away', o.away)
      if (d.error) return d.error
    }
    return null
  }

  const rounds = [...new Set(results.map((r) => r.round))]
  const ofRound = results.filter((r) => r.round === shown)
  const link = (href: string, text: string) => (
    <a href={href} target="_blank" rel="noreferrer" className="font-semibold underline">{text} ↗</a>
  )

  return (
    <div className="space-y-4">
      <div className="panel space-y-3 p-4">
        <p className="text-sm font-semibold">Pegar desde la FFCM</p>
        <p className="text-xs text-white/60">Abre la página, pulsa Ctrl+A y Ctrl+C, pégala abajo y pulsa «Leer». La web reconoce sola qué página es.</p>
        {pages && (
          <ul className="space-y-1.5 text-xs text-white/60">
            <li>{link(pages.cruzada, 'Tabla Cruzada')}: <b>cada jornada</b>. Trae todos los resultados del grupo y calcula la clasificación.</li>
            <li>{link(pages.calendario, 'Calendario')}: <b>una vez por temporada</b>, antes de la tabla cruzada. Trae las jornadas y sus fechas.</li>
            <li>
              {link(pages.clasificacion, 'Clasificación')}: para comprobar o si hay sanciones. Pulsa antes «Tabla Detallada» (si no, no vienen los goles).
            </li>
          </ul>
        )}
        <p className="text-xs text-white/40">En el móvil, pide antes la versión de ordenador (Safari: «aA» → «Solicitar sitio web de escritorio»).</p>
        <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={3} placeholder="Pega aquí el texto de la página" className={`${inputCls} font-mono text-xs`} />
        <Button type="button" variant="ghost" disabled={!pasted.trim() || loading} onClick={readPaste}>Leer</Button>
      </div>

      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}

      <div className="panel space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Resultados por jornada</p>
          {rounds.length > 0 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" className="!px-3" disabled={shown <= rounds[0]} onClick={() => setShown((s) => s - 1)} aria-label="Jornada anterior">‹</Button>
              <span className="w-24 text-center text-sm font-semibold">Jornada {shown}</span>
              <Button variant="ghost" className="!px-3" disabled={shown >= rounds[rounds.length - 1]} onClick={() => setShown((s) => s + 1)} aria-label="Jornada siguiente">›</Button>
            </div>
          )}
        </div>
        {rounds.length ? (
          <>
            <p className="text-xs text-white/40">También se pueden meter o corregir a mano. Deja las dos casillas vacías si no se ha jugado.</p>
            <div className="space-y-1.5">
              {ofRound.map((r) => (
                <div key={`${r.home}|${r.away}`} className="grid grid-cols-[1fr_3rem_3rem_1fr] items-center gap-1.5 text-xs">
                  <span className={`truncate text-right ${isOurs(r.home) ? 'font-bold' : ''}`}>{r.home}</span>
                  <Input type="number" min={0} inputMode="numeric" value={r.hg ?? ''} onChange={(e) => setScore(r, 'hg', e.target.value)} className="!px-2 text-center" aria-label={`Goles de ${r.home}`} />
                  <Input type="number" min={0} inputMode="numeric" value={r.ag ?? ''} onChange={(e) => setScore(r, 'ag', e.target.value)} className="!px-2 text-center" aria-label={`Goles de ${r.away}`} />
                  <span className={`truncate ${isOurs(r.away) ? 'font-bold' : ''}`}>{r.away}</span>
                </div>
              ))}
            </div>
            <Button variant="ghost" onClick={recompute}>Calcular clasificación</Button>
          </>
        ) : (
          <p className="text-xs text-white/50">Aún no hay partidos del grupo. Pega el calendario y la tabla cruzada de la FFCM.</p>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Tras la jornada" className="w-32"><Input type="number" value={round} onChange={(e) => setRound(Number(e.target.value))} /></Field>
        <Button onClick={save}>{resultsDirty ? 'Guardar resultados y clasificación' : 'Guardar clasificación'}</Button>
        <Button
          variant="ghost"
          onClick={() => setRows((r) => [...r, { team_id: team, rank: r.length + 1, team: 'Nuevo equipo', ours: false, pts: 0, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, form: [] }])}
        >
          + Equipo
        </Button>
      </div>
      <p className="text-xs text-white/40">Forma: letras G, E o P de más antiguo a más reciente (ej. GEGGP). El orden de la lista es la posición.</p>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className={`panel grid grid-cols-[2rem_1fr_auto] items-center gap-2 p-3 ${r.ours ? 'ring-1 ring-club-500' : ''}`}>
            <span className="text-center text-sm font-bold text-white/50">{i + 1}</span>
            <div className="min-w-0 space-y-2">
              <Input value={r.team} onChange={(e) => set(i, { team: e.target.value })} />
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                {cols.map((c) => (
                  <label key={c} className="text-[10px] uppercase text-white/40">
                    {c}
                    <Input type="number" value={r[c]} onChange={(e) => set(i, { [c]: Number(e.target.value) })} className="!px-2" />
                  </label>
                ))}
                <label className="text-[10px] uppercase text-white/40">
                  forma
                  <Input
                    value={r.form.join('')}
                    onChange={(e) => set(i, { form: e.target.value.toUpperCase().replace(/[^GEP]/g, '').split('') as Result[] })}
                    className="!px-2"
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" className="!px-3" onClick={() => move(i, -1)} aria-label="Subir">↑</Button>
              <Button variant="ghost" className="!px-3" onClick={() => move(i, 1)} aria-label="Bajar">↓</Button>
              <Button variant="ghost" className="!px-3" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} aria-label="Quitar">✕</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
