// Convierte los datos de partida (FFCM + Excel del club) en filas de Supabase.
// Lo usan la web (copia local de respaldo) y scripts/seed.mjs (carga inicial de la base de datos).
import { splitFfcm } from './names.ts'
import type { Match, MatchRow, PlayerRow, Position, Seed, Standing, StandingRow, TeamRow } from './types'

export type ClubStats = { assists?: number; saves?: number; yellow?: number; red?: number }

// Dorsal del último acta en el que aparece (para equipos sin dorsales oficiales)
function lastActaNumber(raw: string, matches: Match[]) {
  let number: number | null = null
  for (const m of [...matches].sort((a, b) => a.date.localeCompare(b.date))) {
    const listed = m.lineup && [...m.lineup.starters, ...m.lineup.bench].find(([, n]) => n === raw)
    if (listed) number = listed[0]
  }
  return number
}

export function makeSeed({
  team,
  squad,
  profiles,
  clubStats = {},
  matches,
  standings,
}: {
  team: TeamRow
  squad: Record<string, Position | null> // "APELLIDOS, NOMBRE" como en la FFCM
  profiles?: Record<string, [number, string, string?]> // [dorsal, nombre deportivo, apodo?]
  clubStats?: Record<string, ClubStats>
  matches: Match[]
  standings: Standing[]
}): Seed {
  const players: PlayerRow[] = Object.entries(squad).map(([raw, position]) => {
    const profile = profiles?.[raw]
    const s = clubStats[raw] ?? {}
    return {
      id: splitFfcm(raw).id,
      team_id: team.id,
      ffcm: raw,
      display_name: profile?.[1] ?? null,
      nickname: profile?.[2] ?? null,
      number: profiles ? (profile?.[0] ?? null) : lastActaNumber(raw, matches),
      position,
      assists: s.assists ?? 0,
      saves: s.saves ?? 0,
      yellow_cards: s.yellow ?? 0,
      red_cards: s.red ?? 0,
    }
  })

  const matchRows: MatchRow[] = matches.map((m) => ({
    id: m.id,
    team_id: team.id,
    round: m.round,
    date: m.date,
    time: m.time ?? null,
    home: m.home,
    opponent: m.opponent,
    venue: m.venue ?? null,
    score_us: m.score?.us ?? null,
    score_them: m.score?.them ?? null,
    acta: m.acta ?? null,
    lineup: m.lineup ?? null,
  }))

  const standingRows: StandingRow[] = standings.map((s, i) => ({ ...s, team_id: team.id, rank: i + 1, ours: !!s.ours }))

  return { team, players, matches: matchRows, standings: standingRows }
}
