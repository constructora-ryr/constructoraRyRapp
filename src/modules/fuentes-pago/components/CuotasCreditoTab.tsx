/**
 * CuotasCreditoTab
 *
 * Orquestador de la pestaña de cuotas para un crédito con la constructora.
 * El plan es un calendario de referencia — los pagos se registran como abonos
 * normales y el estado se computa desde la vista SQL.
 */

'use client'

import { useEffect, useMemo, useState } from 'react'

import { CreditCard } from 'lucide-react'

import { SectionLoadingSpinner } from '@/shared/components/ui'

import { useCuotasCredito } from '../hooks/useCuotasCredito'

import { ConfigurarPlanCredito } from './ConfigurarPlanCredito'
import { CorregirFechaInicioModal } from './CorregirFechaInicioModal'
import { PanelResumenCredito } from './PanelResumenCredito'
import { ReestructurarCreditoModal } from './ReestructurarCreditoModal'
import { TablaAmortizacion } from './TablaAmortizacion'

interface CuotasCreditoTabProps {
  fuentePagoId: string
  negociacionId: string
  /** Pre-fills the capital field in the "Configurar plan" form */
  montoFuente?: number
  onPagoCuotaRegistrado?: () => void
  /** Incrementar este valor desde el padre para forzar un refetch de cuotas. */
  refreshKey?: number
  /**
   * Modo lectura: oculta "Configurar plan" y "Reestructurar".
   * Usar en Abonos (solo informar). Quitar en Cierre Financiero / Negociación.
   */
  readonly?: boolean
  /**
   * Solo los administradores pueden reestructurar un crédito.
   * Si es false (por defecto), el botón Reestructurar queda oculto.
   */
  isAdmin?: boolean
}

export function CuotasCreditoTab({
  fuentePagoId,
  negociacionId,
  montoFuente,
  refreshKey,
  readonly = false,
  isAdmin = false,
}: CuotasCreditoTabProps) {
  const {
    credito,
    periodos,
    resumen,
    cargando,
    procesando,
    error,
    recargar,
    reestructurar,
    crearPlan,
    corregirFechaInicio,
    proximaCuota,
    progresoCredito,
    saldoPendienteReal,
  } = useCuotasCredito({ fuentePagoId, negociacionId })

  const [mostrarReestructurar, setMostrarReestructurar] = useState(false)
  const [mostrarCorregirFecha, setMostrarCorregirFecha] = useState(false)

  useEffect(() => {
    if (refreshKey && refreshKey > 0) recargar()
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Capital pendiente real: capital original - capital efectivamente aplicado (desde períodos)
  const capitalPendienteReal = useMemo(() => {
    if (!credito || periodos.length === 0) return 0
    const capitalAplicado = periodos.reduce(
      (s, p) => s + (p.capital_aplicado ?? 0),
      0
    )
    return Math.max(0, Math.round(credito.capital - capitalAplicado))
  }, [credito, periodos])

  /**
   * Saldo a usar como base para reestructuración:
   * - Si hay abonos recibidos → usar saldo real de la BD (monto_aprobado - monto_recibido)
   *   → interés simple, correcto para créditos con historial de pagos (ej: traslado)
   * - Si no hay abonos → usar capital amortizado (comportamiento original)
   */
  const capitalParaReestructurar = useMemo(() => {
    if (saldoPendienteReal !== null && saldoPendienteReal > 0) {
      // Solo usar saldo real cuando es menor que el capital (hay abonos que lo reducen)
      if (credito && saldoPendienteReal < credito.capital) {
        return saldoPendienteReal
      }
    }
    return capitalPendienteReal
  }, [saldoPendienteReal, capitalPendienteReal, credito])

  // Cuotas no cubiertas: Atrasado + En curso + Futuro
  const cuotasNoCubiertas = useMemo(() => {
    return periodos.filter(p => p.estado_periodo !== 'Cubierto').length
  }, [periodos])

  if (cargando) {
    return (
      <SectionLoadingSpinner
        label='Cargando cuotas...'
        moduleName='negociaciones'
        icon={CreditCard}
      />
    )
  }

  if (!credito || !resumen || periodos.length === 0) {
    if (readonly) {
      return (
        <div className='rounded-xl border-2 border-dashed border-indigo-200 p-6 text-center dark:border-indigo-700/50'>
          <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Plan de cuotas no configurado
          </p>
          <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
            Ve al detalle de la negociación para configurar el plan de pagos.
          </p>
        </div>
      )
    }
    return (
      <ConfigurarPlanCredito
        montoAprobado={montoFuente}
        crearPlan={crearPlan}
        procesando={procesando}
        error={error}
        onPlanCreado={recargar}
      />
    )
  }

  if (error) {
    return (
      <div className='rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300'>
        {error}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <PanelResumenCredito
        credito={credito}
        resumen={resumen}
        proximaCuota={proximaCuota}
        progresoCredito={progresoCredito}
        procesando={procesando}
        onCorregirFecha={
          !readonly && isAdmin ? () => setMostrarCorregirFecha(true) : undefined
        }
        onReestructurar={
          !readonly && isAdmin ? () => setMostrarReestructurar(true) : undefined
        }
      />

      <TablaAmortizacion periodos={periodos} />

      {!readonly && isAdmin && mostrarCorregirFecha && credito ? (
        <CorregirFechaInicioModal
          creditoActual={credito}
          periodos={periodos}
          procesando={procesando}
          onConfirmar={async nuevaFecha => {
            const ok = await corregirFechaInicio(nuevaFecha)
            if (ok) {
              setMostrarCorregirFecha(false)
              await recargar()
            }
          }}
          onCerrar={() => setMostrarCorregirFecha(false)}
        />
      ) : null}

      {!readonly && isAdmin && mostrarReestructurar && credito ? (
        <ReestructurarCreditoModal
          fuentePagoId={fuentePagoId}
          creditoActual={credito}
          capitalPendiente={capitalParaReestructurar}
          cuotasPendientes={cuotasNoCubiertas}
          procesando={procesando}
          onConfirmar={async params => {
            const ok = await reestructurar(params)
            if (ok) {
              setMostrarReestructurar(false)
              await recargar()
            }
          }}
          onCerrar={() => setMostrarReestructurar(false)}
        />
      ) : null}
    </div>
  )
}
