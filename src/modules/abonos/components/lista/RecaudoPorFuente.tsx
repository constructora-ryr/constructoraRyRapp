'use client'

import { formatCOP } from '@/shared/components/list-page'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { cn } from '@/shared/utils/helpers'

import { fuenteVisual } from './fuente-visual'

interface RecaudoPorFuenteProps {
  porFuente: { tipo: string; monto: number }[]
  /** Fuente filtrada ('todas' = ninguna) */
  seleccionada: string
  onSeleccionar: (tipo: string) => void
}

/**
 * Barra apilada del recaudo por fuente de pago. Cada segmento (y su leyenda)
 * filtra la tabla por esa fuente; un segundo clic quita el filtro.
 */
export function RecaudoPorFuente({
  porFuente,
  seleccionada,
  onSeleccionar,
}: RecaudoPorFuenteProps) {
  const total = porFuente.reduce((s, f) => s + f.monto, 0)
  if (total <= 0) return null

  const hayFiltro = seleccionada !== 'todas'
  const alternar = (tipo: string) =>
    onSeleccionar(seleccionada === tipo ? 'todas' : tipo)
  const pct = (m: number) => (m / total) * 100

  return (
    <section
      aria-label='Recaudo por fuente de pago'
      className='rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
    >
      <div className='mb-2.5 flex items-baseline justify-between gap-3'>
        <h2 className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
          Recaudo por fuente
        </h2>
        <span className='text-sm font-bold tabular-nums text-slate-900 dark:text-white'>
          {formatCOP(total)}
        </span>
      </div>

      {/* Barra */}
      <div className='flex h-3.5 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50'>
        {porFuente.map(f => {
          const v = fuenteVisual(f.tipo)
          const activo = !hayFiltro || seleccionada === f.tipo
          return (
            <Tooltip
              key={f.tipo}
              delayDuration={100}
              content={`${f.tipo}: ${formatCOP(f.monto)} (${pct(f.monto).toFixed(1)} %)`}
            >
              <button
                type='button'
                onClick={() => alternar(f.tipo)}
                aria-label={`Filtrar por ${f.tipo}`}
                aria-pressed={seleccionada === f.tipo}
                style={{ width: `${pct(f.monto)}%` }}
                className={cn(
                  'h-full min-w-[6px] transition-all duration-200 first:rounded-l-full last:rounded-r-full hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
                  v.solid,
                  !activo && 'opacity-25'
                )}
              />
            </Tooltip>
          )
        })}
      </div>

      {/* Leyenda */}
      <ul className='mt-3 flex flex-wrap gap-x-1 gap-y-1'>
        {porFuente.map(f => {
          const v = fuenteVisual(f.tipo)
          const Icono = v.icon
          const elegido = seleccionada === f.tipo
          return (
            <li key={f.tipo}>
              <button
                type='button'
                onClick={() => alternar(f.tipo)}
                aria-pressed={elegido}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50',
                  elegido &&
                    'bg-slate-100 ring-1 ring-slate-300 dark:bg-slate-700/60 dark:ring-slate-600',
                  hayFiltro && !elegido && 'opacity-50'
                )}
              >
                <Icono className={cn('h-3.5 w-3.5', v.text)} />
                <span className='font-medium text-slate-700 dark:text-slate-200'>
                  {f.tipo}
                </span>
                <span className='font-semibold tabular-nums text-slate-500 dark:text-slate-400'>
                  {Math.round(pct(f.monto))}%
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
