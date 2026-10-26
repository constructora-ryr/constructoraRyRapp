'use client'

import { useEffect } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  guardarLimiteMinutos,
  leerLimiteMinutos,
} from '@/lib/sesion/reloj-actividad'

import {
  actualizarLimiteInactividad,
  obtenerLimiteInactividad,
} from '../services/configuracion-sistema.service'

const claveLimite = ['configuracion-sistema', 'inactividad_minutos'] as const

/**
 * Minutos de inactividad configurados. Mientras carga (o si falla) usa el
 * último valor guardado en este navegador, así el reloj nunca queda sin
 * límite. Se guarda local para el control al abrir la app.
 */
export function useLimiteInactividad(habilitado = true) {
  const query = useQuery({
    queryKey: claveLimite,
    queryFn: obtenerLimiteInactividad,
    enabled: habilitado,
    staleTime: 10 * 60_000,
    // Un cambio del administrador llega a las sesiones abiertas sin recargar
    refetchInterval: 10 * 60_000,
  })

  useEffect(() => {
    if (query.data) guardarLimiteMinutos(query.data)
  }, [query.data])

  return {
    minutos: query.data ?? leerLimiteMinutos(),
    cargando: query.isLoading,
  }
}

export function useActualizarLimiteInactividad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: actualizarLimiteInactividad,
    onSuccess: (_, minutos) => {
      queryClient.setQueryData(claveLimite, minutos)
      guardarLimiteMinutos(minutos)
    },
  })
}
