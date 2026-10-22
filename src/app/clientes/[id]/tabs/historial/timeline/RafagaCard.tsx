'use client'

/**
 * Ráfaga: varias acciones iguales seguidas de la misma persona (p.ej. 12
 * documentos cargados) en una sola tarjeta que se expande.
 */

import { useState } from 'react'

import { ChevronDown, ChevronRight } from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { cn } from '@/shared/utils/helpers'

import { FichaEvento } from './EventoCard'
import {
  horaEvento,
  resumenCorto,
  tituloRafaga,
  tonoEvento,
} from './tono-evento'
import { UsuarioEvento } from './UsuarioEvento'

/** Cuántos nombres se muestran antes de "+N más" */
const VISTA_PREVIA = 2

export function RafagaCard({
  eventos,
  onVerDetalle,
}: {
  eventos: EventoHistorialHumanizado[]
  onVerDetalle: (evento: EventoHistorialHumanizado) => void
}) {
  const [abierta, setAbierta] = useState(false)
  const primero = eventos[0]
  // Ordenados del más reciente al más antiguo
  const desde = horaEvento(eventos[eventos.length - 1].fecha)
  const hasta = horaEvento(primero.fecha)

  return (
    <li className='relative pl-12 duration-300 animate-in fade-in slide-in-from-bottom-1'>
      <FichaEvento evento={primero} className='absolute left-0 top-3' />

      <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
        <button
          type='button'
          onClick={() => setAbierta(v => !v)}
          aria-expanded={abierta}
          className='flex w-full items-start justify-between gap-3 p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 sm:p-4'
        >
          <div className='min-w-0'>
            <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>
              {tituloRafaga(primero.tipo, primero.titulo, eventos.length)}
            </h4>
            {/* Los primeros, cada uno en su chip: se ve que son distintos */}
            <div className='mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5'>
              {eventos.slice(0, VISTA_PREVIA).map(e => (
                <span
                  key={e.id}
                  title={e.descripcion}
                  className={cn(
                    'max-w-[16rem] truncate rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                    tonoEvento(e.color).insignia
                  )}
                >
                  {resumenCorto(e.descripcion || e.titulo)}
                </span>
              ))}
              {eventos.length > VISTA_PREVIA ? (
                <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                  +{eventos.length - VISTA_PREVIA} más
                </span>
              ) : null}
            </div>
            <div className='mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1'>
              <UsuarioEvento usuario={primero.usuario} />
              <span className='text-xs tabular-nums text-slate-500 dark:text-slate-400'>
                {desde === hasta ? hasta : `${desde} – ${hasta}`}
              </span>
            </div>
          </div>
          <span className='flex flex-shrink-0 items-center gap-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300'>
            <span className='hidden sm:inline'>
              {abierta ? 'Ocultar' : 'Ver todos'}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                abierta && 'rotate-180'
              )}
            />
          </span>
        </button>

        {abierta ? (
          <ul className='divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-700/50 dark:border-slate-700/50'>
            {eventos.map(evento => (
              <li key={evento.id}>
                <button
                  type='button'
                  onClick={() => onVerDetalle(evento)}
                  className='flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30'
                >
                  <span className='flex-shrink-0 whitespace-nowrap text-xs tabular-nums text-slate-500 dark:text-slate-400'>
                    {horaEvento(evento.fecha)}
                  </span>
                  <span className='min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200'>
                    {resumenCorto(evento.descripcion || evento.titulo)}
                  </span>
                  <span className='flex flex-shrink-0 items-center gap-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300'>
                    <span className='hidden sm:inline'>Detalle</span>
                    <ChevronRight className='h-4 w-4' />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  )
}
