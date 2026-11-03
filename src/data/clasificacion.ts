import type { Result } from './types'

// Lee la clasificación copiando el texto de la página de la FFCM (Ctrl+A, Ctrl+C), igual que las actas.
// Formatos:
// - "Tabla Detallada": rango, equipo, Pts/PJ, Pts, casa J G E P, fuera J G E P, F, C, últimos, sanción
// - "Tabla Resumida" (la que sale al abrir la página): rango, equipo, Pts/PJ, Pts, J, G, E, P, últimos, sanción
//   No trae goles: hay que pulsar «Tabla Detallada» antes de copiar.
// El texto se aplana a una sola línea porque al pegar desde el móvil cada celda puede ir en su propia línea.

export interface FfcmStanding {
  rank: number
  name: string // tal cual en la FFCM, p. ej. "CRISTO DE LA VEGA C.F. CABEZUELO FOODS"
  pts: number
  pj: number
  g: number
  e: number
  p: number
  gf: number | null // null si se copió la tabla resumida
  gc: number | null
  form: Result[] // de más antiguo a más reciente, como en la FFCM
}

export interface ParsedStandings {
  rows: FfcmStanding[]
  round: number
  detailed: boolean
  warnings: string[]
}

// rango · equipo · Pts/PJ (decimal con coma: el ancla) · enteros · últimos (G/E/P) · sanción.
// El nombre no puede llevar números sueltos: así no se traga el texto de antes de la tabla ("GRUPO 3 … Puntos 1 …")
const ROW = /(?:^|\s)(\d{1,2}) ((?:(?!\d{1,3} )\S+ )+?)(\d+,\d{4}) ((?:\d+ ){5,11})((?:[GEP] ){0,5})(\d+)(?= |$)/g

export function parseClasificacion(raw: string): ParsedStandings {
  const flat = raw.replace(/\s+/g, ' ').trim()
  const rows: FfcmStanding[] = []
  const warnings: string[] = []
  let detailed: boolean | null = null

  for (const m of flat.matchAll(ROW)) {
    const nums = m[4].trim().split(' ').map(Number)
    const form = m[5].trim() ? (m[5].trim().split(' ') as Result[]) : []
    const name = m[2].trim()
    let row: FfcmStanding
    if (nums.length === 11) {
      const [pts, hj, hg, he, hp, aj, ag, ae, ap, gf, gc] = nums
      row = { rank: Number(m[1]), name, pts, pj: hj + aj, g: hg + ag, e: he + ae, p: hp + ap, gf, gc, form }
    } else if (nums.length === 5) {
      const [pts, pj, g, e, p] = nums
      row = { rank: Number(m[1]), name, pts, pj, g, e, p, gf: null, gc: null, form }
    } else {
      continue
    }
    const isDetailed = nums.length === 11
    if (detailed !== null && detailed !== isDetailed) continue // mezcla de tablas: se queda con la primera
    detailed = isDetailed
    if (row.g + row.e + row.p !== row.pj) warnings.push(`${name}: los partidos no cuadran (${row.g}+${row.e}+${row.p} ≠ ${row.pj})`)
    if (row.g * 3 + row.e !== row.pts) warnings.push(`${name}: los puntos no cuadran con G y E (puede haber sanción)`)
    rows.push(row)
  }

  if (!rows.length) {
    // En la versión para móvil la FFCM oculta las columnas de partidos (J, G, E, P) y la sanción
    if (/\d,\d{4} \d+ (?:\d+ \d+ )?(?:[GEP] ){1,5}\d{1,2} /.test(flat + ' ')) {
      throw new Error(
        'Has copiado la versión para móvil de la FFCM, que oculta los partidos jugados, ganados, empatados y perdidos. ' +
          'Cópiala desde un ordenador o pide la versión de ordenador en el navegador del móvil (Safari: botón «aA» → «Solicitar sitio web de escritorio»; Chrome: menú ⋮ → «Sitio de escritorio»).',
      )
    }
    throw new Error('No se ha encontrado la clasificación. Copia la página entera de la FFCM (Ctrl+A y Ctrl+C) y pégala aquí.')
  }
  rows.sort((a, b) => a.rank - b.rank)
  rows.forEach((r, i) => {
    if (r.rank !== i + 1) warnings.push(`Falta el puesto ${i + 1} o está repetido`)
  })

  const j = /Jornada (\d+) \(\d{2}-\d{2}-\d{4}\)/.exec(flat)
  const maxPj = Math.max(...rows.map((r) => r.pj))
  const round = j ? Number(j[1]) : maxPj
  if (round > maxPj) warnings.push(`La página marca la jornada ${round}, pero nadie ha jugado más de ${maxPj}: revisa «Tras la jornada».`)
  if (!detailed) warnings.push('Has copiado la tabla resumida, sin goles: pulsa «Tabla Detallada» en la FFCM y vuelve a copiar.')

  return { rows, round, detailed: !!detailed, warnings: [...new Set(warnings)] }
}

// Nombres: se usa el que ya tiene la web (lo usan los escudos y el guardado), no el de la FFCM,
// que lleva patrocinadores ("CABEZUELO FOODS"), va sin tildes ("JUCAR") y a veces sin abreviar
// ("RACING CLUB DE FÚTBOL" por "Racing C.F."): por eso no cuentan las iniciales sueltas
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 1)

// Devuelve el candidato cuyas palabras están todas en el nombre de la FFCM (el más largo si hay varios)
export function matchName(ffcm: string, candidates: string[]): string | null {
  const words = new Set(norm(ffcm))
  let best: string | null = null
  let bestLen = 0
  for (const c of new Set(candidates)) {
    const cw = norm(c)
    if (cw.length && cw.every((w) => words.has(w)) && cw.length > bestLen) {
      best = c
      bestLen = cw.length
    }
  }
  return best
}

export const isClub = (name: string) => {
  const w = norm(name)
  return w.includes('pedro') && w.includes('munoz')
}
