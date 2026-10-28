'use client'

import { useState } from 'react'

import { CheckCircle2, ChevronRight, Hourglass } from 'lucide-react'

import { formatCurrency } from '@/shared/utils/format'
import { cn } from '@/shared/utils/helpers'

import type { EntidadFinancieraResumen } from '../types'
import { avance, etiquetaTipo } from '../utils/reportes.utils'

import { BarraDesembolso, IconoEntidad } from './piezas'

type Orden = 'monto' | 'pendiente'

const ORDENES: { id: Orden; label: string }[] = [
  { id: 'monto', label: 'Mayor monto' },
  { id: 'pendiente', label: 'Más pendiente' },
]

interface ListaEntidadesProps {
  entidades: EntidadFinancieraResumen[]
  seleccionadaId: string
  onSeleccionar: (id: string) => void
}

/** Entidades en filas: monto, avance del desembolso y lo que falta */
export function ListaEntidades({
  entidades,
  seleccionadaId,
  onSeleccionar,
}: ListaEntidadesProps) {
  const [orden, setOrden] = useState<Orden>('monto')
  const ordenadas = [...entidades].sort((a, b) =>
    orden === 'monto'
      ? b.montoTotalAprobado - a.montoTotalAprobado
      : b.totalPendiente - a.totalPendiente
  )

  return (
    <section
      aria-labelledby='entidades-titulo'
      className='rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
    >
      <div className='flex flex-wrap items-center justify-between gap-2 px-3 pb-2 pt-2'>
        <h2
          id='entidades-titulo'
          className='text-sm font-semibold text-slate-900 dark:text-white'
        >
          Entidades ({entidades.length})
        </h2>
        <div
          role='group'
          aria-label='Ordenar entidades'
          className='flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-900/60'
        >
          {ORDENES.map(o => (
            <button
              key={o.id}
              type='button'
              onClick={() => setOrden(o.id)}
              aria-pressed={orden === o.id}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                orden === o.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <ul className='space-y-1'>
        {ordenadas.map(e => (
          <li key={e.id}>
            <FilaEntidad
              entidad={e}
              seleccionada={e.id === seleccionadaId}
              onSeleccionar={onSeleccionar}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

function FilaEntidad({
  entidad: e,
  seleccionada,
  onSeleccionar,
}: {
  entidad: EntidadFinancieraResumen
  seleccionada: boolean
  onSeleccionar: (id: string) => void
}) {
  const pct = avance(e.montoTotalAprobado, e.totalDesembolsado)
  return (
    <button
      type='button'
      onClick={() => onSeleccionar(e.id)}
      aria-pressed={seleccionada}
      className={cn(
        'group w-full rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
        seleccionada
          ? 'bg-sky-50 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/10 dark:ring-sky-500/30'
          : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
      )}
    >
      <div className='flex items-center gap-3'>
        <IconoEntidad tipoFuente={e.tipoFuente} />
        <div className='min-w-0 flex-1'>
          <div className='flex items-baseline justify-between gap-3'>
            <p className='truncate text-sm font-semibold text-slate-900 dark:text-white'>
              {e.nombre}
            </p>
            <p className='shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-white'>
              {formatCurrency(e.montoTotalAprobado)}
            </p>
          </div>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {etiquetaTipo(e.tipo)} · {e.totalClientesUnicos}{' '}
            {e.totalClientesUnicos === 1 ? 'cliente' : 'clientes'}
          </p>
        </div>
        <ChevronRight
          className={cn(
            'h-4 w-4 shrink-0 transition-transform',
            seleccionada
              ? 'text-sky-600 dark:text-sky-400'
              : 'text-slate-400 group-hover:translate-x-0.5 dark:text-slate-500'
          )}
        />
      </div>

      <div className='mt-2.5 flex items-center gap-3 pl-[3.25rem] pr-7'>
        <BarraDesembolso porcentaje={pct} />
        <span className='w-11 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300'>
          {Math.floor(pct)}%
        </span>
      </div>
      <p className='mt-1.5 pl-[3.25rem] text-xs'>
        {e.totalPendiente > 0 ? (
          <span className='inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300'>
            <Hourglass className='h-3.5 w-3.5' />
            Faltan {formatCurrency(e.totalPendiente)} · {e.fuentesPendientes}{' '}
            {e.fuentesPendientes === 1 ? 'pendiente' : 'pendientes'}
          </span>
        ) : (
          <span className='inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400'>
            <CheckCircle2 className='h-3.5 w-3.5' />
            Todo desembolsado
          </span>
        )}
      </p>
    </button>
  )
}
