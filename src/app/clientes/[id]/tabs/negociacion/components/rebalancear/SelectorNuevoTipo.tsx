'use client'

import { useState } from 'react'

import { Plus } from 'lucide-react'

import { getFuenteColor } from '../../hooks'

interface TipoDisponible {
  nombre: string
  descripcion: string
  requiere_entidad?: boolean
  color?: string
}

interface SelectorNuevoTipoProps {
  tiposDisponibles: TipoDisponible[]
  onAgregar: (tipo: string) => void
}

export function SelectorNuevoTipo({
  tiposDisponibles,
  onAgregar,
}: SelectorNuevoTipoProps) {
  const [abierto, setAbierto] = useState(false)

  if (tiposDisponibles.length === 0) return null

  const handleAgregar = (tipo: string) => {
    onAgregar(tipo)
    setAbierto(false)
  }

  if (!abierto) {
    return (
      <button
        type='button'
        onClick={() => setAbierto(true)}
        className='flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 transition-all hover:border-cyan-400 hover:bg-cyan-50/50 hover:text-cyan-600 dark:border-gray-600 dark:text-gray-500 dark:hover:border-cyan-700 dark:hover:bg-cyan-900/10 dark:hover:text-cyan-400'
      >
        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600'>
          <Plus className='h-3 w-3' />
        </div>
        Agregar fuente de pago
      </button>
    )
  }

  return (
    <div className='overflow-hidden rounded-lg border border-cyan-200 dark:border-cyan-800/50'>
      <p className='px-3 pb-2 pt-3 text-xs font-semibold text-gray-500'>
        Seleccionar tipo de fuente:
      </p>
      <div className='max-h-40 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700/50'>
        {tiposDisponibles.map(tipo => {
          const color = getFuenteColor(tipo.nombre)
          return (
            <button
              key={tipo.nombre}
              type='button'
              onClick={() => handleAgregar(tipo.nombre)}
              className='flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-cyan-50/60 dark:hover:bg-cyan-900/10'
            >
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${color.barra}`}
              />
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  {tipo.nombre}
                </p>
                {tipo.descripcion && (
                  <p className='text-xs text-gray-400'>{tipo.descripcion}</p>
                )}
              </div>
            </button>
          )
        })}
      </div>
      <div className='border-t border-gray-100 px-3 pb-2 pt-1 dark:border-gray-700/50'>
        <button
          type='button'
          onClick={() => setAbierto(false)}
          className='text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
