'use client'

import type { LucideIcon } from 'lucide-react'

import { AnimatedCounter } from '@/shared/components/ui/AnimatedCounter'

export interface EstadoFiltroOpcion<T extends string> {
  value: T
  label: string
  count: number
  /** Ícono del estado (va en un cuadro con degradado) */
  icon?: LucideIcon
  /** Degradado del cuadro del ícono: 'from-emerald-500 to-green-600' */
  gradient?: string
  /** Color del número */
  text?: string
  /** Clases cuando la tarjeta está seleccionada (borde + anillo + tinte) */
  selected?: string
  /** Rellenar el ícono (p.ej. estrella sólida) */
  iconFilled?: boolean
  /** Punto de color (si no hay ícono) */
  dot?: string
}

// Clases completas para que Tailwind las detecte
const COLUMNAS_LG: Record<number, string> = {
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
}

interface EstadoFiltroCardsProps<T extends string> {
  opciones: EstadoFiltroOpcion<T>[]
  seleccionado: T
  onSeleccionar: (value: T) => void
  ariaLabel: string
  /** Total para mostrar el % de cada estado (la opción con este valor no lo muestra) */
  total?: number
}

/**
 * Tarjetas de conteo que a la vez son el filtro de estado: un clic en
 * "Activos 9" filtra la tabla. Reemplaza el par tarjetas + chips duplicados.
 */
export function EstadoFiltroCards<T extends string>({
  opciones,
  seleccionado,
  onSeleccionar,
  ariaLabel,
  total,
}: EstadoFiltroCardsProps<T>) {
  return (
    <div
      role='radiogroup'
      aria-label={ariaLabel}
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${COLUMNAS_LG[opciones.length] ?? 'lg:grid-cols-6'}`}
    >
      {opciones.map(o => {
        const activo = o.value === seleccionado
        const Icon = o.icon
        return (
          <button
            key={o.value}
            type='button'
            role='radio'
            aria-checked={activo}
            onClick={() => onSeleccionar(o.value)}
            className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
              activo
                ? (o.selected ??
                  'border-slate-900 bg-white ring-1 ring-slate-900 dark:border-white dark:bg-slate-800')
                : 'border-slate-200/80 bg-white shadow-sm hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:border-slate-600'
            }`}
          >
            {Icon ? (
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-105 ${o.gradient ?? 'from-slate-500 to-slate-700'} ${o.count === 0 && !activo ? 'opacity-50 grayscale-[30%]' : ''}`}
              >
                <Icon
                  className={`h-5 w-5 ${o.iconFilled ? 'fill-white' : ''}`}
                />
              </span>
            ) : (
              o.dot && (
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${o.dot}`}
                />
              )
            )}
            <span className='min-w-0'>
              <span
                className={`block text-2xl font-bold leading-tight tracking-tight ${
                  o.count === 0 && !activo
                    ? 'text-slate-300 dark:text-slate-600'
                    : (o.text ?? 'text-slate-900 dark:text-white')
                }`}
              >
                <AnimatedCounter value={o.count} duration={0.8} />
              </span>
              <span className='flex items-center gap-1.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400'>
                {o.label}
                {total !== undefined && total > 0 && o.count !== total && (
                  <span
                    title={`${o.count} de ${total}`}
                    className='rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-semibold tabular-nums text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                  >
                    {Math.round((o.count / total) * 100)}%
                  </span>
                )}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
