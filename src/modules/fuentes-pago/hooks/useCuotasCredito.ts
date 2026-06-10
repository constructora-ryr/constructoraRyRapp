/**
 * Hook: useCuotasCredito
 *
 * Thin wrapper sobre useCreditoConstructora que añade:
 * - proximaCuota: el período activo (En curso o Atrasado)
 * - progresoCredito: estadísticas de avance del plan
 */

'use client'

import { useMemo } from 'react'

import type { PeriodoCredito, ProgresoCredito, ProximaCuota } from '../types'

import { useCreditoConstructora } from './useCreditoConstructora'

interface UseCuotasCreditoProps {
  fuentePagoId: string
  negociacionId: string
}

export function useCuotasCredito({
  fuentePagoId,
  negociacionId: _negociacionId,
}: UseCuotasCreditoProps) {
  const inner = useCreditoConstructora({ fuentePagoId })

  // ─── Período activo (En curso o Atrasado más antiguo) ────────────────────
  const proximaCuota = useMemo<ProximaCuota | null>(() => {
    const activo = inner.periodos.find(
      p => p.estado_periodo === 'Atrasado' || p.estado_periodo === 'En curso'
    )
    if (!activo) return null
    return {
      id: activo.id,
      numero_cuota: activo.numero_cuota,
      fecha_vencimiento: activo.fecha_vencimiento,
      valor_cuota: activo.valor_cuota,
      deficit: activo.deficit,
      mora_sugerida: activo.mora_sugerida,
      estado: activo.estado_periodo as 'Atrasado' | 'En curso',
      dias_atraso: activo.dias_atraso,
    }
  }, [inner.periodos])

  // ─── Progreso global ─────────────────────────────────────────────────────
  const progresoCredito = useMemo<ProgresoCredito>(() => {
    const periodos = inner.periodos
    const credito = inner.credito
    if (!periodos.length || !credito) {
      return {
        totalCuotas: 0,
        cuotasCubiertas: 0,
        cuotasPendientes: 0,
        montoTotal: credito?.monto_total ?? 0,
        montoCubierto: 0,
        porcentaje: 0,
      }
    }
    const cubiertos = periodos.filter(p => p.estado_periodo === 'Cubierto')
    const montoCubierto = cubiertos.reduce((s, p) => s + p.valor_cuota, 0)
    return {
      totalCuotas: periodos.length,
      cuotasCubiertas: cubiertos.length,
      cuotasPendientes: periodos.length - cubiertos.length,
      montoTotal: credito.monto_total,
      montoCubierto,
      porcentaje:
        periodos.length > 0
          ? Math.round((cubiertos.length / periodos.length) * 100)
          : 0,
    }
  }, [inner.periodos, inner.credito])

  return {
    // Del inner hook
    credito: inner.credito,
    periodos: inner.periodos,
    resumen: inner.resumen,
    cargando: inner.cargando,
    procesando: inner.procesando,
    error: inner.error,
    recargar: inner.recargar,
    reestructurar: inner.reestructurar,
    crearPlan: inner.crearPlan,
    corregirFechaInicio: inner.corregirFechaInicio,
    saldoPendienteReal: inner.saldoPendienteReal,
    // Calculados
    proximaCuota,
    progresoCredito,
  }
}

// Alias para compatibilidad con código que use CuotaVigente
export type { PeriodoCredito as CuotaVigente }
