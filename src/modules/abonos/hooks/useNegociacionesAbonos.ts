/**
 * ============================================
 * HOOK: useNegociacionesAbonos (React Query)
 * ============================================
 *
 * Reemplaza la parte de "cargar negociaciones" de useAbonos.ts
 * Usa React Query para caché inteligente + invalidación automática.
 *
 * Consumidores: abonos-page-main.tsx (vista principal de clientes)
 */

'use client'

import { useMemo } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { obtenerNegociacionesActivas } from '../services/abonos.service'
import type { NegociacionConAbonos } from '../types'

// ============================================
// QUERY KEYS
// ============================================

export const negociacionesAbonosKeys = {
  all: ['negociaciones-abonos'] as const,
  lists: () => [...negociacionesAbonosKeys.all, 'list'] as const,
  details: () => [...negociacionesAbonosKeys.all, 'detail'] as const,
  detail: (id: string) => [...negociacionesAbonosKeys.details(), id] as const,
}

// ============================================
// TIPOS
// ============================================

interface EstadisticasNegociaciones {
  totalNegociaciones: number
  totalAbonado: number
  totalVentas: number
  saldoPendiente: number
}

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook para obtener negociaciones activas con caché.
 * Equivalente a la parte de `cargarNegociaciones()` del viejo useAbonos.
 */
export function useNegociacionesAbonos() {
  const {
    data: negociaciones = [],
    isLoading,
    error,
    refetch: refrescar,
  } = useQuery<NegociacionConAbonos[]>({
    queryKey: negociacionesAbonosKeys.lists(),
    queryFn: obtenerNegociacionesActivas,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
  })

  const estadisticas = useMemo<EstadisticasNegociaciones>(
    () => ({
      totalNegociaciones: negociaciones.length,
      totalAbonado: negociaciones.reduce(
        (sum, n) => sum + (n.total_abonado || 0),
        0
      ),
      // Obligación real (con gastos y recargos): la misma base del saldo y del %
      totalVentas: negociaciones.reduce(
        (sum, n) => sum + (n.valor_total_pagar || n.valor_total || 0),
        0
      ),
      saldoPendiente: negociaciones.reduce(
        (sum, n) => sum + (n.saldo_pendiente || 0),
        0
      ),
    }),
    [negociaciones]
  )

  return {
    negociaciones,
    isLoading,
    error: error as Error | null,
    estadisticas,
    refrescar,
  }
}

// ============================================
// HELPER: Invalidar caché (uso externo)
// ============================================

export function useInvalidateNegociacionesAbonos() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: negociacionesAbonosKeys.all,
      refetchType: 'all',
    })
}
