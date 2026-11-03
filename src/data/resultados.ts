import type { Result, Standing } from './types'

// Resultados de todo el grupo, para calcular la clasificación y mostrar las jornadas.
// Se leen copiando dos páginas de la FFCM (Ctrl+A, Ctrl+C):
// - «Tabla Cruzada»: todos los marcadores de la temporada en una tabla (fila = local, columna = visitante).
//   Los partidos sin jugar salen como "J 7" (su jornada).
// - «Ver Calendario»: los emparejamientos de cada jornada con su fecha. Hace falta una vez por temporada,
//   para saber en qué jornada se jugó cada partido que ya tiene resultado. Sus marcadores no se usan:
//   la FFCM los dibuja de forma que al copiar el texto salen incompletos.

export interface GroupResult {
  round: number
  date: string | null // YYYY-MM-DD, la de la jornada
  home: string // nombres de la web
  away: string
  hg: number | null // null = sin jugar
  ag: number | null
}

export type PasteKind = 'cruzada' | 'calendario' | 'clasificacion'

export function detectPaste(raw: string): PasteKind {
  if (/\bCASA\s+FUERA\b/.test(raw) || /Tabla cruzada de Partidos/i.test(raw)) return 'cruzada'
  if ((raw.match(/Jornada \d+ \(\d{2}-\d{2}-\d{4}\)/g) ?? []).length > 1 && !/\d,\d{4}/.test(raw)) return 'calendario'
  return 'clasificacion'
}

const tokens = (raw: string) =>
  raw
    .split(/[\t\r\n]+/)
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

export interface CruzadaCell {
  home: string // tal cual en la FFCM
  away: string
  round: number | null // si aún no se ha jugado
  hg: number | null
  ag: number | null
}

export function parseCruzada(raw: string): { teams: string[]; cells: CruzadaCell[] } {
  const t = tokens(raw)
  const start = t.findIndex((x, i) => x === 'CASA' && t[i + 1] === 'FUERA')
  if (start < 0) throw new Error('No se ha encontrado la tabla cruzada. Copia la página entera de la FFCM (Ctrl+A y Ctrl+C) y pégala aquí.')
  // Cabecera: los equipos hasta que empieza la primera fila, que es otra vez el primero
  const teams: string[] = []
  let i = start + 2
  while (i < t.length && !(teams.length && t[i] === teams[0])) teams.push(t[i++])
  const n = teams.length
  if (n < 2 || i >= t.length) throw new Error('La tabla cruzada está incompleta: copia la página entera.')
  const cells: CruzadaCell[] = []
  for (let r = 0; r < n; r++) {
    if (t[i] !== teams[r]) throw new Error(`No se entiende la fila de ${teams[r]} en la tabla cruzada. Vuelve a copiarla desde un ordenador.`)
    i++
    for (let c = 0; c < n; c++) {
      if (c === r) continue // la casilla del propio equipo va vacía
      const cell = t[i++] ?? ''
      const pending = /^J ?(\d+)$/.exec(cell)
      const score = /^(\d+) ?- ?(\d+)$/.exec(cell)
      if (!pending && !score) throw new Error(`Casilla no reconocida en ${teams[r]} contra ${teams[c]}: «${cell}». Vuelve a copiar la tabla cruzada.`)
      cells.push({
        home: teams[r],
        away: teams[c],
        round: pending ? Number(pending[1]) : null,
        hg: score ? Number(score[1]) : null,
        ag: score ? Number(score[2]) : null,
      })
    }
  }
  return { teams, cells }
}

export interface Fixture {
  round: number
  date: string
  home: string // tal cual en la FFCM
  away: string
}

// En cada línea: local · (marcador, que se descarta) · visitante. "Descansa" = jornada de descanso.
export function parseCalendario(raw: string): Fixture[] {
  const out: Fixture[] = []
  let round = 0
  let date = ''
  for (const line of raw.split(/\r?\n/)) {
    const j = /Jornada (\d+) \((\d{2})-(\d{2})-(\d{4})\)/.exec(line)
    if (j) {
      round = Number(j[1])
      date = `${j[4]}-${j[3]}-${j[2]}`
      continue
    }
    if (!round || !line.includes('\t')) continue
    const parts = line
      .split('\t')
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter((p) => p && !/^[\d -]+$/.test(p))
    if (parts.length !== 2) continue
    const [home, away] = parts
    if (/^descansa$/i.test(home) || /^descansa$/i.test(away)) continue
    out.push({ round, date, home, away })
  }
  if (!out.length) {
    throw new Error('No se han encontrado partidos en el calendario. Cópialo desde un ordenador (en el móvil cada casilla se pega por separado).')
  }
  return out
}

const key = (home: string, away: string) => `${home}|${away}`

// Une lo guardado con lo pegado. Con el calendario, la lista de partidos pasa a ser la suya.
export function mergeResults(
  saved: GroupResult[],
  paste: { fixtures?: Fixture[]; cells?: CruzadaCell[] },
  name: (ffcm: string) => string,
): { results: GroupResult[]; missingRound: string[] } {
  const prev = new Map(saved.map((r) => [key(r.home, r.away), r]))
  const map = new Map<string, GroupResult>()
  if (paste.fixtures) {
    for (const f of paste.fixtures) {
      const home = name(f.home)
      const away = name(f.away)
      const old = prev.get(key(home, away))
      map.set(key(home, away), { round: f.round, date: f.date, home, away, hg: old?.hg ?? null, ag: old?.ag ?? null })
    }
  } else {
    for (const [k, r] of prev) map.set(k, { ...r })
  }
  const missingRound: string[] = []
  for (const c of paste.cells ?? []) {
    const home = name(c.home)
    const away = name(c.away)
    const k = key(home, away)
    const old = map.get(k)
    const round = c.round ?? old?.round
    if (!round) {
      missingRound.push(`${home} - ${away}`)
      continue
    }
    map.set(k, { round, date: c.round && old?.round !== c.round ? null : (old?.date ?? null), home, away, hg: c.hg, ag: c.ag })
  }
  const results = [...map.values()].sort((a, b) => a.round - b.round || a.home.localeCompare(b.home))
  return { results, missingRound }
}

export const playedResults = (results: GroupResult[]) => results.filter((r) => r.hg !== null && r.ag !== null)

export const lastRound = (results: GroupResult[]) => Math.max(0, ...playedResults(results).map((r) => r.round))

// Clasificación como la de la FFCM: puntos por partido jugado; empates por el enfrentamiento directo
// (solo si se han jugado la ida y la vuelta entre todos los empatados), diferencia de goles y goles a favor
export function computeStandings(
  results: GroupResult[],
  isOurs: (team: string) => boolean,
  side?: 'home' | 'away',
  h2h = true, // la tabla del enfrentamiento directo no vuelve a desempatar por sí misma
): Standing[] {
  const rows = new Map<string, Standing>()
  const row = (team: string) => {
    if (!rows.has(team)) rows.set(team, { team, ours: isOurs(team) || undefined, pts: 0, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, form: [] })
    return rows.get(team)!
  }
  const played = playedResults(results).sort((a, b) => a.round - b.round)
  for (const r of results) {
    row(r.home)
    row(r.away)
  }
  for (const r of played) {
    const sides: [string, number, number][] = []
    if (side !== 'away') sides.push([r.home, r.hg!, r.ag!])
    if (side !== 'home') sides.push([r.away, r.ag!, r.hg!])
    for (const [team, f, c] of sides) {
      const s = row(team)
      const res: Result = f > c ? 'G' : f === c ? 'E' : 'P'
      s.pj++
      s.gf += f
      s.gc += c
      s[res === 'G' ? 'g' : res === 'E' ? 'e' : 'p']++
      s.pts += res === 'G' ? 3 : res === 'E' ? 1 : 0
      s.form.push(res)
    }
  }
  for (const s of rows.values()) s.form = s.form.slice(-5)

  const ratio = (s: Standing) => (s.pj ? s.pts / s.pj : 0)
  const sameRatio = (a: Standing, b: Standing) => a.pts * b.pj === b.pts * a.pj && (a.pj > 0) === (b.pj > 0)
  const general = (a: Standing, b: Standing) => b.gf - b.gc - (a.gf - a.gc) || b.gf - a.gf || a.team.localeCompare(b.team)
  const sorted = [...rows.values()].sort((a, b) => ratio(b) - ratio(a) || general(a, b))

  // Grupos de empatados: se reordenan por el enfrentamiento directo si ya se ha jugado entero
  const out: Standing[] = []
  for (let i = 0; i < sorted.length; ) {
    let j = i + 1
    while (j < sorted.length && sameRatio(sorted[i], sorted[j])) j++
    const group = sorted.slice(i, j)
    if (group.length > 1 && !side && h2h) {
      const names = new Set(group.map((g) => g.team))
      const direct = played.filter((r) => names.has(r.home) && names.has(r.away))
      if (direct.length === group.length * (group.length - 1)) {
        const mini = computeStandings(direct, () => false, undefined, false)
        const pos = (t: string) => mini.findIndex((m) => m.team === t)
        const m = (t: string) => mini[pos(t)]
        group.sort((a, b) => m(b.team).pts - m(a.team).pts || m(b.team).gf - m(b.team).gc - (m(a.team).gf - m(a.team).gc) || general(a, b))
      }
    }
    out.push(...group)
    i = j
  }
  return out
}

// Diferencias entre la clasificación oficial pegada y la calculada con los resultados
export function compareStandings(official: Standing[], computed: Standing[]): string[] {
  const diffs: string[] = []
  official.forEach((o, i) => {
    const c = computed.find((x) => x.team === o.team)
    if (!c) return diffs.push(`${o.team} no está en los resultados`)
    const what = (['pts', 'pj', 'gf', 'gc'] as const).filter((k) => o[k] !== c[k]).map((k) => `${k} ${o[k]} (calculado ${c[k]})`)
    if (computed.indexOf(c) !== i) what.push(`puesto ${i + 1} (calculado ${computed.indexOf(c) + 1})`)
    if (what.length) diffs.push(`${o.team}: ${what.join(', ')}`)
  })
  return diffs
}
