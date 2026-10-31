import { describe, expect, it } from 'vitest'
import { isLive, liveMinute, played, upcoming } from './build'
import type { Match } from './types'

const t0 = new Date('2026-11-07T17:00:00Z').getTime()
const min = (n: number) => t0 + n * 60_000
const base: Match = { id: 1, round: 5, date: '2026-11-07', time: '17:00', home: true, opponent: 'Rival' }
const live = (status: NonNullable<Match['live']>['status'], second?: number): Match => ({
  ...base,
  score: { us: 0, them: 0 },
  live: { status, firstHalfAt: new Date(t0).toISOString(), secondHalfAt: second === undefined ? null : new Date(min(second)).toISOString() },
})

describe('reloj del directo', () => {
  it('cuenta el minuto de la primera parte (el primer minuto es el 1)', () => {
    expect(liveMinute(live('first_half'), min(0))?.label).toBe("1'")
    expect(liveMinute(live('first_half'), min(22.5))?.label).toBe("23'")
  })

  it('muestra el descuento como 45+X', () => {
    expect(liveMinute(live('first_half'), min(46.2))).toEqual({ label: "45+2'", minute: 47 })
  })

  it('en el descanso no corre', () => {
    expect(liveMinute(live('half_time'), min(60))?.label).toBe('Descanso')
  })

  it('la segunda parte empieza en el 46 y su descuento es 90+X', () => {
    expect(liveMinute(live('second_half', 62), min(62))?.label).toBe("46'")
    expect(liveMinute(live('second_half', 62), min(62 + 47))?.label).toBe("90+3'")
  })

  it('un partido en directo no sale ni en próximos ni en resultados hasta que termina', () => {
    const m = live('second_half', 62)
    expect(isLive(m)).toBe(true)
    expect(upcoming([m], new Date(t0))).toHaveLength(0)
    expect(played([m])).toHaveLength(0)
    expect(played([live('finished')])).toHaveLength(1)
  })
})
