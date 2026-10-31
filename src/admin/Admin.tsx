import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crest } from '../components/Crest'
import { supabase } from '../lib/supabase'
import { AdminsAdmin } from './AdminsAdmin'
import { Login, NewPassword } from './Auth'
import { MatchesAdmin } from './MatchesAdmin'
import { MvpAdmin } from './MvpAdmin'
import { PlayersAdmin } from './PlayersAdmin'
import { SponsorsAdmin } from './SponsorsAdmin'
import { StandingsAdmin } from './StandingsAdmin'
import { Button, Notice } from './ui'

type TeamId = 'primer' | 'juvenil'
const tabs = {
  partidos: 'Partidos',
  jugadores: 'Jugadores',
  clasificacion: 'Clasificación',
  mvp: 'MVP',
  patrocinadores: 'Patrocinadores',
  admins: 'Administradores',
} as const
type Tab = keyof typeof tabs
// Pestañas que dependen del equipo (las demás son del club)
const perTeam: Tab[] = ['partidos', 'jugadores', 'clasificacion', 'mvp']

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [recovering, setRecovering] = useState(false)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [team, setTeam] = useState<TeamId>('primer')
  const [tab, setTab] = useState<Tab>('partidos')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return setIsAdmin(null)
    supabase.rpc('is_admin').then(({ data }) => setIsAdmin(!!data))
  }, [session])

  if (session === undefined) return null
  if (!session) return <div className="px-4"><Login /></div>
  if (recovering) return <div className="px-4"><NewPassword onDone={() => setRecovering(false)} /></div>

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
          <div className={`mt-6 flex flex-wrap gap-2 ${perTeam.includes(tab) ? '' : 'invisible'}`}>
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
            {tab === 'patrocinadores' && <SponsorsAdmin />}
            {tab === 'admins' && <AdminsAdmin me={session.user.email ?? ''} />}
          </div>
        </>
      ) : null}
    </div>
  )
}
