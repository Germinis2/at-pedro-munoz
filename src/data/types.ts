export type Position = 'POR' | 'DEF' | 'MED' | 'DEL'
export type Result = 'G' | 'E' | 'P'

export interface Lineup {
  starters: [number, string][]
  bench: [number, string][]
  subs: { min: number; in: string; out: string }[]
  goals: { min: number; player: string | null }[] // null = gol en propia puerta del rival
}

export interface Match {
  id: number
  round: number
  date: string // YYYY-MM-DD
  time?: string // HH:MM, vacío si aún no está fijada
  home: boolean
  opponent: string
  venue?: string
  score?: { us: number; them: number }
  acta?: number
  lineup?: Lineup
}

export interface Standing {
  team: string
  ours?: boolean
  pts: number
  pj: number
  g: number
  e: number
  p: number
  gf: number
  gc: number
  form: Result[] // de más antiguo a más reciente
}

export interface Player {
  id: string
  ffcm: string
  firstName: string
  lastName: string
  nickname?: string
  fullName: string
  number: number | null
  position: Position | null // null = sin asignar todavía
  appearances: number
  starts: number
  minutes: number
  goals: number
  assists: number
  cleanSheets: number
  saves: number
  yellowCards: number
  redCards: number
}

export type StatKey = 'appearances' | 'minutes' | 'goals' | 'assists' | 'cleanSheets' | 'saves' | 'yellowCards' | 'redCards'

export interface Team {
  id: 'primer' | 'juvenil'
  label: string
  base: string // prefijo de las rutas: '' o '/juvenil'
  league: string
  group: string
  matches: Match[]
  standings: Standing[]
  standingsRound: number
  players: Player[]
  // El juvenil solo muestra goles y minutos
  full: boolean
}
