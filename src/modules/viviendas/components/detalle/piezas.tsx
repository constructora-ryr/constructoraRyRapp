/**
 * Piezas de las tarjetas del detalle de vivienda: tarjeta con encabezado de
 * ícono en degradado y dato (etiqueta + valor, opcionalmente copiable).
 */

'use client'

import type { ReactNode } from 'react'

import type { LucideIcon } from 'lucide-react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/shared/utils/helpers'

export function TarjetaDetalle({
  titulo,
  icon: Icon,
  degradado = 'from-orange-500 to-amber-500',
  accion,
  children,
  className,
}: {
  titulo: string
  icon: LucideIcon
  degradado?: string
  /** Enlace o botón a la derecha del título */
  accion?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 sm:p-5',
        className
      )}
    >
      <header className='mb-3 flex items-center justify-between gap-2'>
        <h3 className='flex items-center gap-2.5 text-sm font-bold text-slate-900 dark:text-white'>
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
              degradado
            )}
          >
            <Icon className='h-4 w-4' />
          </span>
          {titulo}
        </h3>
        {accion}
      </header>
      {children}
    </section>
  )
}

export function Dato({
  etiqueta,
  valor,
  copiable = false,
  className,
}: {
  etiqueta: string
  valor: ReactNode
  copiable?: boolean
  className?: string
}) {
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(String(valor))
      toast.success(`${etiqueta} copiada`)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <div
      className={cn(
        'min-w-0 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/50',
        className
      )}
    >
      <p className='text-[11px] font-medium text-slate-500 dark:text-slate-400'>
        {etiqueta}
      </p>
      <div className='flex items-center gap-1.5'>
        <p className='min-w-0 break-words text-sm font-semibold text-slate-900 dark:text-white'>
          {valor || '—'}
        </p>
        {copiable && valor ? (
          <button
            type='button'
            onClick={copiar}
            aria-label={`Copiar ${etiqueta.toLowerCase()}`}
            className='flex-shrink-0 rounded p-0.5 text-slate-400 transition-colors hover:text-orange-600'
          >
            <Copy className='h-3.5 w-3.5' />
          </button>
        ) : null}
      </div>
    </div>
  )
}
