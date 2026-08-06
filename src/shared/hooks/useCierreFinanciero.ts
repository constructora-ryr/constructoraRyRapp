/**
 * useCierreFinanciero — Single source of truth for balance-equation calculations.
 *
 * The "cierre financiero" verifies that the sum of all payment sources covers
 * 100% of the property value. For credits that generate installments
 * (Crédito con la Constructora), only the capital portion counts — interest
 * is excluded via `capital_para_cierre`.
 *
 * Formula:  totalParaCierre = Σ (capital_para_cierre ?? monto_aprobado)
 *           diferencia      = valorVivienda − totalParaCierre
 *           estaBalanceado  = diferencia ≤ TOLERANCE  (excedente is valid)
 */

import { useMemo } from 'react'

// ─── Constants ────────────────────────────────────────────────────

const TOLERANCE = 1 // COP — standard: $1 tolerance

// ─── Pure calculation (testable without React) ────────────────────

interface FuenteParaCierre {
  tipo: string
  monto_aprobado: number
  capital_para_cierre?: number | null
}

export interface CierreFinancieroResult {
  /** Sum using capital_para_cierre ?? monto_aprobado */
  totalParaCierre: number
  /** valorVivienda − totalParaCierre */
  diferencia: number
  /** (totalParaCierre / valorVivienda) * 100, clamped 0–100 */
  porcentajeCubierto: number
  /** true when |diferencia| < TOLERANCE */
  estaBalanceado: boolean
}

export function calcularCierreFinanciero(
  fuentes: FuenteParaCierre[],
  valorVivienda: number
): CierreFinancieroResult {
  const totalParaCierre = fuentes.reduce(
    (sum, f) => sum + (f.capital_para_cierre ?? f.monto_aprobado ?? 0),
    0
  )

  const diferencia = valorVivienda - totalParaCierre

  const porcentajeCubierto =
    valorVivienda > 0
      ? Math.min(Math.round((totalParaCierre / valorVivienda) * 100), 100)
      : 0

  return {
    totalParaCierre,
    diferencia,
    porcentajeCubierto,
    estaBalanceado: diferencia <= TOLERANCE,
  }
}

// ─── React hook wrapper (memoised) ────────────────────────────────

export function useCierreFinanciero(
  fuentes: FuenteParaCierre[],
  valorVivienda: number
): CierreFinancieroResult {
  return useMemo(
    () => calcularCierreFinanciero(fuentes, valorVivienda),
    [fuentes, valorVivienda]
  )
}
