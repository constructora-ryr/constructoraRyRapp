/**
 * Cuadrícula con todos los números de la manzana: los libres se eligen con
 * un toque; los ya registrados aparecen tachados y no se pueden elegir.
 */

'use client'

import { cn } from '@/shared/utils/helpers'

import type { NumeroCasa } from '../../hooks/usePasoUbicacion'

export function SelectorNumero({
  numeros,
  seleccionado,
  onSeleccionar,
  cargando,
  error,
}: {
  numeros: NumeroCasa[]
  seleccionado: string
  onSeleccionar: (numero: string) => void
  cargando: boolean
  error?: boolean
}) {
  if (cargando) {
    return (
      <div className='h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800' />
    )
  }

  return (
    <div>
      <div
        role='radiogroup'
        aria-label='Número de casa'
        className={cn(
          'grid grid-cols-6 gap-1.5 rounded-xl sm:grid-cols-10',
          error &&
            'ring-2 ring-red-500/40 ring-offset-2 dark:ring-offset-gray-900'
        )}
      >
        {numeros.map(({ numero, ocupado }) => {
          const activo = numero === seleccionado
          return (
            <button
              key={numero}
              type='button'
              role='radio'
              aria-checked={activo}
              disabled={ocupado}
              title={ocupado ? `Casa ${numero} ya registrada` : undefined}
              onClick={() => onSeleccionar(numero)}
              className={cn(
                'flex h-10 items-center justify-center rounded-lg border-2 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50',
                ocupado &&
                  'cursor-not-allowed border-transparent bg-gray-100 text-gray-400 line-through dark:bg-gray-800 dark:text-gray-600',
                !ocupado &&
                  !activo &&
                  'border-gray-200 bg-white text-gray-800 hover:border-orange-400 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
                activo &&
                  'scale-105 border-transparent bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
              )}
            >
              {numero}
            </button>
          )
        })}
      </div>
      <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400'>
        <span className='flex items-center gap-1.5'>
          <span className='h-3 w-3 rounded border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900' />
          Libre
        </span>
        <span className='flex items-center gap-1.5'>
          <span className='h-3 w-3 rounded bg-gray-200 dark:bg-gray-700' />
          Ya registrada
        </span>
        <span className='flex items-center gap-1.5'>
          <span className='h-3 w-3 rounded bg-gradient-to-br from-orange-500 to-amber-500' />
          Seleccionada
        </span>
      </div>
    </div>
  )
}
