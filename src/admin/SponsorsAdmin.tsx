import { useCallback, useEffect, useState } from 'react'
import { clearSponsorsCache, fetchSponsors, logoUrl, nameFromFile, removeLogo, uploadLogo, type Sponsor } from '../data/sponsors'
import { supabase } from '../lib/supabase'
import { Button, Input, Notice, Select } from './ui'

export function SponsorsAdmin() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok' | 'info'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setSponsors(await fetchSponsors(true))
    clearSponsorsCache()
  }, [])
  useEffect(() => {
    load()
  }, [load])

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    setMsg({ kind: 'info', text: `Subiendo ${files.length} logo(s)…` })
    const start = Math.max(0, ...sponsors.map((s) => s.sort)) + 1
    const failed: string[] = []
    for (const [i, file] of [...files].entries()) {
      try {
        const logo_path = await uploadLogo(file)
        const { error } = await supabase.from('sponsors').insert({ name: nameFromFile(file), logo_path, sort: start + i })
        if (error) throw error
      } catch {
        failed.push(file.name)
      }
    }
    setBusy(false)
    setMsg(failed.length ? { kind: 'error', text: `No se pudieron subir: ${failed.join(', ')}` } : { kind: 'ok', text: 'Logos subidos. Revisa los nombres y el orden.' })
    load()
  }

  const update = async (id: number, patch: Partial<Sponsor>) => {
    const { error } = await supabase.from('sponsors').update(patch).eq('id', id)
    if (error) return setMsg({ kind: 'error', text: error.message })
    load()
  }

  const remove = async (s: Sponsor) => {
    if (!confirm(`¿Borrar el logo de ${s.name}?`)) return
    const { error } = await supabase.from('sponsors').delete().eq('id', s.id)
    if (error) return setMsg({ kind: 'error', text: error.message })
    await removeLogo(s.logo_path)
    load()
  }

  // Intercambia el orden con el vecino dentro del mismo grupo
  const move = async (s: Sponsor, d: number) => {
    const group = sponsors.filter((x) => x.tier === s.tier)
    const i = group.findIndex((x) => x.id === s.id)
    const other = group[i + d]
    if (!other) return
    const a = { sort: other.sort === s.sort ? s.sort + d : other.sort }
    await supabase.from('sponsors').update(a).eq('id', s.id)
    await supabase.from('sponsors').update({ sort: s.sort }).eq('id', other.id)
    load()
  }

  const groups: [Sponsor['tier'], string][] = [
    ['principal', 'Principales (fichas grandes, arriba)'],
    ['normal', 'Resto de patrocinadores'],
  ]

  return (
    <div className="space-y-5">
      <Notice>
        Los logos salen al final de todas las páginas, como en el cartel de los partidos. Mejor PNG o JPG con fondo blanco o transparente; se
        reducen solos al subirlos. Puedes seleccionar varios a la vez.
      </Notice>
      <label className={`panel flex cursor-pointer flex-col items-center gap-2 border-dashed p-6 text-center hover:bg-white/10 ${busy ? 'pointer-events-none opacity-50' : ''}`}>
        <span className="font-display text-lg font-extrabold uppercase italic">+ Subir logos</span>
        <span className="text-xs text-white/50">Toca para elegir imágenes del móvil o del ordenador</span>
        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
      </label>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}

      {groups.map(([tier, title]) => {
        const list = sponsors.filter((s) => s.tier === tier)
        return (
          <div key={tier}>
            <h3 className="label-caps mb-2">{title} ({list.length})</h3>
            {list.length === 0 && <p className="text-sm text-white/40">Ninguno todavía.</p>}
            <ul className="space-y-2">
              {list.map((s, i) => (
                <li key={s.id} className={`panel flex flex-wrap items-center gap-3 p-3 ${s.active ? '' : 'opacity-50'}`}>
                  <span className="grid h-14 w-24 shrink-0 place-items-center rounded-sm bg-white p-1.5">
                    <img src={logoUrl(s.logo_path)} alt="" className="max-h-full max-w-full object-contain" />
                  </span>
                  <Input
                    defaultValue={s.name}
                    onBlur={(e) => e.target.value.trim() && e.target.value !== s.name && update(s.id, { name: e.target.value.trim() })}
                    className="min-w-36 flex-1"
                    aria-label="Nombre"
                  />
                  <Select value={s.tier} onChange={(e) => update(s.id, { tier: e.target.value as Sponsor['tier'] })} className="!w-32" aria-label="Tipo">
                    <option value="principal">Principal</option>
                    <option value="normal">Normal</option>
                  </Select>
                  <div className="flex gap-1">
                    <Button variant="ghost" className="!px-3" disabled={i === 0} onClick={() => move(s, -1)} aria-label="Subir">↑</Button>
                    <Button variant="ghost" className="!px-3" disabled={i === list.length - 1} onClick={() => move(s, 1)} aria-label="Bajar">↓</Button>
                    <Button variant="ghost" onClick={() => update(s.id, { active: !s.active })}>{s.active ? 'Ocultar' : 'Mostrar'}</Button>
                    <Button variant="danger" className="!px-3" onClick={() => remove(s)} aria-label="Borrar">✕</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
