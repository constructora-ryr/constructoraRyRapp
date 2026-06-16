/**
 * ============================================
 * USE DOCUMENTOS QUERY (REACT QUERY)
 * ============================================
 *
 * Hooks para gestionar documentos usando React Query
 * Reemplaza Zustand store con cache inteligente
 *
 * BENEFICIOS vs Zustand:
 * - ✅ Cache automático (stale-while-revalidate)
 * - ✅ Sin race conditions
 * - ✅ Invalidación automática después de mutations
 * - ✅ Background refetching inteligente
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'

import { CategoriasService } from '../services'
import DocumentosBaseService from '../services/documentos-base.service'
import { DocumentosEliminacionService } from '../services/documentos-eliminacion.service'
import type { DocumentoProyecto, TipoEntidad } from '../types'

// ============================================
// QUERY KEYS (Constantes para cache)
// ============================================
export const documentosKeys = {
  all: ['documentos'] as const,
  lists: () => [...documentosKeys.all, 'list'] as const,
  list: (entidadId: string, tipoEntidad: TipoEntidad) =>
    [...documentosKeys.lists(), tipoEntidad, entidadId] as const,
  // ⚠️ LEGACY: mantener para compatibilidad
  listProyecto: (proyectoId: string) =>
    [...documentosKeys.lists(), 'proyecto', proyectoId] as const,
  categorias: (userId: string) => ['categorias', userId] as const,
}

// ============================================
// 1. HOOK: useDocumentosQuery (GENÉRICO)
// ============================================
export function useDocumentosQuery(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const {
    data: documentos = [],
    isLoading: cargando,
    error,
    refetch,
  } = useQuery({
    queryKey: documentosKeys.list(entidadId, tipoEntidad),
    queryFn: () =>
      DocumentosBaseService.obtenerDocumentosPorEntidad(entidadId, tipoEntidad),
    enabled: !!entidadId && !!tipoEntidad,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  return {
    documentos,
    cargando,
    error: error as Error | null,
    refrescar: refetch,
  }
}

// ⚠️ LEGACY: Mantener para compatibilidad con código existente
export function useDocumentosProyectoQuery(proyectoId: string) {
  return useDocumentosQuery(proyectoId, 'proyecto')
}

// ============================================
// 2. HOOK: useCategoriasQuery
// ============================================
export function useCategoriasQuery(
  userId?: string,
  modulo: 'proyectos' | 'clientes' | 'viviendas' = 'proyectos'
) {
  const safeUserId = userId ?? null

  const {
    data: categorias = [],
    isLoading: cargando,
    error,
  } = useQuery({
    queryKey: [
      ...documentosKeys.categorias(safeUserId ?? 'sin-usuario'),
      modulo,
    ],
    queryFn: async () => {
      if (!safeUserId) return []

      const cats = await CategoriasService.obtenerCategoriasPorModulo(
        safeUserId,
        modulo
      )

      // ✅ SEED AUTOMÁTICO: Si no hay categorías, crear las por defecto según el módulo
      if (cats.length === 0) {
        if (modulo === 'proyectos') {
          await CategoriasService.crearCategoriasProyectosDefault(safeUserId)

          // Refrescar categorías después de crearlas
          const categoriasNuevas =
            await CategoriasService.obtenerCategoriasPorModulo(
              safeUserId,
              modulo
            )
          toast.success('✅ Categorías de proyectos creadas automáticamente')
          return categoriasNuevas
        } else if (modulo === 'viviendas') {
          await CategoriasService.crearCategoriasViviendasDefault(safeUserId)

          // Refrescar categorías después de crearlas
          const categoriasNuevas =
            await CategoriasService.obtenerCategoriasPorModulo(
              safeUserId,
              modulo
            )
          toast.success('✅ Categorías de viviendas creadas automáticamente')
          return categoriasNuevas
        }
      }

      return cats
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutos (categorías cambian poco)
    gcTime: 30 * 60 * 1000, // 30 minutos
  })

  return {
    categorias,
    cargando,
    error: error as Error | null,
  }
}

// ============================================
// 3. HOOK: useSubirDocumentoMutation (GENÉRICO)
// ============================================
export function useSubirDocumentoMutation(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      archivo: File
      titulo: string
      descripcion?: string
      categoriaId?: string
      carpetaId?: string | null
      fechaDocumento?: string
      fechaVencimiento?: string
      esDocumentoIdentidad?: boolean
      userId: string
      metadata?: Record<string, unknown> // ✅ Para vincular con requisito (requisito_config_id, fuente_pago_id, etc.)
    }) =>
      DocumentosBaseService.subirDocumento(
        {
          entidad_id: entidadId,
          tipoEntidad: tipoEntidad,
          categoria_id: params.categoriaId,
          carpeta_id: params.carpetaId ?? null,
          titulo: params.titulo,
          descripcion: params.descripcion,
          archivo: params.archivo,
          fecha_documento: params.fechaDocumento,
          fecha_vencimiento: params.fechaVencimiento,
          es_documento_identidad: params.esDocumentoIdentidad,
          metadata: params.metadata, // ✅ Pasa requisito_config_id y fuente_pago_id al service
        },
        params.userId
      ),
    onSuccess: async nuevoDocumento => {
      // ✅ PASO 1: Invalidar todas las queries relacionadas con documentos
      await queryClient.invalidateQueries({
        queryKey: documentosKeys.list(entidadId, tipoEntidad),
      })

      // ✅ PASO 1.1: Invalidar conteo de carpetas (cantidad_documentos puede cambiar)
      await queryClient.invalidateQueries({
        queryKey: ['carpetas'],
      })

      // ✅ PASO 2: Refetch INMEDIATO y FORZADO
      await queryClient.refetchQueries({
        queryKey: documentosKeys.list(entidadId, tipoEntidad),
        type: 'active',
      })

      // ✅ PASO 3: Actualización optimista del cache (agregar documento manualmente)
      queryClient.setQueryData<DocumentoProyecto[]>(
        documentosKeys.list(entidadId, tipoEntidad),
        (oldDocumentos = []) => {
          // Si el documento ya está en la lista (del refetch), no duplicar
          const existe = oldDocumentos.some(doc => doc.id === nuevoDocumento.id)
          if (existe) return oldDocumentos

          // Agregar el nuevo documento al inicio de la lista
          return [nuevoDocumento, ...oldDocumentos]
        }
      )

      toast.success('Documento subido correctamente', {
        description: nuevoDocumento.titulo,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al subir documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 4. HOOK: useActualizarDocumentoMutation (GENÉRICO)
// ============================================
export function useActualizarDocumentoMutation(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentoId,
      updates,
    }: {
      documentoId: string
      updates: Partial<DocumentoProyecto>
    }) =>
      DocumentosBaseService.actualizarDocumento(
        documentoId,
        updates,
        tipoEntidad
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: documentosKeys.list(entidadId, tipoEntidad),
      })

      toast.success('Documento actualizado')
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 5. HOOK: useEliminarDocumentoMutation (GENÉRICO)
// ============================================
export function useEliminarDocumentoMutation(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentoId: string) =>
      DocumentosEliminacionService.eliminarDocumento(documentoId, tipoEntidad),
    onSuccess: async () => {
      // Fix: invalidar todas las keys de papelera para que se refresque
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: documentosKeys.list(entidadId, tipoEntidad),
        }),
        queryClient.refetchQueries({
          queryKey: ['documentos-eliminados-proyectos'],
        }),
        queryClient.refetchQueries({
          queryKey: ['documentos-eliminados-viviendas'],
        }),
        queryClient.refetchQueries({
          queryKey: ['documentos-eliminados-clientes'],
        }),
        queryClient.refetchQueries({ queryKey: ['versiones-eliminadas'] }),
        queryClient.invalidateQueries({ queryKey: ['carpetas', 'list'] }),
      ])
      toast.success('Documento eliminado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 6. HOOK: useToggleImportanteMutation (GENÉRICO)
// ============================================
export function useToggleImportanteMutation(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentoId: string) => {
      // Obtener documento actual del cache
      const documentos = queryClient.getQueryData<DocumentoProyecto[]>(
        documentosKeys.list(entidadId, tipoEntidad)
      )
      const documento = documentos?.find(d => d.id === documentoId)

      if (!documento) {
        logger.error('❌ [Toggle Importante] Documento no encontrado en cache')
        throw new Error('Documento no encontrado')
      }

      // Toggle importante
      const nuevoValor = !documento.es_importante
      return DocumentosBaseService.actualizarDocumento(
        documentoId,
        {
          es_importante: nuevoValor,
          anclado_at: nuevoValor ? new Date().toISOString() : null,
        },
        tipoEntidad
      )
    },
    onSuccess: async () => {
      // ✅ Invalidar y refetch inmediato (sin optimistic update)
      await queryClient.invalidateQueries({
        queryKey: documentosKeys.list(entidadId, tipoEntidad),
      })

      await queryClient.refetchQueries({
        queryKey: documentosKeys.list(entidadId, tipoEntidad),
        type: 'active',
      })

      toast.success('Documento actualizado correctamente')
    },
    onError: err => {
      logger.error('❌ [Toggle Importante] Error:', err)
      toast.error('Error al actualizar documento')
    },
  })
} // ============================================
// 7. HOOK: useCrearCategoriaMutation
// ============================================
export function useCrearCategoriaMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoria: {
      nombre: string
      descripcion?: string
      color: string
      icono?: string
      modulo: 'proyectos' | 'clientes' | 'viviendas'
    }) =>
      CategoriasService.crearCategoria(userId, {
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        color: categoria.color,
        icono: categoria.icono || '',
        orden: 0,
        es_global: true, // ✅ FIX: Crear como global para que sea visible
        modulos_permitidos: [categoria.modulo],
      }),
    onSuccess: async (nuevaCategoria, variables) => {
      // ✅ FIX: Invalidar queries con el módulo específico
      await queryClient.invalidateQueries({
        queryKey: [...documentosKeys.categorias(userId), variables.modulo],
      })

      // ✅ Forzar refetch inmediato
      await queryClient.refetchQueries({
        queryKey: [...documentosKeys.categorias(userId), variables.modulo],
        type: 'active',
      })

      toast.success('Categoría creada', {
        description: nuevaCategoria.nombre,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear categoría', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 8. HOOK: useActualizarCategoriaMutation
// ============================================
export function useActualizarCategoriaMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      categoriaId,
      updates,
    }: {
      categoriaId: string
      updates: {
        nombre?: string
        descripcion?: string
        color?: string
        icono?: string
        orden?: number
      }
    }) => CategoriasService.actualizarCategoria(categoriaId, updates),
    onSuccess: async categoriaActualizada => {
      // ✅ FIX: Invalidar todas las queries de categorías (todos los módulos)
      await queryClient.invalidateQueries({
        queryKey: documentosKeys.categorias(userId),
      })

      toast.success('Categoría actualizada', {
        description: categoriaActualizada.nombre,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar categoría', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 9. HOOK: useEliminarCategoriaMutation
// ============================================
export function useEliminarCategoriaMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoriaId: string) =>
      CategoriasService.eliminarCategoria(categoriaId),
    onSuccess: async () => {
      // ✅ FIX: Invalidar todas las queries de categorías (todos los módulos)
      await queryClient.invalidateQueries({
        queryKey: documentosKeys.categorias(userId),
      })

      toast.success('Categoría eliminada')
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar categoría', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 10. HOOK: useDocumentosArchivadosQuery (GENÉRICO)
// ============================================
export function useDocumentosArchivadosQuery(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const {
    data: documentos = [],
    isLoading: cargando,
    error,
    refetch,
  } = useQuery({
    queryKey: [...documentosKeys.list(entidadId, tipoEntidad), 'archivados'],
    queryFn: () =>
      DocumentosBaseService.obtenerDocumentosArchivados(entidadId, tipoEntidad),
    enabled: !!entidadId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  return {
    documentos,
    cargando,
    error: error as Error | null,
    refrescar: refetch,
  }
}

// ============================================
// 11. HOOK: useArchivarDocumentoMutation (GENÉRICO)
// ============================================
export function useArchivarDocumentoMutation(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentoId,
      motivoCategoria,
      motivoDetalle,
    }: {
      documentoId: string
      motivoCategoria?: string
      motivoDetalle?: string
    }) =>
      DocumentosEliminacionService.archivarDocumento(
        documentoId,
        tipoEntidad,
        motivoCategoria,
        motivoDetalle
      ),
    onSuccess: async () => {
      // Invalidar ambas queries: activos y archivados
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: documentosKeys.list(entidadId, tipoEntidad),
        }),
        queryClient.refetchQueries({
          queryKey: [
            ...documentosKeys.list(entidadId, tipoEntidad),
            'archivados',
          ],
        }),
      ])

      toast.success('📦 Documento archivado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al archivar documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 12. HOOK: useRestaurarDocumentoMutation (GENÉRICO)
// ============================================
export function useRestaurarDocumentoMutation(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentoId: string) =>
      DocumentosEliminacionService.restaurarDocumentoArchivado(
        documentoId,
        tipoEntidad
      ),
    onSuccess: async () => {
      // Invalidar ambas queries: activos y archivados
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: documentosKeys.list(entidadId, tipoEntidad),
        }),
        queryClient.refetchQueries({
          queryKey: [
            ...documentosKeys.list(entidadId, tipoEntidad),
            'archivados',
          ],
        }),
      ])

      toast.success('✅ Documento restaurado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al restaurar documento', {
        description: error.message,
      })
    },
  })
}
