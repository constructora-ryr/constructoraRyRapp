'use client'

import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'

import { DocumentosEliminacionService } from '../services/documentos-eliminacion.service'
import type { TablaDocumento, TipoEntidad } from '../types/entidad.types'

export interface ConfirmacionEliminarState {
  isOpen: boolean
  detectando: boolean
  esDocumentoCritico: boolean
  esDocumentoIdentidad: boolean
  entidadAfectada: string | null
  documentoId: string | null
  totalVersiones: number
}

const ESTADO_INICIAL: ConfirmacionEliminarState = {
  isOpen: false,
  detectando: false,
  esDocumentoCritico: false,
  esDocumentoIdentidad: false,
  entidadAfectada: null,
  documentoId: null,
  totalVersiones: 1,
}

const TABLAS_POR_ENTIDAD: Record<TipoEntidad, TablaDocumento> = {
  proyecto: 'documentos_proyecto',
  cliente: 'documentos_cliente',
  vivienda: 'documentos_vivienda',
}

interface DocumentoParaEliminar {
  id: string
  documento_padre_id?: string | null
  requisito_config_id?: string | null
  fuente_pago_relacionada?: string | null
  metadata?: Record<string, unknown> | null
  entidad?: string | null
  es_documento_identidad?: boolean | null
}

async function detectarCriticidad(
  documento: DocumentoParaEliminar
): Promise<{ esCritico: boolean; entidad: string | null }> {
  // Con el FK requisito_config_id, la criticidad se detecta directamente:
  // - Subido desde el banner → requisito_config_id NOT NULL → crítico
  // - Subido con vinculación manual a fuente → fuente_pago_relacionada NOT NULL → crítico
  const esCritico =
    !!documento.requisito_config_id || !!documento.fuente_pago_relacionada
  const entidad =
    (documento.metadata?.entidad_fuente as string | undefined) ??
    documento.entidad ??
    null
  return { esCritico, entidad }
}

async function contarVersionesActivas(
  documento: DocumentoParaEliminar,
  tipoEntidad: TipoEntidad
): Promise<number> {
  const tabla = TABLAS_POR_ENTIDAD[tipoEntidad]
  const padreId = documento.documento_padre_id || documento.id
  const { count } = await supabase
    .from(tabla)
    .select('*', { count: 'exact', head: true })
    .or(`id.eq.${padreId},documento_padre_id.eq.${padreId}`)
    .eq('estado', 'activo')
  return count ?? 1
}

/**
 * Hook para eliminar documentos con confirmación inteligente.
 *
 * Dos flujos de uso:
 *
 * A) El componente maneja su propia lógica de refresh (DocumentoCard):
 *    - Llama abrirConfirmacion(doc, tipoEntidad)
 *    - Renderiza ConfirmacionModal con onConfirm = su propia función de borrado
 *
 * B) El hook maneja todo (SeccionDocumentosIdentidad, etc.):
 *    - Llama abrirConfirmacion(doc, tipoEntidad)
 *    - Renderiza ConfirmacionModal con onConfirm = ejecutarEliminacion(tipoEntidad, onSuccess)
 */
export function useEliminarDocumento() {
  const [confirmacion, setConfirmacion] =
    useState<ConfirmacionEliminarState>(ESTADO_INICIAL)
  const [eliminando, setEliminando] = useState(false)
  const queryClient = useQueryClient()

  const abrirConfirmacion = async (
    documento: DocumentoParaEliminar,
    tipoEntidad: TipoEntidad = 'cliente'
  ) => {
    // Detectar primero, abrir después → sin flash de modal intermedio
    const [criticidad, totalVersiones] = await Promise.all([
      detectarCriticidad(documento),
      contarVersionesActivas(documento, tipoEntidad),
    ])

    setConfirmacion({
      isOpen: true,
      detectando: false,
      esDocumentoCritico: criticidad.esCritico,
      esDocumentoIdentidad: !!documento.es_documento_identidad,
      entidadAfectada: criticidad.entidad,
      documentoId: documento.id,
      totalVersiones,
    })
  }

  const cerrarConfirmacion = () => {
    setConfirmacion(prev => ({ ...prev, isOpen: false }))
  }

  /**
   * Ejecuta el borrado en BD. Usar cuando el hook maneja toda la lógica.
   * Si el componente padre tiene su propio handler (ej: DocumentoCard con onDelete prop),
   * llamar ese handler directamente en onConfirm del modal en lugar de esto.
   */
  const ejecutarEliminacion = async (
    tipoEntidad: TipoEntidad,
    onSuccess?: () => void
  ) => {
    if (!confirmacion.documentoId) return
    setEliminando(true)
    try {
      await DocumentosEliminacionService.eliminarDocumento(
        confirmacion.documentoId,
        tipoEntidad
      )
      // Si era un documento crítico, el pendiente vuelve a aparecer en la vista SQL
      // inmediatamente — invalidar cache de React Query para que se muestre al instante
      if (confirmacion.esDocumentoCritico) {
        await queryClient.invalidateQueries({
          queryKey: ['documentos-pendientes'],
        })
      }
      onSuccess?.()
      cerrarConfirmacion()
    } finally {
      setEliminando(false)
    }
  }

  return {
    abrirConfirmacion,
    cerrarConfirmacion,
    ejecutarEliminacion,
    confirmacion,
    eliminando,
  }
}
