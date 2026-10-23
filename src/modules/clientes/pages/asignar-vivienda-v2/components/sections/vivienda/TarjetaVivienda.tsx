/**
 * Casa elegida: código, proyecto, desglose del valor (base, notariales,
 * esquinera, descuento) y el total que el cliente debe cubrir.
 */

'use client'

import { motion } from 'framer-motion'
import { Building2, Calculator, CornerDownRight, Home } from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import type { ViviendaDetalle } from '@/modules/clientes/components/asignar-vivienda/types'

function Fila({
  etiqueta,
  valor,
  tono = 'normal',
}: {
  etiqueta: string
  valor: string
  tono?: 'normal' | 'descuento'
}) {
  return (
    <div className='flex items-center justify-between gap-3 text-sm'>
      <span className='text-gray-600 dark:text-gray-300'>{etiqueta}</span>
      <span
        className={
          tono === 'descuento'
            ? 'font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'
            : 'font-semibold tabular-nums text-gray-900 dark:text-white'
        }
      >
        {valor}
      </span>
    </div>
  )
}

export function TarjetaVivienda({
  vivienda,
  proyecto,
  valorBase,
  gastosNotariales,
  recargoEsquinera,
  descuento,
  valorTotal,
}: {
  vivienda: ViviendaDetalle
  proyecto: string
  valorBase: number
  gastosNotariales: number
  recargoEsquinera: number
  descuento: number
  valorTotal: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className='overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm dark:border-cyan-500/30 dark:bg-gray-900'
    >
      <div className='flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-white'>
        <span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30'>
          <Home className='h-5 w-5' />
        </span>
        <div className='min-w-0'>
          <p className='font-bold'>
            Manzana {vivienda.manzana_nombre ?? '?'} · Casa {vivienda.numero}
          </p>
          <p className='flex flex-wrap items-center gap-x-3 text-xs text-white/85'>
            <span className='inline-flex items-center gap-1'>
              <Building2 className='h-3 w-3' />
              {proyecto}
            </span>
            {recargoEsquinera > 0 ? (
              <span className='inline-flex items-center gap-1'>
                <CornerDownRight className='h-3 w-3' />
                Esquinera
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className='space-y-1.5 px-4 py-3'>
        <Fila etiqueta='Valor de la casa' valor={formatCurrency(valorBase)} />
        <Fila
          etiqueta='Gastos notariales'
          valor={`+ ${formatCurrency(gastosNotariales)}`}
        />
        {recargoEsquinera > 0 ? (
          <Fila
            etiqueta='Recargo esquinera'
            valor={`+ ${formatCurrency(recargoEsquinera)}`}
          />
        ) : null}
        {descuento > 0 ? (
          <Fila
            etiqueta='Descuento'
            valor={`− ${formatCurrency(descuento)}`}
            tono='descuento'
          />
        ) : null}
      </div>

      <div className='flex items-center justify-between gap-3 border-t border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 dark:border-cyan-500/20 dark:from-cyan-500/10 dark:to-blue-500/5'>
        <span className='flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100'>
          <Calculator className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
          Total que debe cubrir el cliente
        </span>
        <span className='text-xl font-extrabold tabular-nums text-cyan-700 dark:text-cyan-300'>
          {formatCurrency(valorTotal)}
        </span>
      </div>
    </motion.div>
  )
}
