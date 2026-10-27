/**
 * ============================================
 * HOOK: useNegociacionDetalle (React Query)
 * ============================================
 *
 * Reemplaza la parte de "cargarDatosNegociacion()" de useAbonos.ts
 * Carga fuentes de pago + historial de abonos para UNA negociación.
 *
 * Consumidores: useAbonosDetalle.ts, page-new.tsx (detalle de cliente)
 */

'use client'

import { useMemo } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  obtenerFuentesPagoConAbonos,
  obtenerHistorialAbonos,
} from '../services/abonos.service'
import type { AbonoHistorial, FuentePagoConAbonos } from '../types'

import { negociacionesAbonosKeys } from './useNegociacionesAbonos'

// ============================================
// QUERY KEYS
// ============================================

export const negociacionDetalleKeys = {
  all: ['negociacion-detalle'] as const,
  fuentes: (negociacionId: string) =>
    [...negociacionDetalleKeys.all, 'fuentes', negociacionId] as const,
  historial: (negociacionId: string) =>
    [...negociacionDetalleKeys.all, 'historial', negociacionId] as const,
}

// ============================================
// HOOKS
// ============================================

/**
 * Carga las fuentes de pago de una negociación con caché.
 */
export function useFuentesPagoQuery(negociacionId: string | null) {
  return useQuery<FuentePagoConAbonos[]>({
    queryKey: negociacionDetalleKeys.fuentes(negociacionId ?? ''),
    queryFn: () => obtenerFuentesPagoConAbonos(negociacionId as string),
    enabled: !!negociacionId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
  })
}

/**
 * Carga el historial de abonos de una negociación con caché.
 */
export function useHistorialAbonosQuery(negociacionId: string | null) {
  return useQuery<AbonoHistorial[]>({
    queryKey: negociacionDetalleKeys.historial(negociacionId ?? ''),
    queryFn: () =>
      obtenerHistorialAbonos({ negociacion_id: negociacionId as string }),
    enabled: !!negociacionId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
  })
}

/**
 * Hook combinado: fuentes + historial de una negociación.
 * Equivalente completo a `cargarDatosNegociacion()` del viejo useAbonos.
 */
export function useNegociacionDetalle(negociacionId: string | null) {
  const fuentesQuery = useFuentesPagoQuery(negociacionId)
  const historialQuery = useHistorialAbonosQuery(negociacionId)

  const isLoading = fuentesQuery.isLoading || historialQuery.isLoading

  const historialActivo = useMemo(
    () =>
      (historialQuery.data ?? []).filter(
        a => !a.estado || a.estado === 'Activo'
      ),
    [historialQuery.data]
  )

  return {
    fuentesPago: fuentesQuery.data ?? [],
    historial: historialQuery.data ?? [],
    historialActivo,
    isLoading,
    error: fuentesQuery.error ?? historialQuery.error,
  }
}

// ============================================
// HELPER: Invalidar todo el detalle + lista padre
// ============================================

export function useInvalidateNegociacionDetalle() {
  const queryClient = useQueryClient()

  return (negociacionId?: string) => {
    // Invalidar detalle específico
    if (negociacionId) {
      queryClient.invalidateQueries({
        queryKey: negociacionDetalleKeys.fuentes(negociacionId),
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: negociacionDetalleKeys.historial(negociacionId),
        refetchType: 'all',
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: negociacionDetalleKeys.all,
        refetchType: 'all',
      })
    }
    // También invalidar la lista de negociaciones (porcentajes cambian)
    queryClient.invalidateQueries({
      queryKey: negociacionesAbonosKeys.all,
      refetchType: 'all',
    })
  }
}
