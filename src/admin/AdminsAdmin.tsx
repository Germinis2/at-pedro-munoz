import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Field, Input, Notice } from './ui'

export function AdminsAdmin({ me }: { me: string }) {
  const [admins, setAdmins] = useState<{ email: string; created_at: string }[]>([])
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from('admins').select('email, created_at').order('created_at')
    setAdmins(data ?? [])
  }, [])
  useEffect(() => {
    load()
  }, [load])

  const add = async () => {
    const mail = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(mail)) return setMsg({ kind: 'error', text: 'Escribe un email válido' })
    const { error } = await supabase.from('admins').insert({ email: mail })
    if (error) return setMsg({ kind: 'error', text: error.code === '23505' ? 'Ese email ya es administrador' : error.message })
    setEmail('')
    setMsg({
      kind: 'ok',
      text: `Listo. Dile a ${mail} que entre en ${window.location.origin}/admin, pulse «Crear cuenta (con invitación)» y confirme el correo que le llegará.`,
    })
    load()
  }

  const remove = async (mail: string) => {
    if (!confirm(`¿Quitar los permisos de administrador a ${mail}?`)) return
    const { error } = await supabase.from('admins').delete().eq('email', mail)
    if (error) return setMsg({ kind: 'error', text: error.message })
    setMsg(null)
    load()
  }

  return (
    <div className="space-y-4">
      <Notice>
        Solo los emails de esta lista pueden crearse una cuenta en el panel. Cualquier administrador puede añadir o quitar a otros, pero nadie
        puede quitarse a sí mismo.
      </Notice>
      <div className="panel flex flex-wrap items-end gap-2 p-4">
        <Field label="Añadir administrador" className="min-w-60 flex-1">
          <Input type="email" value={email} placeholder="nombre@correo.com" onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Button onClick={add} disabled={!email}>Añadir</Button>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <ul className="space-y-2">
        {admins.map((a) => (
          <li key={a.email} className="panel flex items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{a.email}</span>
            {a.email === me.toLowerCase() ? (
              <span className="text-xs text-white/50">Tú</span>
            ) : (
              <Button variant="ghost" onClick={() => remove(a.email)}>Quitar</Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
