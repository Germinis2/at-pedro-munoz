import { useCallback, useEffect, useState } from 'react'
import { useTeams } from '../data/teams'
import type { Result, StandingRow } from '../data/types'
import { supabase } from '../lib/supabase'
import { Button, Field, Input, Notice } from './ui'

const cols = ['pts', 'pj', 'g', 'e', 'p', 'gf', 'gc'] as const

export function StandingsAdmin({ team }: { team: 'primer' | 'juvenil' }) {
  const { reload } = useTeams()
  const [rows, setRows] = useState<StandingRow[]>([])
  const [round, setRound] = useState(0)
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null)

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
