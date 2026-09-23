'use client'

/**
 * HOOK: useRebalanceoMutation
 *
 * Mutación atómica para rebalancear el plan financiero de una negociación.
 * Usa la RPC `rebalancear_plan_financiero` de PostgreSQL para garantizar
 * que TODO se ejecuta o NADA se persiste.
 */

import { useCallback, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { documentosPendientesKeys } from '@/modules/clientes/types/documentos-pendientes.types'
import { formatCurrency } from '@/shared/utils/format'

// Convierte "$127576000" → "$ 127.576.000" en mensajes de error del servidor
function formatearMensajeErrorRebalanceo(msg: string): string {
  if (!msg) return 'Error al ajustar el cierre financiero. Intenta nuevamente.'
  return msg.replace(/\$(\d+)/g, (_, n) => formatCurrency(parseInt(n, 10)))
}

import type { DatosAjusteCierreFinanciero } from './useNegociacionTab'

interface UseAjusteCierreFinancieroProps {
  negociacionId?: string
  clienteId: string
  valorVivienda: number
}

export function useAjusteCierreFinanciero({
  negociacionId,
  clienteId,
  valorVivienda,
}: UseAjusteCierreFinancieroProps) {
  const queryClient = useQueryClient()
  const [modalAjusteOpen, setModalAjusteOpen] = useState(false)

  const openAjuste = useCallback(() => setModalAjusteOpen(true), [])
  const closeAjuste = useCallback(() => setModalAjusteOpen(false), [])

  const ajusteMutation = useMutation({
    mutationFn: async ({
      ajustes,
      nuevas,
      motivo,
      notas,
    }: DatosAjusteCierreFinanciero) => {
      // Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const payload = {
        negociacion_id: negociacionId,
        usuario_id: user?.id ?? null,
        motivo,
        notas: notas || null,
        valor_vivienda: valorVivienda,
        cliente_id: clienteId,
        ajustes: ajustes.map(a => ({
          id: a.id,
          tipo: a.tipo,
          montoOriginal: a.montoOriginal,
          montoEditable: a.montoEditable,
          entidad: a.entidad,
          entidadEditable: a.entidadEditable,
          paraEliminar: a.paraEliminar,
        })),
        nuevas: nuevas.map(n => ({
          tipo: n.tipo,
          monto: n.monto,
          entidad: n.entidad || '',
        })),
      }

      const { data, error } = await supabase.rpc(
        'rebalancear_plan_financiero',
        { p_payload: payload }
      )

      if (error) throw error

      const result = data as { success: boolean; error?: string } | null
      if (result && !result.success)
        throw new Error(result.error || 'Error en rebalanceo')

      return data
    },
    onSuccess: (_, { motivo }) => {
      queryClient.invalidateQueries({
        queryKey: ['fuentes-pago-neg-tab', negociacionId],
      })
      queryClient.invalidateQueries({
        queryKey: documentosPendientesKeys.byCliente(clienteId),
      })
      queryClient.invalidateQueries({
        queryKey: ['docs-pendientes-neg-tab', clienteId],
      })
      toast.success('Cierre financiero ajustado', {
        description: motivo ? `Motivo: ${motivo}` : undefined,
      })
      closeAjuste()
    },
    onError: (error: Error) => {
      logger.error(
        '[useAjusteCierreFinanciero] Error al ajustar cierre financiero:',
        error.message
      )
      toast.error(formatearMensajeErrorRebalanceo(error.message))
    },
  })

  return {
    modalAjusteOpen,
    openAjuste,
    closeAjuste,
    isAjustando: ajusteMutation.isPending,
    handleGuardarAjuste: ajusteMutation.mutate,
  }
}
