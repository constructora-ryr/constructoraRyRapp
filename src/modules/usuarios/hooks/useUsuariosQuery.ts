/**
 * ============================================
 * HOOK: useUsuariosQuery
 * ============================================
 *
 * React Query: queries, mutations y factory keys del módulo de usuarios.
 * Separado de la lógica de UI (filtros, modales, selección → useUsuariosList).
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  actualizarUsuario,
  cambiarEstadoConRevocacion,
  cambiarRolUsuario,
  crearUsuario,
  desbloquearUsuario,
  obtenerEstadisticasUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarios,
} from '../services/usuarios.service'
import type {
  ActualizarUsuarioData,
  CrearUsuarioData,
  EstadoUsuario,
  FiltrosUsuarios,
  Rol,
} from '../types'

// ============================================
// FACTORY KEYS
// ============================================

export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  list: (filtros?: FiltrosUsuarios) =>
    [...usuariosKeys.lists(), { filtros }] as const,
  details: () => [...usuariosKeys.all, 'detail'] as const,
  detail: (id: string) => [...usuariosKeys.details(), id] as const,
  estadisticas: () => [...usuariosKeys.all, 'estadisticas'] as const,
}

// ============================================
// QUERIES
// ============================================

/**
 * Lista de usuarios con filtros opcionales.
 */
export function useUsuariosListQuery(filtros?: FiltrosUsuarios) {
  return useQuery({
    queryKey: usuariosKeys.list(filtros),
    queryFn: () => obtenerUsuarios(filtros),
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

/**
 * Detalle de un usuario por ID.
 */
export function useUsuarioDetailQuery(id: string | null) {
  return useQuery({
    queryKey: id ? usuariosKeys.detail(id) : usuariosKeys.details(),
    queryFn: () => obtenerUsuarioPorId(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Estadísticas del módulo.
 */
export function useUsuariosEstadisticasQuery() {
  return useQuery({
    queryKey: usuariosKeys.estadisticas(),
    queryFn: obtenerEstadisticasUsuarios,
    staleTime: 1000 * 60 * 3, // 3 minutos
  })
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear un nuevo usuario.
 */
export function useCrearUsuarioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: CrearUsuarioData) => crearUsuario(datos),
    onSuccess: respuesta => {
      toast.success('Usuario creado exitosamente', {
        description: respuesta.password_temporal
          ? `Contraseña temporal: ${respuesta.password_temporal}`
          : undefined,
        duration: respuesta.password_temporal ? 10000 : 4000,
      })
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usuariosKeys.estadisticas() })
    },
    onError: (error: Error) => {
      toast.error('Error al crear usuario', { description: error.message })
    },
  })
}

/**
 * Actualizar datos de un usuario.
 */
export function useActualizarUsuarioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: ActualizarUsuarioData }) =>
      actualizarUsuario(id, datos),
    onSuccess: (_, { id }) => {
      toast.success('Usuario actualizado')
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: usuariosKeys.estadisticas() })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar usuario', { description: error.message })
    },
  })
}

/**
 * Cambiar estado de un usuario (Activo / Inactivo / Bloqueado).
 */
export function useCambiarEstadoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      nuevoEstado,
    }: {
      id: string
      nuevoEstado: EstadoUsuario
    }) => cambiarEstadoConRevocacion(id, nuevoEstado),
    onSuccess: (_, { id, nuevoEstado }) => {
      if (nuevoEstado === 'Inactivo') {
        toast.success('Usuario inactivado', {
          description: 'Expulsado de todas sus sesiones activas',
        })
      } else {
        toast.success('Usuario activado', {
          description: 'Ya puede ingresar al sistema',
        })
      }
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: usuariosKeys.estadisticas() })
    },
    onError: (error: Error) => {
      toast.error('Error al cambiar estado', { description: error.message })
    },
  })
}

/**
 * Cambiar rol de un usuario.
 */
export function useCambiarRolMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, nuevoRol }: { id: string; nuevoRol: Rol }) =>
      cambiarRolUsuario(id, nuevoRol),
    onSuccess: (_, { id }) => {
      toast.success('Rol actualizado correctamente')
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: usuariosKeys.estadisticas() })
    },
    onError: (error: Error) => {
      toast.error('Error al cambiar rol', { description: error.message })
    },
  })
}

/**
 * Desbloquear un usuario.
 */
export function useDesbloquearUsuarioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => desbloquearUsuario(id),
    onSuccess: (_, id) => {
      toast.success('Usuario desbloqueado')
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: usuariosKeys.estadisticas() })
    },
    onError: (error: Error) => {
      toast.error('Error al desbloquear usuario', {
        description: error.message,
      })
    },
  })
}
