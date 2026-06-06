'use client'

import { memo } from 'react'

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
