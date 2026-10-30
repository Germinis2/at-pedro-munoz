import { photoFor } from './photos'
import type { Match, Player, Position, Standing } from './types'

export const positionLabels: Record<Position, { one: string; many: string }> = {
  POR: { one: 'Portero', many: 'Porteros' },
  DEF: { one: 'Defensa', many: 'Defensas' },
  MED: { one: 'Centrocampista', many: 'Centrocampistas' },
  DEL: { one: 'Delantero', many: 'Delanteros' },
}
export const positionOrder: Position[] = ['POR', 'DEF', 'MED', 'DEL']
export const positionLabel = (p: Position | null) => (p ? positionLabels[p].one : 'Jugador')

export type ClubStats = { assists?: number; saves?: number; yellow?: number; red?: number }

const capitalize = (s: string) => s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase())

const slug = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const FULL = 90

// Partidos, minutos, goles y porterías a 0 a partir de las actas
function statsFor(raw: string, keeper: boolean, matches: Match[]) {
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
    if (keeper && started && !subOut && m.score.them === 0) cleanSheets++
  }
  return { number, appearances, starts, minutes, goals, cleanSheets }
}

export function buildPlayers({
  team,
  squad,
  matches,
  profiles = {},
  clubStats = {},
}: {
  team: string // carpeta de fotos
  squad: Record<string, Position | null> // "APELLIDOS, NOMBRE" como en la FFCM
  matches: Match[]
  profiles?: Record<string, [number, string, string?]> // [dorsal, nombre deportivo, apodo?]
  clubStats?: Record<string, ClubStats>
}): Player[] {
  const useProfiles = Object.keys(profiles).length > 0
  return Object.entries(squad).map(([raw, position]) => {
    const [surnames, name] = raw.split(',').map((s) => capitalize(s.trim()))
    const [number, display, nickname] = profiles[raw] ?? [null, `${name} ${surnames.split(' ')[0]}`]
    const [first, ...rest] = display.split(' ')
    const stats = statsFor(raw, position === 'POR', matches)
    const id = slug(`${name} ${surnames}`)
    return {
      id,
      photo: photoFor(team, id),
      ffcm: raw,
      firstName: first,
      lastName: rest.join(' '),
      nickname,
      fullName: `${name} ${surnames}`,
      position,
      assists: clubStats[raw]?.assists ?? 0,
      saves: clubStats[raw]?.saves ?? 0,
      yellowCards: clubStats[raw]?.yellow ?? 0,
      redCards: clubStats[raw]?.red ?? 0,
      ...stats,
      // Con dorsales oficiales del club se usan esos; si no, el del último acta
      number: useProfiles ? number : stats.number,
    }
  })
}

export const sortPlayers = (players: Player[]) =>
  [...players].sort(
    (a, b) =>
      (a.position ? positionOrder.indexOf(a.position) : 9) - (b.position ? positionOrder.indexOf(b.position) : 9) ||
      (a.number ?? 99) - (b.number ?? 99) ||
      a.firstName.localeCompare(b.firstName),
  )

export const kickoff = (m: Match) => new Date(`${m.date}T${m.time ?? '00:00'}`)

export const upcoming = (matches: Match[], now = new Date()) =>
  matches.filter((m) => !m.score && kickoff(m) >= new Date(now.toDateString())).sort((a, b) => a.date.localeCompare(b.date))

export const played = (matches: Match[]) => matches.filter((m) => m.score).sort((a, b) => b.date.localeCompare(a.date))

export const actaUrl = (acta: number) =>
  `https://www.ffcm.es/pnfg/NPcd/NFG_CmpPartido?cod_primaria=1000120&CodActa=${acta}&cod_acta=${acta}`

export function summary(standings: Standing[]) {
  const i = standings.findIndex((s) => s.ours)
  const s = standings[i]
  return {
    position: i + 1,
    teams: standings.length,
    points: s.pts,
    played: s.pj,
    won: s.g,
    drawn: s.e,
    lost: s.p,
    goalsFor: s.gf,
    goalsAgainst: s.gc,
    form: s.form,
  }
}
