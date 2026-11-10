/**
 * SERVICE: Documentos — Queries (lecturas)
 * Todos los métodos de lectura de documentos, separados de las mutaciones.
 */
import { supabase } from '@/lib/supabase/client'
import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'
import {
  obtenerConfiguracionEntidad,
  type TipoEntidad,
} from '@/shared/documentos/types/entidad.types'

type TablaDocumentos =
  | 'documentos_proyecto'
  | 'documentos_vivienda'
  | 'documentos_cliente'

function getTablaDocumentos(tipoEntidad: TipoEntidad): TablaDocumentos {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  return config.tabla as TablaDocumentos
}

export class DocumentosQueriesService {
  /**
   * Obtener todos los documentos de una entidad.
   * JOIN directo con FK usuarios!subido_por (evita N+1).
   */
  static async obtenerDocumentosPorEntidad(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = getTablaDocumentos(tipoEntidad)

    const { data, error } = await supabase
      .from(tabla)
      .select(
        `
        *,
        usuarios!subido_por(id, nombres, apellidos, email, rol)
      `
      )
      .eq(config.campoEntidad, entidadId)
      .in('estado', ['activo', 'archivado'])
      .eq('es_version_actual', true)
      .order('es_importante', { ascending: false })
      .order('fecha_creacion', { ascending: false })

    if (error) throw error

    const documentos = (data || []).map(doc => ({
      ...doc,
      usuario: doc.usuarios,
      usuarios: undefined,
    }))

    return documentos as DocumentoProyecto[]
  }

  /** @deprecated Usar obtenerDocumentosPorEntidad con tipoEntidad='proyecto' */
  static obtenerDocumentosPorProyecto(
    proyectoId: string
  ): Promise<DocumentoProyecto[]> {
    return DocumentosQueriesService.obtenerDocumentosPorEntidad(
      proyectoId,
      'proyecto'
    )
  }

  /** Obtener documentos por categoría. */
  static async obtenerDocumentosPorCategoria(
    entidadId: string,
    categoriaId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = getTablaDocumentos(tipoEntidad)

    const { data, error } = await supabase
      .from(tabla)
      .select(
        `
        *,
        usuarios!subido_por(id, nombres, apellidos, email, rol)
      `
      )
      .eq(config.campoEntidad, entidadId)
      .eq('categoria_id', categoriaId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .order('version', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /** Obtener documentos próximos a vencer. */
  static async obtenerDocumentosProximosAVencer(
    diasAntes = 30,
    tipoEntidad?: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + diasAntes)

    if (tipoEntidad) {
      const config = obtenerConfiguracionEntidad(tipoEntidad)

      const { data, error } = await supabase
        .from(config.tabla)
        .select(
          `
          *,
          usuarios!subido_por(id, nombres, apellidos, email, rol)
        `
        )
        .eq('estado', 'activo')
        .eq('es_version_actual', true)
        .not('fecha_vencimiento', 'is', null)
        .lte('fecha_vencimiento', fechaLimite.toISOString())
        .order('fecha_vencimiento', { ascending: true })

      if (error) throw error
      return (data || []) as unknown as DocumentoProyecto[]
    }

    const { data, error } = await supabase
      .from('documentos_proyecto')
      .select(
        `
        *,
        usuarios!subido_por(id, nombres, apellidos, email, rol)
      `
      )
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .not('fecha_vencimiento', 'is', null)
      .lte('fecha_vencimiento', fechaLimite.toISOString())
      .order('fecha_vencimiento', { ascending: true })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /** Buscar documentos por texto. */
  static async buscarDocumentos(
    entidadId: string,
    query: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = getTablaDocumentos(tipoEntidad)

    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .eq(config.campoEntidad, entidadId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /** Obtener documentos marcados como importantes. */
  static async obtenerDocumentosImportantes(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = getTablaDocumentos(tipoEntidad)

    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .eq(config.campoEntidad, entidadId)
      .eq('estado', 'activo')
      .eq('es_version_actual', true)
      .eq('es_importante', true)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }

  /** Obtener documentos archivados. */
  static async obtenerDocumentosArchivados(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const tabla = getTablaDocumentos(tipoEntidad)

    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .eq(config.campoEntidad, entidadId)
      .eq('estado', 'archivado')
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as DocumentoProyecto[]
  }
}
