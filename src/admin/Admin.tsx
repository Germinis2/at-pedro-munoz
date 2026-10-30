import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { supabase } from '../lib/supabase'
import { MatchesAdmin } from './MatchesAdmin'
import { MvpAdmin } from './MvpAdmin'
import { PlayersAdmin } from './PlayersAdmin'
import { StandingsAdmin } from './StandingsAdmin'
import { Button, Field, Input, Notice } from './ui'

type TeamId = 'primer' | 'juvenil'
const tabs = { partidos: 'Partidos', jugadores: 'Jugadores', clasificacion: 'Clasificación', mvp: 'MVP' } as const
type Tab = keyof typeof tabs

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError('Email o contraseña incorrectos')
  }
  return (
    <form onSubmit={submit} className="panel mx-auto mt-16 max-w-sm space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Crest className="size-12" />
        <h1 className="text-xl font-bold">Panel del club</h1>
      </div>
      <Field label="Email">
        <Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Contraseña">
        <Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      {error && <Notice kind="error">{error}</Notice>}
      <Button type="submit" disabled={busy} className="w-full">Entrar</Button>
    </form>
  )
}

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [team, setTeam] = useState<TeamId>('primer')
  const [tab, setTab] = useState<Tab>('partidos')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return setIsAdmin(null)
    supabase.rpc('is_admin').then(({ data }) => setIsAdmin(!!data))
  }, [session])

  if (session === undefined) return null
  if (!session) return <div className="px-4"><Login /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-8">
      <header className="flex flex-wrap items-center gap-3">
        <Crest className="size-10" />
        <div className="mr-auto">
          <h1 className="text-lg font-bold leading-tight">Panel del club</h1>
          <p className="text-xs text-white/50">{session.user.email}</p>
        </div>
        <Link to="/" className="text-sm font-semibold text-white/70 hover:text-white">Ver web</Link>
        <Button variant="ghost" onClick={() => supabase.auth.signOut()}>Salir</Button>
      </header>

      {isAdmin === false ? (
        <div className="mt-8">
          <Notice kind="error">Esta cuenta no tiene permisos de administrador.</Notice>
        </div>
      ) : isAdmin ? (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {(['primer', 'juvenil'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTeam(t)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${team === t ? 'bg-white text-club-800' : 'bg-white/10 text-white/70'}`}
              >
                {t === 'primer' ? 'Primer equipo' : 'Juvenil'}
              </button>
            ))}
          </div>
          <nav className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-white/10">
            {(Object.keys(tabs) as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === t ? 'border-club-500 text-white' : 'border-transparent text-white/50'}`}
              >
                {tabs[t]}
              </button>
            ))}
          </nav>
          <div className="mt-6" key={team + tab}>
            {tab === 'partidos' && <MatchesAdmin team={team} />}
            {tab === 'jugadores' && <PlayersAdmin team={team} />}
            {tab === 'clasificacion' && <StandingsAdmin team={team} />}
            {tab === 'mvp' && <MvpAdmin team={team} />}
          </div>
        </>
      ) : null}
    </div>
  )
}
