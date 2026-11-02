import { useCallback, useEffect, useState } from 'react'
import { positionLabels, positionOrder } from '../data/build'
import { splitFfcm } from '../data/names'
import { photoFor, removePlayerPhoto, uploadPlayerPhoto } from '../data/photos'
import { useTeams } from '../data/teams'
import type { PlayerRow, Position } from '../data/types'
import { supabase } from '../lib/supabase'
import { Button, Field, Input, Notice, Select, num } from './ui'

const manual = [
  ['assists', 'Asist.'],
  ['saves', 'Paradas'],
  ['yellow_cards', 'Amarillas'],
  ['red_cards', 'Rojas'],
] as const

function PlayerRowEditor({ initial, full, onSaved }: { initial: PlayerRow; full: boolean; onSaved: () => void }) {
  const [p, setP] = useState(initial)
  const [error, setError] = useState('')
  const dirty = JSON.stringify(p) !== JSON.stringify(initial)
  const set = <K extends keyof PlayerRow>(k: K, v: PlayerRow[K]) => setP((x) => ({ ...x, [k]: v }))

  const save = async () => {
    const { id, ...row } = p
    const { error } = await supabase.from('players').update(row).eq('id', id)
    if (error) return setError(error.message)
    setError('')
    onSaved()
  }
  // La foto se guarda al momento, sin pasar por «Guardar»
  const [busy, setBusy] = useState(false)
  const setPhoto = async (photo: string | null) => {
    const { error } = await supabase.from('players').update({ photo }).eq('id', p.id)
    if (error) return setError(error.message)
    await removePlayerPhoto(initial.photo)
    setError('')
    onSaved()
  }
  const upload = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      await setPhoto(await uploadPlayerPhoto(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la foto')
    }
    setBusy(false)
  }
  const photo = photoFor(initial)

  const remove = async () => {
    if (!confirm(`¿Quitar a ${p.display_name || splitFfcm(p.ffcm).short} de la plantilla?`)) return
    const { error } = await supabase.from('players').delete().eq('id', p.id)
    if (error) return setError(error.message)
    onSaved()
  }

  return (
    <div className="panel space-y-3 p-4">
      <div className="flex items-center gap-3">
        <div className="h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-white/10">
          {photo && <img src={photo} alt="" className="size-full object-cover object-top" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{splitFfcm(p.ffcm).name} {splitFfcm(p.ffcm).surnames}</p>
          <div className="mt-1 flex flex-wrap gap-3 text-xs font-semibold">
            <label className={`cursor-pointer text-club-300 hover:text-white ${busy ? 'pointer-events-none opacity-50' : ''}`}>
              {busy ? 'Subiendo…' : photo ? 'Cambiar foto' : 'Subir foto'}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
            </label>
            {photo && <button className="text-white/50 hover:text-white" onClick={() => confirm('¿Quitar la foto?') && setPhoto('none')}>Quitar foto</button>}
          </div>
        </div>
        {dirty && <Button onClick={save}>Guardar</Button>}
        <Button variant="ghost" onClick={remove} aria-label="Quitar de la plantilla">✕</Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Field label="Dorsal"><Input type="number" value={p.number ?? ''} onChange={(e) => set('number', num(e.target.value))} /></Field>
        <Field label="Posición">
          <Select value={p.position ?? ''} onChange={(e) => set('position', (e.target.value || null) as Position | null)}>
            <option value="">Sin asignar</option>
            {positionOrder.map((pos) => <option key={pos} value={pos}>{positionLabels[pos].one}</option>)}
          </Select>
        </Field>
        <Field label="Nombre en la web"><Input value={p.display_name ?? ''} placeholder={splitFfcm(p.ffcm).short} onChange={(e) => set('display_name', e.target.value || null)} /></Field>
        <Field label="Apodo"><Input value={p.nickname ?? ''} onChange={(e) => set('nickname', e.target.value || null)} /></Field>
        {full &&
          manual.map(([k, label]) => (
            <Field key={k} label={label}><Input type="number" min={0} value={p[k]} onChange={(e) => set(k, Number(e.target.value) || 0)} /></Field>
          ))}
      </div>
      {error && <Notice kind="error">{error}</Notice>}
    </div>
  )
}

export function PlayersAdmin({ team }: { team: 'primer' | 'juvenil' }) {
  const { reload } = useTeams()
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const [full, setFull] = useState(true)
  const [ffcm, setFfcm] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const [p, t] = await Promise.all([
      supabase.from('players').select('*').eq('team_id', team).order('number', { nullsFirst: false }),
      supabase.from('teams').select('full_stats').eq('id', team).single(),
    ])
    setPlayers((p.data as PlayerRow[]) ?? [])
    setFull(t.data?.full_stats ?? true)
  }, [team])
  useEffect(() => {
    load()
  }, [load])

  const saved = () => {
    load()
    reload()
  }

  const add = async () => {
    const raw = ffcm.trim().toUpperCase()
    if (!/^[^,]+,[^,]+$/.test(raw)) return setError('Escríbelo como en el acta: APELLIDOS, NOMBRE')
    const { error } = await supabase.from('players').insert({ id: splitFfcm(raw).id, team_id: team, ffcm: raw })
    if (error) return setError(error.message)
    setFfcm('')
    setError('')
    saved()
  }

  return (
    <div className="space-y-4">
      <Notice>
        Fotos: vale la imagen horizontal del club (escudo a la izquierda, jugador a la derecha) o una foto vertical; se recorta sola.
      </Notice>
      <Notice>
        Partidos, minutos, goles{full && ' y porterías a 0'} se calculan solos con las actas.
        {full && ' Asistencias, paradas y tarjetas se apuntan aquí.'}
      </Notice>
      <div className="panel flex flex-wrap items-end gap-2 p-4">
        <Field label="Añadir jugador (como en el acta)" className="min-w-60 flex-1">
          <Input value={ffcm} placeholder="APELLIDOS, NOMBRE" onChange={(e) => setFfcm(e.target.value)} />
        </Field>
        <Button onClick={add} disabled={!ffcm}>Añadir</Button>
        {error && <div className="w-full"><Notice kind="error">{error}</Notice></div>}
      </div>
      {players.map((p) => <PlayerRowEditor key={p.id + JSON.stringify(p)} initial={p} full={full} onSaved={saved} />)}
    </div>
  )
}
