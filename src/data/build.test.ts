import { describe, expect, it } from 'vitest'
import { buildTeam } from './build'
import { primerSeed } from './primer/seed'

// Minutos y goles calculados con las actas, comparados con el Excel de estadísticas del club
const club: Record<string, { minutes: number; goals: number; appearances: number }> = {
  'jorge-zarco-martinez': { appearances: 4, minutes: 345, goals: 1 },
  'ivan-merino-fernandez': { appearances: 4, minutes: 301, goals: 0 },
  'diego-delgado-ayuso-morales': { appearances: 4, minutes: 181, goals: 0 },
  'alejandro-herreros-rodriguez': { appearances: 4, minutes: 335, goals: 3 },
  'alvaro-fernandez-munoz': { appearances: 4, minutes: 141, goals: 0 },
  'reyes-pulpon-buendia': { appearances: 4, minutes: 158, goals: 2 },
  // El Excel dice 4 partidos, pero en la J1 se quedó en el banquillo: las actas dan 3 (y sus 75' cuadran)
  'guillermo-delgado-fernandez-canadas': { appearances: 3, minutes: 75, goals: 0 },
  'jaime-sanchez-alberca': { appearances: 2, minutes: 30, goals: 2 },
  'ismael-bounab-charqi': { appearances: 3, minutes: 147, goals: 0 },
  'daniel-felguera-perea': { appearances: 2, minutes: 139, goals: 1 },
}

describe('estadísticas a partir de las actas', () => {
  const team = buildTeam(primerSeed)

  it.each(Object.entries(club))('%s cuadra con el Excel del club', (id, expected) => {
    const p = team.players.find((x) => x.id === id)
    expect(p).toMatchObject(expected)
  })

  it('cuenta las porterías a 0 del portero titular', () => {
    expect(team.players.find((x) => x.id === 'sergio-salido-molina')?.cleanSheets).toBe(3)
  })

  it('los goles de los jugadores más el de propia puerta suman los del equipo', () => {
    const ours = team.players.reduce((a, p) => a + p.goals, 0)
    const total = team.matches.reduce((a, m) => a + (m.score?.us ?? 0), 0)
    expect(ours + 1).toBe(total)
  })
})
