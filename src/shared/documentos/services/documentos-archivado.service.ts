// ============================================
// SERVICE: Documentos - Archivado
// ============================================
// Responsabilidad: Archivar / restaurar del archivo / consultar archivados

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { auditService } from '@/services/audit.service'

import type {
  DocumentoProyecto,
  DocumentoRegistroComun,
} from '../types/documento.types'
import {
  type TipoEntidad,
  obtenerConfiguracionEntidad,
} from '../types/entidad.types'

export class DocumentosArchivadoService {
  /** Archivar documento completo (todas las versiones) */
  static async archivarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad,
    motivoCategoria?: string,
    motivoDetalle?: string
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data: documentoResult, error: getError } = await supabase
      .from(tabla)
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult as unknown as DocumentoRegistroComun

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { error } = await supabase
      .from(tabla)
      .update({
        estado: 'archivado',
        motivo_categoria: motivoCategoria || null,
        motivo_detalle: motivoDetalle || null,
      })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    if (error) throw error

    if (tipoEntidad === 'cliente') {
      try {
        const { data: docCompleto } = await supabase
          .from(tabla as 'documentos_cliente')
          .select('id, titulo, cliente_id')
          .eq('id', documentoPadreId)
          .single()

        if (docCompleto) {
          await auditService.registrarAccion({
            tabla: 'documentos_cliente',
            accion: 'UPDATE',
            registroId: documentoPadreId,
            datosNuevos: { estado: 'archivado' },
            metadata: {
              cliente_id: (docCompleto as unknown as Record<string, unknown>)
                .cliente_id,
              titulo: (docCompleto as unknown as Record<string, unknown>)
                .titulo,
              motivo_categoria: motivoCategoria || null,
              motivo_detalle: motivoDetalle || null,
              tipo_operacion: 'ARCHIVAR_DOCUMENTO',
            },
            modulo: 'clientes',
          })
        }
      } catch (e) {
        logger.warn('Auditoría de archivado de documento falló:', e)
      }
    }
  }

  /** Restaurar documento archivado (todas las versiones) */
  static async restaurarDocumentoArchivado(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data: documentoResult, error: getError } = await supabase
      .from(tabla)
      .select('id, documento_padre_id')
      .eq('id', documentoId)
      .single()
    const documento = documentoResult as unknown as DocumentoRegistroComun

    if (getError) throw getError
    if (!documento) throw new Error('Documento no encontrado')

    const documentoPadreId = documento.documento_padre_id || documentoId

    const { error } = await supabase
      .from(tabla)
      .update({ estado: 'activo' })
      .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

    if (error) throw error

    if (tipoEntidad === 'cliente') {
      try {
        const { data: docCompleto } = await supabase
          .from(tabla as 'documentos_cliente')
          .select('id, titulo, cliente_id')
          .eq('id', documentoPadreId)
          .single()

        if (docCompleto) {
          await auditService.registrarAccion({
            tabla: 'documentos_cliente',
            accion: 'UPDATE',
            registroId: documentoPadreId,
            datosNuevos: { estado: 'activo' },
            metadata: {
              cliente_id: (docCompleto as unknown as Record<string, unknown>)
                .cliente_id,
              titulo: (docCompleto as unknown as Record<string, unknown>)
                .titulo,
              tipo_operacion: 'RESTAURAR_DOCUMENTO_ARCHIVADO',
            },
            modulo: 'clientes',
          })
        }
      } catch (e) {
        logger.warn('Auditoría de restauración de documento falló:', e)
      }
    }
  }

  /** Obtener documentos archivados de una entidad */
  static async obtenerDocumentosArchivados(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = config.tabla

    const { data, error } = await supabase
      .from(tabla)
      .select(
        `
        *,
        usuario:usuarios!${config.fkSubidoPor} (
          nombres,
          apellidos,
          email,
          rol
        )
      `
      )
      .eq(config.campoEntidad, entidadId)
      .eq('estado', 'archivado')
      .eq('es_version_actual', true)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }
}
