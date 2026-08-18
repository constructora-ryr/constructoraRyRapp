'use client'

import { ArrowDownToLine, CheckCircle2, ExternalLink } from 'lucide-react'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/shared/utils/format'

interface ExcedenteDevolucionBannersProps {
  diferencia: number
  estado: 'pendiente' | 'procesada' | null | undefined
  monto: number | null | undefined
  fecha: string | null | undefined
  comprobanteUrl: string | null | undefined
  puedeAjustar: boolean
  onRegistrar: () => void
}

export function ExcedenteDevolucionBanners({
  diferencia,
  estado,
  monto,
  fecha,
  comprobanteUrl,
  puedeAjustar,
  onRegistrar,
}: ExcedenteDevolucionBannersProps) {
  if (diferencia >= 0) return null

  const montoExcedente = Math.abs(diferencia)
  const fechaFormateada = fecha ? formatDateForDisplay(fecha) : null

  if (estado === 'procesada') {
    return (
      <div className='relative overflow-hidden rounded-lg border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 dark:border-emerald-700/60 dark:from-emerald-950/40 dark:to-teal-950/20'>
        <div className='absolute left-0 top-0 h-full w-1 bg-emerald-500' />
        <div className='flex items-center gap-3 px-4 py-2.5'>
          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40'>
            <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-bold text-emerald-800 dark:text-emerald-300'>
              Devolución Registrada — {formatCurrency(monto ?? montoExcedente)}
            </p>
            <p className='mt-0.5 text-[10px] text-emerald-700 dark:text-emerald-400'>
              El excedente fue devuelto al cliente.
              {fechaFormateada ? ` Fecha: ${fechaFormateada}.` : ''}
            </p>
          </div>
          {comprobanteUrl && (
            <a
              href={`/api/negociaciones/comprobante-devolucion?path=${encodeURIComponent(comprobanteUrl)}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
            >
              <ExternalLink className='h-3 w-3' />
              Ver comprobante
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='relative overflow-hidden rounded-lg border border-amber-300 bg-gradient-to-r from-amber-50 via-amber-50 to-orange-50 dark:border-amber-700/60 dark:from-amber-950/40 dark:via-amber-950/30 dark:to-orange-950/20'>
      <div className='absolute left-0 top-0 h-full w-1 bg-amber-500' />
      <div className='flex items-center gap-3 px-4 py-2.5'>
        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40'>
          <ArrowDownToLine className='h-4 w-4 text-amber-600 dark:text-amber-400' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-bold text-amber-800 dark:text-amber-300'>
            Devolución pendiente al cliente — {formatCurrency(montoExcedente)}
          </p>
          <p className='mt-0.5 text-[10px] leading-relaxed text-amber-700 dark:text-amber-400'>
            Las fuentes de pago registradas suman{' '}
            {formatCurrency(montoExcedente)} más que el valor total de la
            negociación. Una vez se completen los desembolsos, ese excedente
            deberá ser devuelto al cliente.
          </p>
        </div>
        {puedeAjustar ? (
          <button
            onClick={onRegistrar}
            className='flex-shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow transition-colors hover:bg-amber-600'
          >
            Registrar
          </button>
        ) : null}
      </div>
    </div>
  )
}
