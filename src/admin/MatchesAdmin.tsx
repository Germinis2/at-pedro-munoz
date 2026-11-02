import { useCallback, useEffect, useState } from 'react'
import { parseActa } from '../data/acta'
import { actaUrl } from '../data/build'
import { splitFfcm } from '../data/names'
import { useTeams } from '../data/teams'
import type { Lineup, MatchRow, PlayerRow } from '../data/types'
import { notify } from '../data/push'
import { supabase } from '../lib/supabase'
import { Button, Field, Input, Notice, Select, inputCls, num } from './ui'

const emptyLineup = (): Lineup => ({ starters: [], bench: [], subs: [], goals: [] })
const nameOf = (players: PlayerRow[], raw: string) => {
  const p = players.find((x) => x.ffcm === raw)
  return p?.display_name || splitFfcm(raw).short
}

function PlayerSelect({ value, players, extra = [], onChange, allowOwnGoal = false }: {
  value: string | null
  players: PlayerRow[]
  extra?: string[]
  onChange: (v: string | null) => void
  allowOwnGoal?: boolean
}) {
  // Jugadores del equipo + los que vienen en el acta aunque no estén en la plantilla (p. ej. juveniles)
  const options = [...new Set([...players.map((p) => p.ffcm), ...extra])]
  return (
    <Select value={value ?? '__pp'} onChange={(e) => onChange(e.target.value === '__pp' ? null : e.target.value)}>
      {allowOwnGoal && <option value="__pp">Gol en propia puerta</option>}
      {!allowOwnGoal && !value && <option value="">—</option>}
      {options.map((raw) => (
        <option key={raw} value={raw}>{nameOf(players, raw)}{players.some((p) => p.ffcm === raw) ? '' : ' (no está en la plantilla)'}</option>
      ))}
    </Select>
  )
}

function LineupEditor({ lineup, players, onChange }: { lineup: Lineup; players: PlayerRow[]; onChange: (l: Lineup) => void }) {
  const inActa = [...lineup.starters, ...lineup.bench].map(([, n]) => n)
  const set = <K extends keyof Lineup>(k: K, v: Lineup[K]) => onChange({ ...lineup, [k]: v })
  const firstPlayer = players[0]?.ffcm ?? ''

  const people = (k: 'starters' | 'bench', title: string) => (
    <div>
      <h4 className="label-caps mb-2">{title} ({lineup[k].length})</h4>
      <div className="space-y-2">
        {lineup[k].map(([n, raw], i) => (
          <div key={i} className="flex gap-2">
            <Input type="number" className="!w-16" value={n} onChange={(e) => set(k, lineup[k].map((x, j) => (j === i ? [Number(e.target.value), x[1]] : x)))} />
            <PlayerSelect value={raw} players={players} extra={[raw]} onChange={(v) => set(k, lineup[k].map((x, j) => (j === i ? [x[0], v ?? ''] : x)))} />
            <Button variant="ghost" type="button" onClick={() => set(k, lineup[k].filter((_, j) => j !== i))} aria-label="Quitar">✕</Button>
          </div>
        ))}
        <Button variant="ghost" type="button" onClick={() => set(k, [...lineup[k], [0, firstPlayer]])}>+ Añadir</Button>
      </div>
    </div>
  )

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {people('starters', 'Titulares')}
      {people('bench', 'Suplentes')}
      <div>
        <h4 className="label-caps mb-2">Cambios</h4>
        <div className="space-y-2">
          {lineup.subs.map((s, i) => (
            <div key={i} className="grid grid-cols-[4rem_1fr_auto] gap-2">
              <Input type="number" placeholder="min" value={s.min} onChange={(e) => set('subs', lineup.subs.map((x, j) => (j === i ? { ...x, min: Number(e.target.value) } : x)))} />
              <div className="space-y-1">
                <PlayerSelect value={s.in} players={players} extra={inActa} onChange={(v) => set('subs', lineup.subs.map((x, j) => (j === i ? { ...x, in: v ?? '' } : x)))} />
                <PlayerSelect value={s.out} players={players} extra={inActa} onChange={(v) => set('subs', lineup.subs.map((x, j) => (j === i ? { ...x, out: v ?? '' } : x)))} />
              </div>
              <Button variant="ghost" type="button" onClick={() => set('subs', lineup.subs.filter((_, j) => j !== i))} aria-label="Quitar">✕</Button>
            </div>
          ))}
          <p className="text-[11px] text-white/40">Arriba entra, abajo sale.</p>
          <Button variant="ghost" type="button" onClick={() => set('subs', [...lineup.subs, { min: 46, in: firstPlayer, out: firstPlayer }])}>+ Añadir cambio</Button>
        </div>
      </div>
      <div>
        <h4 className="label-caps mb-2">Goles nuestros</h4>
        <div className="space-y-2">
          {lineup.goals.map((g, i) => (
            <div key={i} className="flex gap-2">
              <Input type="number" placeholder="min" className="!w-16" value={g.min} onChange={(e) => set('goals', lineup.goals.map((x, j) => (j === i ? { ...x, min: Number(e.target.value) } : x)))} />
              <PlayerSelect allowOwnGoal value={g.player} players={players} extra={inActa} onChange={(v) => set('goals', lineup.goals.map((x, j) => (j === i ? { ...x, player: v } : x)))} />
              <Button variant="ghost" type="button" onClick={() => set('goals', lineup.goals.filter((_, j) => j !== i))} aria-label="Quitar">✕</Button>
            </div>
          ))}
          <Button variant="ghost" type="button" onClick={() => set('goals', [...lineup.goals, { min: 0, player: firstPlayer }])}>+ Añadir gol</Button>
        </div>
      </div>
      <div className="md:col-span-2">
        <h4 className="label-caps mb-2">Goles del rival</h4>
        <div className="space-y-2">
          {(lineup.rivalGoals ?? []).map((g, i) => (
            <div key={i} className="flex gap-2">
              <Input type="number" placeholder="min" className="!w-16" value={g.min} onChange={(e) => set('rivalGoals', (lineup.rivalGoals ?? []).map((x, j) => (j === i ? { ...x, min: Number(e.target.value) } : x)))} />
              <Input placeholder="APELLIDOS, NOMBRE" value={g.player} onChange={(e) => set('rivalGoals', (lineup.rivalGoals ?? []).map((x, j) => (j === i ? { ...x, player: e.target.value.toUpperCase() } : x)))} />
              <Button variant="ghost" type="button" onClick={() => set('rivalGoals', (lineup.rivalGoals ?? []).filter((_, j) => j !== i))} aria-label="Quitar">✕</Button>
            </div>
          ))}
          <p className="text-[11px] text-white/40">Solo se usan en la crónica del partido. Al leer el acta se rellenan solos.</p>
          <Button variant="ghost" type="button" onClick={() => set('rivalGoals', [...(lineup.rivalGoals ?? []), { min: 0, player: '' }])}>+ Añadir gol del rival</Button>
        </div>
      </div>
    </div>
  )
}

function MatchEditor({ initial, players, onDone }: { initial: MatchRow; players: PlayerRow[]; onDone: () => void }) {
  const [m, setM] = useState<MatchRow>(initial)
  const [acta, setActa] = useState(initial.acta?.toString() ?? '')
  const [pasted, setPasted] = useState('')
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok' | 'info'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof MatchRow>(k: K, v: MatchRow[K]) => setM((x) => ({ ...x, [k]: v }))

  const readActa = () => {
    try {
      const data = parseActa(pasted)
      setM((x) => ({
        ...x,
        acta: acta ? Number(acta) : x.acta,
        round: x.id ? x.round : (data.round ?? x.round),
        date: data.date ?? x.date,
        time: data.time ?? x.time,
        home: data.home,
        venue: x.venue ?? data.venue,
        score_us: data.score.us,
        score_them: data.score.them,
        lineup: data.lineup,
      }))
      setPasted('')
      setMsg({
        kind: 'info',
        text: `Acta leída: ${data.lineup.starters.length} titulares, ${data.lineup.subs.length} cambios y ${data.lineup.goals.length} goles. Revisa el marcador (la FFCM lo oculta: se calcula con los goleadores y falla si hay goles en propia puerta) y pulsa Guardar.`,
      })
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'No se pudo leer el acta' })
    }
  }

  const save = async () => {
    setBusy(true)
    const { id, ...row } = m
    const q = id ? supabase.from('matches').update(row).eq('id', id) : supabase.from('matches').insert(row)
    const { data, error } = await q.select('id').single()
    if (error) {
      setBusy(false)
      return setMsg({ kind: 'error', text: error.message })
    }
    // Con resultado: avisa del final (solo la primera vez que se guarda con marcador)
    if (row.score_us != null) await notify('result', data.id)
    setBusy(false)
    onDone()
  }

  const remove = async () => {
    if (!m.id || !confirm('¿Borrar este partido? No se puede deshacer.')) return
    const { error } = await supabase.from('matches').delete().eq('id', m.id)
    if (error) return setMsg({ kind: 'error', text: error.message })
    onDone()
  }

  return (
    <div className="panel space-y-6 p-5">
      <div className="space-y-3 rounded-xl border border-white/10 p-4">
        <p className="text-sm font-semibold">Importar desde el acta de la FFCM</p>
        <ol className="list-decimal space-y-1 pl-5 text-xs text-white/60">
          <li>Pon el nº de acta (sale en la dirección del acta: CodActa=…) y pulsa «Abrir acta».</li>
          <li>En la página del acta: Ctrl+A y Ctrl+C (en el móvil: seleccionar todo y copiar).</li>
          <li>Pégalo abajo y pulsa «Leer acta». Revisa y guarda.</li>
        </ol>
        <div className="flex flex-wrap items-end gap-2">
          <Field label="Nº de acta" className="w-36">
            <Input inputMode="numeric" value={acta} onChange={(e) => setActa(e.target.value.replace(/\D/g, ''))} placeholder="598024" />
          </Field>
          <a
            href={acta ? actaUrl(Number(acta)) : undefined}
            target="_blank"
            rel="noreferrer"
            className={`rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ${acta ? 'hover:bg-white/15' : 'pointer-events-none opacity-40'}`}
          >
            Abrir acta ↗
          </a>
        </div>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={3}
          placeholder="Pega aquí el texto del acta"
          className={`${inputCls} font-mono text-xs`}
        />
        <Button type="button" variant="ghost" disabled={!pasted.trim()} onClick={readActa}>Leer acta</Button>
        <p className="text-[11px] text-white/40">También puedes rellenarlo todo a mano en el formulario de abajo.</p>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="Jornada"><Input type="number" value={m.round} onChange={(e) => set('round', Number(e.target.value))} /></Field>
        <Field label="Fecha"><Input type="date" value={m.date} onChange={(e) => set('date', e.target.value)} /></Field>
        <Field label="Hora"><Input type="time" value={m.time?.slice(0, 5) ?? ''} onChange={(e) => set('time', e.target.value || null)} /></Field>
        <Field label="Local / visitante">
          <Select value={m.home ? '1' : '0'} onChange={(e) => set('home', e.target.value === '1')}>
            <option value="1">En casa</option>
            <option value="0">Fuera</option>
          </Select>
        </Field>
        <Field label="Rival" className="col-span-2"><Input value={m.opponent} onChange={(e) => set('opponent', e.target.value)} /></Field>
        <Field label="Campo" className="col-span-2"><Input value={m.venue ?? ''} onChange={(e) => set('venue', e.target.value || null)} /></Field>
        <Field label="Goles nuestros"><Input type="number" min={0} value={m.score_us ?? ''} onChange={(e) => set('score_us', num(e.target.value))} /></Field>
        <Field label="Goles rival"><Input type="number" min={0} value={m.score_them ?? ''} onChange={(e) => set('score_them', num(e.target.value))} /></Field>
      </div>

      <details open={!!m.lineup} className="rounded-xl border border-white/10 p-4">
        <summary className="cursor-pointer text-sm font-semibold">Alineación del acta</summary>
        <div className="mt-4">
          <LineupEditor lineup={m.lineup ?? emptyLineup()} players={players} onChange={(l) => set('lineup', l)} />
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy || !m.opponent || !m.date} onClick={save}>Guardar</Button>
        <Button type="button" variant="ghost" onClick={onDone}>Cancelar</Button>
        {m.id && <Button type="button" variant="danger" className="ml-auto" onClick={remove}>Borrar partido</Button>}
      </div>
    </div>
  )
}

export function MatchesAdmin({ team }: { team: 'primer' | 'juvenil' }) {
  const { reload } = useTeams()
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const [editing, setEditing] = useState<MatchRow | null>(null)

  const load = useCallback(async () => {
    const [m, p] = await Promise.all([
      supabase.from('matches').select('*').eq('team_id', team).order('round'),
      supabase.from('players').select('*').eq('team_id', team).order('number'),
    ])
    setMatches((m.data as MatchRow[]) ?? [])
    setPlayers((p.data as PlayerRow[]) ?? [])
  }, [team])
  useEffect(() => {
    load()
  }, [load])

  if (editing) {
    return (
      <MatchEditor
        initial={editing}
        players={players}
        onDone={() => {
          setEditing(null)
          load()
          reload()
        }}
      />
    )
  }

  const blank = (): MatchRow => ({
    team_id: team, round: (matches.at(-1)?.round ?? 0) + 1, date: new Date().toISOString().slice(0, 10), time: null,
    home: true, opponent: '', venue: null, score_us: null, score_them: null, acta: null, lineup: null,
  })

  return (
    <div className="space-y-3">
      <Button onClick={() => setEditing(blank())}>+ Nuevo partido</Button>
      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m.id}>
            <button onClick={() => setEditing(m)} className="panel flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/10">
              <span className="w-10 text-xs font-bold text-white/50">J{m.round}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{m.home ? 'vs' : 'en'} {m.opponent}</span>
                <span className="text-xs text-white/50">{m.date}{m.time ? ` · ${m.time.slice(0, 5)}` : ''}</span>
              </span>
              <span className="text-sm font-bold tabular-nums">{m.score_us != null ? `${m.score_us}-${m.score_them}` : '—'}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.lineup ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'}`}>
                {m.lineup ? 'Con acta' : 'Sin acta'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
