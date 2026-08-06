'use client'

import { AlertTriangle } from 'lucide-react'

import { formatCurrency } from '@/shared/utils/format'

interface DescuadreFinancieroAlertProps {
  diferencia: number
  puedeAjustar: boolean
  onCorregir: () => void
}

export function DescuadreFinancieroAlert({
  diferencia,
  puedeAjustar,
  onCorregir,
}: DescuadreFinancieroAlertProps) {
  return (
    <div className='relative overflow-hidden rounded-lg border border-red-300 bg-gradient-to-r from-red-50 via-red-50 to-orange-50 dark:border-red-800/60 dark:from-red-950/40 dark:via-red-950/30 dark:to-orange-950/20'>
      <div className='absolute left-0 top-0 h-full w-1 bg-red-500' />
      <div className='flex items-center gap-3 px-4 py-2.5'>
        <div className='relative flex-shrink-0'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40'>
            <AlertTriangle className='h-4 w-4 text-red-600 dark:text-red-400' />
          </div>
          <span className='absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-red-50 bg-red-500 dark:border-red-950'>
            <span className='absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75' />
          </span>
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-bold text-red-800 dark:text-red-300'>
            Descuadre en Cierre Financiero — Atención Requerida
          </p>
          <p className='mt-0.5 text-[10px] text-red-700 dark:text-red-400'>
            {diferencia > 0
              ? `Faltan ${formatCurrency(diferencia)} para cubrir el valor total.`
              : `Sobran ${formatCurrency(Math.abs(diferencia))} en las fuentes de pago.`}{' '}
            Los registros de abonos permanecerán bloqueados hasta resolver el
            descuadre.
          </p>
        </div>
        {puedeAjustar ? (
          <button
            onClick={onCorregir}
            className='flex-shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
          >
            Corregir ahora
          </button>
        ) : null}
      </div>
    </div>
  )
}
