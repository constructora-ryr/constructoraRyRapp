'use client'

/**
 * HOOK: useDescuentoMutation
 *
 * Mutación para aplicar/modificar descuento en una negociación.
 * El trigger `calcular_valor_total_pagar()` recalcula automáticamente
 * el valor_total_pagar después del UPDATE.
 */

import { useCallback, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'
import {
  LABELS_TIPO_DESCUENTO,
  TIPOS_DESCUENTO,
  type TipoDescuento,
} from '@/modules/clientes/constants/descuento.constants'
import { negociacionesQueryKeys } from '@/modules/clientes/hooks/useNegociacionesQuery'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'

export { LABELS_TIPO_DESCUENTO, TIPOS_DESCUENTO, type TipoDescuento }

export interface DatosDescuento {
  /** null limpia el campo en BD al quitar el descuento */
  descuento_aplicado: number | null
  /** null cuando se elimina el descuento (limpia el campo en BD) */
  tipo_descuento: TipoDescuento | null
  /** null cuando se elimina el descuento (limpia el campo en BD) */
  motivo_descuento: string | null
}

// ============================================
// HOOK
// ============================================

interface UseDescuentoMutationProps {
  negociacionId?: string
  clienteId: string
}

export function useDescuentoMutation({
  negociacionId,
  clienteId,
}: UseDescuentoMutationProps) {
  const queryClient = useQueryClient()
  const [modalDescuentoOpen, setModalDescuentoOpen] = useState(false)

  const openDescuento = useCallback(() => setModalDescuentoOpen(true), [])
  const closeDescuento = useCallback(() => setModalDescuentoOpen(false), [])

  const descuentoMutation = useMutation({
    mutationFn: async (datos: DatosDescuento) => {
      if (!negociacionId) throw new Error('No hay negociación activa')

      return negociacionesService.actualizarNegociacion(negociacionId, {
        descuento_aplicado: datos.descuento_aplicado,
        tipo_descuento: datos.tipo_descuento,
        motivo_descuento: datos.motivo_descuento,
      })
    },
    onSuccess: () => {
      // Invalidar negociaciones del cliente (para que valor_total_pagar se actualice)
      queryClient.invalidateQueries({
        queryKey: negociacionesQueryKeys.byCliente(clienteId),
      })
      // Invalidar fuentes de pago (para recalcular balance)
      queryClient.invalidateQueries({
        queryKey: ['fuentes-pago-neg-tab', negociacionId],
      })
      toast.success('Descuento aplicado correctamente')
      closeDescuento()
    },
    onError: (error: Error) => {
      logger.error('Error aplicando descuento:', error)
      toast.error(
        error.message || 'Error al aplicar descuento. Intenta nuevamente.'
      )
    },
  })

  return {
    modalDescuentoOpen,
    openDescuento,
    closeDescuento,
    isAplicandoDescuento: descuentoMutation.isPending,
    handleAplicarDescuento: descuentoMutation.mutate,
  }
}
