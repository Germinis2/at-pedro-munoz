import { splitFfcm } from './names'
import { photoFor } from './photos'
import type { Match, MatchRow, MvpPoll, Player, PlayerRow, Position, Seed, Standing, Team } from './types'

export const positionLabels: Record<Position, { one: string; many: string }> = {
  POR: { one: 'Portero', many: 'Porteros' },
  DEF: { one: 'Defensa', many: 'Defensas' },
  MED: { one: 'Centrocampista', many: 'Centrocampistas' },
  DEL: { one: 'Delantero', many: 'Delanteros' },
}
export const positionOrder: Position[] = ['POR', 'DEF', 'MED', 'DEL']
export const positionLabel = (p: Position | null) => (p ? positionLabels[p].one : 'Jugador')

const FULL = 90

// Partidos, minutos, goles y porterías a 0 a partir de las actas
function statsFor(raw: string, keeper: boolean, matches: Match[]) {
  let appearances = 0, starts = 0, minutes = 0, goals = 0, cleanSheets = 0
  for (const m of matches) {
    const l = m.lineup
    if (!l || !m.score || isLive(m)) continue // un partido en directo cuenta cuando termina
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
  return { appearances, starts, minutes, goals, cleanSheets }
}

export const toMatch = (r: MatchRow): Match => ({
  id: r.id ?? r.round,
  round: r.round,
  date: r.date,
  time: r.time?.slice(0, 5) ?? undefined,
  home: r.home,
  opponent: r.opponent,
  venue: r.venue ?? undefined,
  score: r.score_us != null && r.score_them != null ? { us: r.score_us, them: r.score_them } : undefined,
  acta: r.acta ?? undefined,
  lineup: r.lineup ?? undefined,
  live: r.live_status ? { status: r.live_status, firstHalfAt: r.first_half_at ?? null, secondHalfAt: r.second_half_at ?? null } : undefined,
})

// En juego (empezado y sin terminar)
export const isLive = (m: Match) => !!m.live && m.live.status !== 'finished'

// Minuto del directo según la hora de inicio de cada parte: "23'", "45+2'", "DESCANSO", "90+3'"
export function liveMinute(m: Match, now = Date.now()) {
  const l = m.live
  if (!l) return null
  if (l.status === 'half_time') return { label: 'Descanso', minute: 45 }
  if (l.status === 'finished') return { label: 'Final', minute: 90 }
  const from = l.status === 'first_half' ? l.firstHalfAt : l.secondHalfAt
  if (!from) return null
  const elapsed = Math.max(0, Math.floor((now - new Date(from).getTime()) / 60_000)) + 1
  const base = l.status === 'first_half' ? 0 : 45
  const minute = base + elapsed
  const cap = base + 45
  return { label: minute > cap ? `${cap}+${minute - cap}'` : `${minute}'`, minute }
}

export function buildPlayer(row: PlayerRow, matches: Match[], mvps = 0): Player {
  const { name, surnames, short } = splitFfcm(row.ffcm)
  const [first, ...rest] = (row.display_name || short).split(' ')
  return {
    id: row.id,
    ffcm: row.ffcm,
    photo: photoFor(row.team_id, row.id),
    firstName: first,
    lastName: rest.join(' '),
    nickname: row.nickname ?? undefined,
    fullName: `${name} ${surnames}`,
    number: row.number,
    position: row.position,
    assists: row.assists,
    saves: row.saves,
    yellowCards: row.yellow_cards,
    redCards: row.red_cards,
    mvps,
    ...statsFor(row.ffcm, row.position === 'POR', matches),
  }
}

export function buildTeam({ team, players, matches, standings }: Seed, polls: MvpPoll[] = [], mvps: Record<string, number> = {}): Team {
  const ms = matches.map(toMatch)
  return {
    id: team.id,
    label: team.label,
    base: team.id === 'primer' ? '' : `/${team.id}`,
    league: team.league,
    group: team.grp,
    matches: ms,
    standings: [...standings].sort((a, b) => a.rank - b.rank).map(({ team_id: _t, rank: _r, ...s }) => s as Standing),
    standingsRound: team.standings_round,
    players: players.map((p) => buildPlayer(p, ms, mvps[p.id])),
    full: team.full_stats,
    polls: polls.filter((p) => ms.some((m) => m.id === p.match_id)),
  }
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
  matches.filter((m) => !m.score && !m.live && kickoff(m) >= new Date(now.toDateString())).sort((a, b) => a.date.localeCompare(b.date))

export const played = (matches: Match[]) => matches.filter((m) => m.score && !isLive(m)).sort((a, b) => b.date.localeCompare(a.date))

export const liveMatch = (matches: Match[]) => matches.find(isLive)

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
