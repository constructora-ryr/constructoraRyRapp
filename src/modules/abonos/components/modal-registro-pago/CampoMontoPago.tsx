'use client'

import { AlertCircle, AlertTriangle, CheckCircle2, Lock } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

import type { ModoRegistro } from '../../types'

import { formatCurrency, type ColorScheme } from './ModalRegistroPago.styles'

/** "2500000" → "2.500.000" */
export function formatMontoDisplay(value: string): string {
  const raw = value.replace(/[^0-9]/g, '')
  return raw ? Number(raw).toLocaleString('es-CO') : ''
}

interface CampoMontoPagoProps {
  modo: ModoRegistro
  monto: string
  onMontoChange: (value: string) => void
  montoNum: number
  montoAprobado: number
  /** "aprobado" (créditos) o "asignado" (subsidios) */
  etiquetaMonto: string
  montoRecibido: number
  saldoPendiente: number
  saldoDespues: number
  excedente: number
  esAdmin: boolean
  valorCuota?: number
  colorScheme: ColorScheme
  error?: string
}

export function CampoMontoPago({
  modo,
  monto,
  onMontoChange,
  montoNum,
  montoAprobado,
  etiquetaMonto,
  montoRecibido,
  saldoPendiente,
  saldoDespues,
  excedente,
  esAdmin,
  valorCuota,
  colorScheme,
  error,
}: CampoMontoPagoProps) {
  const pct = (v: number) =>
    montoAprobado > 0 ? Math.min((v / montoAprobado) * 100, 100) : 0
  const pctAntes = pct(montoRecibido)
  const pctDespues = pct(montoRecibido + Math.min(montoNum, saldoPendiente))

  const impacto = (
    <div className='rounded-xl bg-gray-50 px-3 py-2.5 ring-1 ring-gray-200 dark:bg-gray-800/60 dark:ring-gray-700'>
      <div className='flex items-center justify-between gap-2 text-xs'>
        <span className='font-medium text-gray-600 dark:text-gray-300'>
          Así queda la fuente
        </span>
        <span className='font-semibold tabular-nums text-gray-900 dark:text-white'>
          {saldoDespues > 0
            ? `Saldo ${formatCurrency(saldoDespues)}`
            : 'Pagada al 100 %'}
        </span>
      </div>
      <div className='relative mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
        <div
          className={cn(
            'absolute inset-y-0 left-0 opacity-40',
            colorScheme.solid
          )}
          style={{ width: `${pctDespues}%` }}
        />
        <div
          className={cn('absolute inset-y-0 left-0', colorScheme.solid)}
          style={{ width: `${pctAntes}%` }}
        />
      </div>
      <p className='mt-1 text-[11px] text-gray-500 dark:text-gray-400'>
        {pctAntes.toFixed(0)} % recibido → {pctDespues.toFixed(0)} % con este
        pago
      </p>
    </div>
  )

  if (modo === 'desembolso') {
    return (
      <div className='space-y-2'>
        <div className={cn('relative rounded-2xl p-4', colorScheme.soft)}>
          <Lock
            className='absolute right-3 top-3 h-4 w-4 text-gray-400'
            aria-hidden='true'
          />
          <p className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
            Monto del desembolso
          </p>
          <p
            className={cn(
              'mt-1 text-3xl font-extrabold tabular-nums',
              colorScheme.text
            )}
          >
            {formatCurrency(montoAprobado)}
          </p>
          <p className='mt-1 text-xs text-gray-600 dark:text-gray-300'>
            La entidad desembolsa el valor {etiquetaMonto} en un solo pago, por
            eso este monto es fijo.
          </p>
        </div>
        {impacto}
      </div>
    )
  }

  const atajos = [
    { etiqueta: 'Todo el saldo', valor: saldoPendiente },
    ...(valorCuota && valorCuota < saldoPendiente
      ? [{ etiqueta: 'Una cuota', valor: valorCuota }]
      : []),
  ].filter(a => a.valor > 0)

  return (
    <div className='space-y-2'>
      <label
        htmlFor='monto-abono'
        className='flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100'
      >
        Monto recibido <span className='text-red-500'>*</span>
      </label>
      <div
        className={cn(
          'flex items-center rounded-2xl border-2 bg-white transition-all dark:bg-gray-800/80',
          error
            ? 'border-red-400 dark:border-red-600'
            : cn(
                'border-gray-200 dark:border-gray-700',
                colorScheme.focusWithin
              )
        )}
      >
        <span className='select-none pl-4 text-xl font-bold text-gray-400'>
          $
        </span>
        <input
          id='monto-abono'
          type='text'
          inputMode='numeric'
          autoComplete='off'
          value={formatMontoDisplay(monto)}
          onChange={e => onMontoChange(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder='0'
          className='min-w-0 flex-1 bg-transparent py-3 pl-2 pr-4 text-2xl font-bold tabular-nums text-gray-900 outline-none placeholder:text-gray-300 dark:text-white dark:placeholder:text-gray-600'
        />
      </div>

      {atajos.length > 0 ? (
        <div className='flex flex-wrap gap-2'>
          {atajos.map(a => (
            <button
              key={a.etiqueta}
              type='button'
              onClick={() => onMontoChange(String(a.valor))}
              className='rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
            >
              {a.etiqueta} · {formatCurrency(a.valor)}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className='flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400'>
          <AlertCircle className='h-3.5 w-3.5' />
          {error}
        </p>
      ) : excedente > 0 && esAdmin ? (
        <div className='flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-700/50 dark:bg-amber-900/20'>
          <AlertTriangle className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400' />
          <p className='text-xs text-amber-800 dark:text-amber-200'>
            <strong>Supera el saldo en {formatCurrency(excedente)}.</strong> Se
            registrará como devolución pendiente al cliente.
          </p>
        </div>
      ) : excedente > 0 ? (
        <p className='flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400'>
          <AlertCircle className='h-3.5 w-3.5' />
          Supera el saldo pendiente en {formatCurrency(excedente)}
        </p>
      ) : montoNum > 0 && saldoDespues === 0 ? (
        <p className='flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
          <CheckCircle2 className='h-3.5 w-3.5' />
          Con este pago la fuente queda saldada
        </p>
      ) : null}

      {montoNum > 0 ? impacto : null}
    </div>
  )
}
