import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseActa } from './acta'

// Textos copiados de la web de la FFCM (Ctrl+A, Ctrl+C en la página del acta)
const acta = (n: number) => readFileSync(new URL(`./__fixtures__/acta-${n}.txt`, import.meta.url), 'utf8')

describe('parseActa', () => {
  it('lee un partido en casa: fecha, campo, alineación, cambios y goles', () => {
    const p = parseActa(acta(598001))
    expect(p).toMatchObject({ round: 1, date: '2026-10-04', time: '18:00', home: true, venue: 'Juande Ramos - Pedro Muñoz' })
    expect(p.lineup.starters).toHaveLength(11)
    expect(p.lineup.starters[0]).toEqual([13, 'SALIDO MOLINA, SERGIO'])
    expect(p.lineup.bench).toHaveLength(7)
    expect(p.lineup.subs).toHaveLength(5)
    expect(p.lineup.subs[0]).toEqual({ min: 45, in: 'MUÑOZ PLIEGO, PABLO', out: 'PULPON BUENDIA, REYES' })
    expect(p.lineup.goals).toEqual([
      { min: 16, player: 'MOURA FERREIRA, JACKSON' },
      { min: 77, player: 'SANCHEZ ALBERCA, JAIME' },
      { min: 83, player: 'SANCHEZ ALBERCA, JAIME' },
    ])
    expect(p.score).toEqual({ us: 3, them: 0 })
  })

  it('lee un partido fuera y solo toma nuestra alineación', () => {
    const p = parseActa(acta(598009))
    expect(p).toMatchObject({ round: 2, home: false, venue: null })
    expect(p.lineup.starters.map(([, n]) => n)).toContain('BOUNAB CHARQI, ISMAEL')
    expect(p.lineup.starters.map(([, n]) => n)).not.toContain('LOPEZ MORAL, JESUS')
    expect(p.lineup.bench).toHaveLength(8)
    expect(p.lineup.subs).toHaveLength(4)
    expect(p.lineup.goals).toEqual([{ min: 4, player: 'PULPON BUENDIA, REYES' }])
    // Limitación conocida: el gol en propia puerta del rival se cuenta como suyo (real: 2-2)
    expect(p.score).toEqual({ us: 1, them: 3 })
  })

  it('lee el juvenil con nombres con tilde y guion', () => {
    const p = parseActa(acta(604470))
    expect(p).toMatchObject({ round: 2, date: '2026-10-03', home: true })
    expect(p.lineup.bench.map(([, n]) => n)).toContain('MARTÍN MANGLANO, HUGO')
    expect(p.lineup.subs.at(-1)).toEqual({ min: 83, in: 'RUIZ DÍAZ, ALONSO', out: 'SERNA RAMIREZ, DANIEL' })
    expect(p.lineup.goals.map((g) => g.player)).toEqual([
      'CEBRIAN VILLALGORDO, YERAY',
      'ESCUDERO SEVILLA, OMAR',
      'MUÑOZ RODRIGUEZ, DAVID',
      'TENAJAS MANZANERO, ADRIAN',
      'TENAJAS MANZANERO, ADRIAN',
    ])
    expect(p.score).toEqual({ us: 5, them: 1 })
    expect(p.lineup.rivalGoals).toEqual([{ min: 24, player: 'SANCHEZ CARABAÑO, ALEJANDRO' }])
  })

  it('avisa si el texto no es un acta nuestra', () => {
    expect(() => parseActa('hola')).toThrow(/alineación/)
  })
})
