import { describe, expect, it } from 'vitest'

import { partesDescripcion, resumenCorto, tituloRafaga } from './tono-evento'

describe('resumenCorto', () => {
  it('usa recibo y valor de una descripción por partes', () => {
    expect(
      resumenCorto(
        'Recibo: RYR-2026-002 · Fecha: 12 de dic de 2024 · Valor: $2.500.000 · Fuente: Cuota Inicial'
      )
    ).toBe('RYR-2026-002 · $2.500.000')
  })

  it('quita las comillas de un título de documento', () => {
    expect(resumenCorto('"ACTA DE ENTREGA A2"')).toBe('ACTA DE ENTREGA A2')
  })

  it('devuelve vacío si no hay descripción', () => {
    expect(resumenCorto(undefined)).toBe('')
  })
})

describe('partesDescripcion', () => {
  it('solo separa si todas las partes son "Etiqueta: valor"', () => {
    expect(partesDescripcion('Texto libre · sin etiquetas')).toBeNull()
    expect(partesDescripcion('Recibo: 1 · Valor: $2')).toHaveLength(2)
  })
})

describe('tituloRafaga', () => {
  it('usa el plural del tipo o un genérico', () => {
    expect(tituloRafaga('abono_registrado', 'Nuevo abono', 3)).toBe(
      '3 abonos registrados'
    )
    expect(tituloRafaga('otro_tipo', 'Evento', 4)).toBe('Evento · 4 veces')
  })
})
