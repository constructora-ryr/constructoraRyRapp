'use client'

/**
 * useResumenNegociacion
 *
 * Fetches fuentes de pago para la negociación y calcula los mismos totales
 * que useNegociacionTab, de modo que el ResumenNegociacion en Información
 * General muestre exactamente los mismos números que el banner del tab
 * Negociación.
 */

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
import type { Negociacion } from '@/modules/clientes/types'
import { calcularTotalesNegociacion } from '@/modules/clientes/utils/totales-negociacion'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'

interface UseResumenNegociacionProps {
  negociacion: Negociacion
}

export function useResumenNegociacion({
  negociacion,
}: UseResumenNegociacionProps) {
  // Valor base de la vivienda (sin intereses)
  const valorVivienda =
    negociacion.valor_total_pagar ?? negociacion.valor_total ?? 0

  // Fuentes de pago (misma query key que useNegociacionTab para reutilizar caché)
  const { data: fuentesPago = [], isLoading: cargandoFuentes } = useQuery({
    queryKey: ['fuentes-pago-neg-tab', negociacion.id],
    queryFn: () =>
      fuentesPagoService.obtenerFuentesPagoNegociacion(negociacion.id),
    staleTime: 30_000,
  })

  // Total comprometido = suma de monto_aprobado (incluye capital + intereses)
  const totalComprometido = useMemo(
    () => fuentesPago.reduce((sum, f) => sum + (f.monto_aprobado ?? 0), 0),
    [fuentesPago]
  )

  // Intereses = diferencia entre totalComprometido y valorVivienda (si hay crédito constructora)
  const interesesTotales = useMemo(() => {
    const tieneCredito = fuentesPago.some(f => esCreditoConstructora(f.tipo))
    if (!tieneCredito) return 0
    return Math.max(0, totalComprometido - valorVivienda)
  }, [fuentesPago, totalComprometido, valorVivienda])

  const totalAbonadoDB = negociacion.total_abonado ?? 0

  const { saldo, pctPagado } = calcularTotalesNegociacion({
    negociacion,
    valorVivienda,
    totalComprometido,
    interesesTotales,
    totalAbonado: totalAbonadoDB,
  })

  // totalAbonado: siempre el valor real de la BD (lo que el trigger calculó).
  const totalAbonado = totalAbonadoDB

  return {
    cargandoFuentes,
    valorVivienda,
    totalComprometido,
    interesesTotales,
    totalAbonado,
    saldo,
    pctPagado,
  }
}
