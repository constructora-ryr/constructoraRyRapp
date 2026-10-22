/**
 * Campo de las pantallas de acceso: etiqueta conectada al input, ícono a la
 * izquierda, acción opcional a la derecha (ver contraseña) y ayuda o aviso
 * debajo.
 */

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

interface CampoAuthProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon: LucideIcon
  /** Botón dentro del campo, a la derecha */
  accion?: ReactNode
  /** Texto bajo el campo (aviso de Bloq Mayús, requisitos…) */
  ayuda?: ReactNode
}

export const CampoAuth = forwardRef<HTMLInputElement, CampoAuthProps>(
  function CampoAuth(
    { id, label, icon: Icon, accion, ayuda, className, ...input },
    ref
  ) {
    return (
      <div>
        <label
          htmlFor={id}
          className='mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200'
        >
          {label}
        </label>
        <div className='relative'>
          <Icon
            aria-hidden
            className='pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'
          />
          <input
            ref={ref}
            id={id}
            className={cn(
              'h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 text-[15px] text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-red-500/20 dark:disabled:bg-zinc-900',
              accion ? 'pr-12' : 'pr-3.5',
              className
            )}
            {...input}
          />
          {accion ? (
            <div className='absolute right-1.5 top-1/2 -translate-y-1/2'>
              {accion}
            </div>
          ) : null}
        </div>
        {ayuda ? <div className='mt-1.5 text-xs'>{ayuda}</div> : null}
      </div>
    )
  }
)

/** Botón principal de las pantallas de acceso (rojo de la marca) */
export function BotonAuth({
  children,
  className,
  ...boton
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 text-[15px] font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none dark:focus-visible:ring-red-500/30',
        className
      )}
      {...boton}
    >
      {children}
    </button>
  )
}

/** Aviso dentro del formulario (error, advertencia o éxito) */
export function AvisoAuth({
  tono,
  icon: Icon,
  children,
}: {
  tono: 'error' | 'aviso' | 'exito'
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <div
      role={tono === 'exito' ? 'status' : 'alert'}
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm',
        tono === 'error' &&
          'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
        tono === 'aviso' &&
          'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
        tono === 'exito' &&
          'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
      )}
    >
      <Icon className='mt-0.5 h-4 w-4 flex-shrink-0' />
      <div className='min-w-0'>{children}</div>
    </div>
  )
}
