export type Position = 'POR' | 'DEF' | 'MED' | 'DEL'

export const positionLabels: Record<Position, { one: string; many: string }> = {
  POR: { one: 'Portero', many: 'Porteros' },
  DEF: { one: 'Defensa', many: 'Defensas' },
  MED: { one: 'Centrocampista', many: 'Centrocampistas' },
  DEL: { one: 'Delantero', many: 'Delanteros' },
}

export interface Player {
  id: string
  firstName: string
  lastName: string
  fullName: string
  number: number
  position: Position
  appearances: number
  minutes: number
  goals: number
  assists: number
  cleanSheets: number
}

// Ficha oficial FFCM (temporada 2026/27). Formato: "APELLIDOS, NOMBRE"
const ffcm = [
  'BOUNAB CHARQI, ISMAEL',
  'CASERO VILLALGORDO, JAVIER',
  'DELGADO AYUSO MORALES, DIEGO',
  'DELGADO FERNANDEZ CAÑADAS, GUILLERMO',
  'ESCUDERO RIVAS, ISAAC',
  'ESCUDERO RIVAS, SAMUEL',
  'FELGUERA PEREA, DANIEL',
  'FERNANDEZ MUÑOZ, ALVARO',
  'HEREDIA MORALES, ISMAEL',
  'HERREROS RODRIGUEZ, ALEJANDRO',
  'MERINO FERNANDEZ, IVAN',
  'MONEDERO ALBERCA, CARLOS',
  'MOURA FERREIRA, JACKSON',
  'MUÑOZ PLIEGO, PABLO',
  'PLATAS MUÑOZ, JESUS',
  'PORRERO MOTA, HUGO',
  'PULPON BUENDIA, REYES',
  'RAMOS LOPEZ, JAVIER',
  'RAMOS LOPEZ, JOSE LUIS',
  'RODRIGUEZ GONZALEZ, RAUL',
  'SALIDO MOLINA, SERGIO',
  'SANCHEZ ALBERCA, JAIME',
  'VILLEGAS PULPON, VICTOR',
  'YUSTE MUÑOZ, ADRIAN',
  'ZARCO MARTINEZ, JORGE',
]

// PROVISIONAL: posiciones y dorsales de relleno hasta tener los reales
const provisionalPositions: Position[] = [
  'POR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'DEL', 'DEL',
  'POR', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'DEL', 'DEL', 'DEF', 'MED',
  'MED', 'DEL', 'DEF', 'MED', 'DEL',
]

const capitalize = (s: string) =>
  s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase())

const slug = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const players: Player[] = ffcm.map((raw, i) => {
  const [surnames, name] = raw.split(',').map((s) => capitalize(s.trim()))
  const firstSurname = surnames.split(' ')[0]
  return {
    id: slug(`${name} ${surnames}`),
    firstName: name,
    lastName: firstSurname,
    fullName: `${name} ${surnames}`,
    number: i + 1,
    position: provisionalPositions[i],
    appearances: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
  }
})

export const positionOrder: Position[] = ['POR', 'DEF', 'MED', 'DEL']

export const sortedPlayers = [...players].sort(
  (a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position) || a.number - b.number,
)
