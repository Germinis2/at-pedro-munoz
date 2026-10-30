import { matches } from './matches'

export type Position = 'POR' | 'DEF' | 'MED' | 'DEL'

export const positionLabels: Record<Position, { one: string; many: string }> = {
  POR: { one: 'Portero', many: 'Porteros' },
  DEF: { one: 'Defensa', many: 'Defensas' },
  MED: { one: 'Centrocampista', many: 'Centrocampistas' },
  DEL: { one: 'Delantero', many: 'Delanteros' },
}

export interface Player {
  id: string
  ffcm: string
  firstName: string
  lastName: string
  fullName: string
  number: number | null
  position: Position
  appearances: number
  starts: number
  minutes: number
  goals: number
  assists: number
  cleanSheets: number
}

// Ficha oficial FFCM + porteros que aparecen en las actas. Formato: "APELLIDOS, NOMBRE"
const squad: Record<string, Position> = {
  'SALIDO MOLINA, SERGIO': 'POR',
  'GONZALEZ FERNANDEZ, ISMAEL': 'POR',
  'ROSU BASCUÑANA, ALEXIS': 'POR',
  // PROVISIONAL: posiciones de campo de relleno hasta tener las reales
  'ZARCO MARTINEZ, JORGE': 'DEF',
  'MERINO FERNANDEZ, IVAN': 'DEF',
  'HEREDIA MORALES, ISMAEL': 'DEF',
  'ESCUDERO RIVAS, SAMUEL': 'DEF',
  'ESCUDERO RIVAS, ISAAC': 'DEF',
  'MONEDERO ALBERCA, CARLOS': 'DEF',
  'RAMOS LOPEZ, JOSE LUIS': 'DEF',
  'RODRIGUEZ GONZALEZ, RAUL': 'DEF',
  'DELGADO AYUSO MORALES, DIEGO': 'MED',
  'VILLEGAS PULPON, VICTOR': 'MED',
  'FELGUERA PEREA, DANIEL': 'MED',
  'PLATAS MUÑOZ, JESUS': 'MED',
  'FERNANDEZ MUÑOZ, ALVARO': 'MED',
  'DELGADO FERNANDEZ CAÑADAS, GUILLERMO': 'MED',
  'MUÑOZ PLIEGO, PABLO': 'MED',
  'RAMOS LOPEZ, JAVIER': 'MED',
  'YUSTE MUÑOZ, ADRIAN': 'MED',
  'PORRERO MOTA, HUGO': 'MED',
  'HERREROS RODRIGUEZ, ALEJANDRO': 'DEL',
  'PULPON BUENDIA, REYES': 'DEL',
  'SANCHEZ ALBERCA, JAIME': 'DEL',
  'MOURA FERREIRA, JACKSON': 'DEL',
  'CASERO VILLALGORDO, JAVIER': 'DEL',
  'BOUNAB CHARQI, ISMAEL': 'DEL',
}

// Las actas de la FFCM no recogen asistencias: se apuntan a mano
const assists: Record<string, number> = {}
export const assistsTracked = Object.keys(assists).length > 0

const capitalize = (s: string) => s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase())

const slug = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const FULL = 90

function statsFor(raw: string) {
  let number: number | null = null
  let appearances = 0, starts = 0, minutes = 0, goals = 0, cleanSheets = 0
  for (const m of [...matches].sort((a, b) => a.date.localeCompare(b.date))) {
    const l = m.lineup
    if (!l || !m.score) continue
    const listed = [...l.starters, ...l.bench].find(([, n]) => n === raw)
    if (listed) number = listed[0]
    const started = l.starters.some(([, n]) => n === raw)
    const subIn = l.subs.find((s) => s.in === raw)
    const subOut = l.subs.find((s) => s.out === raw)
    if (!started && !subIn) continue
    appearances++
    if (started) starts++
    const from = started ? 0 : subIn!.min
    const to = subOut ? subOut.min : FULL
    minutes += Math.max(0, to - from)
    goals += l.goals.filter((g) => g.player === raw).length
    if (squad[raw] === 'POR' && started && !subOut && m.score.them === 0) cleanSheets++
  }
  return { number, appearances, starts, minutes, goals, cleanSheets }
}

export const players: Player[] = Object.entries(squad).map(([raw, position]) => {
  const [surnames, name] = raw.split(',').map((s) => capitalize(s.trim()))
  return {
    id: slug(`${name} ${surnames}`),
    ffcm: raw,
    firstName: name,
    lastName: surnames.split(' ')[0],
    fullName: `${name} ${surnames}`,
    position,
    assists: assists[raw] ?? 0,
    ...statsFor(raw),
  }
})

export const positionOrder: Position[] = ['POR', 'DEF', 'MED', 'DEL']

export const sortedPlayers = [...players].sort(
  (a, b) =>
    positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position) ||
    (a.number ?? 99) - (b.number ?? 99),
)

export const playerByName = (raw: string) => players.find((p) => p.ffcm === raw)
