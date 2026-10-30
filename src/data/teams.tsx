import { createContext, useContext, type ReactNode } from 'react'
import { juvenil } from './juvenil'
import { primer } from './primer'
import type { Team } from './types'

export const teams = { primer, juvenil }

const TeamContext = createContext<Team>(primer)

export function TeamProvider({ team, children }: { team: Team; children: ReactNode }) {
  return <TeamContext.Provider value={team}>{children}</TeamContext.Provider>
}

export const useTeam = () => useContext(TeamContext)
