/**
 * Detalle de una vivienda (React Query). Usa viviendasKeys.detail, la misma
 * llave que invalidan las mutaciones de viviendas, abonos y negociaciones.
 */

import { useQuery } from '@tanstack/react-query'

import { viviendasService } from '@/modules/viviendas/services/viviendas.service'

import { viviendasKeys } from './useViviendasQuery'

export function useViviendaQuery(viviendaId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: viviendasKeys.detail(viviendaId),
    queryFn: () => viviendasService.obtenerVivienda(viviendaId),
    enabled: !!viviendaId,
    staleTime: 30 * 1000,
  })

  return { vivienda: data ?? null, loading: isLoading, error, refetch }
}
