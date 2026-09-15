/**
 * ============================================
 * CLIENTES - REACT QUERY HOOKS
 * ============================================
 *
 * Queries y Mutations para el módulo de Clientes.
 * Migrado desde Zustand store a React Query para mejor cache management.
 *
 * QUERIES:
 * - useClientesQuery(filtros) - Lista de clientes con filtros
 * - useClienteQuery(id) - Detalle de cliente individual
 * - useEstadisticasClientesQuery() - Estadísticas generales
 *
 * MUTATIONS:
 * - useCrearClienteMutation() - Crear nuevo cliente
 * - useActualizarClienteMutation() - Actualizar cliente existente
 * - useEliminarClienteMutation() - Eliminar cliente
 * - useCambiarEstadoClienteMutation() - Cambiar estado de cliente
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { clientesService } from '../services/clientes.service'
import type {
  ActualizarClienteDTO,
  CrearClienteDTO,
  FiltrosClientes,
} from '../types'

// ============================================================================
// QUERY KEYS CENTRALIZADOS
// ============================================================================

export const clientesKeys = {
  all: ['clientes'] as const,
  lists: () => [...clientesKeys.all, 'list'] as const,
  list: (filtros?: FiltrosClientes) =>
    [...clientesKeys.lists(), filtros] as const,
  details: () => [...clientesKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientesKeys.details(), id] as const,
  estadisticas: () => [...clientesKeys.all, 'estadisticas'] as const,
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Query: Lista de clientes con filtros
 */
export function useClientesQuery(filtros?: FiltrosClientes) {
  return useQuery({
    queryKey: clientesKeys.list(filtros),
    queryFn: () => clientesService.obtenerClientes(filtros),
    staleTime: 0, // Siempre refetch para datos actualizados
    gcTime: 1000 * 60 * 5, // Cache 5 minutos
    placeholderData: previousData => previousData, // ⭐ Mantener datos anteriores mientras carga
  })
}

/**
 * Query: Detalle de cliente individual
 */
export function useClienteQuery(id: string | null) {
  const clienteId = id ?? null

  return useQuery({
    queryKey: clientesKeys.detail(clienteId ?? ''),
    queryFn: () => {
      if (!clienteId) {
        throw new Error('Cliente ID requerido')
      }

      return clientesService.obtenerCliente(clienteId)
    },
    enabled: !!clienteId, // Solo ejecutar si hay ID
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 10, // Cache 10 minutos
  })
}

/**
 * Query: Estadísticas generales de clientes
 */
export function useEstadisticasClientesQuery() {
  return useQuery({
    queryKey: clientesKeys.estadisticas(),
    queryFn: () => clientesService.obtenerEstadisticas(),
    staleTime: 1000 * 60, // 1 minuto
    gcTime: 1000 * 60 * 5, // Cache 5 minutos
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mutation: Crear cliente
 */
export function useCrearClienteMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (datos: CrearClienteDTO) => clientesService.crearCliente(datos),
    onSuccess: cliente => {
      // Invalidar todas las listas de clientes
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientesKeys.estadisticas() })

      // 🎉 Toast de éxito
      toast.success(`${cliente.nombres} ${cliente.apellidos}`, {
        description: 'Cliente creado exitosamente',
        duration: 4000,
        action: {
          label: 'Ver cliente',
          onClick: () => router.push(`/clientes/${cliente.id}`),
        },
      })
    },
    onError: (error: Error) => {
      // ❌ Toast de error
      toast.error('Error al crear cliente', {
        description: error.message,
        duration: 5000,
      })
    },
  })
}

/**
 * Mutation: Actualizar cliente
 */
export function useActualizarClienteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: ActualizarClienteDTO }) =>
      clientesService.actualizarCliente(id, datos),
    onSuccess: (cliente, variables) => {
      // Invalidar detalle del cliente actualizado
      queryClient.invalidateQueries({
        queryKey: clientesKeys.detail(variables.id),
      })
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientesKeys.estadisticas() })

      // 🎉 Toast de éxito
      toast.success('Cliente actualizado exitosamente', {
        description: `${cliente.nombres} ${cliente.apellidos}`,
        duration: 4000,
      })
    },
    onError: (error: Error) => {
      // ❌ Toast de error
      toast.error('Error al actualizar cliente', {
        description: error.message,
        duration: 5000,
      })
    },
  })
}

/**
 * Mutation: Eliminar cliente
 */
export function useEliminarClienteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => clientesService.eliminarCliente(id),
    onSuccess: (_, id) => {
      // Remover de cache
      queryClient.removeQueries({ queryKey: clientesKeys.detail(id) })
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientesKeys.estadisticas() })

      // 🎉 Toast de éxito
      toast.success('Cliente eliminado exitosamente', {
        duration: 4000,
      })
    },
    onError: (error: Error) => {
      // ❌ Toast de error
      toast.error('Error al eliminar cliente', {
        description: error.message,
        duration: 5000,
      })
    },
  })
}

/**
 * Mutation: Cambiar estado de cliente
 */
export function useCambiarEstadoClienteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      estado,
    }: {
      id: string
      estado: 'Interesado' | 'Activo' | 'Inactivo'
    }) => clientesService.cambiarEstado(id, estado),
    onSuccess: (data, variables) => {
      // Invalidar detalle del cliente
      queryClient.invalidateQueries({
        queryKey: clientesKeys.detail(variables.id),
      })
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientesKeys.estadisticas() })
    },
  })
}

// ============================================================================
// HELPER: Invalidar cache de clientes
// ============================================================================

export function invalidateClientesQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: clientesKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: clientesKeys.estadisticas() }),
  ])
}
