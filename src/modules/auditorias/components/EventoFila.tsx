/**
 * Un evento en la línea de tiempo: ícono del tipo de registro con el punto
 * de la acción, frase ("Nicolás editó el abono"), etiqueta del registro y,
 * en ediciones, los primeros cambios (antes → después).
 */

'use client'

import { ArrowRight, Server } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

import { formatearValor, infoTabla, nombreCampo } from '../config/presentacion'
import type { EventoAuditoria } from '../types'
import { cambiosVisibles, frase, horaCorta } from '../utils/evento'
import { interpretar } from '../utils/interpretar'

const MAX_CAMBIOS = 2

export function EventoFila({
  evento,
  onAbrir,
}: {
  evento: EventoAuditoria
  onAbrir: () => void
}) {
  const tabla = infoTabla(evento.tabla)
  const accion = interpretar(evento)
  const Icon = tabla.icon
  const cambios = cambiosVisibles(evento)

  return (
    <button
      type='button'
      onClick={onAbrir}
      className='group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:hover:bg-slate-800/60'
    >
      <span
        className={cn(
          'relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
          tabla.color
        )}
      >
        <Icon className='h-[18px] w-[18px]' />
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900',
            accion.punto
          )}
        />
      </span>

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <p className='text-sm text-slate-700 dark:text-slate-300'>
            <span className='font-semibold text-slate-900 dark:text-white'>
              {frase(evento)}
            </span>
          </p>
          <span className='flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-xs tabular-nums text-slate-400'>
            {evento.origen === 'servidor' ? (
              <Server className='h-3 w-3' aria-label='Desde el servidor' />
            ) : null}
            {horaCorta(evento.fecha)}
          </span>
        </div>

        {evento.etiqueta ? (
          <p className='mt-0.5 truncate text-sm font-medium text-indigo-700 dark:text-indigo-300'>
            {evento.etiqueta}
          </p>
        ) : null}

        {cambios.length ? (
          <div className='mt-1.5 flex flex-wrap gap-1.5'>
            {cambios.slice(0, MAX_CAMBIOS).map(([campo, c]) => (
              <span
                key={campo}
                className='inline-flex max-w-full items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-900 ring-1 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/20'
              >
                <span className='font-semibold'>{nombreCampo(campo)}:</span>
                <span className='truncate line-through opacity-70'>
                  {formatearValor(campo, c.antes)}
                </span>
                <ArrowRight className='h-3 w-3 flex-shrink-0' />
                <span className='truncate font-semibold'>
                  {formatearValor(campo, c.despues)}
                </span>
              </span>
            ))}
            {cambios.length > MAX_CAMBIOS ? (
              <span className='rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                +{cambios.length - MAX_CAMBIOS} más
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </button>
  )
}
