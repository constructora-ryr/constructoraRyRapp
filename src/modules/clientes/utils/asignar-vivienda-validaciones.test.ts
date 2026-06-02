import { describe, expect, it } from 'vitest'

import {
  validarSinNegociacionActiva,
  validarViviendaDisponible,
} from './asignar-vivienda-validaciones'

// ──────────────────────────────────────────────────────────────
// validarViviendaDisponible
// ──────────────────────────────────────────────────────────────

describe('validarViviendaDisponible', () => {
  it('retorna ok cuando la vivienda está Disponible', () => {
    const result = validarViviendaDisponible('Disponible')
    expect(result.ok).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('retorna error cuando la vivienda está Asignada', () => {
    const result = validarViviendaDisponible('Asignada')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('Asignada')
  })

  it('retorna error cuando la vivienda está Reservada', () => {
    const result = validarViviendaDisponible('Reservada')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('Reservada')
  })

  it('retorna error cuando la vivienda está No Disponible', () => {
    const result = validarViviendaDisponible('No Disponible')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('No Disponible')
  })

  it('retorna error cuando el estado es null (no se pudo consultar)', () => {
    const result = validarViviendaDisponible(null)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('No se pudo verificar')
  })

  it('retorna error cuando el estado es undefined', () => {
    const result = validarViviendaDisponible(undefined)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('No se pudo verificar')
  })
})

// ──────────────────────────────────────────────────────────────
// validarSinNegociacionActiva
// ──────────────────────────────────────────────────────────────

describe('validarSinNegociacionActiva', () => {
  it('retorna ok cuando el cliente no tiene negociación activa', () => {
    const result = validarSinNegociacionActiva(null)
    expect(result.ok).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('retorna ok cuando maybeSingle devuelve undefined', () => {
    const result = validarSinNegociacionActiva(undefined)
    expect(result.ok).toBe(true)
  })

  it('retorna error cuando ya existe una negociación activa', () => {
    const result = validarSinNegociacionActiva({ id: 'abc-123' })
    expect(result.ok).toBe(false)
    expect(result.error).toContain('ya tiene una negociación activa')
  })

  it('el mensaje de error incluye instrucción de acción', () => {
    const result = validarSinNegociacionActiva({ id: 'xyz' })
    expect(result.error).toContain('Cancela o completa')
  })
})
