import { describe, expect, it } from 'vitest'

import { calcularTotalesNegociacion } from './totales-negociacion'

describe('calcularTotalesNegociacion', () => {
  it('sin intereses usa saldo y % de la BD', () => {
    const r = calcularTotalesNegociacion({
      negociacion: { saldo_pendiente: 36_705_000, porcentaje_pagado: 69.9 },
      valorVivienda: 122_000_000,
      totalComprometido: 128_000_000,
      interesesTotales: 0,
      totalAbonado: 85_295_000,
    })
    expect(r).toEqual({
      baseTotal: 122_000_000,
      saldo: 36_705_000,
      pctPagado: 69.9,
    })
  })

  it('con intereses recalcula el saldo sobre el total comprometido', () => {
    const r = calcularTotalesNegociacion({
      negociacion: { saldo_pendiente: 10, porcentaje_pagado: null },
      valorVivienda: 100,
      totalComprometido: 120,
      interesesTotales: 20,
      totalAbonado: 30,
    })
    expect(r.baseTotal).toBe(120)
    expect(r.saldo).toBe(90)
    expect(r.pctPagado).toBe(25)
  })

  it('nunca da saldo negativo ni avance mayor a 100', () => {
    const r = calcularTotalesNegociacion({
      negociacion: { saldo_pendiente: null, porcentaje_pagado: 104 },
      valorVivienda: 100,
      totalComprometido: 100,
      interesesTotales: 0,
      totalAbonado: 150,
    })
    expect(r.saldo).toBe(0)
    expect(r.pctPagado).toBe(100)
  })
})
