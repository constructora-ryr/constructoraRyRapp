'use client'

import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, Hourglass, Users } from 'lucide-react'

import { formatCurrency } from '@/shared/utils/format'
import { cn } from '@/shared/utils/helpers'

import type { ResumenFinanciacion as Resumen } from '../types'
import { avance } from '../utils/reportes.utils'

import { BarraDesembolso } from './piezas'

/**
 * Lo aprobado por bancos y subsidios: cuánto se aprobó, cuánto ya giraron
 * las entidades y cuánto falta (lo que hay que perseguir). No se dice
 * "financiado": los subsidios no son préstamos.
 */
export function ResumenFinanciacion({ resumen }: { resumen: Resumen }) {
  const pct = avance(resumen.montoAprobado, resumen.desembolsado)
  // Hacia abajo: 99,96 % con algo pendiente no debe verse como 100,0 %
  const pctTexto = (Math.floor(pct * 10) / 10).toLocaleString('es-CO', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  return (
    <section
      aria-label='Resumen de créditos y subsidios'
      className='grid gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 sm:p-6 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-8'
    >
      <div className='min-w-0'>
        <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>
          Total aprobado por entidades
        </p>
        <p className='mt-0.5 text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white'>
          {formatCurrency(resumen.montoAprobado)}
        </p>
        <div className='mt-4'>
          <BarraDesembolso porcentaje={pct} grosor='h-3' />
          <p className='mt-2 text-sm text-slate-600 dark:text-slate-300'>
            <span className='font-semibold text-emerald-700 dark:text-emerald-400'>
              {pctTexto}% ya desembolsado
            </span>
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1'>
        <Cifra
          icon={CheckCircle2}
          label='Desembolsado'
          valor={formatCurrency(resumen.desembolsado)}
          tono='bg-gradient-to-br from-emerald-500 to-teal-600'
        />
        <Cifra
          icon={Hourglass}
          label='Por desembolsar'
          valor={formatCurrency(resumen.pendiente)}
          detalle={
            resumen.clientesPendientes > 0
              ? `${resumen.clientesPendientes} ${resumen.clientesPendientes === 1 ? 'cliente' : 'clientes'}`
              : 'Nada pendiente'
          }
          tono='bg-gradient-to-br from-amber-400 to-orange-500'
          destacado={resumen.pendiente > 0}
        />
        <Cifra
          icon={Users}
          label='Clientes con crédito o subsidio'
          valor={String(resumen.clientes)}
          tono='bg-gradient-to-br from-sky-500 to-blue-600'
        />
      </div>
    </section>
  )
}

function Cifra({
  icon: Icon,
  label,
  valor,
  detalle,
  tono,
  destacado = false,
}: {
  icon: LucideIcon
  label: string
  valor: string
  detalle?: string
  tono: string
  destacado?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5',
        destacado
          ? 'bg-amber-50 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/25'
          : 'bg-slate-50 dark:bg-slate-900/40'
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
          tono
        )}
      >
        <Icon className='h-4 w-4' />
      </span>
      <div className='min-w-0'>
        <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
          {label}
        </p>
        <p className='truncate text-base font-bold tabular-nums text-slate-900 dark:text-white'>
          {valor}
          {detalle && (
            <span
              className={cn(
                'ml-1.5 text-xs font-medium',
                destacado
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              · {detalle}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
