/**
 * Recargos por esquinera configurados, como tarjetas para elegir uno. Si la
 * vivienda (en edición) tiene un valor que ya no está en la configuración,
 * se muestra también como opción para no perderlo.
 */

'use client'

import { Check, TrendingUp } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

import type { ConfiguracionRecargo } from '../../types'
import { formatCurrency } from '../../utils'

export function SelectorRecargo({
  recargos,
  valor,
  onSeleccionar,
  bloqueado,
  error,
}: {
  recargos: ConfiguracionRecargo[]
  valor: number
  onSeleccionar: (valor: number) => void
  bloqueado?: boolean
  error?: boolean
}) {
  const opciones = recargos.map(r => ({
    clave: r.id,
    nombre: r.nombre,
    valor: Number(r.valor),
  }))
  if (valor > 0 && !opciones.some(o => o.valor === valor))
    opciones.push({ clave: 'actual', nombre: 'Valor actual', valor })

  if (opciones.length === 0) {
    return (
      <p className='rounded-xl border border-dashed border-amber-300 p-3 text-xs text-amber-700 dark:border-amber-800 dark:text-amber-300'>
        No hay recargos por esquinera configurados.
      </p>
    )
  }

  return (
    <div
      role='radiogroup'
      aria-label='Recargo por esquinera'
      className={cn(
        'grid grid-cols-1 gap-2 rounded-xl sm:grid-cols-2',
        error &&
          'ring-2 ring-red-500/40 ring-offset-2 dark:ring-offset-gray-900'
      )}
    >
      {opciones.map(o => {
        const activo = o.valor === valor
        return (
          <button
            key={o.clave}
            type='button'
            role='radio'
            aria-checked={activo}
            disabled={bloqueado}
            onClick={() => onSeleccionar(o.valor)}
            className={cn(
              'flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60',
              activo
                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30'
                : 'border-gray-200 bg-white hover:border-orange-300 dark:border-gray-700 dark:bg-gray-900'
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                activo
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                  : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300'
              )}
            >
              {activo ? (
                <Check className='h-4 w-4' />
              ) : (
                <TrendingUp className='h-4 w-4' />
              )}
            </span>
            <span className='min-w-0'>
              <span className='block text-sm font-bold text-gray-900 dark:text-white'>
                + {formatCurrency(o.valor)}
              </span>
              <span className='block truncate text-xs text-gray-500 dark:text-gray-400'>
                {o.nombre}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
