/**
 * ============================================
 * USE CARPETAS QUERY (REACT QUERY)
 * ============================================
 *
 * Hooks para gestionar carpetas de documentos usando React Query.
 * Incluye query keys factory, queries y mutations.
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'

import { CarpetasDocumentosService } from '../services/carpetas-documentos.service'
import type {
  ActualizarCarpetaParams,
  CarpetaBreadcrumb,
  CarpetaConConteo,
  CarpetaConRuta,
  CrearCarpetaParams,
} from '../types/carpeta.types'
import type { TipoEntidad } from '../types/entidad.types'

import { documentosKeys } from './useDocumentosQuery'

// ============================================
// QUERY KEYS
// ============================================
export const carpetasKeys = {
  all: ['carpetas'] as const,
  lists: () => [...carpetasKeys.all, 'list'] as const,
  list: (entidadId: string, tipoEntidad: TipoEntidad, padreId: string | null) =>
    [...carpetasKeys.lists(), tipoEntidad, entidadId, padreId] as const,
  breadcrumbs: (carpetaId: string | null) =>
    [...carpetasKeys.all, 'breadcrumbs', carpetaId] as const,
  todasPlanas: (entidadId: string, tipoEntidad: TipoEntidad) =>
    [...carpetasKeys.all, 'plano', tipoEntidad, entidadId] as const,
}

// ============================================
// HOOK: useCarpetasQuery
// ============================================
export function useCarpetasQuery(
  entidadId: string,
  tipoEntidad: TipoEntidad,
  padreId: string | null = null
) {
  const {
    data: carpetas = [],
    isLoading: cargando,
    error,
  } = useQuery<CarpetaConConteo[]>({
    queryKey: carpetasKeys.list(entidadId, tipoEntidad, padreId),
    queryFn: () =>
      CarpetasDocumentosService.obtenerCarpetas(
        entidadId,
        tipoEntidad,
        padreId
      ),
    enabled: !!entidadId && !!tipoEntidad,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return { carpetas, cargando, error: error as Error | null }
}

// ============================================
// HOOK: useTodasLasCarpetasQuery
// ============================================
export function useTodasLasCarpetasQuery(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const {
    data: carpetas = [],
    isLoading: cargando,
    error,
  } = useQuery<CarpetaConRuta[]>({
    queryKey: carpetasKeys.todasPlanas(entidadId, tipoEntidad),
    queryFn: () =>
      CarpetasDocumentosService.obtenerTodasLasCarpetas(entidadId, tipoEntidad),
    enabled: !!entidadId && !!tipoEntidad,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return { carpetas, cargando, error: error as Error | null }
}

// ============================================
// HOOK: useBreadcrumbsQuery
// ============================================
export function useBreadcrumbsQuery(carpetaId: string | null) {
  const { data: breadcrumbs = [{ id: null, nombre: 'Documentos' }] } = useQuery<
    CarpetaBreadcrumb[]
  >({
    queryKey: carpetasKeys.breadcrumbs(carpetaId),
    queryFn: () => CarpetasDocumentosService.construirBreadcrumbs(carpetaId),
    staleTime: 5 * 60 * 1000,
  })

  return { breadcrumbs }
}

// ============================================
// MUTATION: Crear carpeta
// ============================================
export function useCrearCarpetaMutation(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (
      params: Omit<CrearCarpetaParams, 'entidadId' | 'tipoEntidad'>
    ) =>
      CarpetasDocumentosService.crearCarpeta(
        { ...params, entidadId, tipoEntidad },
        user?.id ?? ''
      ),
    onSuccess: (_data, variables) => {
      toast.success(`Carpeta "${variables.nombre}" creada`)
      queryClient.invalidateQueries({
        queryKey: carpetasKeys.all,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear carpeta', {
        description: error.message,
      })
    },
  })
}

// ============================================
// MUTATION: Actualizar carpeta
// ============================================
export function useActualizarCarpetaMutation(
  _entidadId: string,
  _tipoEntidad: TipoEntidad
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      carpetaId,
      updates,
    }: {
      carpetaId: string
      updates: ActualizarCarpetaParams
    }) => CarpetasDocumentosService.actualizarCarpeta(carpetaId, updates),
    onSuccess: () => {
      toast.success('Carpeta actualizada')
      queryClient.invalidateQueries({
        queryKey: carpetasKeys.all,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar carpeta', {
        description: error.message,
      })
    },
  })
}

// ============================================
// MUTATION: Eliminar carpeta
// ============================================
export function useEliminarCarpetaMutation(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (carpetaId: string) =>
      CarpetasDocumentosService.eliminarCarpeta(carpetaId),
    onSuccess: () => {
      toast.success('Carpeta eliminada')
      queryClient.invalidateQueries({
        queryKey: carpetasKeys.all,
      })
      // Los documentos vuelven a raíz, invalidar lista de docs
      queryClient.invalidateQueries({
        queryKey: documentosKeys.list(entidadId, tipoEntidad),
      })
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar carpeta', {
        description: error.message,
      })
    },
  })
}

// ============================================
// MUTATION: Mover documento a carpeta
// ============================================
export function useMoverDocumentoACarpetaMutation(
  entidadId: string,
  tipoEntidad: TipoEntidad
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentoId,
      carpetaId,
    }: {
      documentoId: string
      carpetaId: string | null
    }) =>
      CarpetasDocumentosService.moverDocumentoACarpeta(
        documentoId,
        carpetaId,
        tipoEntidad
      ),
    onSuccess: () => {
      toast.success('Documento movido')
      queryClient.invalidateQueries({
        queryKey: documentosKeys.list(entidadId, tipoEntidad),
      })
      queryClient.invalidateQueries({
        queryKey: carpetasKeys.all,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al mover documento', {
        description: error.message,
      })
    },
  })
}
