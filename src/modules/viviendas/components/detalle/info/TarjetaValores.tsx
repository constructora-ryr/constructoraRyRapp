/**
 * Valores de la vivienda: desglose comercial (base + notariales + recargo) y,
 * si está negociada, precio pactado con el avance de pagos.
 */

'use client'

import { DollarSign } from 'lucide-react'

import type { Vivienda } from '@/modules/viviendas/types'
import { formatCurrency } from '@/modules/viviendas/utils'

import { ResumenValores } from '../../formulario/ResumenValores'
import { TarjetaDetalle } from '../piezas'

export function TarjetaValores({ vivienda }: { vivienda: Vivienda }) {
  const recargo = vivienda.es_esquinera ? vivienda.recargo_esquinera || 0 : 0
  const pactado = vivienda.valor_negociado
  const pct = Math.min(vivienda.porcentaje_pagado ?? 0, 100)

  return (
    <TarjetaDetalle titulo='Valores' icon={DollarSign}>
      <ResumenValores
        resumen={{
          valor_base: vivienda.valor_base || 0,
          gastos_notariales: vivienda.gastos_notariales || 0,
          recargo_esquinera: recargo,
          valor_total: vivienda.valor_total || 0,
        }}
      />

      {pactado ? (
        <div className='mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700'>
          <div className='flex items-baseline justify-between gap-2'>
            <p className='text-xs font-semibold text-slate-600 dark:text-slate-300'>
              Precio pactado en la negociación
            </p>
            <p className='text-sm font-bold tabular-nums text-slate-900 dark:text-white'>
              {formatCurrency(pactado)}
            </p>
          </div>
          <div className='mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-700'
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className='mt-1.5 flex flex-wrap justify-between gap-x-3 text-xs text-slate-500 dark:text-slate-400'>
            <span>
              Abonado{' '}
              <strong className='text-emerald-600 dark:text-emerald-400'>
                {formatCurrency(vivienda.total_abonado || 0)}
              </strong>{' '}
              · {pct}%
            </span>
            <span>
              Saldo{' '}
              <strong className='text-slate-800 dark:text-slate-200'>
                {formatCurrency(vivienda.saldo_pendiente || 0)}
              </strong>
            </span>
          </div>
        </div>
      ) : null}
    </TarjetaDetalle>
  )
}
