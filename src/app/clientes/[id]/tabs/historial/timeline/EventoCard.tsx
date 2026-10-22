'use client'

/**
 * Evento de la línea de tiempo: ficha de color sobre la línea, título con
 * insignia, descripción, hora y usuario, y acciones (detalle, ocultar,
 * editar/eliminar nota).
 */

import { useState } from 'react'

import { Eye, EyeOff, Pencil, Star, Trash2 } from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { RichTextContent } from '@/shared/components/rich-text/RichTextContent'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { cn } from '@/shared/utils/helpers'

import {
  etiquetaAccion,
  horaEvento,
  partesDescripcion,
  tonoEvento,
} from './tono-evento'
import { UsuarioEvento } from './UsuarioEvento'

export interface AccionesEvento {
  onVerDetalle: (evento: EventoHistorialHumanizado) => void
  onEditarNota?: (notaId: string) => void
  onEliminarNota?: (notaId: string) => void
  notasEditables?: Set<string>
  /** Solo admins */
  onOcultarEvento?: (eventoId: string) => Promise<void>
  onRestaurarEvento?: (eventoId: string) => Promise<void>
}

const btnIcono =
  'flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-slate-200'

/** Ficha con el ícono del evento, centrada sobre la línea vertical */
export function FichaEvento({
  evento,
  className,
}: {
  evento: EventoHistorialHumanizado
  className?: string
}) {
  const Icono = evento.icono
  return (
    <span
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ring-4 ring-slate-50 dark:ring-slate-950',
        tonoEvento(evento.color).ficha,
        className
      )}
    >
      <Icono className='h-4 w-4' strokeWidth={2.25} />
    </span>
  )
}

export function EventoCard({
  evento,
  acciones,
}: {
  evento: EventoHistorialHumanizado
  acciones: AccionesEvento
}) {
  const [procesando, setProcesando] = useState(false)
  const esNota = evento.metadata?.esNota === true
  const esImportante = evento.metadata?.esImportante === true
  const notaId = evento.metadata?.notaId as string | undefined
  const puedeEditarNota = !!notaId && !!acciones.notasEditables?.has(notaId)
  const oculto = evento.oculto === true
  const partes = esNota ? null : partesDescripcion(evento.descripcion)

  const alternarOculto = async () => {
    const accion = oculto
      ? acciones.onRestaurarEvento
      : acciones.onOcultarEvento
    if (!accion) return
    setProcesando(true)
    await accion(evento.id)
    setProcesando(false)
  }

  return (
    <li
      id={esNota && notaId ? `evento-${notaId}` : undefined}
      className={cn(
        'relative pl-12 duration-300 animate-in fade-in slide-in-from-bottom-1',
        oculto && 'opacity-50'
      )}
    >
      <FichaEvento evento={evento} className='absolute left-0 top-3' />

      <div
        className={cn(
          'group rounded-2xl border p-3.5 shadow-sm transition-shadow hover:shadow-md sm:p-4',
          esNota
            ? esImportante
              ? 'border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/10'
              : 'border-violet-200 bg-violet-50/60 dark:border-violet-500/30 dark:bg-violet-500/10'
            : 'border-slate-200/80 bg-white dark:border-slate-700/60 dark:bg-slate-800/60'
        )}
      >
        {/* Título + insignia + hora */}
        <div className='flex flex-wrap items-start justify-between gap-x-3 gap-y-1'>
          <div className='flex min-w-0 flex-wrap items-center gap-2'>
            <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>
              {evento.titulo}
            </h4>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-px text-[11px] font-semibold ring-1 ring-inset',
                tonoEvento(evento.color).insignia
              )}
            >
              {esImportante ? <Star className='h-3 w-3 fill-current' /> : null}
              {etiquetaAccion(evento.accion, esNota, esImportante)}
            </span>
            {oculto ? (
              <span className='rounded-full bg-slate-200 px-2 py-px text-[11px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300'>
                Oculto
              </span>
            ) : null}
          </div>
          <time
            dateTime={evento.fecha}
            className='text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400'
          >
            {horaEvento(evento.fecha)}
          </time>
        </div>

        {/* Descripción */}
        {esNota ? (
          <div className='mt-1 line-clamp-3 text-sm text-slate-700 dark:text-slate-300'>
            <RichTextContent html={evento.descripcion ?? ''} />
          </div>
        ) : partes ? (
          <div className='mt-2 flex flex-wrap gap-1.5'>
            {partes.map(({ etiqueta, valor }) => (
              <span
                key={etiqueta}
                className='inline-flex items-baseline gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs ring-1 ring-inset ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700'
              >
                <span className='text-slate-500 dark:text-slate-400'>
                  {etiqueta}
                </span>
                <span className='font-semibold text-slate-800 dark:text-slate-100'>
                  {valor}
                </span>
              </span>
            ))}
          </div>
        ) : evento.descripcion ? (
          <p className='mt-1 line-clamp-2 break-words text-sm text-slate-600 dark:text-slate-300'>
            {evento.descripcion}
          </p>
        ) : null}

        {/* Usuario + acciones */}
        <div className='mt-2.5 flex items-center justify-between gap-2'>
          <UsuarioEvento usuario={evento.usuario} />
          <div className='flex flex-shrink-0 items-center gap-0.5'>
            {esNota && puedeEditarNota ? (
              <>
                <Tooltip content='Editar nota' side='top'>
                  <button
                    type='button'
                    onClick={() => acciones.onEditarNota?.(notaId)}
                    aria-label='Editar nota'
                    className={btnIcono}
                  >
                    <Pencil className='h-4 w-4' />
                  </button>
                </Tooltip>
                <Tooltip content='Eliminar nota' side='top'>
                  <button
                    type='button'
                    onClick={() => acciones.onEliminarNota?.(notaId)}
                    aria-label='Eliminar nota'
                    className={cn(
                      btnIcono,
                      'hover:bg-rose-50 hover:text-rose-600'
                    )}
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </Tooltip>
              </>
            ) : null}
            {!esNota &&
            (oculto ? acciones.onRestaurarEvento : acciones.onOcultarEvento) ? (
              <Tooltip
                content={
                  oculto ? 'Restaurar en el historial' : 'Ocultar del historial'
                }
                side='top'
              >
                <button
                  type='button'
                  onClick={alternarOculto}
                  disabled={procesando}
                  aria-label={oculto ? 'Restaurar evento' : 'Ocultar evento'}
                  className={btnIcono}
                >
                  {oculto ? (
                    <Eye className='h-4 w-4' />
                  ) : (
                    <EyeOff className='h-4 w-4' />
                  )}
                </button>
              </Tooltip>
            ) : null}
            <button
              type='button'
              onClick={() => acciones.onVerDetalle(evento)}
              className='ml-1 inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-500/10'
            >
              <Eye className='h-3.5 w-3.5' />
              {esNota ? 'Ver nota' : 'Ver detalle'}
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
