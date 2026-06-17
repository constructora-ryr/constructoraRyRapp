/**
 * ============================================
 * USE ABONOS QUERY (REACT QUERY)
 * ============================================
 *
 * Hook principal para abonos usando React Query.
 * Reemplaza fetch manual con cache inteligente.
 *
 * Patrón idéntico a useProyectosQuery.ts
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import { anularAbono } from '../services/anular-abono.service'
import { editarAbonoService } from '../services/editar-abono.service'
import {
  registrarAbonoApi,
  type RegistrarAbonoPayload,
} from '../services/registrar-abono.service'
import type { AnularAbonoPayload } from '../types'
import type { EditarAbonoPayload } from '../types/editar-abono.types'

// ============================================
// TIPOS (basados en vista_abonos_completos)
// ============================================

/** Fila plana tal como viene de la vista SQL */
export interface AbonoCompletoRow {
  id: string
  numero_recibo: string
  negociacion_id: string
  fuente_pago_id: string
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_referencia: string | null
  comprobante_url: string | null
  notas: string | null
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_registro: string | null
  registrado_por_nombre: string | null
  estado: 'Activo' | 'Anulado'
  motivo_categoria: string | null
  motivo_detalle: string | null
  anulado_por_id: string | null
  anulado_por_nombre: string | null
  fecha_anulacion: string | null
  cliente_id: string
  cliente_nombres: string
  cliente_apellidos: string
  cliente_numero_documento: string
  negociacion_estado:
    | 'Activa'
    | 'Suspendida'
    | 'Cerrada por Renuncia'
    | 'Completada'
  vivienda_id: string
  vivienda_numero: string
  manzana_id: string
  manzana_nombre: string
  proyecto_id: string
  proyecto_nombre: string
  fuente_pago_tipo: string
  // Financieros de la negociación (para recibo PDF)
  negociacion_valor_total: number
  negociacion_total_abonado: number
  negociacion_saldo_pendiente: number
}

/** Estructura anidada para consumo en componentes */
export interface AbonoConInfo {
  id: string
  numero_recibo: string
  negociacion_id: string
  fuente_pago_id: string
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_referencia: string | null
  comprobante_url: string | null
  notas: string | null
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_registro: string | null
  registrado_por_nombre?: string | null
  estado: 'Activo' | 'Anulado'
  motivo_categoria: string | null
  motivo_detalle: string | null
  anulado_por_nombre: string | null
  fecha_anulacion: string | null
  cliente: {
    id: string
    nombres: string
    apellidos: string
    numero_documento: string
  }
  negociacion: {
    id: string
    estado: 'Activa' | 'Suspendida' | 'Cerrada por Renuncia' | 'Completada'
  }
  vivienda: {
    id: string
    numero: string
    manzana: { identificador: string }
  }
  proyecto: {
    id: string
    nombre: string
  }
  fuente_pago: {
    id: string
    tipo: string
  }
  // Financieros de la negociación (para recibo PDF)
  negociacion_valor_total: number
  negociacion_total_abonado: number
  negociacion_saldo_pendiente: number
}

// ============================================
// QUERY KEYS (Constantes para cache)
// ============================================
export const abonosKeys = {
  all: ['abonos'] as const,
  lists: () => [...abonosKeys.all, 'list'] as const,
  list: (filtros?: Record<string, unknown>) =>
    [...abonosKeys.lists(), { filtros }] as const,
  details: () => [...abonosKeys.all, 'detail'] as const,
  detail: (id: string) => [...abonosKeys.details(), id] as const,
}

// ============================================
// HELPERS
// ============================================

/** Transforma fila plana de la vista SQL a estructura anidada */
function transformarFila(row: AbonoCompletoRow): AbonoConInfo {
  return {
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
    registrado_por_nombre: row.registrado_por_nombre ?? null,
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
    },
    negociacion_valor_total: row.negociacion_valor_total ?? 0,
    negociacion_total_abonado: row.negociacion_total_abonado ?? 0,
    negociacion_saldo_pendiente: row.negociacion_saldo_pendiente ?? 0,
  }
}

/** Obtiene todos los abonos desde la vista optimizada */
async function fetchAbonos(): Promise<AbonoConInfo[]> {
  const { data, error } = await supabase
    .from('vista_abonos_completos')
    .select('*')
    .order('fecha_abono', { ascending: false })
    .order('fecha_creacion', { ascending: false })
    .limit(500)

  if (error) {
    logger.error('❌ Error fetching abonos:', error)
    throw new Error(error.message)
  }

  if (!data || data.length === 0) return []

  return (data as unknown as AbonoCompletoRow[]).map(transformarFila)
}

// ============================================
// HOOK PRINCIPAL: useAbonosQuery (solo query)
// ============================================
export function useAbonosQuery() {
  const {
    data: abonos = [],
    isLoading: cargando,
    error,
    refetch: refrescar,
  } = useQuery({
    queryKey: abonosKeys.lists(),
    queryFn: fetchAbonos,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    placeholderData: previousData => previousData,
  })

  return {
    abonos,
    cargando,
    error: error as Error | null,
    refrescar,
  }
}

// ============================================
// MUTATIONS STANDALONE (sin suscripción a query)
// ============================================

/** Mutation: Anular abono */
export function useAnularAbonoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AnularAbonoPayload) =>
      anularAbono(payload).then(({ data, error }) => {
        if (error) throw new Error(error)
        return data
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: abonosKeys.lists(),
          refetchType: 'all',
        }),
        queryClient.invalidateQueries({
          queryKey: ['historial-cliente'],
          refetchType: 'active',
        }),
      ])
    },
    onError: (error: Error) => {
      logger.error('❌ Error anulando abono:', error.message)
    },
  })
}

/** Mutation: Editar abono */
export function useEditarAbonoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EditarAbonoPayload) =>
      editarAbonoService(payload).then(({ ok, error, abono }) => {
        if (!ok) throw new Error(error ?? 'Error al editar el abono')
        return abono
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: abonosKeys.lists(),
          refetchType: 'all',
        }),
        queryClient.invalidateQueries({
          queryKey: ['historial-cliente'],
          refetchType: 'active',
        }),
      ])
      toast.success('Abono actualizado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al editar abono', { description: error.message })
    },
  })
}

/** Mutation: Registrar abono */
export function useRegistrarAbonoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegistrarAbonoPayload) => registrarAbonoApi(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: abonosKeys.lists(),
          refetchType: 'all',
        }),
        // Refrescar historial del cliente activo para que el nuevo evento aparezca de inmediato
        queryClient.invalidateQueries({
          queryKey: ['historial-cliente'],
          refetchType: 'active',
        }),
      ])
    },
    onError: (error: Error) => {
      logger.error('❌ Error registrando abono:', error.message)
    },
  })
}

// ============================================
// HELPER: Invalidar cache de abonos (uso externo)
// ============================================
export function useInvalidateAbonos() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: abonosKeys.lists(),
      refetchType: 'all',
    })
}
