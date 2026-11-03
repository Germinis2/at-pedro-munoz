import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { isClub, matchName, parseClasificacion } from './clasificacion'
import { capitalize } from './names'
import { compareStandings, computeStandings, detectPaste, lastRound, mergeResults, parseCalendario, parseCruzada, type GroupResult } from './resultados'

const fixture = (name: string) => readFileSync(new URL(`./__fixtures__/${name}`, import.meta.url), 'utf8')

// Nombres de la web (los de los escudos) para cada equipo
const web = {
  primer: ['AT. Pedro Muñoz C.F.', 'C.D. Alto Júcar', 'C.D. Casas de Haro', 'U.D. Casasimarro', 'C.D. Ciudad Encantada', 'Cristo de la Vega C.F.',
    'Iniestense Balompié', 'C.F. La Santa Cruz', 'C.D. Don Pefi Los Llanos', 'C.D. Manchego Provencio', 'U.D. Puebla de Almenara',
    'C.D. Triana Tresjuncos', 'C.D. Villagarcía', 'C.P. Villarrobledo "B"'],
  juvenil: ['AT. Pedro Muñoz C.F.', 'U.D. Santa Cruz', 'C.D. Atlético Tomelloso "B"', 'C.F. La Solana', 'Sporting de Alcázar C.F. "B"',
    'Carretero E.F.B. Valdepeñas', 'Daimiel Racing C.F.', 'Cristo de la Vega C.F.', 'C.D.B. Herencia', 'C.D.U. Criptanense',
    'C.P. Villarrobledo', 'Membrilla C.F.', 'Camuñas F.C.', 'Atlético Cervantino', 'E.F.B. Atlético Valdepeñas'],
}
const namer = (team: keyof typeof web) => (ffcm: string) => (isClub(ffcm) ? web[team][0] : (matchName(ffcm, web[team]) ?? capitalize(ffcm)))
const ours = (t: string) => isClub(t)

function season(team: keyof typeof web) {
  const name = namer(team)
  const fromCalendar = mergeResults([], { fixtures: parseCalendario(fixture(`calendario-${team}.txt`)) }, name).results
  return mergeResults(fromCalendar, { cells: parseCruzada(fixture(`cruzada-${team}.txt`)).cells }, name)
}

// La oficial de la FFCM con los nombres de la web
const official = (file: string, team: keyof typeof web) => {
  const name = namer(team)
  return parseClasificacion(fixture(file)).rows.map((r) => ({ ...r, team: name(r.name) }))
}

describe('resultados del grupo', () => {
  it('reconoce cada página de la FFCM', () => {
    expect(detectPaste(fixture('cruzada-primer.txt'))).toBe('cruzada')
    expect(detectPaste(fixture('calendario-juvenil.txt'))).toBe('calendario')
    expect(detectPaste(fixture('clasificacion-detallada.txt'))).toBe('clasificacion')
    expect(detectPaste(fixture('clasificacion-juvenil.txt'))).toBe('clasificacion')
  })

  it('lee la tabla cruzada: marcadores y jornada de los partidos pendientes', () => {
    const { teams, cells } = parseCruzada(fixture('cruzada-primer.txt'))
    expect(teams).toHaveLength(14)
    expect(cells).toHaveLength(14 * 13)
    expect(cells.find((c) => c.home === 'INIESTENSE BALOMPIÉ' && c.away.startsWith('C.P. VILLARROBLEDO'))).toMatchObject({ hg: 13, ag: 0, round: null })
    expect(cells.find((c) => c.home === 'AT. PEDRO MUÑOZ C.F.' && c.away === 'C.D. ALTO JUCAR')).toMatchObject({ round: 19, hg: null })
    expect(cells.filter((c) => c.hg !== null)).toHaveLength(28)
  })

  it('funciona aunque cada casilla venga en su propia línea', () => {
    expect(parseCruzada(fixture('cruzada-juvenil.txt').replace(/\t/g, '\n')).cells).toHaveLength(15 * 14)
  })

  it('lee el calendario sin fiarse de sus marcadores y salta los descansos', () => {
    const f = parseCalendario(fixture('calendario-juvenil.txt'))
    expect(f.filter((x) => x.round === 1)).toHaveLength(7)
    expect(f[0]).toEqual({ round: 1, date: '2026-09-27', home: 'C.P. VILLARROBLEDO', away: 'DAIMIEL RACING CLUB DE FÚTBOL' })
    expect(f.some((x) => /descansa/i.test(x.home + x.away))).toBe(false)
  })

  it('sin calendario no sabe la jornada de los partidos ya jugados', () => {
    const r = mergeResults([], { cells: parseCruzada(fixture('cruzada-primer.txt')).cells }, namer('primer'))
    expect(r.missingRound).toHaveLength(28)
  })

  it('primer equipo: calcula exactamente la clasificación oficial de la jornada 4', () => {
    const { results, missingRound } = season('primer')
    expect(missingRound).toEqual([])
    expect(lastRound(results)).toBe(4)
    const computed = computeStandings(results, ours)
    const off = official('clasificacion-detallada.txt', 'primer')
    expect(computed.map((s) => s.team)).toEqual(off.map((s) => s.team))
    for (const o of off) {
      const c = computed.find((x) => x.team === o.team)!
      expect({ pts: c.pts, pj: c.pj, g: c.g, e: c.e, p: c.p, gf: c.gf, gc: c.gc, form: c.form }, o.team).toEqual({
        pts: o.pts, pj: o.pj, g: o.g, e: o.e, p: o.p, gf: o.gf, gc: o.gc, form: o.form,
      })
    }
    expect(computed[1]).toMatchObject({ team: 'AT. Pedro Muñoz C.F.', ours: true })
    expect(compareStandings(off, computed)).toEqual([])
  })

  it('juvenil: con descansos ordena por puntos por partido, como la FFCM', () => {
    const { results, missingRound } = season('juvenil')
    expect(missingRound).toEqual([])
    expect(lastRound(results)).toBe(6)
    const computed = computeStandings(results, ours)
    const off = official('clasificacion-juvenil.txt', 'juvenil')
    expect(computed.map((s) => [s.team, s.pts, s.pj, s.gf, s.gc, s.form.join('')])).toEqual(
      off.map((s) => [s.team, s.pts, s.pj, s.gf, s.gc, s.form.join('')]),
    )
  })

  it('local y visitante solo cuentan los partidos en casa o fuera', () => {
    const { results } = season('primer')
    const home = computeStandings(results, ours, 'home').find((s) => s.ours)!
    const away = computeStandings(results, ours, 'away').find((s) => s.ours)!
    expect(home).toMatchObject({ pj: 2, gf: 8, gc: 0 })
    expect(away).toMatchObject({ pj: 2, gf: 4, gc: 2 })
  })

  it('desempata por el enfrentamiento directo cuando se han jugado ida y vuelta', () => {
    const r = (round: number, home: string, away: string, hg: number, ag: number): GroupResult => ({ round, date: null, home, away, hg, ag })
    // A y B empatan a 6 puntos; B tiene más diferencia de goles, pero A gana el enfrentamiento directo (3-0 y 1-0)
    const results = [r(1, 'A', 'B', 3, 0), r(2, 'B', 'A', 1, 0), r(3, 'B', 'C', 9, 0), r(3, 'A', 'D', 1, 0)]
    expect(computeStandings(results, () => false).map((s) => s.team)).toEqual(['A', 'B', 'D', 'C'])
    // Con solo la ida jugada manda la diferencia de goles
    const ida = [r(1, 'A', 'B', 1, 1), r(2, 'A', 'D', 1, 0), r(2, 'B', 'C', 9, 0)]
    expect(computeStandings(ida, () => false).map((s) => s.team)).toEqual(['B', 'A', 'D', 'C'])
  })

  it('avisa de las diferencias con la clasificación oficial', () => {
    const { results } = season('primer')
    const sinUno = results.map((x) => (x.home === 'Iniestense Balompié' && x.round === 4 ? { ...x, hg: null, ag: null } : x))
    const diffs = compareStandings(official('clasificacion-detallada.txt', 'primer'), computeStandings(sinUno, ours))
    expect(diffs.join(' ')).toMatch(/Iniestense Balompié: pts 9 \(calculado 6\)/)
  })
})
