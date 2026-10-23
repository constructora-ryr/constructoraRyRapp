'use client'

/**
 * ============================================
 * HOOK: useDocumentosPendientesObligatorios
 * ============================================
 *
 * Fuente única de datos para documentos OBLIGATORIOS pendientes de un cliente.
 * Comparte exactamente el mismo cache (queryKey) que useDocumentosPendientes,
 * usando el option `select` de React Query para filtrar y transformar los datos
 * sin hacer una segunda llamada a la red.
 *
 * Consumidores actuales:
 *   - useAbonosDetalle (valida todas las fuentes de una negociación)
 *
 * Para filtrar por fuente específica, usar filtrarPendientesPorFuente()
 * de @/modules/clientes/utils/documentos-pendientes.utils
 */

import { useQuery } from '@tanstack/react-query'

import { fetchDocumentosPendientesPorCliente } from '@/modules/clientes/services/documentos-pendientes.service'
import { documentosPendientesKeys } from '@/modules/clientes/types/documentos-pendientes.types'

import type { DocPendienteRaw } from '../utils/documentos-pendientes.utils'

// ============================================
// HOOK
// ============================================

/**
 * Retorna todos los documentos OBLIGATORIOS pendientes del cliente.
 * ✅ Mismo queryKey que useDocumentosPendientes → un solo fetch/cache compartido.
 * Listo para pasar a filtrarPendientesPorFuente().
 */
export function useDocumentosPendientesObligatorios(
  clienteId: string | undefined
) {
  const safeClienteId = clienteId ?? null

  return useQuery({
    queryKey: safeClienteId
      ? documentosPendientesKeys.byCliente(safeClienteId)
      : ['disabled'],
    queryFn: () => {
      if (!safeClienteId) {
        throw new Error('Cliente ID requerido')
      }

      return fetchDocumentosPendientesPorCliente(safeClienteId)
    },
    enabled: !!safeClienteId,
    staleTime: 1000 * 30, // 30 s — coincide con useDocumentosPendientes
    gcTime: 1000 * 60 * 30, // 30 min en memoria (coincide con useDocumentosPendientes)
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
    // 🔑 select: extrae solo OBLIGATORIOS mapeados a DocPendienteRaw
    // Los datos completos siguen en cache; este hook devuelve la vista filtrada
    select: (data): DocPendienteRaw[] =>
      data
        .filter(
          d =>
            (d.metadata as Record<string, unknown>)?.nivel_validacion ===
            'DOCUMENTO_OBLIGATORIO'
        )
        .map(d => {
          const meta = d.metadata as Record<string, unknown> | null
          return {
            fuente_pago_id: d.fuente_pago_id,
            alcance: (meta?.alcance as string) ?? null,
            nivel_validacion: 'DOCUMENTO_OBLIGATORIO',
            tipo_documento: d.tipo_documento,
            tipo_documento_sistema:
              (meta?.tipo_documento_sistema as string) ?? null,
            fuentes_aplicables: (meta?.fuentes_aplicables as string[]) ?? null,
          }
        }),
  })
}
