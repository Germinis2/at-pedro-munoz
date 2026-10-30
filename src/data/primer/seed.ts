import { makeSeed } from '../seed.ts'
import type { Standing } from '../types'
import { matches } from './matches.ts'
import { clubStats, profiles, squad } from './squad.ts'

// Clasificación FFCM tras la jornada 4
const standings: Standing[] = [
  { team: 'C.D. Ciudad Encantada', pts: 12, pj: 4, g: 4, e: 0, p: 0, gf: 15, gc: 6, form: ['G', 'G', 'G', 'G'] },
  { team: 'At. Pedro Muñoz C.F.', ours: true, pts: 10, pj: 4, g: 3, e: 1, p: 0, gf: 12, gc: 2, form: ['G', 'E', 'G', 'G'] },
  { team: 'U.D. Casasimarro', pts: 9, pj: 4, g: 3, e: 0, p: 1, gf: 6, gc: 2, form: ['G', 'P', 'G', 'G'] },
  { team: 'U.D. Puebla de Almenara', pts: 9, pj: 4, g: 3, e: 0, p: 1, gf: 7, gc: 5, form: ['P', 'G', 'G', 'G'] },
  { team: 'Iniestense Balompié', pts: 6, pj: 3, g: 2, e: 0, p: 1, gf: 19, gc: 6, form: ['P', 'G', 'G'] },
  { team: 'Cristo de la Vega C.F.', pts: 7, pj: 4, g: 2, e: 1, p: 1, gf: 11, gc: 2, form: ['E', 'G', 'G', 'P'] },
  { team: 'C.D. Don Pefi Los Llanos', pts: 6, pj: 4, g: 2, e: 0, p: 2, gf: 4, gc: 4, form: ['P', 'G', 'P', 'G'] },
  { team: 'C.D. Casas de Haro', pts: 6, pj: 4, g: 2, e: 0, p: 2, gf: 5, gc: 6, form: ['G', 'G', 'P', 'P'] },
  { team: 'C.D. Manchego Provencio', pts: 4, pj: 4, g: 1, e: 1, p: 2, gf: 3, gc: 8, form: ['E', 'P', 'G', 'P'] },
  { team: 'C.D. Villagarcía', pts: 3, pj: 3, g: 1, e: 0, p: 2, gf: 1, gc: 7, form: ['P', 'P', 'G'] },
  { team: 'C.P. Villarrobledo "B"', pts: 3, pj: 4, g: 1, e: 0, p: 3, gf: 4, gc: 22, form: ['G', 'P', 'P', 'P'] },
  { team: 'C.D. Alto Júcar', pts: 1, pj: 4, g: 0, e: 1, p: 3, gf: 3, gc: 6, form: ['E', 'P', 'P', 'P'] },
  { team: 'C.F. La Santa Cruz', pts: 1, pj: 4, g: 0, e: 1, p: 3, gf: 5, gc: 12, form: ['E', 'P', 'P', 'P'] },
  { team: 'C.D. Triana Tresjuncos', pts: 1, pj: 4, g: 0, e: 1, p: 3, gf: 3, gc: 10, form: ['P', 'E', 'P', 'P'] },
]

export const primerSeed = makeSeed({
  team: { id: 'primer', label: 'Primer equipo', league: 'Segunda Autonómica', grp: 'Grupo 3', full_stats: true, standings_round: 4 },
  squad,
  profiles,
  clubStats,
  matches,
  standings,
})
