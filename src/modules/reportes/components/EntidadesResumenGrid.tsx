'use client'

import { memo } from 'react'

import { Building2 } from 'lucide-react'

import type { EntidadFinancieraResumen } from '../types'

import { EntidadResumenCard } from './EntidadResumenCard'

interface EntidadesResumenGridProps {
  entidades: EntidadFinancieraResumen[]
  entidadSeleccionadaId: string | null
  onSeleccionar: (id: string) => void
}

function EntidadesResumenGridComponent({
  entidades,
  entidadSeleccionadaId,
  onSeleccionar,
}: EntidadesResumenGridProps) {
  if (entidades.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white/50 py-16 dark:border-gray-700 dark:bg-gray-800/30'>
        <Building2 className='mb-3 h-10 w-10 text-gray-300 dark:text-gray-600' />
        <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
          No hay entidades financieras registradas
        </p>
        <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
          Las entidades aparecerán aquí cuando se registren negociaciones
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
      {entidades.map(entidad => (
        <EntidadResumenCard
          key={entidad.id}
          entidad={entidad}
          seleccionada={entidadSeleccionadaId === entidad.id}
          onSeleccionar={onSeleccionar}
        />
      ))}
    </div>
  )
}

export const EntidadesResumenGrid = memo(EntidadesResumenGridComponent)
