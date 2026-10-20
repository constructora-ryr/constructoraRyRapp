'use client'

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'

export interface AlertaMoraItem {
  fuenteId: string
  clienteId: string
  /** null si el usuario no tiene permiso para ver clientes (RLS) */
  cliente: string | null
  diasAtraso: number
  monto: number
}

export interface AlertaDesembolsoItem {
  fuenteId: string
  clienteId: string
  cliente: string | null
  tipo: string
  entidad: string | null
  vivienda: string | null
  monto: number
}

export interface AlertaDevolucionItem {
  /** id del pago excedente o de la negociación */
  refId: string
  /** pago_excedente: abonó de más · excedente_fuentes: fuentes > valor */
  origen: 'pago_excedente' | 'excedente_fuentes'
  clienteId: string
  cliente: string | null
  vivienda: string | null
  monto: number
}

/**
 * Estadísticas del dashboard en 1 round-trip vía RPC `get_dashboard_stats()`.
 * La función es SECURITY INVOKER: cada usuario agrega solo lo que RLS le deja
 * ver. Ver supabase/migrations/20261020_dashboard_stats_rpc_v3.sql
 */
export interface DashboardStatsData {
  generadoEn: string
  proyectos: {
    total: number
    /** en_proceso + en_construccion */
    activos: number
    enPlanificacion: number
    pausados: number
    completados: number
    list: Array<{
      id: string
      nombre: string
      estado: string
      /** max(viviendas planeadas en manzanas, viviendas creadas) */
      totalViviendas: number
      viviendasCreadas: number
      disponibles: number
      asignadas: number
      entregadas: number
      propietario: number
      /** No disponibles (misma regla del filtro "Vendidas" de viviendas) */
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
  finanzas: {
    /** Capital recaudado (sin mora) en el mes actual, hora Colombia */
    recaudoMes: number
    recaudoMesAnterior: number
    abonosMes: number
    /** Suma de saldo_pendiente de negociaciones activas */
    carteraPendiente: number
    negociacionesActivas: number
    ventasMes: number
    ventasMesAnterior: number
    /** Negociaciones completadas (pagadas al 100%) en el mes. v2+ */
    saldadasMes?: number
    saldadasMesAnterior?: number
  }
  /** Últimos 12 meses, incluye meses en cero. mes = 'YYYY-MM' */
  recaudoMensual: Array<{ mes: string; total: number; cantidad: number }>
  alertas: {
    creditoMora: {
      creditos: number
      monto: number
      maxDiasAtraso: number
      /** Top 10 por días de atraso. v2+ */
      items?: AlertaMoraItem[]
    }
    desembolsosPendientes: {
      total: number
      monto: number
      /** Top 10 por saldo. v2+ */
      items?: AlertaDesembolsoItem[]
    }
    /** Dinero a favor de clientes por devolver. v3+ */
    devolucionesPendientes?: {
      total: number
      monto: number
      items: AlertaDevolucionItem[]
    }
    documentosPendientes: { total: number; vencidos: number }
    renunciasPendientes: { total: number; monto: number }
  }
  /** Vacío para usuarios sin acceso a audit_log */
  actividad: Array<{
    id: string
    modulo: string | null
    accion: string
    tabla: string
    fecha: string
    usuario: string | null
    detalle: string | null
    monto: number | null
  }>
}

export const EMPTY_DASHBOARD_STATS: DashboardStatsData = {
  generadoEn: '',
  proyectos: {
    total: 0,
    activos: 0,
    enPlanificacion: 0,
    pausados: 0,
    completados: 0,
    list: [],
  },
  viviendas: {
    total: 0,
    disponibles: 0,
    asignadas: 0,
    entregadas: 0,
    propietario: 0,
  },
  clientes: {
    total: 0,
    activos: 0,
    interesados: 0,
    inactivos: 0,
    renunciaron: 0,
    propietarios: 0,
  },
  finanzas: {
    recaudoMes: 0,
    recaudoMesAnterior: 0,
    abonosMes: 0,
    carteraPendiente: 0,
    negociacionesActivas: 0,
    ventasMes: 0,
    ventasMesAnterior: 0,
    saldadasMes: 0,
    saldadasMesAnterior: 0,
  },
  recaudoMensual: [],
  alertas: {
    creditoMora: { creditos: 0, monto: 0, maxDiasAtraso: 0, items: [] },
    desembolsosPendientes: { total: 0, monto: 0, items: [] },
    devolucionesPendientes: { total: 0, monto: 0, items: [] },
    documentosPendientes: { total: 0, vencidos: 0 },
    renunciasPendientes: { total: 0, monto: 0 },
  },
  actividad: [],
}

export function useDashboardStats() {
  return useQuery<DashboardStatsData>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // RPC aún no presente en los tipos generados
      const { data, error } = await (
        supabase.rpc as (fn: string) => ReturnType<typeof supabase.rpc>
      )('get_dashboard_stats')

      if (error) throw new Error(error.message)

      return data as unknown as DashboardStatsData
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
