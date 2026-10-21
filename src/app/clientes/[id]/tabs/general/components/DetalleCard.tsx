'use client'

/**
 * Piezas base de las tarjetas de Información General: contenedor con
 * encabezado (ícono en degradado + título + acción) y fila dato (ícono +
 * etiqueta + valor + acciones rápidas). Reemplazan el marcado repetido de
 * cada tarjeta.
 */

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

export function DetalleCard({
  icon: Icon,
  title,
  gradient,
  accion,
  children,
  className,
  delay = 0,
}: {
  icon: LucideIcon
  title: string
  /** Degradado del cuadro del ícono: 'from-cyan-500 to-blue-600' */
  gradient: string
  accion?: ReactNode
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60',
        className
      )}
    >
      <div className='flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/60'>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
            gradient
          )}
        >
          <Icon className='h-4 w-4' />
        </span>
        <h3 className='flex-1 text-sm font-bold text-slate-900 dark:text-white'>
          {title}
        </h3>
        {accion}
      </div>
      <div className='flex-1'>{children}</div>
    </motion.section>
  )
}

export function FilaDato({
  icon: Icon,
  tint,
  label,
  children,
  vacio = 'Sin registrar',
  acciones,
}: {
  icon: LucideIcon
  /** Fondo suave + color del ícono: 'bg-cyan-50 text-cyan-600 …' */
  tint: string
  label: string
  /** Valor; si es null/undefined/'' se muestra `vacio` en gris */
  children?: ReactNode
  vacio?: string
  /** Botones rápidos a la derecha (llamar, copiar…) */
  acciones?: ReactNode
}) {
  const tieneValor =
    children !== null && children !== undefined && children !== ''
  return (
    <div className='group flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-700/60'>
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          tieneValor
            ? tint
            : 'bg-slate-100 text-slate-400 dark:bg-slate-700/40 dark:text-slate-500'
        )}
      >
        <Icon className='h-4 w-4' />
      </span>
      <div className='min-w-0 flex-1'>
        <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
          {label}
        </p>
        {tieneValor ? (
          <div className='text-[15px] font-semibold leading-snug text-slate-900 dark:text-white'>
            {children}
          </div>
        ) : (
          <p className='text-xs italic text-slate-400 dark:text-slate-500'>
            {vacio}
          </p>
        )}
      </div>
      {tieneValor && acciones ? (
        <div className='flex shrink-0 items-center gap-1'>{acciones}</div>
      ) : null}
    </div>
  )
}

/** Botón rápido de una fila (ícono con tooltip nativo) */
export function AccionRapida({
  icon: Icon,
  label,
  href,
  onClick,
  externo,
  className,
}: {
  icon: LucideIcon
  label: string
  href?: string
  onClick?: () => void
  externo?: boolean
  className?: string
}) {
  const cls = cn(
    // 40 px en celular (área táctil cómoda), 32 px en escritorio
    'flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 sm:h-8 sm:w-8 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200',
    className
  )
  if (href) {
    return (
      <a
        href={href}
        title={label}
        aria-label={label}
        className={cls}
        {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <Icon className='h-4 w-4' />
      </a>
    )
  }
  return (
    <button
      type='button'
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cls}
    >
      <Icon className='h-4 w-4' />
    </button>
  )
}
