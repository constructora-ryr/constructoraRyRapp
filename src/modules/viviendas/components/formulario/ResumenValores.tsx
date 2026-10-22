/**
 * Desglose del valor de la vivienda: base + gastos notariales + recargo =
 * total. Se usa en el paso financiero y en el resumen final.
 */

'use client'

import { AlertTriangle, Calculator } from 'lucide-react'

import type { ResumenFinanciero } from '../../types'
import { formatCurrency } from '../../utils'

export function ResumenValores({
  resumen,
  errorConfiguracion = false,
}: {
  resumen: ResumenFinanciero
  errorConfiguracion?: boolean
}) {
  const filas = [
    { etiqueta: 'Valor base', valor: resumen.valor_base, signo: '' },
    {
      etiqueta: 'Gastos notariales',
      valor: resumen.gastos_notariales,
      signo: '+',
    },
    ...(resumen.recargo_esquinera > 0
      ? [
          {
            etiqueta: 'Recargo esquinera',
            valor: resumen.recargo_esquinera,
            signo: '+',
          },
        ]
      : []),
  ]

  return (
    <div className='overflow-hidden rounded-xl border border-orange-200 dark:border-orange-900/60'>
      <div className='space-y-1.5 bg-white p-3 dark:bg-gray-900'>
        {filas.map(f => (
          <div
            key={f.etiqueta}
            className='flex items-center justify-between text-sm'
          >
            <span className='text-gray-600 dark:text-gray-400'>
              {f.etiqueta}
            </span>
            <span className='font-semibold tabular-nums text-gray-900 dark:text-white'>
              {f.signo} {formatCurrency(f.valor)}
            </span>
          </div>
        ))}
        {errorConfiguracion ? (
          <p className='flex items-start gap-1.5 pt-1 text-xs text-amber-700 dark:text-amber-400'>
            <AlertTriangle className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
            No se pudo cargar la configuración de gastos o recargos. Recarga la
            página antes de guardar.
          </p>
        ) : null}
      </div>
      <div className='flex items-center justify-between gap-3 bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2.5 text-white'>
        <span className='flex items-center gap-2 text-sm font-semibold'>
          <Calculator className='h-4 w-4' />
          Valor total
        </span>
        <span className='text-lg font-extrabold tabular-nums'>
          {formatCurrency(resumen.valor_total)}
        </span>
      </div>
    </div>
  )
}
