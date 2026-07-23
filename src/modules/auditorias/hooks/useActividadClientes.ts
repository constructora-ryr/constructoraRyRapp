'use client'

import { useQuery } from '@tanstack/react-query'

import { notasHistorialService } from '@/modules/clientes/services/notas-historial.service'

export function useActividadClientesQuery(limite = 100) {
  return useQuery({
    queryKey: ['actividad-clientes-global', limite],
    queryFn: () => notasHistorialService.obtenerNotasRecientesGlobal(limite),
    staleTime: 30_000,
  })
}
