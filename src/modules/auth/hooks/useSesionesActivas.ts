'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { obtenerSesiones, revocarSesion } from '../services/sesiones.service'

const sesionesKeys = {
  all: ['sesiones-activas'] as const,
}

export function useSesionesActivas() {
  return useQuery({
    queryKey: sesionesKeys.all,
    queryFn: obtenerSesiones,
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: true,
  })
}

export function useRevocarSesion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => revocarSesion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sesionesKeys.all })
    },
  })
}
