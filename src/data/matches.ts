export interface Match {
  id: number
  round: number
  date: string // ISO con hora local
  home: boolean
  opponent: string
  venue: string
  score?: { us: number; them: number }
}

// PROVISIONAL: calendario de ejemplo hasta tener el real
export const matches: Match[] = [
  { id: 5, round: 5, date: '2026-11-07T16:30', home: true, opponent: 'Rival por confirmar', venue: 'Juande Ramos' },
  { id: 6, round: 6, date: '2026-11-14T16:30', home: false, opponent: 'Rival por confirmar', venue: 'Por confirmar' },
  { id: 7, round: 7, date: '2026-11-21T16:30', home: true, opponent: 'Rival por confirmar', venue: 'Juande Ramos' },
  { id: 8, round: 8, date: '2026-11-28T16:30', home: false, opponent: 'Rival por confirmar', venue: 'Por confirmar' },
]

export const upcoming = (now = new Date()) =>
  matches.filter((m) => !m.score && new Date(m.date) >= now).sort((a, b) => a.date.localeCompare(b.date))

export const played = () =>
  matches.filter((m) => m.score).sort((a, b) => b.date.localeCompare(a.date))
