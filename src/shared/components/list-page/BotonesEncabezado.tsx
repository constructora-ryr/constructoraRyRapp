'use client'

import type { ReactNode } from 'react'

import type { LucideIcon } from 'lucide-react'

import Link from 'next/link'

import { colorModulo } from '@/shared/config/color-modulo'
import { cn } from '@/shared/utils/helpers'

interface BotonBaseProps {
  icon?: LucideIcon
  children: ReactNode
  /** Con href es un enlace; si no, un botón */
  href?: string
  onClick?: () => void
  disabled?: boolean
  /** Trabajando: el ícono gira y el botón no se puede volver a pulsar */
  cargando?: boolean
  /** Solo ícono en celular (el texto queda como nombre accesible) */
  compactoEnMovil?: boolean
  'aria-label'?: string
}

function BotonBase({
  icon: Icon,
  children,
  href,
  onClick,
  disabled,
  cargando = false,
  compactoEnMovil,
  className,
  'aria-label': ariaLabel,
}: BotonBaseProps & { className: string }) {
  const contenido = (
    <>
      {Icon ? (
        <Icon className={cn('h-4 w-4', cargando && 'animate-spin')} />
      ) : null}
      <span className={compactoEnMovil ? 'hidden sm:inline' : undefined}>
        {children}
      </span>
    </>
  )
  const clases = cn(
    'inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-900',
    className
  )
  if (href)
    return (
      <Link href={href} aria-label={ariaLabel} className={clases}>
        {contenido}
      </Link>
    )
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      aria-label={ariaLabel}
      className={clases}
    >
      {contenido}
    </button>
  )
}

/** Acción principal de la página, en el color plano del módulo */
export function BotonPrincipal({
  modulo,
  ...props
}: BotonBaseProps & { modulo?: string }) {
  return (
    <BotonBase
      {...props}
      className={cn(
        'text-white shadow-sm hover:shadow-md focus-visible:ring-slate-400',
        colorModulo(modulo).boton
      )}
    />
  )
}

/**
 * Acción de solo ícono (editar, eliminar). El nombre va en `label`: es el
 * nombre accesible y el tooltip nativo. `peligro` la tiñe de rojo al pasar
 * el cursor.
 */
export function BotonIcono({
  icon: Icon,
  label,
  onClick,
  disabled,
  peligro = false,
  sinTitle = false,
}: {
  icon: LucideIcon
  label: string
  onClick?: () => void
  disabled?: boolean
  peligro?: boolean
  /** Si ya va dentro de un Tooltip propio (evita dos avisos) */
  sinTitle?: boolean
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={sinTitle ? undefined : label}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        peligro
          ? 'hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-400'
          : 'hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white'
      )}
    >
      <Icon className='h-4 w-4' />
    </button>
  )
}

/** Acción secundaria: borde neutro, sin color propio */
export function BotonSecundario(props: BotonBaseProps) {
  return (
    <BotonBase
      {...props}
      className='border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
    />
  )
}
