import { useCallback, useEffect, useState } from 'react'
import { isClub, matchName, parseClasificacion } from '../data/clasificacion'
import { club } from '../data/club'
import { capitalize } from '../data/names'
import { useTeams } from '../data/teams'
import type { Result, StandingRow } from '../data/types'
import { supabase } from '../lib/supabase'
import { Button, Field, Input, Notice, inputCls } from './ui'

const cols = ['pts', 'pj', 'g', 'e', 'p', 'gf', 'gc'] as const

export function StandingsAdmin({ team }: { team: 'primer' | 'juvenil' }) {
  const { teams, reload } = useTeams()
  const [rows, setRows] = useState<StandingRow[]>([])
  const [round, setRound] = useState(0)
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok' | 'info'; text: string } | null>(null)
  const [pasted, setPasted] = useState('')

  const load = useCallback(async () => {
    const [s, t] = await Promise.all([
      supabase.from('standings').select('*').eq('team_id', team).order('rank'),
      supabase.from('teams').select('standings_round').eq('id', team).single(),
    ])
    setRows((s.data as StandingRow[]) ?? [])
    setRound(t.data?.standings_round ?? 0)
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

  // Pegar la página de clasificación de la FFCM: rellena la lista (con los nombres que ya usa la web) y se revisa antes de guardar
  const readFfcm = () => {
    try {
      const c = parseClasificacion(pasted)
      const candidates = [...rows.map((r) => r.team), ...teams[team].matches.map((m) => m.opponent), club.name]
      const unknown: string[] = []
      const next = c.rows.map((r, i): StandingRow => {
        const ours = isClub(r.name)
        const name = (ours ? (rows.find((x) => x.ours)?.team ?? club.name) : matchName(r.name, candidates)) ?? capitalize(r.name)
        if (!ours && !matchName(r.name, candidates)) unknown.push(name)
        const prev = rows.find((x) => x.team === name)
        return {
          team_id: team, rank: i + 1, team: name, ours, pts: r.pts, pj: r.pj, g: r.g, e: r.e, p: r.p,
          // Sin la tabla detallada no hay goles: se dejan los de antes
          gf: r.gf ?? prev?.gf ?? 0, gc: r.gc ?? prev?.gc ?? 0, form: r.form,
        }
      })
      setRows(next)
      setRound(c.round)
      setPasted('')
      const notes = [
        `Leída la clasificación de la jornada ${c.round}: ${next.length} equipos.`,
        ...c.warnings,
        ...(unknown.length ? [`Equipos nuevos, revisa el nombre: ${unknown.join(', ')}.`] : []),
        'Revisa la lista y pulsa «Guardar clasificación».',
      ]
      setMsg({ kind: c.detailed && !unknown.length ? 'info' : 'error', text: notes.join(' ') })
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'No se pudo leer la clasificación' })
    }
  }

  const save = async () => {
    const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }))
    const up = await supabase.from('standings').upsert(ranked)
    const keep = ranked.map((r) => r.team)
    const old = (await supabase.from('standings').select('team').eq('team_id', team)).data ?? []
    const gone = old.map((o) => o.team).filter((t) => !keep.includes(t))
    const del = gone.length ? await supabase.from('standings').delete().eq('team_id', team).in('team', gone) : { error: null }
    const t = await supabase.from('teams').update({ standings_round: round }).eq('id', team)
    const error = up.error ?? del.error ?? t.error
    setMsg(error ? { kind: 'error', text: error.message } : { kind: 'ok', text: 'Clasificación guardada' })
    if (!error) reload()
  }

  return (
    <div className="space-y-4">
      <div className="panel space-y-3 p-4">
        <p className="text-sm font-semibold">Pegar desde la FFCM</p>
        <ol className="list-decimal space-y-1 pl-5 text-xs text-white/60">
          <li>
            Abre la clasificación en la FFCM
            {club.ffcm[team] && (
              <>
                {' '}
                (<a href={club.ffcm[team]} target="_blank" rel="noreferrer" className="underline">abrir ↗</a>)
              </>
            )}
            {' '}y pulsa <b>Tabla Detallada</b> (si no, no vienen los goles).
          </li>
          <li>Ctrl+A y Ctrl+C (en el móvil: seleccionar todo y copiar).</li>
          <li>Pégalo abajo y pulsa «Leer clasificación». Revisa y guarda.</li>
        </ol>
        <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={3} placeholder="Pega aquí el texto de la clasificación" className={`${inputCls} font-mono text-xs`} />
        <Button type="button" variant="ghost" disabled={!pasted.trim()} onClick={readFfcm}>Leer clasificación</Button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Tras la jornada" className="w-32"><Input type="number" value={round} onChange={(e) => setRound(Number(e.target.value))} /></Field>
        <Button onClick={save}>Guardar clasificación</Button>
        <Button
          variant="ghost"
          onClick={() => setRows((r) => [...r, { team_id: team, rank: r.length + 1, team: 'Nuevo equipo', ours: false, pts: 0, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, form: [] }])}
        >
          + Equipo
        </Button>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
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
