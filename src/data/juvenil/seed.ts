// Datos de la FFCM (Juvenil Territorial, Grupo 3, temporada 2026/27).
// Los jugadores se escriben tal cual aparecen en el acta: "APELLIDOS, NOMBRE".
import { makeSeed } from '../seed.ts'
import type { Match, Position, Standing } from '../types'

// Ficha oficial FFCM. Posición null = pendiente de que el club la confirme.
const squad: Record<string, Position | null> = {
  'ROSU BASCUÑANA, ALEXIS': 'POR',
  'GONZALEZ FERNANDEZ, ISMAEL': 'POR',
  'PACHECO PULPON, JESUS ALBERTO': 'POR',
  'AJENJO MARTINEZ, JAVIER': null,
  'BOUNAB CHARQI, MOHAMED': null,
  'CEBRIAN VILLALGORDO, YERAY': null,
  'CRUZADO FERNANDEZ, DANIEL': null,
  'ESCUDERO SEVILLA, OMAR': null,
  'HERNANDEZ CALCERRADA, PABLO': null,
  'IZQUIERDO RABADAN, ASIER': null,
  'MARTÍN MANGLANO, HUGO': null,
  'MARTINEZ PINTADO, ALEXIS': null,
  'MARTÍNEZ-SANTOS LÓPEZ, HUGO': null,
  'MAYORAL SUCIU, JUAN': null,
  'MAYORDOMO SANZ, IVAN': null,
  'MONREAL GARCIA, JOSE CARLOS': null,
  'MUÑOZ DÍAZ, DIEGO': null,
  'MUÑOZ RODRIGUEZ, DAVID': null,
  'PEINADO ESCUDERO, DAVID': null,
  'ROSADO DE CARLOS, EDGAR': null,
  'RUIZ DÍAZ, ALONSO': null,
  'SÁNCHEZ GARCÍA, RUBÉN': null,
  'SANCHEZ SEVILLA, LUCAS': null,
  'SERNA RAMIREZ, DANIEL': null,
  'TENAJAS MANZANERO, ADRIAN': null,
}

const matches: Match[] = [
  {
    id: 1, round: 1, date: '2026-09-26', time: '18:00', home: false,
    opponent: 'U.D. Santa Cruz', venue: 'San José - Santa Cruz de Mudela', score: { us: 1, them: 3 }, acta: 604462,
    lineup: {
      starters: [[13, 'ROSU BASCUÑANA, ALEXIS'], [5, 'CEBRIAN VILLALGORDO, YERAY'], [6, 'AJENJO MARTINEZ, JAVIER'], [7, 'HERNANDEZ CALCERRADA, PABLO'], [8, 'MUÑOZ RODRIGUEZ, DAVID'], [10, 'TENAJAS MANZANERO, ADRIAN'], [16, 'ESCUDERO SEVILLA, OMAR'], [18, 'SERNA RAMIREZ, DANIEL'], [20, 'MAYORAL SUCIU, JUAN'], [22, 'MONREAL GARCIA, JOSE CARLOS'], [25, 'MUÑOZ DÍAZ, DIEGO']],
      bench: [[2, 'PEINADO ESCUDERO, DAVID'], [9, 'MAYORDOMO SANZ, IVAN'], [15, 'ROSADO DE CARLOS, EDGAR'], [17, 'MARTÍN MANGLANO, HUGO'], [19, 'MARTINEZ PINTADO, ALEXIS'], [21, 'SANCHEZ SEVILLA, LUCAS']],
      subs: [
        { min: 45, in: 'ROSADO DE CARLOS, EDGAR', out: 'MAYORAL SUCIU, JUAN' },
        { min: 45, in: 'SANCHEZ SEVILLA, LUCAS', out: 'AJENJO MARTINEZ, JAVIER' },
        { min: 45, in: 'MARTINEZ PINTADO, ALEXIS', out: 'SERNA RAMIREZ, DANIEL' },
        { min: 67, in: 'MAYORDOMO SANZ, IVAN', out: 'MUÑOZ DÍAZ, DIEGO' },
        { min: 85, in: 'MARTÍN MANGLANO, HUGO', out: 'HERNANDEZ CALCERRADA, PABLO' },
      ],
      goals: [{ min: 36, player: 'HERNANDEZ CALCERRADA, PABLO' }],
    },
  },
  {
    id: 2, round: 2, date: '2026-10-03', time: '18:00', home: true,
    opponent: 'E.F.B. Atlético Valdepeñas', venue: 'Juande Ramos', score: { us: 5, them: 1 }, acta: 604470,
    lineup: {
      starters: [[1, 'ROSU BASCUÑANA, ALEXIS'], [2, 'PEINADO ESCUDERO, DAVID'], [5, 'CEBRIAN VILLALGORDO, YERAY'], [7, 'HERNANDEZ CALCERRADA, PABLO'], [8, 'MUÑOZ RODRIGUEZ, DAVID'], [10, 'TENAJAS MANZANERO, ADRIAN'], [15, 'ROSADO DE CARLOS, EDGAR'], [16, 'ESCUDERO SEVILLA, OMAR'], [18, 'SERNA RAMIREZ, DANIEL'], [19, 'MARTINEZ PINTADO, ALEXIS'], [21, 'SANCHEZ SEVILLA, LUCAS']],
      bench: [[13, 'PACHECO PULPON, JESUS ALBERTO'], [3, 'RUIZ DÍAZ, ALONSO'], [6, 'AJENJO MARTINEZ, JAVIER'], [17, 'MARTÍN MANGLANO, HUGO'], [20, 'MAYORAL SUCIU, JUAN'], [22, 'MONREAL GARCIA, JOSE CARLOS'], [25, 'MUÑOZ DÍAZ, DIEGO']],
      subs: [
        { min: 23, in: 'MONREAL GARCIA, JOSE CARLOS', out: 'PEINADO ESCUDERO, DAVID' },
        { min: 46, in: 'MUÑOZ DÍAZ, DIEGO', out: 'CEBRIAN VILLALGORDO, YERAY' },
        { min: 46, in: 'AJENJO MARTINEZ, JAVIER', out: 'ROSADO DE CARLOS, EDGAR' },
        { min: 83, in: 'MARTÍN MANGLANO, HUGO', out: 'HERNANDEZ CALCERRADA, PABLO' },
        { min: 83, in: 'RUIZ DÍAZ, ALONSO', out: 'SERNA RAMIREZ, DANIEL' },
      ],
      goals: [
        { min: 41, player: 'CEBRIAN VILLALGORDO, YERAY' },
        { min: 65, player: 'ESCUDERO SEVILLA, OMAR' },
        { min: 70, player: 'MUÑOZ RODRIGUEZ, DAVID' },
        { min: 78, player: 'TENAJAS MANZANERO, ADRIAN' },
        { min: 86, player: 'TENAJAS MANZANERO, ADRIAN' },
      ],
    },
  },
  {
    id: 3, round: 3, date: '2026-10-10', time: '12:00', home: false,
    opponent: 'C.D.B. Herencia', venue: 'Municipal Fdez. de la Puebla - Herencia', score: { us: 1, them: 0 }, acta: 604477,
    lineup: {
      starters: [[1, 'ROSU BASCUÑANA, ALEXIS'], [6, 'AJENJO MARTINEZ, JAVIER'], [7, 'HERNANDEZ CALCERRADA, PABLO'], [8, 'MUÑOZ RODRIGUEZ, DAVID'], [10, 'TENAJAS MANZANERO, ADRIAN'], [16, 'ESCUDERO SEVILLA, OMAR'], [18, 'SERNA RAMIREZ, DANIEL'], [19, 'MARTINEZ PINTADO, ALEXIS'], [21, 'SANCHEZ SEVILLA, LUCAS'], [22, 'MONREAL GARCIA, JOSE CARLOS'], [25, 'MUÑOZ DÍAZ, DIEGO']],
      bench: [[13, 'GONZALEZ FERNANDEZ, ISMAEL'], [4, 'MARTÍNEZ-SANTOS LÓPEZ, HUGO'], [5, 'CEBRIAN VILLALGORDO, YERAY'], [9, 'MAYORDOMO SANZ, IVAN'], [15, 'ROSADO DE CARLOS, EDGAR'], [17, 'MARTÍN MANGLANO, HUGO'], [24, 'BOUNAB CHARQI, MOHAMED']],
      subs: [
        { min: 30, in: 'CEBRIAN VILLALGORDO, YERAY', out: 'MUÑOZ DÍAZ, DIEGO' },
        { min: 60, in: 'MAYORDOMO SANZ, IVAN', out: 'HERNANDEZ CALCERRADA, PABLO' },
        { min: 88, in: 'BOUNAB CHARQI, MOHAMED', out: 'TENAJAS MANZANERO, ADRIAN' },
        { min: 88, in: 'MARTÍNEZ-SANTOS LÓPEZ, HUGO', out: 'SANCHEZ SEVILLA, LUCAS' },
      ],
      goals: [{ min: 38, player: 'ESCUDERO SEVILLA, OMAR' }],
    },
  },
  {
    id: 4, round: 4, date: '2026-10-17', time: '17:00', home: true,
    opponent: 'C.P. Villarrobledo', venue: 'Juande Ramos', score: { us: 1, them: 5 }, acta: 604485,
    lineup: {
      starters: [[1, 'ROSU BASCUÑANA, ALEXIS'], [5, 'CEBRIAN VILLALGORDO, YERAY'], [6, 'AJENJO MARTINEZ, JAVIER'], [7, 'HERNANDEZ CALCERRADA, PABLO'], [8, 'MUÑOZ RODRIGUEZ, DAVID'], [10, 'TENAJAS MANZANERO, ADRIAN'], [16, 'ESCUDERO SEVILLA, OMAR'], [18, 'SERNA RAMIREZ, DANIEL'], [19, 'MARTINEZ PINTADO, ALEXIS'], [21, 'SANCHEZ SEVILLA, LUCAS'], [25, 'MUÑOZ DÍAZ, DIEGO']],
      bench: [[13, 'GONZALEZ FERNANDEZ, ISMAEL'], [4, 'MARTÍNEZ-SANTOS LÓPEZ, HUGO'], [9, 'MAYORDOMO SANZ, IVAN'], [14, 'IZQUIERDO RABADAN, ASIER'], [15, 'ROSADO DE CARLOS, EDGAR'], [20, 'MAYORAL SUCIU, JUAN'], [24, 'BOUNAB CHARQI, MOHAMED']],
      subs: [
        { min: 45, in: 'IZQUIERDO RABADAN, ASIER', out: 'SANCHEZ SEVILLA, LUCAS' },
        { min: 70, in: 'MAYORAL SUCIU, JUAN', out: 'MUÑOZ DÍAZ, DIEGO' },
        { min: 70, in: 'BOUNAB CHARQI, MOHAMED', out: 'MUÑOZ RODRIGUEZ, DAVID' },
        { min: 80, in: 'MAYORDOMO SANZ, IVAN', out: 'ESCUDERO SEVILLA, OMAR' },
        { min: 80, in: 'ROSADO DE CARLOS, EDGAR', out: 'SERNA RAMIREZ, DANIEL' },
      ],
      goals: [{ min: 24, player: 'MUÑOZ DÍAZ, DIEGO' }],
    },
  },
  {
    id: 5, round: 5, date: '2026-10-24', time: '18:30', home: false,
    opponent: 'C.F. La Solana', venue: 'Ciudad Deportiva de La Solana', score: { us: 2, them: 4 }, acta: 604492,
    lineup: {
      starters: [[13, 'ROSU BASCUÑANA, ALEXIS'], [5, 'CEBRIAN VILLALGORDO, YERAY'], [6, 'AJENJO MARTINEZ, JAVIER'], [7, 'HERNANDEZ CALCERRADA, PABLO'], [8, 'MUÑOZ RODRIGUEZ, DAVID'], [9, 'MAYORDOMO SANZ, IVAN'], [14, 'IZQUIERDO RABADAN, ASIER'], [16, 'ESCUDERO SEVILLA, OMAR'], [18, 'SERNA RAMIREZ, DANIEL'], [22, 'MONREAL GARCIA, JOSE CARLOS'], [25, 'MUÑOZ DÍAZ, DIEGO']],
      bench: [[2, 'PEINADO ESCUDERO, DAVID'], [3, 'RUIZ DÍAZ, ALONSO'], [15, 'ROSADO DE CARLOS, EDGAR'], [17, 'MARTÍN MANGLANO, HUGO'], [24, 'BOUNAB CHARQI, MOHAMED'], [99, 'PACHECO PULPON, JESUS ALBERTO']],
      subs: [
        { min: 35, in: 'ROSADO DE CARLOS, EDGAR', out: 'IZQUIERDO RABADAN, ASIER' },
        { min: 62, in: 'MARTÍN MANGLANO, HUGO', out: 'MAYORDOMO SANZ, IVAN' },
        { min: 78, in: 'BOUNAB CHARQI, MOHAMED', out: 'MUÑOZ DÍAZ, DIEGO' },
      ],
      goals: [
        { min: 63, player: 'MARTÍN MANGLANO, HUGO' },
        { min: 80, player: 'BOUNAB CHARQI, MOHAMED' },
      ],
    },
  },
  { id: 6, round: 6, date: '2026-10-30', time: '19:30', home: true, opponent: 'C.D. Atlético Tomelloso "B"', venue: 'Juande Ramos', acta: 604500 },
  { id: 7, round: 7, date: '2026-11-08', time: '12:00', home: false, opponent: 'Sporting de Alcázar C.F. "B"', venue: 'Manuel Delgado Meco - Alcázar de San Juan' },
  { id: 8, round: 8, date: '2026-11-15', home: true, opponent: 'Atlético Cervantino', venue: 'Juande Ramos' },
  // Jornada 9: descansa
  { id: 10, round: 10, date: '2026-11-29', home: true, opponent: 'C.D.U. Criptanense', venue: 'Juande Ramos' },
  { id: 11, round: 11, date: '2026-12-13', home: false, opponent: 'Camuñas F.C.', venue: 'La Unión - Camuñas' },
  { id: 12, round: 12, date: '2026-12-20', home: true, opponent: 'Carretero E.F.B. Valdepeñas', venue: 'Juande Ramos' },
]

// Clasificación FFCM tras la jornada 5
const standings: Standing[] = [
  { team: 'U.D. Santa Cruz', pts: 12, pj: 4, g: 4, e: 0, p: 0, gf: 18, gc: 3, form: ['G', 'G', 'G', 'G'] },
  { team: 'C.D. Atlético Tomelloso "B"', pts: 13, pj: 5, g: 4, e: 1, p: 0, gf: 16, gc: 3, form: ['G', 'E', 'G', 'G', 'G'] },
  { team: 'C.F. La Solana', pts: 13, pj: 5, g: 4, e: 1, p: 0, gf: 15, gc: 9, form: ['G', 'G', 'G', 'E', 'G'] },
  { team: 'Sporting de Alcázar C.F. "B"', pts: 10, pj: 5, g: 3, e: 1, p: 1, gf: 12, gc: 7, form: ['G', 'P', 'G', 'E', 'G'] },
  { team: 'C.D.U. Criptanense', pts: 6, pj: 4, g: 2, e: 0, p: 2, gf: 7, gc: 6, form: ['P', 'G', 'P', 'G'] },
  { team: 'Cristo de la Vega C.F.', pts: 7, pj: 5, g: 2, e: 1, p: 2, gf: 14, gc: 7, form: ['G', 'P', 'G', 'E', 'P'] },
  { team: 'Daimiel Racing C.F.', pts: 7, pj: 5, g: 2, e: 1, p: 2, gf: 9, gc: 11, form: ['G', 'P', 'P', 'E', 'G'] },
  { team: 'C.D.B. Herencia', pts: 7, pj: 5, g: 2, e: 1, p: 2, gf: 8, gc: 10, form: ['G', 'G', 'P', 'E', 'P'] },
  { team: 'C.P. Villarrobledo', pts: 6, pj: 5, g: 2, e: 0, p: 3, gf: 10, gc: 10, form: ['P', 'P', 'P', 'G', 'G'] },
  { team: 'At. Pedro Muñoz C.F.', ours: true, pts: 6, pj: 5, g: 2, e: 0, p: 3, gf: 10, gc: 13, form: ['P', 'G', 'G', 'P', 'P'] },
  { team: 'Carretero E.F.B. Valdepeñas', pts: 4, pj: 4, g: 1, e: 1, p: 2, gf: 6, gc: 9, form: ['P', 'E', 'P', 'G'] },
  { team: 'Camuñas F.C.', pts: 3, pj: 4, g: 1, e: 0, p: 3, gf: 5, gc: 10, form: ['P', 'G', 'P', 'P'] },
  { team: 'Atlético Cervantino', pts: 3, pj: 4, g: 1, e: 0, p: 3, gf: 7, gc: 13, form: ['P', 'G', 'P', 'P'] },
  { team: 'Membrilla C.F.', pts: 3, pj: 5, g: 1, e: 0, p: 4, gf: 11, gc: 16, form: ['P', 'G', 'P', 'P', 'P'] },
  { team: 'E.F.B. Atlético Valdepeñas', pts: 1, pj: 5, g: 0, e: 1, p: 4, gf: 6, gc: 27, form: ['P', 'P', 'P', 'E', 'P'] },
]

export const juvenilSeed = makeSeed({
  team: { id: 'juvenil', label: 'Juvenil', league: 'Juvenil Territorial', grp: 'Grupo 3', full_stats: false, standings_round: 5 },
  squad,
  matches,
  standings,
})
