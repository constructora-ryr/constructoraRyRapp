/**
 * Saldo y avance de una negociación — una sola fórmula para la pestaña
 * Negociación, el resumen de Información General y el encabezado del cliente.
 *
 * - Sin intereses: saldo = saldo_pendiente de BD (lo calcula el trigger).
 * - Con crédito con la constructora (intereses): el trigger no suma los
 *   intereses, así que el saldo se recalcula sobre el total comprometido.
 * - % pagado: el campo de BD si existe; si no, se calcula sobre la base.
 */

interface NegociacionTotalesInput {
  saldo_pendiente?: number | null
  porcentaje_pagado?: number | null
}

export interface TotalesNegociacion {
  /** Base de cálculo: total comprometido si hay intereses, si no el valor de la vivienda */
  baseTotal: number
  saldo: number
  /** 0–100 */
  pctPagado: number
}

export function calcularTotalesNegociacion({
  negociacion,
  valorVivienda,
  totalComprometido,
  interesesTotales,
  totalAbonado,
}: {
  negociacion: NegociacionTotalesInput
  valorVivienda: number
  totalComprometido: number
  interesesTotales: number
  totalAbonado: number
}): TotalesNegociacion {
  const baseTotal = interesesTotales > 0 ? totalComprometido : valorVivienda

  const saldo =
    interesesTotales > 0
      ? Math.max(0, baseTotal - totalAbonado)
      : (negociacion.saldo_pendiente ?? Math.max(0, baseTotal - totalAbonado))

  const pct =
    negociacion.porcentaje_pagado !== null &&
    negociacion.porcentaje_pagado !== undefined
      ? negociacion.porcentaje_pagado
      : baseTotal > 0
        ? Math.max(0, ((baseTotal - saldo) / baseTotal) * 100)
        : 0

  return { baseTotal, saldo, pctPagado: Math.min(pct, 100) }
}
