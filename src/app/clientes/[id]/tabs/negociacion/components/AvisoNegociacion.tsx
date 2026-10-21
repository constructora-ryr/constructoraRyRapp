'use client'

/**
 * Aviso de la pestaña Negociación (descuadre, devolución, documentos…):
 * mismo formato para todos — ícono en degradado, título, texto y acción.
 */

import type { ReactNode } from 'react'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

const TONOS = {
  rojo: {
    caja: 'border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50/60 dark:border-rose-800/50 dark:from-rose-950/40 dark:to-orange-950/20',
    icono: 'from-rose-500 to-red-600 shadow-rose-500/30',
    titulo: 'text-rose-900 dark:text-rose-200',
    texto: 'text-rose-700 dark:text-rose-300',
    boton: 'bg-rose-600 text-white hover:bg-rose-700',
  },
  ambar: {
    caja: 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/60 dark:border-amber-800/50 dark:from-amber-950/40 dark:to-orange-950/20',
    icono: 'from-amber-400 to-orange-500 shadow-amber-500/30',
    titulo: 'text-amber-900 dark:text-amber-200',
    texto: 'text-amber-800 dark:text-amber-300',
    boton: 'bg-amber-500 text-white hover:bg-amber-600',
  },
  verde: {
    caja: 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/60 dark:border-emerald-800/50 dark:from-emerald-950/40 dark:to-teal-950/20',
    icono: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
    titulo: 'text-emerald-900 dark:text-emerald-200',
    texto: 'text-emerald-700 dark:text-emerald-300',
    boton:
      'border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
} as const

export type TonoAviso = keyof typeof TONOS

interface AvisoNegociacionProps {
  tono: TonoAviso
  icon: LucideIcon
  titulo: ReactNode
  texto?: ReactNode
  /** Punto que late sobre el ícono (urgente) */
  urgente?: boolean
  accion?: {
    label: string
    icon?: LucideIcon
    onClick?: () => void
    href?: string
  }
}

export function AvisoNegociacion({
  tono,
  icon: Icon,
  titulo,
  texto,
  urgente,
  accion,
}: AvisoNegociacionProps) {
  const t = TONOS[tono]
  const AccionIcono = accion?.icon
  const claseBoton = cn(
    'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-sm transition-colors sm:h-9',
    t.boton
  )
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-3.5 sm:flex-row sm:items-center',
        t.caja
      )}
    >
      <div className='flex min-w-0 flex-1 items-start gap-3'>
        <span className='relative shrink-0'>
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
              t.icono
            )}
          >
            <Icon className='h-5 w-5' />
          </span>
          {urgente && (
            <span className='absolute -right-1 -top-1 flex h-3 w-3'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75' />
              <span className='relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-slate-900' />
            </span>
          )}
        </span>
        <div className='min-w-0'>
          <p className={cn('text-sm font-bold', t.titulo)}>{titulo}</p>
          {texto && (
            <p className={cn('mt-0.5 text-xs leading-relaxed', t.texto)}>
              {texto}
            </p>
          )}
        </div>
      </div>
      {accion &&
        (accion.href ? (
          <a
            href={accion.href}
            target='_blank'
            rel='noopener noreferrer'
            className={claseBoton}
          >
            {AccionIcono && <AccionIcono className='h-4 w-4' />}
            {accion.label}
          </a>
        ) : (
          <button type='button' onClick={accion.onClick} className={claseBoton}>
            {AccionIcono && <AccionIcono className='h-4 w-4' />}
            {accion.label}
          </button>
        ))}
    </div>
  )
}
