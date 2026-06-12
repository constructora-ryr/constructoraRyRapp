'use client'

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'
import { clientesService } from '@/modules/clientes/services/clientes.service'
import { proyectosService } from '@/modules/proyectos/services'
import { viviendasService } from '@/modules/viviendas/services/viviendas.service'

export interface DashboardStatsData {
  proyectos: {
    total: number
    activos: number
    completados: number
    list: Array<{
      id: string
      nombre: string
      estado: string
      progreso: number
      totalViviendas: number
      viviendasVendidas: number
    }>
  }
  viviendas: {
    total: number
    disponibles: number
    asignadas: number
    entregadas: number
    propietario: number
  }
  clientes: {
    total: number
    activos: number
    interesados: number
    inactivos: number
    renunciaron: number
    propietarios: number
  }
  recaudoMes: number
}

export function useDashboardStats() {
  return useQuery<DashboardStatsData>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)
      const inicioMesStr = inicioMes.toISOString().slice(0, 10)

      const [proyectos, viviendas, clientesStats, abonosMes] =
        await Promise.all([
          proyectosService.obtenerProyectos(false),
          viviendasService.listar(),
          clientesService.obtenerEstadisticas(),
          supabase
            .from('abonos_historial')
            .select('monto, mora_incluida')
            .eq('estado', 'Activo')
            .gte('fecha_abono', inicioMesStr),
        ])

      return {
        proyectos: {
          total: proyectos.length,
          activos: proyectos.filter(p => p.estado !== 'completado').length,
          completados: proyectos.filter(p => p.estado === 'completado').length,
          list: proyectos.slice(0, 6).map(p => ({
            id: p.id,
            nombre: p.nombre,
            estado: p.estado,
            progreso: p.progreso ?? 0,
            totalViviendas: p.manzanas.reduce(
              (s, m) => s + m.totalViviendas,
              0
            ),
            viviendasVendidas: p.manzanas.reduce(
              (s, m) => s + m.viviendasVendidas,
              0
            ),
          })),
        },
        viviendas: {
          total: viviendas.length,
          disponibles: viviendas.filter(v => v.estado === 'Disponible').length,
          asignadas: viviendas.filter(v => v.estado === 'Asignada').length,
          entregadas: viviendas.filter(v => v.estado === 'Entregada').length,
          propietario: viviendas.filter(v => v.estado === 'Propietario').length,
        },
        clientes: clientesStats,
        recaudoMes: (abonosMes.data ?? []).reduce(
          (sum, a) => sum + (a.monto ?? 0) - (a.mora_incluida ?? 0),
          0
        ),
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
