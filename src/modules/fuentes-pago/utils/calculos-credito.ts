/**
 * Cálculos financieros para crédito con la constructora
 *
 * Funciones PURAS — sin efectos secundarios, sin llamadas a BD.
 * Todas las tasas se reciben como parámetros (no hardcodeadas).
 *
 * Fórmula: Interés Simple
 *   interes_total = capital × (tasaMensual / 100) × numCuotas
 *   valor_cuota   = (capital + interes_total) / numCuotas
 *
 * Decisión de diseño:
 *   - Se usa interés simple (no compuesto) para transparencia con el cliente
 *   - La mora se calcula desde tasa_mora_diaria que viene de BD (no hardcodeada)
 *   - Los cálculos producen valores enteros (Math.round) para evitar centavos flotantes
 */

import type { CuotaCalculo, ParametrosCredito, ResumenCredito } from '../types'

// ============================================================
// TABLA DE AMORTIZACIÓN
// ============================================================

/**
 * Calcula la tabla de amortización completa con interés simple.
 *
 * @param params - Capital, tasa mensual (%), número de cuotas y fecha de inicio
 * @returns Resumen financiero + array de cuotas con fecha y desglose
 */
export function calcularTablaAmortizacion(
  params: ParametrosCredito
): ResumenCredito {
  const { capital, tasaMensual, numCuotas, fechaInicio } = params

  if (capital <= 0) throw new Error('El capital debe ser mayor a 0')
  if (tasaMensual <= 0 || tasaMensual > 10)
    throw new Error('La tasa mensual debe estar entre 0 y 10%')
  if (numCuotas < 1 || numCuotas > 360)
    throw new Error('El número de cuotas debe estar entre 1 y 360')

  const tasa = tasaMensual / 100
  const interesTotal = Math.round(capital * tasa * numCuotas)
  const montoTotal = capital + interesTotal
  const valorCuota = Math.round(montoTotal / numCuotas)
  const capitalPorCuota = Math.round(capital / numCuotas)
  const interesPorCuota = Math.round(interesTotal / numCuotas)

  // La última cuota absorbe el residuo del redondeo para que la suma exacta = montoTotal.
  // Ej: $19.504.000 / 12 = $1.625.333,33 → redondeado $1.625.333 × 12 = $19.503.996 (faltan $4).
  const valorUltimaCuota = montoTotal - valorCuota * (numCuotas - 1)

  const cuotas: CuotaCalculo[] = Array.from({ length: numCuotas }, (_, i) => {
    const esUltima = i === numCuotas - 1
    const fecha = new Date(
      fechaInicio.getFullYear(),
      fechaInicio.getMonth() + i + 1,
      fechaInicio.getDate()
    )
    return {
      numero: i + 1,
      fechaVencimiento: fecha,
      valorCuota: esUltima ? valorUltimaCuota : valorCuota,
      capitalPorCuota,
      interesPorCuota,
    }
  })

  return {
    capital,
    interesTotal,
    montoTotal,
    valorCuotaMensual: valorCuota,
    cuotas,
  }
}

// ============================================================
// CÁLCULO DE MORA
// ============================================================

/**
 * Sugiere la mora para una cuota vencida.
 *
 * La tasa viene de creditos_constructora.tasa_mora_diaria (no hardcodeada).
 * El admin puede ajustar el valor sugerido antes de aplicarlo.
 *
 * @param valorCuota        - Valor original de la cuota (sin mora)
 * @param fechaVencimiento  - Fecha de vencimiento de la cuota
 * @param tasaMoraDiaria    - Tasa diaria desde BD (ej: 0.001 = 0.1% diario)
 * @returns Mora sugerida redondeada a entero
 */
export function calcularMoraSugerida(
  valorCuota: number,
  fechaVencimiento: Date,
  tasaMoraDiaria: number
): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const vence = new Date(fechaVencimiento)
  vence.setHours(0, 0, 0, 0)

  const diasVencido = Math.max(
    0,
    Math.floor((hoy.getTime() - vence.getTime()) / (1000 * 60 * 60 * 24))
  )

  return Math.round(valorCuota * tasaMoraDiaria * diasVencido)
}

// ============================================================
// CÁLCULO DE CAPITAL PENDIENTE
// ============================================================

/**
 * Calcula el capital pendiente para reestructurar un crédito.
 *
 * Principio: cuotas pagadas cubrieron capitalPorCuota × n_pagadas.
 * El resto es el capital que queda por pagar.
 *
 * @param capitalOriginal   - Capital del crédito original
 * @param numCuotasTotal    - Total de cuotas del plan original
 * @param numCuotasPagadas  - Cuántas cuotas se han marcado como Pagadas
 * @returns Capital pendiente para el nuevo plan
 */
/**
 * Suma N meses a una fecha preservando el día del mes.
 */
export function sumarMeses(fecha: Date, meses: number): Date {
  return new Date(
    fecha.getFullYear(),
    fecha.getMonth() + meses,
    fecha.getDate()
  )
}

export function calcularCapitalPendiente(
  capitalOriginal: number,
  numCuotasTotal: number,
  numCuotasPagadas: number
): number {
  const capitalPorCuota = Math.round(capitalOriginal / numCuotasTotal)
  const capitalPagado = capitalPorCuota * numCuotasPagadas
  return Math.max(0, capitalOriginal - capitalPagado)
}

// ============================================================
// FORMATO DE FECHAS PARA CUOTAS (sin efectos de timezone)
// ============================================================

/**
 * Convierte un Date a string YYYY-MM-DD para guardar en BD.
 * Usa los componentes locales del Date para evitar timezone shift.
 */
export function fechaCuotaParaBD(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
