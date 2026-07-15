'use client'

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import type {
  AbonoCompletoRow,
  AbonoConInfo,
} from '@/modules/abonos/hooks/useAbonosQuery'

// ============================================
// QUERY KEYS
// ============================================

export const abonosViviendaKeys = {
  all: ['abonos-vivienda'] as const,
  list: (viviendaId: string) =>
    [...abonosViviendaKeys.all, viviendaId] as const,
}

// ============================================
// DATA FETCHING
// ============================================

/**
 * Obtiene abonos activos de la negociacion activa de una vivienda.
 * Filtra por vivienda_id + negociacion_estado = 'Activa' + estado abono = 'Activo'
 */
async function fetchAbonosViviendaActivos(
  viviendaId: string
): Promise<AbonoConInfo[]> {
  const { data, error } = await supabase
    .from('vista_abonos_completos')
    .select('*')
    .eq('vivienda_id', viviendaId)
    .eq('negociacion_estado', 'Activa')
    .eq('estado', 'Activo')
    .order('fecha_abono', { ascending: false })

  if (error) {
    logger.error('Error fetching abonos de vivienda:', error)
    throw new Error(error.message)
  }

  if (!data || data.length === 0) return []

  return (data as unknown as AbonoCompletoRow[]).map(row => ({
    id: row.id,
    numero_recibo: row.numero_recibo,
    negociacion_id: row.negociacion_id,
    fuente_pago_id: row.fuente_pago_id,
    monto: row.monto,
    fecha_abono: row.fecha_abono,
    metodo_pago: row.metodo_pago,
    numero_referencia: row.numero_referencia,
    comprobante_url: row.comprobante_url,
    notas: row.notas,
    fecha_creacion: row.fecha_creacion,
    fecha_actualizacion: row.fecha_actualizacion,
    usuario_registro: row.usuario_registro,
    estado: (row.estado ?? 'Activo') as 'Activo' | 'Anulado',
    motivo_categoria: row.motivo_categoria ?? null,
    motivo_detalle: row.motivo_detalle ?? null,
    anulado_por_nombre: row.anulado_por_nombre ?? null,
    fecha_anulacion: row.fecha_anulacion ?? null,
    cliente: {
      id: row.cliente_id || '',
      nombres: row.cliente_nombres || 'N/A',
      apellidos: row.cliente_apellidos || '',
      numero_documento: row.cliente_numero_documento || '',
    },
    negociacion: {
      id: row.negociacion_id || '',
      estado: row.negociacion_estado || 'Activa',
    },
    vivienda: {
      id: row.vivienda_id || '',
      numero: row.vivienda_numero || 'N/A',
      manzana: { identificador: row.manzana_nombre || 'N/A' },
    },
    proyecto: {
      id: row.proyecto_id || '',
      nombre: row.proyecto_nombre || 'N/A',
    },
    fuente_pago: {
      id: row.fuente_pago_id || '',
      tipo: row.fuente_pago_tipo || 'N/A',
      entidad: row.fuente_pago_entidad ?? null,
    },
    negociacion_valor_total: row.negociacion_valor_total ?? 0,
    negociacion_total_abonado: row.negociacion_total_abonado ?? 0,
    negociacion_saldo_pendiente: row.negociacion_saldo_pendiente ?? 0,
  }))
}

// ============================================
// HOOK
// ============================================

export function useAbonosViviendaTab(viviendaId: string) {
  const {
    data: abonos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: abonosViviendaKeys.list(viviendaId),
    queryFn: () => fetchAbonosViviendaActivos(viviendaId),
    enabled: !!viviendaId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
  })

  const totalAbonado = abonos.reduce((sum, a) => sum + a.monto, 0)

  return {
    abonos,
    totalAbonado,
    cargando: isLoading,
    error: error as Error | null,
  }
}
