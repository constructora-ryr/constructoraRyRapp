'use client'

import { useQuery } from '@tanstack/react-query'

import { reporteFinanciacionService } from '../services/reporte-financiacion.service'
import type { ReporteFinanciacionData } from '../types'

const QUERY_KEY = ['reportes', 'financiacion-por-entidad'] as const

export function useReporteFinanciacion() {
  return useQuery<ReporteFinanciacionData, Error>({
    queryKey: QUERY_KEY,
    queryFn: () => reporteFinanciacionService.obtenerReporteFinanciacion(),
    staleTime: 1000 * 60 * 5, // 5 minutos — datos analíticos, no necesitan refresco frecuente
  })
}
