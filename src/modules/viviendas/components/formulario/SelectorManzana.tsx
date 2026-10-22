/**
 * Manzanas del proyecto como tarjetas: cuántas casas faltan por registrar y
 * una barra con lo ya registrado.
 */

'use client'

import { Check, MapPin } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

import type { ManzanaConDisponibilidad } from '../../types'

export function SelectorManzana({
  manzanas,
  seleccionada,
  onSeleccionar,
  cargando,
  error,
}: {
  manzanas: ManzanaConDisponibilidad[]
  seleccionada: string
  onSeleccionar: (id: string) => void
  cargando: boolean
  error?: boolean
}) {
  if (cargando) {
    return (
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className='h-[74px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800'
          />
        ))}
      </div>
    )
  }

  if (manzanas.length === 0) {
    return (
      <p className='rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400'>
        Este proyecto no tiene casas pendientes por registrar.
      </p>
    )
  }

  return (
    <div
      role='radiogroup'
      aria-label='Manzana'
      className={cn(
        'grid grid-cols-2 gap-2 rounded-xl sm:grid-cols-3',
        error &&
          'ring-2 ring-red-500/40 ring-offset-2 dark:ring-offset-gray-900'
      )}
    >
      {manzanas.map(m => {
        const activa = m.id === seleccionada
        const registradas = m.viviendas_creadas
        const porcentaje = m.total_viviendas
          ? Math.round((registradas / m.total_viviendas) * 100)
          : 0
        return (
          <button
            key={m.id}
            type='button'
            role='radio'
            aria-checked={activa}
            onClick={() => onSeleccionar(m.id)}
            className={cn(
              'relative rounded-xl border-2 p-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50',
              activa
                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-md shadow-orange-500/15 dark:from-orange-950/40 dark:to-amber-950/30'
                : 'border-gray-200 bg-white hover:border-orange-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-orange-700'
            )}
          >
            <div className='flex items-center gap-2'>
              <span
                className={cn(
                  'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                  activa
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                    : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300'
                )}
              >
                {activa ? (
                  <Check className='h-4 w-4' />
                ) : (
                  <MapPin className='h-4 w-4' />
                )}
              </span>
              <span className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                Manzana {m.nombre}
              </span>
            </div>
            <p className='mt-1.5 text-xs text-gray-600 dark:text-gray-400'>
              <span className='font-semibold text-orange-600 dark:text-orange-400'>
                {m.viviendas_disponibles}
              </span>{' '}
              por registrar · {m.total_viviendas} en total
            </p>
            <div className='mt-1.5 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500'
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
