/**
 * Ubicación en modo edición: proyecto, manzana y número no se pueden cambiar.
 */

'use client'

import { Building2, Home, Lock, MapPin } from 'lucide-react'

import type { Vivienda } from '../../types'

export function UbicacionSoloLectura({
  vivienda,
}: {
  vivienda: Vivienda | null
}) {
  const datos = [
    {
      icon: Building2,
      etiqueta: 'Proyecto',
      valor: vivienda?.manzanas?.proyectos?.nombre ?? '—',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: MapPin,
      etiqueta: 'Manzana',
      valor: vivienda?.manzanas?.nombre ?? '—',
      color: 'from-orange-500 to-amber-600',
    },
    {
      icon: Home,
      etiqueta: 'Casa',
      valor: vivienda?.numero ?? '—',
      color: 'from-green-500 to-emerald-600',
    },
  ]

  return (
    <div className='space-y-3'>
      <p className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100'>
        <Lock className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
        La ubicación no se puede modificar. Para otra ubicación, crea una
        vivienda nueva.
      </p>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
        {datos.map(({ icon: Icon, etiqueta, valor, color }) => (
          <div
            key={etiqueta}
            className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'
          >
            <span
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color} shadow`}
            >
              <Icon className='h-4 w-4 text-white' />
            </span>
            <div className='min-w-0'>
              <p className='text-[11px] text-gray-500 dark:text-gray-400'>
                {etiqueta}
              </p>
              <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                {valor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
