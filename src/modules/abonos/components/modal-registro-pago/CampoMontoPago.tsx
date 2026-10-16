'use client'

import { Lock } from 'lucide-react'

import type { ModoRegistro } from '../../types'

import { formatCurrency, type ColorScheme } from './ModalRegistroPago.styles'

/** Extrae el número limpio de un string (posiblemente formateado como moneda) */
function parseMontoRaw(value: string): number {
  return parseFloat(value.replace(/[^0-9]/g, '')) || 0
}

/** Formatea un string numérico a moneda colombiana (ej: "2500000" → "2.500.000") */
export function formatMontoDisplay(value: string): string {
  const raw = value.replace(/[^0-9]/g, '')
  if (!raw) return ''
  return Number(raw).toLocaleString('es-CO')
}

interface CampoMontoPagoProps {
  modo: ModoRegistro
  monto: string
  onMontoChange: (value: string) => void
  saldoPendiente: number
  montoAprobado: number | null
  colorScheme: ColorScheme
  error?: string
  /** Info de overpayment cuando admin ingresa más del saldo (no bloquea, solo advierte) */
  overpaymentInfo?: { excedente: number; esOverpayment: boolean } | null
}

export function CampoMontoPago({
  modo,
  monto,
  onMontoChange,
  saldoPendiente,
  montoAprobado,
  colorScheme,
  error,
  overpaymentInfo,
}: CampoMontoPagoProps) {
  const montoNum = parseMontoRaw(monto)
  const saldoRestante = saldoPendiente - montoNum
  const excedeSaldo = montoNum > saldoPendiente && montoNum > 0
  const esOverpaymentAdmin = excedeSaldo && overpaymentInfo?.esOverpayment

  if (modo === 'desembolso') {
    // ── Readonly card: desembolso total aprobado ────────────────────────────
    return (
      <div
        className={`relative rounded-xl border-2 p-4 ${colorScheme.desembolsoCard}`}
      >
        <Lock
          className='absolute right-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500'
          aria-hidden='true'
        />
        <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
          Monto del desembolso
        </p>
        {montoAprobado != null && montoAprobado > 0 ? (
          <p className={`text-3xl font-black ${colorScheme.textAccent}`}>
            {formatCurrency(montoAprobado)}
          </p>
        ) : (
          <p className='text-lg font-semibold italic text-gray-400 dark:text-gray-500'>
            Pendiente de aprobación
          </p>
        )}
        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
          Desembolso total aprobado · No modificable
        </p>
      </div>
    )
  }

  // ── Editable: abono parcial ─────────────────────────────────────────────────
  return (
    <div>
      <label
        htmlFor='monto-abono'
        className='mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300'
      >
        Monto del abono <span className='text-red-500'>*</span>
      </label>
      <div
        className={`relative flex items-center rounded-xl border-2 transition-all ${error ? 'border-red-400 dark:border-red-600' : 'border-gray-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-gray-700 dark:focus-within:border-emerald-400'} bg-gray-50 dark:bg-gray-800/80`}
      >
        <span className='select-none pl-4 text-base font-semibold text-gray-500 dark:text-gray-400'>
          $
        </span>
        <input
          id='monto-abono'
          type='text'
          inputMode='numeric'
          value={formatMontoDisplay(monto)}
          onChange={e => {
            const raw = e.target.value.replace(/[^0-9]/g, '')
            onMontoChange(raw)
          }}
          placeholder='0'
          className='flex-1 bg-transparent py-2.5 pl-2 pr-4 text-base font-semibold text-gray-900 outline-none dark:text-white'
        />
      </div>

      {error ? (
        <p className='mt-1 text-xs text-red-500 dark:text-red-400'>{error}</p>
      ) : esOverpaymentAdmin ? (
        // Admin overpayment: advertencia amarilla (no bloqueo)
        <div className='mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-700/50 dark:bg-amber-900/20'>
          <p className='text-xs font-semibold text-amber-700 dark:text-amber-300'>
            ⚠ Excede el saldo en{' '}
            {formatCurrency(overpaymentInfo?.excedente ?? 0)}
          </p>
          <p className='mt-0.5 text-xs text-amber-600 dark:text-amber-400'>
            Se registrará una devolución pendiente al cliente por ese monto.
          </p>
        </div>
      ) : montoNum > 0 ? (
        <p
          className={`mt-1.5 text-xs font-medium ${excedeSaldo ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
        >
          {excedeSaldo
            ? `⚠ Excede el saldo en ${formatCurrency(Math.abs(saldoRestante))}`
            : `Saldo restante: ${formatCurrency(saldoRestante)}`}
        </p>
      ) : (
        <p className='mt-1.5 text-xs text-gray-500 dark:text-gray-400'>
          Saldo disponible: {formatCurrency(saldoPendiente)}
        </p>
      )}
    </div>
  )
}
