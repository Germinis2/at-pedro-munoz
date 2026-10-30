import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { buildTeam } from './build'
import { juvenilSeed } from './juvenil/seed'
import { primerSeed } from './primer/seed'
import type { MatchRow, MvpPoll, PlayerRow, Seed, StandingRow, Team, TeamRow } from './types'

type TeamId = Team['id']
type Teams = Record<TeamId, Team>

// Copia local: se muestra al instante y sirve de respaldo si Supabase no responde
const local: Teams = { primer: buildTeam(primerSeed), juvenil: buildTeam(juvenilSeed) }

async function fetchTeams(): Promise<Teams> {
  const [t, p, m, s, v] = await Promise.all([
    supabase.from('teams').select('*'),
    supabase.from('players').select('*'),
    supabase.from('matches').select('*').order('date'),
    supabase.from('standings').select('*'),
    supabase.from('mvp_polls').select('*').order('opened_at', { ascending: false }),
  ])
  const error = t.error ?? p.error ?? m.error ?? s.error ?? v.error
  if (error) throw error
  const polls = v.data as MvpPoll[]
  const build = (team: TeamRow): Team => {
    const seed: Seed = {
      team,
      players: (p.data as PlayerRow[]).filter((x) => x.team_id === team.id),
      matches: (m.data as MatchRow[]).filter((x) => x.team_id === team.id),
      standings: (s.data as StandingRow[]).filter((x) => x.team_id === team.id),
    }
    return buildTeam(seed, polls)
  }
  const rows = t.data as TeamRow[]
  if (rows.length < 2) throw new Error('Base de datos sin cargar')
  return Object.fromEntries(rows.map((team) => [team.id, build(team)])) as Teams
}

const TeamsContext = createContext<{ teams: Teams; live: boolean; reload: () => Promise<void> }>({
  teams: local,
  live: false,
  reload: async () => {},
})
const CurrentTeam = createContext<TeamId>('primer')

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Teams>(local)
  const [live, setLive] = useState(false)
  const reload = useCallback(async () => {
    try {
      setTeams(await fetchTeams())
      setLive(true)
    } catch (e) {
      console.warn('Usando datos locales:', e)
    }
  }, [])
  useEffect(() => {
    reload()
  }, [reload])
  return <TeamsContext.Provider value={{ teams, live, reload }}>{children}</TeamsContext.Provider>
}

export function TeamProvider({ team, children }: { team: TeamId; children: ReactNode }) {
  return <CurrentTeam.Provider value={team}>{children}</CurrentTeam.Provider>
}

export const useTeams = () => useContext(TeamsContext)
export const useTeam = () => useContext(TeamsContext).teams[useContext(CurrentTeam)]
