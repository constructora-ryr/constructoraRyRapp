'use client'

/**
 * Un día de la línea de tiempo: encabezado fijo al hacer scroll ("Hoy",
 * "12 de junio de 2026") y sus eventos, con las ráfagas agrupadas.
 */

import { useMemo } from 'react'

import type { GrupoEventosPorFecha } from '@/modules/clientes/types/historial.types'
import { agruparRafagas } from '@/modules/clientes/utils/historial-timeline.utils'

import { EventoCard, type AccionesEvento } from './EventoCard'
import { RafagaCard } from './RafagaCard'

export function DiaTimeline({
  grupo,
  acciones,
}: {
  grupo: GrupoEventosPorFecha
  acciones: AccionesEvento
}) {
  const items = useMemo(() => agruparRafagas(grupo.eventos), [grupo.eventos])

  return (
    <section aria-label={grupo.fechaFormateada} className='space-y-3'>
      <header className='sticky top-0 z-10 -mx-1 flex items-center gap-2 bg-slate-50/90 px-1 py-2 backdrop-blur-sm dark:bg-slate-950/90'>
        <span className='rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm shadow-cyan-500/25'>
          {grupo.fechaFormateada}
        </span>
        <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
          {grupo.total} {grupo.total === 1 ? 'evento' : 'eventos'}
        </span>
      </header>

      {/* Línea vertical: pasa por el centro de las fichas (36px → 17px) */}
      <ol className='relative space-y-3 before:absolute before:bottom-3 before:left-[17px] before:top-3 before:w-0.5 before:rounded-full before:bg-gradient-to-b before:from-cyan-300 before:to-slate-200 dark:before:from-cyan-700 dark:before:to-slate-700'>
        {items.map(item =>
          item.tipo === 'rafaga' ? (
            <RafagaCard
              key={item.id}
              eventos={item.eventos}
              onVerDetalle={acciones.onVerDetalle}
            />
          ) : (
            <EventoCard
              key={item.evento.id}
              evento={item.evento}
              acciones={acciones}
            />
          )
        )}
      </ol>
    </section>
  )
}
