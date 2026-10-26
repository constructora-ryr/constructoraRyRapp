import { describe, expect, it } from 'vitest'

import {
  avisoMsPara,
  estadoInactividad,
  formatoCuentaRegresiva,
} from './estado-inactividad'

const MIN = 60_000

describe('estadoInactividad', () => {
  const limite = 60 * MIN
  const t0 = 1_000_000

  it('activa mientras falte más que el aviso', () => {
    expect(estadoInactividad(t0, t0 + 54 * MIN, limite)).toEqual({
      fase: 'activa',
      restanteMs: 6 * MIN,
    })
  })

  it('aviso en los últimos 5 minutos', () => {
    expect(estadoInactividad(t0, t0 + 55 * MIN, limite).fase).toBe('aviso')
    expect(estadoInactividad(t0, t0 + 59 * MIN, limite)).toEqual({
      fase: 'aviso',
      restanteMs: MIN,
    })
  })

  it('expirada al cumplir el límite o después (p. ej. equipo apagado)', () => {
    expect(estadoInactividad(t0, t0 + limite, limite).fase).toBe('expirada')
    expect(estadoInactividad(t0, t0 + 3 * 24 * 60 * MIN, limite)).toEqual({
      fase: 'expirada',
      restanteMs: 0,
    })
  })
})

describe('avisoMsPara', () => {
  it('5 minutos con límites normales y la mitad con límites cortos', () => {
    expect(avisoMsPara(60 * MIN)).toBe(5 * MIN)
    expect(avisoMsPara(6 * MIN)).toBe(3 * MIN)
  })
})

describe('formatoCuentaRegresiva', () => {
  it('mm:ss redondeando hacia arriba', () => {
    expect(formatoCuentaRegresiva(5 * MIN)).toBe('05:00')
    expect(formatoCuentaRegresiva(59_001)).toBe('01:00')
    expect(formatoCuentaRegresiva(9_000)).toBe('00:09')
  })
})
