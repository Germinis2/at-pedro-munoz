export type Position = 'POR' | 'DEF' | 'MED' | 'DEL'
export type Result = 'G' | 'E' | 'P'

export interface Lineup {
  starters: [number, string][]
  bench: [number, string][]
  subs: { min: number; in: string; out: string }[]
  goals: { min: number; player: string | null }[] // null = gol en propia puerta del rival
}

export interface Match {
  id: number // en Supabase; en la copia local es la jornada
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
  photo?: string
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
  mvps: number // votaciones del MVP ganadas
}

// Filas tal cual están en Supabase
export interface TeamRow {
  id: 'primer' | 'juvenil'
  label: string
  league: string
  grp: string
  full_stats: boolean
  standings_round: number
}

export interface PlayerRow {
  id: string
  team_id: string
  ffcm: string
  display_name: string | null
  nickname: string | null
  number: number | null
  position: Position | null
  assists: number
  saves: number
  yellow_cards: number
  red_cards: number
}

export interface MatchRow {
  id?: number
  team_id: string
  round: number
  date: string
  time: string | null
  home: boolean
  opponent: string
  venue: string | null
  score_us: number | null
  score_them: number | null
  acta: number | null
  lineup: Lineup | null
}

export interface StandingRow extends Omit<Standing, 'ours'> {
  team_id: string
  rank: number
  ours: boolean
}

export interface MvpPoll {
  id: number
  match_id: number
  status: 'open' | 'closed'
  opened_at: string
  closed_at: string | null
}

export interface Seed {
  team: TeamRow
  players: PlayerRow[]
  matches: MatchRow[]
  standings: StandingRow[]
}

export type StatKey = 'appearances' | 'minutes' | 'goals' | 'assists' | 'cleanSheets' | 'saves' | 'yellowCards' | 'redCards' | 'mvps'

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
  polls: MvpPoll[]
}
