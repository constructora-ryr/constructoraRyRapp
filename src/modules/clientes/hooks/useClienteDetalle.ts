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

export function useClienteDetalle({ clienteId }: UseClienteDetalleProps) {
  const { user } = useAuth()

  // =====================================================
  // ESTADO
  // =====================================================

  // clienteId ya es un UUID resuelto por el Server Component
  const clienteUUID = clienteId
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [modalInteresAbierto, setModalInteresAbierto] = useState(false)

  // Activar tab desde intent guardado en sessionStorage (p.ej. desde módulo Abonos)
  useEffect(() => {
    const intent = sessionStorage.getItem('cliente-tab-intent')
    if (
      intent &&
      [
        'general',
        'intereses',
        'negociacion',
        'documentos',
        'historial',
      ].includes(intent)
    ) {
      setActiveTab(intent as TabType)
      sessionStorage.removeItem('cliente-tab-intent')
    }
  }, [])

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
  const cambiarTab = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

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
    setActiveTab('documentos')
  }, [])

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
