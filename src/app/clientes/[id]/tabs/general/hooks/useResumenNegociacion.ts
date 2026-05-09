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

  // Total abonado para mostrar en UI.
  // Cuando hay intereses del crédito constructora, total_abonado en DB solo suma capital
  // (el trigger excluye mora_incluida). El valor real pagado = baseTotal - saldo.
  // Para eso necesitamos baseTotal primero (calculado abajo), así que usamos un helper:
  const totalAbonadoDB = negociacion.total_abonado ?? 0

  // Base para saldo y % — incluye intereses cuando corresponde
  const baseTotal = interesesTotales > 0 ? totalComprometido : valorVivienda

  // Saldo — usar siempre el campo calculado por el trigger de BD.
  const saldo =
    negociacion.saldo_pendiente ?? Math.max(0, baseTotal - totalAbonadoDB)

  // totalAbonado para display: cuando hay intereses, el DB solo suma capital.
  // El real = baseTotal - saldo (lo que falta para llegar al total comprometido).
  const totalAbonado =
    interesesTotales > 0 ? Math.max(0, baseTotal - saldo) : totalAbonadoDB

  // Porcentaje pagado — usar siempre el campo de BD cuando está disponible
  const pctPagado =
    negociacion.porcentaje_pagado !== null &&
    negociacion.porcentaje_pagado !== undefined
      ? negociacion.porcentaje_pagado
      : baseTotal > 0
        ? Math.max(0, ((baseTotal - saldo) / baseTotal) * 100)
        : 0

  return {
    cargandoFuentes,
    valorVivienda,
    totalComprometido,
    interesesTotales,
    totalAbonado,
    saldo,
    pctPagado: Math.min(pctPagado, 100),
  }
}
