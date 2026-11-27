'use client'

import { cn } from '@/shared/utils/helpers'

import type { EstadoFiltroOpcion } from './EstadoFiltroCards'

interface EstadoFiltroTabsProps<T extends string> {
  opciones: EstadoFiltroOpcion<T>[]
  seleccionado: T
  onSeleccionar: (value: T) => void
  ariaLabel: string
}

/**
 * Filtro de estado como pestañas con conteo ("Activos 9"), pegado a la
 * búsqueda y a la tabla. Recibe las mismas opciones que EstadoFiltroCards:
 * el ícono toma el color del número de cada estado, y la pestaña activa se
 * subraya con su degradado. En celular se desliza de lado.
 */
export function EstadoFiltroTabs<T extends string>({
  opciones,
  seleccionado,
  onSeleccionar,
  ariaLabel,
}: EstadoFiltroTabsProps<T>) {
  return (
    <div className='-mb-px overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <div
        role='radiogroup'
        aria-label={ariaLabel}
        className='flex min-w-max gap-1 px-2'
      >
        {opciones.map(o => {
          const activo = o.value === seleccionado
          const Icon = o.icon
          const vacio = o.count === 0 && !activo
          return (
            <button
              key={o.value}
              type='button'
              role='radio'
              aria-checked={activo}
              onClick={() => onSeleccionar(o.value)}
              className={cn(
                'group relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400',
                activo
                  ? 'font-semibold text-slate-900 dark:text-white'
                  : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                vacio && 'opacity-60'
              )}
            >
              {Icon ? (
                <Icon
                  className={cn(
                    'h-4 w-4',
                    o.text ?? 'text-slate-500 dark:text-slate-400',
                    o.iconFilled && 'fill-current'
                  )}
                />
              ) : o.dot ? (
                <span className={cn('h-2 w-2 rounded-full', o.dot)} />
              ) : null}
              {o.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-px text-xs font-semibold tabular-nums',
                  activo
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                )}
              >
                {o.count.toLocaleString('es-CO')}
              </span>
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gradient-to-r transition-opacity',
                  o.gradient ?? 'from-slate-600 to-slate-800',
                  activo ? 'opacity-100' : 'opacity-0'
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
