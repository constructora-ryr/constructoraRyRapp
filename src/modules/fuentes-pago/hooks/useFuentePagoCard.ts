/**
 * ============================================
 * HOOK: useFuentePagoCard (Business Logic)
 * ============================================
 *
 * Hook especializado que encapsula TODA la lógica de negocio
 * para las tarjetas de fuente de pago.
 *
 * Responsabilidades:
 * - Formateo de datos
 * - Cálculos financieros
 * - Estados visuales
 * - Handlers de eventos
 *
 * ✅ SISTEMA NUEVO: Usa vista_documentos_pendientes_fuentes
 * ❌ SISTEMA VIEJO: pasos_fuente_pago (eliminado)
 */

import { useCallback, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import type { LucideIcon } from 'lucide-react'
import {
  BadgeDollarSign,
  Banknote,
  Building2,
  CreditCard,
  DollarSign,
  HandCoins,
  Home,
  Landmark,
  Shield,
  Wallet,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

import { useTiposFuentePagoConfig } from '../hooks'

// =====================================================
// TYPES
// =====================================================

interface EstadoVisual {
  tipo: 'completo' | 'progreso' | 'sin-configurar' | 'bloqueado'
  label: string
  color: string
  iconClass: string
}

interface MetricasFinancieras {
  total: number
  abonado: number
  pendiente: number
  porcentajePagado: number
}

export interface FuentePagoData {
  id: string
  tipo: string
  entidad?: string | null
  monto_aprobado: number
  monto_recibido: number
  numero_referencia?: string | null
  saldo_pendiente?: number
  porcentaje_completado?: number
  estado?: string
  negociacion_id?: string
  permite_multiples_abonos?: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
}

interface UseFuentePagoCardProps {
  fuente: FuentePagoData
  clienteId?: string
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useFuentePagoCard({
  fuente,
  clienteId,
}: UseFuentePagoCardProps) {
  // ✅ Documentos pendientes obligatorios desde la vista nueva
  const { data: documentosPendientes, isLoading: isLoadingPendientes } =
    useQuery({
      queryKey: ['documentos-pendientes-fuente', fuente.id, clienteId],
      queryFn: async () => {
        if (!fuente.id || !clienteId) return []
        const { data, error } = await supabase
          .from('vista_documentos_pendientes_fuentes')
          .select('tipo_documento, alcance, nivel_validacion')
          .eq('cliente_id', clienteId)
          .or(`fuente_pago_id.eq.${fuente.id},alcance.eq.COMPARTIDO_CLIENTE`)
        if (error) throw error
        return data || []
      },
      enabled: !!fuente.id && !!clienteId,
      staleTime: 1000 * 30, // 30 segundos — validación en tiempo real
    })

  // ✅ Configuración dinámica desde BD
  const { getTipoConfig, isLoading: isLoadingConfig } =
    useTiposFuentePagoConfig()

  // ✅ Mapeo de iconos optimizado
  const iconMap = useMemo<Record<string, LucideIcon>>(
    () => ({
      Wallet,
      Building2,
      HandCoins,
      BadgeDollarSign,
      DollarSign,
      Home,
      Banknote,
      Shield,
      CreditCard,
      Landmark,
    }),
    []
  )

  // ✅ Métricas financieras (memoizadas)
  const metricas = useMemo<MetricasFinancieras>(
    () => ({
      total: fuente.monto_aprobado || 0,
      abonado: fuente.monto_recibido || 0,
      pendiente: (fuente.monto_aprobado || 0) - (fuente.monto_recibido || 0),
      porcentajePagado: fuente.monto_aprobado
        ? Math.round(
            ((fuente.monto_recibido || 0) / fuente.monto_aprobado) * 100
          )
        : 0,
    }),
    [fuente.monto_aprobado, fuente.monto_recibido]
  )

  // ✅ Configuración visual (memoizada)
  const configuracion = useMemo(() => {
    const config = getTipoConfig(fuente.tipo)
    const iconName = config.icono || 'Banknote'
    const IconComponent = iconMap[iconName] || Banknote
    return {
      icono: IconComponent,
      colores: { gradientFrom: config.from, gradientTo: config.to },
      config,
    }
  }, [fuente.tipo, getTipoConfig, iconMap])

  // ✅ Cálculos de pendientes (memoizados)
  const pendientesObligatorios = useMemo(
    () =>
      (documentosPendientes || []).filter(
        d => d.nivel_validacion === 'DOCUMENTO_OBLIGATORIO'
      ),
    [documentosPendientes]
  )

  const puedeDesembolsar = pendientesObligatorios.length === 0

  // ✅ Estado visual calculado (memoizado)
  // requiere_entidad viene de tipos_fuentes_pago en BD — sin hardcodear nombres de tipos
  const estadoVisual = useMemo<EstadoVisual>(() => {
    const tipoConfig = getTipoConfig(fuente.tipo)
    const requiereDocumentos = tipoConfig.requiere_entidad

    // Fuentes sin requisitos de documentos (ej: Cuota Inicial)
    if (!requiereDocumentos) {
      if (metricas.porcentajePagado === 100) {
        return {
          tipo: 'completo',
          label: '✓ Totalmente pagada',
          color: 'text-green-600 dark:text-green-400',
          iconClass: 'text-green-600 dark:text-green-400',
        }
      }
      return {
        tipo: 'completo',
        label: '✓ Lista para recibir abonos',
        color: 'text-green-600 dark:text-green-400',
        iconClass: 'text-green-600 dark:text-green-400',
      }
    }

    // Fuentes con requisitos de documentos
    if (puedeDesembolsar) {
      return {
        tipo: 'completo',
        label: '✓ Habilitada para desembolso',
        color: 'text-green-600 dark:text-green-400',
        iconClass: 'text-green-600 dark:text-green-400',
      }
    }

    const n = pendientesObligatorios.length
    return {
      tipo: 'progreso',
      label: `⚠️ ${n} documento${n > 1 ? 's' : ''} obligatorio${n > 1 ? 's' : ''} pendiente${n > 1 ? 's' : ''}`,
      color: 'text-amber-600 dark:text-amber-400',
      iconClass: 'text-amber-600 dark:text-amber-400',
    }
  }, [
    fuente.tipo,
    metricas.porcentajePagado,
    puedeDesembolsar,
    pendientesObligatorios,
    getTipoConfig,
  ])

  // ✅ Formateador de moneda (memoizado)
  const formatCurrency = useCallback(
    (amount: number) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(amount),
    []
  )

  const isLoading = isLoadingPendientes || isLoadingConfig
  const requiereDocumentos = getTipoConfig(fuente.tipo).requiere_entidad

  return {
    // Datos
    fuente,
    documentosPendientes: documentosPendientes || [],
    pendientesObligatorios,
    metricas,
    estadoVisual,
    configuracion,

    // Estados
    isLoading,
    puedeDesembolsar,
    requiereDocumentos,

    // Utilidades
    formatCurrency,

    // Configuración
    clienteId,
  }
}
