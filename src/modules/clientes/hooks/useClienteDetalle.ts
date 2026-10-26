/**
 * ============================================
 * HOOK: useClienteDetalle
 * ============================================
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 * Hook que maneja TODA la lógica de la vista de detalle del cliente.
 * Consolida los 5 useEffect del componente original.
 *
 * Responsabilidades:
 * - Recibe UUID del cliente (resolución de slug delegada al Server Component)
 * - Cargar datos del cliente con React Query
 * - Gestionar tabs activos
 * - Cargar categorías de documentos
 * - Escuchar eventos de actualización y cambio de tab
 * - Validar documento de identidad
 * - Cargar documentos del cliente
 */

import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'
import { useDocumentoIdentidad } from '@/modules/clientes/documentos/hooks/useDocumentoIdentidad'
import { useClienteQuery } from '@/modules/clientes/hooks'
import { useDocumentosQuery } from '@/shared/documentos/hooks/useDocumentosQuery'
import { CategoriasService } from '@/shared/documentos/services'
import { useDocumentosStore } from '@/shared/documentos/store/documentos.store'
import { usePestanaUrl } from '@/shared/hooks/usePestanaUrl'

interface UseClienteDetalleProps {
  clienteId: string // UUID del cliente (resuelto en el Server Component)
}

export type TabType =
  | 'general'
  | 'intereses'
  | 'negociacion'
  | 'negociaciones'
  | 'documentos'
  | 'historial'
  | 'vivienda-asignada'
  | 'fuentes-pago'

const PESTANAS = [
  'general',
  'intereses',
  'negociacion',
  'documentos',
  'historial',
] as const

export function useClienteDetalle({ clienteId }: UseClienteDetalleProps) {
  const { user } = useAuth()

  // =====================================================
  // ESTADO
  // =====================================================

  // clienteId ya es un UUID resuelto por el Server Component
  const clienteUUID = clienteId
  // Pestaña en la URL (?tab=historial): sobrevive a recargar y otros
  // módulos enlazan directo a una pestaña con conPestana()
  const [activeTab, setPestana] = usePestanaUrl(PESTANAS, 'general')
  const [modalInteresAbierto, setModalInteresAbierto] = useState(false)

  // =====================================================
  // STORES Y QUERIES
  // =====================================================

  // Store de documentos (GENÉRICO)
  const { modalSubirAbierto, cerrarModalSubir } = useDocumentosStore()

  // Función para cargar categorías (reemplaza método del store legacy)
  const cargarCategorias = useCallback(async () => {
    if (!user?.id) return
    try {
      await CategoriasService.obtenerCategoriasPorModulo(user.id, 'clientes')
    } catch (error) {
      logger.error('Error cargando categorías:', error)
    }
  }, [user?.id])

  // ✅ REACT QUERY: Cargar cliente automáticamente
  const {
    data: cliente,
    isLoading: loading,
    error,
    refetch: recargarCliente,
  } = useClienteQuery(clienteUUID)

  // ✅ Hook de validación de documento de identidad
  const { tieneCedula, cargando: cargandoValidacion } = useDocumentoIdentidad({
    clienteId: clienteUUID,
  })

  // ✅ Query de documentos para contador
  const { documentos: documentosCliente } = useDocumentosQuery(
    clienteUUID,
    'cliente'
  )

  // =====================================================
  // EFECTOS
  // =====================================================

  // 1. Cargar categorías al montar (si hay usuario)
  useEffect(() => {
    if (user?.id) {
      cargarCategorias()
    }
  }, [user?.id, cargarCategorias])

  // 2. Listener para actualización de cliente (cuando se sube cédula)
  useEffect(() => {
    const handleClienteActualizado = () => {
      recargarCliente()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('cliente-actualizado', handleClienteActualizado)
      return () =>
        window.removeEventListener(
          'cliente-actualizado',
          handleClienteActualizado
        )
    }
  }, [clienteUUID, recargarCliente])

  // =====================================================
  // ACCIONES
  // =====================================================

  /**
   * Cambiar tab activo programáticamente
   */
  const cambiarTab = useCallback(
    (tab: TabType) => {
      if ((PESTANAS as readonly string[]).includes(tab))
        setPestana(tab as (typeof PESTANAS)[number])
    },
    [setPestana]
  )

  /**
   * Abrir modal de registrar interés
   */
  const abrirModalInteres = useCallback(() => {
    setModalInteresAbierto(true)
  }, [])

  /**
   * Cerrar modal de registrar interés
   */
  const cerrarModalInteres = useCallback(() => {
    setModalInteresAbierto(false)
  }, [])

  /**
   * Cambiar a tab de documentos (usado desde otros tabs)
   */
  const irATabDocumentos = useCallback(() => {
    setPestana('documentos')
  }, [setPestana])

  // =====================================================
  // COMPUTED
  // =====================================================

  const totalDocumentos = documentosCliente?.length || 0

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    clienteUUID,
    cliente,
    loading,
    error,
    activeTab,
    modalInteresAbierto,

    // Validaciones
    tieneCedula,
    cargandoValidacion,

    // Documentos
    totalDocumentos,
    modalSubirAbierto,

    // Acciones
    cambiarTab,
    abrirModalInteres,
    cerrarModalInteres,
    cerrarModalSubir,
    recargarCliente,
    irATabDocumentos,
  }
}
