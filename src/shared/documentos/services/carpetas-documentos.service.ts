/**
 * SERVICE: Carpetas de Documentos — CRUD
 *
 * Gestión de carpetas jerárquicas para organizar documentos
 * dentro de cada entidad (proyecto, vivienda, cliente).
 */
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type {
  ActualizarCarpetaParams,
  CarpetaBreadcrumb,
  CarpetaConConteo,
  CarpetaConRuta,
  CarpetaDocumentoRow,
  CrearCarpetaParams,
} from '../types/carpeta.types'
import {
  obtenerConfiguracionEntidad,
  type TipoEntidad,
} from '../types/entidad.types'

export class CarpetasDocumentosService {
  /**
   * Obtener carpetas de una entidad en un nivel específico.
   * padreId = null → carpetas raíz
   */
  static async obtenerCarpetas(
    entidadId: string,
    tipoEntidad: TipoEntidad,
    padreId: string | null = null
  ): Promise<CarpetaConConteo[]> {
    let query = supabase
      .from('carpetas_documentos')
      .select('*')
      .eq('entidad_id', entidadId)
      .eq('tipo_entidad', tipoEntidad)
      .order('orden', { ascending: true })
      .order('nombre', { ascending: true })

    if (padreId) {
      query = query.eq('padre_id', padreId)
    } else {
      query = query.is('padre_id', null)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error obteniendo carpetas:', error)
      throw new Error(`Error al obtener carpetas: ${error.message}`)
    }

    const carpetas = data as CarpetaDocumentoRow[]

    // Enriquecer con conteos
    const carpetasConConteo = await Promise.all(
      carpetas.map(async carpeta => {
        const [cantDocs, cantSub] = await Promise.all([
          CarpetasDocumentosService.contarDocumentosEnCarpeta(
            carpeta.id,
            tipoEntidad
          ),
          CarpetasDocumentosService.contarSubcarpetas(carpeta.id),
        ])
        return {
          ...carpeta,
          cantidad_documentos: cantDocs,
          cantidad_subcarpetas: cantSub,
        } satisfies CarpetaConConteo
      })
    )

    return carpetasConConteo
  }

  /**
   * Obtener TODAS las carpetas de una entidad (cualquier nivel de anidación)
   * con su ruta completa armada, para selectores como "Mover a carpeta".
   */
  static async obtenerTodasLasCarpetas(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<CarpetaConRuta[]> {
    const { data, error } = await supabase
      .from('carpetas_documentos')
      .select('*')
      .eq('entidad_id', entidadId)
      .eq('tipo_entidad', tipoEntidad)
      .order('nombre', { ascending: true })

    if (error) {
      logger.error('Error obteniendo todas las carpetas:', error)
      throw new Error(`Error al obtener carpetas: ${error.message}`)
    }

    const carpetas = data as CarpetaDocumentoRow[]
    const porId = new Map(carpetas.map(c => [c.id, c]))

    const construirRuta = (carpeta: CarpetaDocumentoRow): string => {
      const segmentos: string[] = [carpeta.nombre]
      let actual = carpeta
      while (actual.padre_id) {
        const padre = porId.get(actual.padre_id)
        if (!padre) break
        segmentos.unshift(padre.nombre)
        actual = padre
      }
      return segmentos.join(' / ')
    }

    return carpetas
      .map(carpeta => ({ ...carpeta, ruta: construirRuta(carpeta) }))
      .sort((a, b) => a.ruta.localeCompare(b.ruta))
  }

  /**
   * Obtener una carpeta por ID
   */
  static async obtenerCarpetaPorId(
    carpetaId: string
  ): Promise<CarpetaDocumentoRow | null> {
    const { data, error } = await supabase
      .from('carpetas_documentos')
      .select('*')
      .eq('id', carpetaId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      logger.error('Error obteniendo carpeta:', error)
      throw new Error(`Error al obtener carpeta: ${error.message}`)
    }

    return data as CarpetaDocumentoRow
  }

  /**
   * Crear una nueva carpeta
   */
  static async crearCarpeta(
    params: CrearCarpetaParams,
    userId: string
  ): Promise<CarpetaDocumentoRow> {
    const { data, error } = await supabase
      .from('carpetas_documentos')
      .insert({
        entidad_id: params.entidadId,
        tipo_entidad: params.tipoEntidad,
        padre_id: params.padreId || null,
        nombre: params.nombre.trim(),
        descripcion: params.descripcion?.trim() || null,
        color: params.color || '#6B7280',
        icono: params.icono || 'Folder',
        creado_por: userId,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'Ya existe una carpeta con ese nombre en esta ubicación'
        )
      }
      logger.error('Error creando carpeta:', error)
      throw new Error(`Error al crear carpeta: ${error.message}`)
    }

    return data as CarpetaDocumentoRow
  }

  /**
   * Actualizar una carpeta
   */
  static async actualizarCarpeta(
    carpetaId: string,
    updates: ActualizarCarpetaParams
  ): Promise<CarpetaDocumentoRow> {
    const updateData: Record<string, unknown> = {}
    if (updates.nombre !== undefined) updateData.nombre = updates.nombre.trim()
    if (updates.descripcion !== undefined)
      updateData.descripcion = updates.descripcion?.trim() || null
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.icono !== undefined) updateData.icono = updates.icono
    if (updates.orden !== undefined) updateData.orden = updates.orden

    const { data, error } = await supabase
      .from('carpetas_documentos')
      .update(updateData)
      .eq('id', carpetaId)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'Ya existe una carpeta con ese nombre en esta ubicación'
        )
      }
      logger.error('Error actualizando carpeta:', error)
      throw new Error(`Error al actualizar carpeta: ${error.message}`)
    }

    return data as CarpetaDocumentoRow
  }

  /**
   * Eliminar una carpeta.
   * Los documentos dentro quedan con carpeta_id = null (vuelven a raíz).
   * Las sub-carpetas se eliminan en cascada (ON DELETE CASCADE).
   */
  static async eliminarCarpeta(carpetaId: string): Promise<void> {
    const { error } = await supabase
      .from('carpetas_documentos')
      .delete()
      .eq('id', carpetaId)

    if (error) {
      logger.error('Error eliminando carpeta:', error)
      throw new Error(`Error al eliminar carpeta: ${error.message}`)
    }
  }

  /**
   * Mover un documento a una carpeta (o a raíz si carpetaId = null)
   */
  static async moverDocumentoACarpeta(
    documentoId: string,
    carpetaId: string | null,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    const { error } = await supabase
      .from(config.tabla)
      .update({ carpeta_id: carpetaId } as never)
      .eq('id', documentoId)

    if (error) {
      logger.error('Error moviendo documento a carpeta:', error)
      throw new Error(`Error al mover documento: ${error.message}`)
    }
  }

  /**
   * Mover múltiples documentos a una carpeta
   */
  static async moverDocumentosACarpeta(
    documentoIds: string[],
    carpetaId: string | null,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    const { error } = await supabase
      .from(config.tabla)
      .update({ carpeta_id: carpetaId } as never)
      .in('id', documentoIds)

    if (error) {
      logger.error('Error moviendo documentos a carpeta:', error)
      throw new Error(`Error al mover documentos: ${error.message}`)
    }
  }

  /**
   * Construir breadcrumbs desde una carpeta hasta la raíz
   */
  static async construirBreadcrumbs(
    carpetaId: string | null
  ): Promise<CarpetaBreadcrumb[]> {
    const breadcrumbs: CarpetaBreadcrumb[] = [
      { id: null, nombre: 'Documentos' },
    ]

    if (!carpetaId) return breadcrumbs

    let currentId: string | null = carpetaId
    const visited = new Set<string>()

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId)

      const carpeta =
        await CarpetasDocumentosService.obtenerCarpetaPorId(currentId)
      if (!carpeta) break

      breadcrumbs.push({ id: carpeta.id, nombre: carpeta.nombre })
      currentId = carpeta.padre_id
    }

    // Invertir para que raíz esté primero (ya está) y la carpeta actual al final
    // El primer elemento (raíz) ya está, los demás se insertaron en orden hijo→padre
    // Necesitamos: raíz → abuelo → padre → actual
    const raiz = breadcrumbs[0]
    const ancestros = breadcrumbs.slice(1).reverse()
    return [raiz, ...ancestros]
  }

  // -- Helpers privados --------------------------------------------------

  private static async contarDocumentosEnCarpeta(
    carpetaId: string,
    tipoEntidad: TipoEntidad
  ): Promise<number> {
    const config = obtenerConfiguracionEntidad(tipoEntidad)

    const { count, error } = await supabase
      .from(config.tabla)
      .select('id', { count: 'exact', head: true })
      .eq('carpeta_id', carpetaId)
      .eq('es_version_actual', true)
      .in('estado', ['activo', 'archivado'])

    if (error) {
      logger.error('Error contando documentos en carpeta:', error)
      return 0
    }

    return count ?? 0
  }

  private static async contarSubcarpetas(carpetaId: string): Promise<number> {
    const { count, error } = await supabase
      .from('carpetas_documentos')
      .select('id', { count: 'exact', head: true })
      .eq('padre_id', carpetaId)

    if (error) {
      logger.error('Error contando subcarpetas:', error)
      return 0
    }

    return count ?? 0
  }
}
