// Lee el texto de un acta de la FFCM copiado de la web (Ctrl+A, Ctrl+C en la página del acta).
// La FFCM no sirve las actas a servidores, así que se copian a mano desde el navegador.
import type { Lineup } from './types'

const CLUB = 'AT. PEDRO MUÑOZ C.F.'

export interface ParsedActa {
  round: number | null
  date: string | null
  time: string | null
  home: boolean
  venue: string | null
  score: { us: number; them: number }
  lineup: Lineup
}

export function parseActa(raw: string): ParsedActa {
  const text = raw
    .replace(/eval\(function[\s\S]*?\{\}\)\);/g, '')
    .replace(/ntype\([^)]*\);|#idh\d+:[a-z]+\{[^}]*\}/g, '')
    .replace(/\s+/g, ' ')

  const head = text.match(/Jornada (\d+)\s+(\d\d)-(\d\d)-(\d{4})\s+(\d\d:\d\d)?/)
  // Cabecera: "(GRUPO 3) LOCAL VISITANTE": somos locales si nuestro nombre va primero
  const header = text.slice(text.indexOf('(GRUPO'), text.indexOf('Árbitro')).replace(/^\(GRUPO[^)]*\)\s*/, '')
  const home = header.startsWith(CLUB)

  // El acta trae dos bloques "EQUIPO Titulares … Suplentes … Sustituciones … Tarjetas", uno por equipo
  const start = text.indexOf(`${CLUB} Titulares`)
  if (start < 0) throw new Error('No encuentro la alineación del At. Pedro Muñoz. ¿Has copiado la página entera del acta?')
  const ourAt = start + CLUB.length
  const titulares = [...text.matchAll(/ Titulares /g)].map((m) => m.index!)
  const rivalAt = titulares.find((i) => Math.abs(i - ourAt) > 5)

  let ourBlock = text.slice(ourAt)
  const next = ourBlock.search(/\s[A-ZÁÉÍÓÚÑ."' ]{4,} Titulares/)
  if (next > 0) ourBlock = ourBlock.slice(0, next)
  // Si el rival va primero, su bloque termina donde empieza el nuestro
  const rivalBlock = rivalAt === undefined ? '' : text.slice(rivalAt, rivalAt < ourAt ? start : undefined)

  const ours = parseTeam(ourBlock)
  const rival = parseTeam(rivalBlock)

  const goalsText = text.slice(text.indexOf('Goles'), text.indexOf('Gol G. Penalti'))
  const allGoals = [...goalsText.matchAll(/\((\d+)'\) ([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ ,.-]+?)(?=\s{2,}|\s*$| [^A-ZÁÉÍÓÚÑÜ ,.-])/g)].map((m) => {
    const raw = m[2].replace(/[\s-]+$/, '').trim() // quita el guion del marcador que va detrás
    const player = ours.names.has(raw) || !rival.names.size ? ours.full(raw) : rival.full(raw)
    return { min: +m[1], player }
  })
  const goals = allGoals.filter((g) => ours.names.has(g.player))
  const rivalGoals = allGoals.filter((g) => !ours.names.has(g.player))
  const venue = text.match(/Estadio: (.*?) Ciudad/)?.[1]?.trim() || null

  return {
    round: head ? +head[1] : null,
    date: head ? `${head[4]}-${head[3]}-${head[2]}` : null,
    time: head?.[5] ?? null,
    home,
    venue,
    // El marcador de la FFCM está oculto: se deduce de los goleadores y hay que revisarlo
    score: { us: goals.length, them: allGoals.length - goals.length },
    lineup: {
      starters: ours.starters,
      bench: ours.bench,
      subs: ours.subs,
      goals,
      rivalGoals,
      rival: rival.starters.length ? { starters: rival.starters, bench: rival.bench, subs: rival.subs } : undefined,
    },
  }
}

// Titulares, suplentes y cambios de un equipo a partir de su bloque del acta
function parseTeam(block: string) {
  const sec = (from: string, to: string[]) => {
    const i = block.indexOf(from)
    if (i < 0) return ''
    const ends = to.map((x) => block.indexOf(x, i + from.length)).filter((x) => x > 0)
    return block.slice(i + from.length, ends.length ? Math.min(...ends) : undefined).trim()
  }
  const people = (s: string): [number, string][] => [...s.matchAll(/(\d+) ([^\d(]+?)(?= \d+ |$)/g)].map((m) => [+m[1], m[2].trim()])
  const starters = people(sec('Titulares', ['Suplentes', 'Cuerpo']))
  const bench = people(sec('Suplentes', ['Cuerpo']))

  const names = new Set([...starters, ...bench].map(([, n]) => n))
  // A veces el acta corta el nombre ("SERNA RAMIREZ,"): se completa con la alineación
  const full = (n: string) => (names.has(n) ? n : ([...names].find((x) => x.startsWith(n)) ?? n))

  const subs = [...sec('Sustituciones', ['Tarjetas', 'PATROCINADORES']).matchAll(/(\d+) ([^\d(]+?) (\d+) \((\d+)'\) ([^\d(]+?)(?= \d+ |$)/g)].map((m) => ({
    min: +m[4],
    in: full(m[2].trim()),
    out: full(m[5].trim()),
  }))
  return { starters, bench, subs, names, full }
}
