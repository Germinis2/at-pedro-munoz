import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { isClub, matchName, parseClasificacion } from './clasificacion'
import type { StandingRow } from './types'

const fixture = (name: string) => readFileSync(new URL(`./__fixtures__/${name}`, import.meta.url), 'utf8')
// Clasificación guardada en Supabase tras la jornada 4 (comprobada a mano con la FFCM)
const db = JSON.parse(fixture('standings-primer-j4.json')) as StandingRow[]

describe('clasificación de la FFCM', () => {
  it('lee la tabla detallada con goles y jornada', () => {
    const c = parseClasificacion(fixture('clasificacion-detallada.txt'))
    expect(c.detailed).toBe(true)
    expect(c.round).toBe(4)
    expect(c.rows).toHaveLength(14)
    expect(c.warnings).toEqual([])
    expect(c.rows[1]).toEqual({ rank: 2, name: 'AT. PEDRO MUÑOZ C.F.', pts: 10, pj: 4, g: 3, e: 1, p: 0, gf: 12, gc: 2, form: ['G', 'E', 'G', 'G'] })
    // Triana: empate con nosotros en la J2 y derrota en la J4 → "P E P P" de más antiguo a más reciente
    expect(c.rows[13].form).toEqual(['P', 'E', 'P', 'P'])
  })

  it('coincide con la clasificación guardada (mismos números y nombres)', () => {
    const c = parseClasificacion(fixture('clasificacion-detallada.txt'))
    const names = db.map((r) => r.team)
    // Al guardar la de la web faltaban dos resultados de la J4 (Iniestense 13-0 y Alto Júcar 0-1 Villagarcía)
    const late = ['Iniestense Balompié', 'C.D. Villagarcía']
    for (const r of c.rows) {
      const name = matchName(r.name, names)
      expect(name, r.name).not.toBeNull()
      if (late.includes(name!)) continue
      const saved = db.find((x) => x.team === name)!
      expect({ pts: r.pts, pj: r.pj, g: r.g, e: r.e, p: r.p, gf: r.gf, gc: r.gc, form: r.form }, r.name).toEqual({
        pts: saved.pts, pj: saved.pj, g: saved.g, e: saved.e, p: saved.p, gf: saved.gf, gc: saved.gc, form: saved.form,
      })
    }
    expect(new Set(c.rows.map((r) => matchName(r.name, names))).size).toBe(14)
  })

  it('lee la tabla resumida, sin goles, y avisa', () => {
    const c = parseClasificacion(fixture('clasificacion-simple.txt'))
    expect(c.detailed).toBe(false)
    expect(c.rows).toHaveLength(14)
    expect(c.rows[0]).toMatchObject({ name: 'C.D. CIUDAD ENCANTADA', pts: 12, pj: 4, gf: null, gc: null })
    expect(c.warnings.join(' ')).toMatch(/Tabla Detallada/)
  })

  it('funciona aunque cada celda venga en su propia línea (copiado desde el móvil)', () => {
    const c = parseClasificacion(fixture('clasificacion-detallada.txt').replace(/\t/g, '\n'))
    expect(c.rows).toHaveLength(14)
    expect(c.rows[10].name).toBe('C.P. VILLARROBLEDO SENIOR MASCULINO "B"')
  })

  it('lee la del juvenil (últimos 5 partidos y jornada con descanso)', () => {
    const c = parseClasificacion(fixture('clasificacion-juvenil.txt'))
    expect(c.round).toBe(6)
    expect(c.rows).toHaveLength(15)
    expect(c.warnings).toEqual([])
    expect(c.rows[11]).toMatchObject({ name: 'AT. PEDRO MUÑOZ C.F.', pts: 6, pj: 6, gf: 11, gc: 16, form: ['G', 'G', 'P', 'P', 'P'] })
    expect(matchName(c.rows[5].name, ['Daimiel Racing C.F.', 'C.F. La Solana'])).toBe('Daimiel Racing C.F.')
    // Nombres de la web del juvenil (escudos): cada equipo de la FFCM encaja con uno distinto
    const web = ['U.D. Santa Cruz', 'C.D. Atlético Tomelloso "B"', 'C.F. La Solana', 'Sporting de Alcázar C.F. "B"', 'Carretero E.F.B. Valdepeñas',
      'Daimiel Racing C.F.', 'Cristo de la Vega C.F.', 'C.D.B. Herencia', 'C.D.U. Criptanense', 'C.P. Villarrobledo', 'Membrilla C.F.',
      'Camuñas F.C.', 'Atlético Cervantino', 'E.F.B. Atlético Valdepeñas']
    const mapped = c.rows.filter((r) => !isClub(r.name)).map((r) => matchName(r.name, web))
    expect(mapped).not.toContain(null)
    expect(new Set(mapped).size).toBe(14)
  })

  it('explica qué hacer si se copia la versión para móvil (sin partidos jugados)', () => {
    expect(() => parseClasificacion(fixture('clasificacion-movil.txt'))).toThrow(/versión para móvil/)
  })

  it('falla con un texto que no es la clasificación', () => {
    expect(() => parseClasificacion('hola')).toThrow(/clasificación/)
  })

  it('reconoce al club y empareja nombres sin tildes ni patrocinadores', () => {
    expect(isClub('AT. PEDRO MUÑOZ C.F.')).toBe(true)
    expect(matchName('C.D. ALTO JUCAR', ['C.D. Alto Júcar', 'C.D. Villagarcía'])).toBe('C.D. Alto Júcar')
    expect(matchName('C.D. MANCHEGO PROVENCIO CANFORRALES', ['C.D. Manchego Provencio'])).toBe('C.D. Manchego Provencio')
    expect(matchName('C.D. NUEVO', ['C.D. Alto Júcar'])).toBeNull()
  })
})
