'use client'

import { CheckCircle2 } from 'lucide-react'

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(v)
    .replace(/\s/g, '')

interface PagoProgresoProps {
  /** Valor total a pagar */
  valorTotal: number
  /** Lo que falta por pagar */
  saldo: number
  /** Avance 0-100 */
  porcentaje: number
}

/**
 * Estado de pago en una sola celda: "✓ Pagado" + total, o el saldo en ámbar
 * con su barra de avance. Compartido por Clientes y Viviendas.
 */
export function PagoProgreso({
  valorTotal,
  saldo,
  porcentaje,
}: PagoProgresoProps) {
  const pagado = saldo <= 0 && valorTotal > 0
  const secundario =
    'block truncate text-xs tabular-nums text-slate-500 dark:text-slate-400'

  if (pagado) {
    return (
      <span className='block'>
        <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'>
          <CheckCircle2 className='h-3.5 w-3.5' />
          Pagado
        </span>
        <span className={secundario}>{formatCOP(valorTotal)}</span>
      </span>
    )
  }

  const pct = Math.max(0, Math.min(porcentaje, 99))
  return (
    <span className='block'>
      <span className='flex items-baseline justify-between gap-3'>
        <span className='text-sm font-semibold tabular-nums text-amber-700 dark:text-amber-400'>
          {formatCOP(saldo)}
        </span>
        <span className='text-xs tabular-nums text-slate-500 dark:text-slate-400'>
          {pct}%
        </span>
      </span>
      <span className='mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-500/15'>
        <span
          className='block h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500'
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className={`${secundario} mt-0.5`}>
        por pagar de {formatCOP(valorTotal)}
      </span>
    </span>
  )
}

export { formatCOP }
