'use client'

import {
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  TrendingDown,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type {
  CreditoConstructora,
  ProgresoCredito,
  ProximaCuota,
  ResumenCuotas,
} from '@/modules/fuentes-pago/types'

interface PanelResumenCreditoProps {
  credito: CreditoConstructora
  resumen: ResumenCuotas
  proximaCuota: ProximaCuota | null
  progresoCredito: ProgresoCredito
  procesando: boolean
  /** Si no se pasa, el botón "Reestructurar" no se muestra (modo lectura) */
  onReestructurar?: () => void
  /** Solo admins. Abre el modal de corrección de fecha de inicio. */
  onCorregirFecha?: () => void
}

export function PanelResumenCredito({
  credito,
  resumen,
  proximaCuota,
  progresoCredito,
  procesando,
  onReestructurar,
  onCorregirFecha,
}: PanelResumenCreditoProps) {
  // Semáforo de próxima cuota
  const semaforo = proximaCuota ? getSemaforo(proximaCuota) : null

  return (
    <div className='space-y-3'>
      {/* Zona A — 4 stats monetarios + botón reestructurar */}
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-900/10'>
        <div className='flex flex-wrap items-center gap-4'>
          <Stat
            label='Capital'
            value={`$${credito.capital.toLocaleString('es-CO')}`}
          />
          <Stat
            label='Interés total'
            value={`$${(credito.monto_total - credito.capital).toLocaleString('es-CO')}`}
          />
          <Stat
            label='Mora acumulada'
            value={`$${resumen.moraTotal.toLocaleString('es-CO')}`}
            highlight={resumen.moraTotal > 0}
          />
          <Stat label='Tasa mensual' value={`${credito.tasa_mensual}%`} />
        </div>
        <div className='flex items-center gap-2'>
          {onCorregirFecha ? (
            <button
              onClick={onCorregirFecha}
              disabled={procesando}
              className='inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 transition-all hover:bg-amber-200 disabled:opacity-50 dark:bg-amber-800/40 dark:text-amber-300 dark:hover:bg-amber-800/60'
            >
              <CalendarClock className='h-3 w-3' />
              Corregir fecha
            </button>
          ) : null}
          {onReestructurar ? (
            <button
              onClick={onReestructurar}
              disabled={procesando}
              className='inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-all hover:bg-indigo-200 disabled:opacity-50 dark:bg-indigo-800/40 dark:text-indigo-300 dark:hover:bg-indigo-800/60'
            >
              <ArrowRightLeft className='h-3 w-3' />
              Reestructurar
            </button>
          ) : null}
        </div>
      </div>

      {/* Zona B — Próxima cuota + progreso */}
      {proximaCuota ? (
        <div
          className={`rounded-xl border px-4 py-3 ${semaforo?.containerClass ?? ''}`}
        >
          <div className='flex flex-wrap items-start justify-between gap-3'>
            {/* Cuota info */}
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${semaforo?.dotClass ?? ''}`}
                />
                <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  Próxima cuota — N°{proximaCuota.numero_cuota}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${semaforo?.badgeClass ?? ''}`}
                >
                  {proximaCuota.estado === 'Atrasado' ? (
                    <TrendingDown className='h-3 w-3' />
                  ) : (
                    <Clock className='h-3 w-3' />
                  )}
                  {proximaCuota.estado}
                  {proximaCuota.dias_atraso > 0
                    ? ` · ${proximaCuota.dias_atraso}d`
                    : ''}
                </span>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Vence:{' '}
                <strong>
                  {formatDateCompact(proximaCuota.fecha_vencimiento)}
                </strong>
              </p>
            </div>

            {/* Desglose importes */}
            <div className='space-y-0.5 text-right text-xs'>
              <div className='flex items-center justify-end gap-3 text-gray-600 dark:text-gray-400'>
                <span>Valor cuota:</span>
                <span className='font-medium'>
                  ${proximaCuota.valor_cuota.toLocaleString('es-CO')}
                </span>
              </div>
              {proximaCuota.mora_sugerida > 0 ? (
                <div className='flex items-center justify-end gap-3 text-orange-600 dark:text-orange-400'>
                  <span>Mora sugerida:</span>
                  <span className='font-medium'>
                    ~${proximaCuota.mora_sugerida.toLocaleString('es-CO')}
                  </span>
                </div>
              ) : null}
              <div
                className={`flex items-center justify-end gap-3 border-t pt-0.5 ${semaforo?.totalBorderClass ?? ''}`}
              >
                <span className='font-semibold text-gray-900 dark:text-white'>
                  Total a pagar:
                </span>
                <span className={`font-bold ${semaforo?.totalTextClass ?? ''}`}>
                  $
                  {(
                    proximaCuota.valor_cuota + (proximaCuota.mora_sugerida ?? 0)
                  ).toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          {progresoCredito.totalCuotas > 0 ? (
            <div className='mt-3 space-y-1'>
              <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400'>
                <span>
                  {progresoCredito.cuotasCubiertas} de{' '}
                  {progresoCredito.totalCuotas} cuotas cubiertas
                </span>
                <span>{progresoCredito.porcentaje}%</span>
              </div>
              <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                <div
                  className='h-full rounded-full bg-indigo-500 transition-all duration-500 dark:bg-indigo-400'
                  style={{ width: `${progresoCredito.porcentaje}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* Crédito completado */
        <div className='flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800/50 dark:bg-green-900/10'>
          <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400' />
          <div>
            <p className='text-sm font-semibold text-green-800 dark:text-green-200'>
              Crédito completado ✓
            </p>
            <p className='text-xs text-green-600 dark:text-green-400'>
              Todas las {progresoCredito.totalCuotas} cuotas han sido cubiertas.
            </p>
          </div>
          {progresoCredito.totalCuotas > 0 ? (
            <div className='ml-auto'>
              <div className='h-1.5 w-24 overflow-hidden rounded-full bg-green-200 dark:bg-green-800'>
                <div className='h-full w-full rounded-full bg-green-500' />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface SemaforoConfig {
  containerClass: string
  dotClass: string
  badgeClass: string
  totalBorderClass: string
  totalTextClass: string
}

function getSemaforo(cuota: ProximaCuota): SemaforoConfig {
  if (cuota.estado === 'Atrasado') {
    return {
      containerClass:
        'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/10',
      dotClass: 'bg-red-500',
      badgeClass:
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      totalBorderClass: 'border-red-200 dark:border-red-700',
      totalTextClass: 'text-red-700 dark:text-red-300',
    }
  }

  // Calcular días hasta vencimiento
  const hoy = new Date()
  const vence = new Date(cuota.fecha_vencimiento + 'T12:00:00')
  const diasHasta = Math.ceil(
    (vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diasHasta <= 7) {
    return {
      containerClass:
        'border-yellow-200 bg-yellow-50 dark:border-yellow-800/50 dark:bg-yellow-900/10',
      dotClass: 'bg-yellow-500',
      badgeClass:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      totalBorderClass: 'border-yellow-200 dark:border-yellow-700',
      totalTextClass: 'text-yellow-700 dark:text-yellow-300',
    }
  }

  return {
    containerClass:
      'border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-900/10',
    dotClass: 'bg-green-500',
    badgeClass:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    totalBorderClass: 'border-indigo-200 dark:border-indigo-700',
    totalTextClass: 'text-indigo-700 dark:text-indigo-300',
  }
}

interface StatProps {
  label: string
  value: string
  highlight?: boolean
}

function Stat({ label, value, highlight = false }: StatProps) {
  return (
    <div>
      <p className='text-xs text-gray-500 dark:text-gray-400'>{label}</p>
      <p
        className={`text-sm font-semibold ${highlight ? 'text-red-600 dark:text-red-400' : 'text-indigo-700 dark:text-indigo-300'}`}
      >
        {value}
      </p>
    </div>
  )
}
