/**
 * ============================================
 * HOOK: usePermisosQuery
 * ============================================
 *
 * Hook con React Query para gestionar permisos desde BD.
 * Reemplaza el sistema hardcodeado de usePermissions.
 *
 * CARACTERÍSTICAS:
 * - Consulta permisos desde tabla permisos_rol
 * - Cache automático con React Query
 * - Bypass automático para Administrador
 * - Invalidación de cache al actualizar
 */

'use client'

import { useCallback, useEffect, useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import {
  actualizarPermiso,
  actualizarPermisosEnLote,
  obtenerPermisosPorRol,
  obtenerTodosLosPermisos,
} from '../services/permisos.service'
import type { Accion, Modulo, Rol } from '../types'

export const permisosKeys = {
  all: ['permisos'] as const,
  byRol: (rol: Rol) => [...permisosKeys.all, rol] as const,
  todos: () => [...permisosKeys.all, 'todos'] as const,
}

/**
 * Hook principal para gestión de permisos con React Query
 */
export function usePermisosQuery() {
  const { perfil, loading: authLoading } = useAuth()
  const rol = perfil?.rol as Rol | undefined

  /**
   * Query: Obtener permisos del rol actual
   */
  const {
    data: permisos = [],
    isLoading: permisosLoading,
    error: permisosError,
  } = useQuery({
    queryKey: rol ? permisosKeys.byRol(rol) : permisosKeys.all,
    queryFn: () => {
      if (!rol) {
        throw new Error('No hay rol definido')
      }
      return obtenerPermisosPorRol(rol)
    },
    enabled: !!rol,
    // Los permisos son datos de seguridad — siempre frescos.
    // Se sirven desde caché mientras el usuario navega en la misma pestaña,
    // pero se revalidan al volver al foco (cambio de tab/ventana).
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  /**
   * Estado combinado de carga
   */
  const isLoading = useMemo(() => {
    return authLoading || (!!rol && permisosLoading)
  }, [authLoading, rol, permisosLoading])

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const puede = useCallback(
    (modulo: Modulo, accion: Accion): boolean => {
      if (!rol) return false

      // Bypass para Administrador
      if (rol === 'Administrador') {
        return true
      }

      // Verificar en permisos obtenidos de BD
      return permisos.some(
        p => p.modulo === modulo && p.accion === accion && p.permitido
      )
    },
    [rol, permisos]
  )

  /**
   * Verifica si el usuario tiene ALGUNO de los permisos
   */
  const puedeAlguno = useCallback(
    (modulo: Modulo, acciones: Accion[]): boolean => {
      if (!rol) return false
      return acciones.some(accion => puede(modulo, accion))
    },
    [rol, puede]
  )

  /**
   * Verifica si el usuario tiene TODOS los permisos
   */
  const puedeTodos = useCallback(
    (modulo: Modulo, acciones: Accion[]): boolean => {
      if (!rol) return false
      return acciones.every(accion => puede(modulo, accion))
    },
    [rol, puede]
  )

  /**
   * Obtiene todos los permisos del usuario para un módulo
   */
  const permisosModulo = useCallback(
    (modulo: Modulo): Accion[] => {
      if (!rol) return []

      return permisos
        .filter(p => p.modulo === modulo && p.permitido)
        .map(p => p.accion as Accion)
    },
    [rol, permisos]
  )

  /**
   * Obtiene todos los módulos a los que el usuario tiene acceso
   */
  const modulosConAcceso = useMemo(() => {
    if (!rol) return []

    const modulos = new Set(
      permisos.filter(p => p.permitido).map(p => p.modulo)
    )
    return Array.from(modulos) as Modulo[]
  }, [rol, permisos])

  /**
   * Realtime: escuchar cambios de permisos del rol actual.
   * Cuando el admin actualiza permisos, se emite un broadcast al canal
   * 'permissions-changed'. Si el payload.rol coincide con el rol actual,
   * se invalida el caché para que React Query refetch silenciosamente.
   */
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!rol || rol === 'Administrador') return

    const supabase = createClient()
    const channel = supabase
      .channel('permissions-changed')
      .on('broadcast', { event: 'permissions_updated' }, ({ payload }) => {
        if (payload?.rol === rol) {
          queryClient.invalidateQueries({
            queryKey: permisosKeys.byRol(rol as Rol),
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [rol, queryClient])

  /**
   * Helpers de rol
   */
  const esAdmin = useMemo(() => rol === 'Administrador', [rol])
  const esContabilidad = useMemo(() => rol === 'Contabilidad', [rol])
  const esAdminObra = useMemo(() => rol === 'Administrador de Obra', [rol])
  const esGerencia = useMemo(() => rol === 'Gerencia', [rol])

  /**
   * Obtiene todos los permisos disponibles del usuario
   */
  const todosLosPermisos = useMemo(() => {
    if (!rol) return []

    return permisos
      .filter(p => p.permitido)
      .map(p => ({
        modulo: p.modulo as Modulo,
        accion: p.accion as Accion,
        descripcion: p.descripcion || '',
      }))
  }, [rol, permisos])

  return {
    // Verificación de permisos
    puede,
    puedeAlguno,
    puedeTodos,

    // Información de permisos
    permisosModulo,
    modulosConAcceso,
    todosLosPermisos,
    permisosRaw: permisos, // Permisos sin procesar

    // Helpers de rol
    esAdmin,
    esContabilidad,
    esAdminObra,
    esGerencia,
    rol,
    tieneRol: !!rol,

    // Estado
    isLoading,
    error: permisosError,
  }
}

/**
 * Hook para obtener TODOS los permisos del sistema (Admin only)
 * Útil para matriz de configuración de permisos
 */
export function useTodosLosPermisosQuery() {
  const { perfil } = useAuth()
  const esAdmin = perfil?.rol === 'Administrador'

  return useQuery({
    queryKey: permisosKeys.todos(),
    queryFn: obtenerTodosLosPermisos,
    enabled: esAdmin, // Solo ejecutar si es admin
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Emite un broadcast de Realtime para que todas las sesiones activas del rol
 * afectado refresquen su caché de permisos silenciosamente, sin forzar logout.
 * El middleware siempre consulta BD en cada request, por lo que los cambios
 * son efectivos de inmediato en el servidor — el broadcast actualiza solo la UI.
 */
async function broadcastPermissionsUpdated(rol: string): Promise<void> {
  const supabase = createClient()
  const channel = supabase.channel('permissions-changed')
  await new Promise<void>(resolve => {
    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        channel
          .send({
            type: 'broadcast',
            event: 'permissions_updated',
            payload: { rol },
          })
          .then(() => resolve())
          .catch(() => resolve()) // no bloquear si falla
      }
    })
  })
  supabase.removeChannel(channel)
}

/**
 * Mutation: Actualizar un permiso específico
 * Emite broadcast Realtime para actualizar clientes sin interrumpir sesión.
 */
export function useActualizarPermisoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      permitido,
      rol,
    }: {
      id: string
      permitido: boolean
      rol?: string
    }) => {
      const resultado = await actualizarPermiso(id, permitido)

      if (rol) {
        try {
          await broadcastPermissionsUpdated(rol)
        } catch (error) {
          logger.warn('⚠️ [MUTATION] Error en broadcast de permisos:', error)
        }
      }

      return resultado
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permisosKeys.all })
    },

    onError: error => {
      logger.error('❌ [MUTATION] Error actualizando permiso:', error)
    },
  })
}

/**
 * Mutation: Actualizar múltiples permisos en lote
 * Emite broadcast Realtime para actualizar clientes sin interrumpir sesión.
 */
export function useActualizarPermisosEnLoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      actualizaciones,
      rol,
    }: {
      actualizaciones: Array<{ id: string; permitido: boolean }>
      rol?: string
    }) => {
      const resultado = await actualizarPermisosEnLote(actualizaciones)

      if (rol) {
        try {
          await broadcastPermissionsUpdated(rol)
        } catch (error) {
          logger.warn('⚠️ [MUTATION] Error en broadcast de permisos:', error)
        }
      }

      return resultado
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permisosKeys.all })
    },

    onError: error => {
      logger.error('❌ [MUTATION] Error actualizando permisos en lote:', error)
    },
  })
}

/**
 * Hook simplificado para verificaciones rápidas de permisos
 */
export function useCan() {
  const { puede, puedeAlguno, puedeTodos } = usePermisosQuery()
  return { puede, puedeAlguno, puedeTodos }
}

/**
 * Hook para verificar si el usuario es admin
 */
export function useIsAdmin(): boolean {
  const { esAdmin } = usePermisosQuery()
  return esAdmin
}

/**
 * Hook para obtener el rol del usuario
 */
export function useRole(): Rol | undefined {
  const { rol } = usePermisosQuery()
  return rol
}
