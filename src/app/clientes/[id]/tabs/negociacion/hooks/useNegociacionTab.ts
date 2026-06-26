'use client'

/**
 * HOOK: useNegociacionTab
 *
 * Orquestador del tab "Negociación". Compone sub-hooks especializados:
 * - useDocumentosPendientesNeg → docs pendientes por fuente
 * - useRebalanceoMutation → mutación atómica (RPC)
 *
 * Queries propias: negociación activa, fuentes, tipos, requisitos, abonos.
 */

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'
import { useNegociacionesQuery } from '@/modules/clientes/hooks/useNegociacionesQuery'
import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
import type { Cliente } from '@/modules/clientes/types'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'
import { useCierreFinanciero } from '@/shared/hooks/useCierreFinanciero'

import { useDescuentoMutation } from './useDescuentoMutation'
import { useDocumentosPendientesNeg } from './useDocumentosPendientesNeg'
import { useAjusteCierreFinanciero } from './useRebalanceoMutation'

/**
 * @deprecated Use `getFuenteColorClasses` from `@/shared/constants/fuentes-pago.constants`
 */
export { getFuenteColorClasses as getFuenteColor } from '@/shared/constants/fuentes-pago.constants'

// ============================================
// CONSTANTS
// ============================================

export const MOTIVOS_AJUSTE = [
  'Reducción de crédito bancario',
  'Mejora de crédito bancario',
  'Ingreso de subsidio',
  'Retiro de subsidio',
  'Ajuste de cuota inicial',
  'Cambio de entidad financiera',
  'Corrección de datos',
  'Otro',
] as const

export type MotivoAjuste = (typeof MOTIVOS_AJUSTE)[number]

// ============================================
// TYPES
// ============================================

export interface AjusteLocal {
  id: string
  tipo: string
  montoOriginal: number
  montoEditable: number
  entidad: string
  entidadEditable: string
  paraEliminar: boolean
  /** Monto ya recibido (para restricciones de edición) */
  monto_recibido: number
  /** Capital para cierre (créditos) */
  capital_para_cierre: number | null
  /** Si el crédito constructora ya tiene plan de cuotas */
  tienePlanCuotas: boolean
  /** Fuente de verdad desde BD: false = desembolso único exacto */
  permite_multiples_abonos: boolean
}

export interface FuAlteNueva {
  tipo: string
  monto: number
  entidad: string
}

export interface DatosAjusteCierreFinanciero {
  ajustes: AjusteLocal[]
  nuevas: FuAlteNueva[]
  motivo: string
  notas: string
}

// ============================================
// HOOK
// ============================================

interface UseNegociacionTabProps {
  cliente: Cliente
}

export function useNegociacionTab({ cliente }: UseNegociacionTabProps) {
  const { esAdmin, puede } = usePermisosQuery()
  // isAdmin se mantiene para casos admin-only (ej: editar abono)
  const isAdmin = esAdmin
  // Permisos granulares por acción de negociaciones
  const puedeTrasladar = isAdmin || puede('negociaciones', 'trasladar')
  const puedeRenunciar = isAdmin || puede('negociaciones', 'renunciar')
  const puedeDescuento = isAdmin || puede('negociaciones', 'descuento')
  const puedeEscritura = isAdmin || puede('negociaciones', 'escritura')
  const puedeAjustar = isAdmin || puede('negociaciones', 'ajustar')

  // ─── Negociación activa ──────────────────────────────────────────────────
  const {
    negociaciones,
    isLoading: isLoadingNeg,
    refetch: refetchNegociaciones,
  } = useNegociacionesQuery({
    clienteId: cliente.id,
  })

  const negociacion = useMemo(
    () =>
      // 1. Priorizar negociación Activa
      negociaciones.find(n => n.estado === 'Activa') ??
      // 2. Cualquier negociación que no sea Cerrada por Renuncia (ej: Completada, Suspendida)
      negociaciones.find(n => n.estado !== 'Cerrada por Renuncia') ??
      // 3. Si solo hay cierres por renuncia, mostrar la más reciente (la primera, ya ordenadas desc)
      negociaciones[0] ??
      null,
    [negociaciones]
  )

  // Valor total a pagar — calculado por trigger en BD
  // Incluye: (valor_negociado - descuento) + gastos_notariales + recargo_esquinera
  const valorVivienda = useMemo(() => {
    if (!negociacion) return 0

    return negociacion.valor_total_pagar ?? negociacion.valorFinal ?? 0
  }, [negociacion])

  // ─── Fuentes de pago ────────────────────────────────────────────────────
  const {
    data: fuentesPago = [],
    isLoading: isLoadingFuentes,
    refetch: refetchFuentes,
  } = useQuery({
    queryKey: ['fuentes-pago-neg-tab', negociacion?.id],
    queryFn: () =>
      fuentesPagoService.obtenerFuentesPagoNegociacion(negociacion?.id ?? ''),
    enabled: !!negociacion?.id,
    staleTime: 1000 * 60, // 1 minuto
    refetchOnMount: true,
  })

  // ─── Tipos disponibles (para agregar fuentes) ──────────────────────────
  const { data: tiposFuentes = [] } = useQuery({
    queryKey: ['tipos-fuentes-pago'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tipos_fuentes_pago')
        .select(
          'nombre, icono, color, descripcion, requiere_entidad, codigo, tipo_entidad_requerido'
        )
        .eq('activo', true)
        .order('orden')
      return (data ?? []) as {
        nombre: string
        icono: string
        color: string
        descripcion: string
        requiere_entidad: boolean
        codigo: string
        tipo_entidad_requerido: string | null
      }[]
    },
    staleTime: 5 * 60_000,
  })

  // ─── Entidades financieras (bancos, cajas, etc.) ──────────────────────
  const { data: entidadesFinancieras = [] } = useQuery({
    queryKey: ['entidades-financieras-activas'],
    queryFn: async () => {
      const { data } = await supabase
        .from('entidades_financieras')
        .select('id, nombre, tipo, orden')
        .eq('activo', true)
        .order('orden')
      return (data ?? []) as {
        id: string
        nombre: string
        tipo: string
        orden: number
      }[]
    },
    staleTime: 5 * 60_000,
  })

  const tiposDisponibles = useMemo(() => {
    const usados = new Set(fuentesPago.map(f => f.tipo))
    return tiposFuentes.filter(t => !usados.has(t.nombre as string))
  }, [tiposFuentes, fuentesPago])

  // Mapa: tipo_entidad → nombres de entidades financieras (cargados desde BD)
  const entidadesPorTipoEntidad = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const ef of entidadesFinancieras) {
      const list = map.get(ef.tipo) ?? []
      list.push(ef.nombre)
      map.set(ef.tipo, list)
    }
    return map
  }, [entidadesFinancieras])

  // Tipos enriquecidos con tipo_entidad_requerido desde BD (columna real)
  const tiposConfigConEntidad = useMemo(() => tiposFuentes, [tiposFuentes])

  // ─── Requisitos obligatorios por tipo (para warnings del modal) ─────────
  const { data: requisitosConfig = [] } = useQuery({
    queryKey: ['requisitos-fuentes-pago-config-obligatorios'],
    queryFn: async () => {
      const { data } = await supabase
        .from('requisitos_fuentes_pago_config')
        .select('tipo_fuente, titulo')
        .eq('activo', true)
        .eq('nivel_validacion', 'DOCUMENTO_OBLIGATORIO')
      return (data ?? []) as { tipo_fuente: string; titulo: string }[]
    },
    staleTime: 10 * 60_000,
  })

  const requisitosMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const req of requisitosConfig) {
      const list = map.get(req.tipo_fuente) ?? []
      list.push(req.titulo)
      map.set(req.tipo_fuente, list)
    }
    return map
  }, [requisitosConfig])

  // ─── Documentos pendientes (sub-hook) ──────────────────────────────────
  const docsPendientes = useDocumentosPendientesNeg({
    clienteId: cliente.id,
    negociacionId: negociacion?.id,
  })

  // ─── Abonos recientes ──────────────────────────────────────────────────
  const {
    data: abonos = [],
    isLoading: isLoadingAbonos,
    refetch: refetchAbonos,
  } = useQuery({
    queryKey: ['abonos-recientes-neg', negociacion?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('abonos_historial')
        .select(
          'id, numero_recibo, monto, fecha_abono, metodo_pago, numero_referencia, fuente_pago_id, notas, comprobante_url, estado'
        )
        .eq('negociacion_id', negociacion?.id ?? '')
        .eq('estado', 'Activo')
        .order('fecha_abono', { ascending: false })
        .limit(20)
      return data ?? []
    },
    enabled: !!negociacion?.id,
    staleTime: 30_000,
  })

  // ⭐ Usar total_abonado del trigger de BD (suma real de TODOS los abonos)
  // No usar abonos.reduce() porque abonos está limitado a 5 registros (.limit(5))
  const totalAbonado = useMemo(
    () => negociacion?.total_abonado ?? 0,
    [negociacion]
  )

  // ─── Total comprometido real (incluye intereses del crédito constructora) ─
  const totalComprometido = useMemo(
    () => fuentesPago.reduce((sum, f) => sum + (f.monto_aprobado ?? 0), 0),
    [fuentesPago]
  )
  const interesesTotales = useMemo(() => {
    const tieneCredito = fuentesPago.some(f => esCreditoConstructora(f.tipo))
    if (!tieneCredito) return 0
    return Math.max(0, totalComprometido - valorVivienda)
  }, [fuentesPago, totalComprometido, valorVivienda])

  // ─── Balance (shared hook — single source of truth) ─────────────────────
  const {
    totalParaCierre: totalFuentes,
    diferencia,
    estaBalanceado,
  } = useCierreFinanciero(fuentesPago, valorVivienda)

  // ─── Ordenar fuentes según el orden definido en el admin ───────────────
  const fuentesOrdenadas = useMemo(() => {
    if (!tiposFuentes.length || !fuentesPago.length)
      return fuentesPago as FuentePago[]
    const orderMap = new Map(tiposFuentes.map((t, i) => [t.nombre, i]))
    return [...fuentesPago].sort((a, b) => {
      const oa = orderMap.get(a.tipo) ?? 999
      const ob = orderMap.get(b.tipo) ?? 999
      return oa - ob
    }) as FuentePago[]
  }, [fuentesPago, tiposFuentes])

  // ─── Rebalanceo mutation (sub-hook, RPC atómica) ───────────────────────
  const rebalanceo = useAjusteCierreFinanciero({
    negociacionId: negociacion?.id,
    clienteId: cliente.id,
    valorVivienda,
  })

  // ─── Descuento mutation (sub-hook) ─────────────────────────────────────
  const descuento = useDescuentoMutation({
    negociacionId: negociacion?.id,
    clienteId: cliente.id,
  })

  return {
    // Data
    negociacion,
    valorVivienda,
    totalComprometido,
    interesesTotales,
    fuentesPago: fuentesOrdenadas,
    abonos,
    totalAbonado,
    totalFuentes,
    diferencia,
    estaBalanceado,
    tiposDisponibles,
    tiposFuentes,
    tiposConfigConEntidad,
    requisitosMap,
    entidadesPorTipoEntidad,

    // Estado
    isLoading: isLoadingNeg || isLoadingFuentes,
    isLoadingAbonos,
    isAdmin,
    puedeTrasladar,
    puedeRenunciar,
    puedeDescuento,
    puedeEscritura,
    puedeAjustar,

    // Documentos pendientes (delegado a sub-hook)
    ...docsPendientes,

    // Rebalanceo (delegado a sub-hook)
    ...rebalanceo,

    // Descuento (delegado a sub-hook)
    ...descuento,

    // Actions
    refetchFuentes,
    refetchAbonos,
    refetchNegociaciones,
  }
}
