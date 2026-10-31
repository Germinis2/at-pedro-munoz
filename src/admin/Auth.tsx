import { useState, type FormEvent } from 'react'
import { Crest } from '../components/Crest'
import { supabase } from '../lib/supabase'
import { Button, Field, Input, Notice } from './ui'

type Mode = 'login' | 'signup' | 'forgot'
const back = () => `${window.location.origin}/admin`

// Traduce los errores de Supabase Auth a algo que entienda cualquiera del club
function explain(message: string) {
  if (/Database error saving new user|no autorizado/i.test(message)) return 'Este email no está autorizado. Pide a un administrador que lo añada en «Administradores».'
  if (/already registered/i.test(message)) return 'Ese email ya tiene cuenta: entra con tu contraseña.'
  if (/Invalid login credentials/i.test(message)) return 'Email o contraseña incorrectos.'
  if (/Email not confirmed/i.test(message)) return 'Falta confirmar el email: revisa tu correo (y la carpeta de spam).'
  if (/Password should be/i.test(message)) return 'La contraseña debe tener al menos 8 caracteres.'
  if (/rate limit/i.test(message)) return 'Demasiados intentos seguidos. Espera un rato y vuelve a probar.'
  return message
}

export function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const mail = email.trim().toLowerCase()
    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email: mail, password })
        : mode === 'signup'
          ? await supabase.auth.signUp({ email: mail, password, options: { emailRedirectTo: back() } })
          : await supabase.auth.resetPasswordForEmail(mail, { redirectTo: back() })
    setBusy(false)
    if (error) return setMsg({ kind: 'error', text: explain(error.message) })
    if (mode === 'signup') setMsg({ kind: 'ok', text: 'Cuenta creada. Te hemos enviado un correo para confirmarla: abre el enlace y vuelve aquí.' })
    if (mode === 'forgot') setMsg({ kind: 'ok', text: 'Si el email tiene cuenta, recibirás un enlace para cambiar la contraseña.' })
  }

  const titles = { login: 'Entrar', signup: 'Crear cuenta', forgot: 'Recuperar contraseña' }
  return (
    <form onSubmit={submit} className="panel mx-auto mt-16 max-w-sm space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Crest className="size-12" />
        <div>
          <h1 className="font-display text-2xl uppercase leading-none">Panel del club</h1>
          <p className="text-xs text-white/50">{titles[mode]}</p>
        </div>
      </div>
      <Field label="Email">
        <Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      {mode !== 'forgot' && (
        <Field label="Contraseña">
          <Input
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minLength={mode === 'signup' ? 8 : undefined}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
      )}
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Button type="submit" disabled={busy} className="w-full">{titles[mode]}</Button>
      <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-white/60">
        {mode !== 'login' && <button type="button" onClick={() => setMode('login')} className="hover:text-white">← Ya tengo cuenta</button>}
        {mode === 'login' && (
          <>
            <button type="button" onClick={() => setMode('signup')} className="hover:text-white">Crear cuenta (con invitación)</button>
            <button type="button" onClick={() => setMode('forgot')} className="hover:text-white">He olvidado la contraseña</button>
          </>
        )}
      </div>
    </form>
  )
}

// Tras abrir el enlace de recuperación: elegir contraseña nueva
export function NewPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return setError(explain(error.message))
    onDone()
  }
  return (
    <form onSubmit={submit} className="panel mx-auto mt-16 max-w-sm space-y-4 p-6">
      <h1 className="font-display text-2xl uppercase">Nueva contraseña</h1>
      <Field label="Contraseña (mín. 8 caracteres)">
        <Input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      {error && <Notice kind="error">{error}</Notice>}
      <Button type="submit" className="w-full">Guardar contraseña</Button>
    </form>
  )
}
