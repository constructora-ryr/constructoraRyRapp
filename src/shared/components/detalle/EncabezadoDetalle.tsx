'use client'

/**
 * Encabezado de las páginas de detalle (cliente, vivienda, abonos de un
 * cliente, Mi perfil): un "encabezado de objeto" sobre tarjeta blanca.
 *
 * - Una línea fina arriba con el color del módulo: la identidad sin banner.
 * - Identidad: avatar, nombre, estado y datos en línea (chips neutros).
 * - Acciones a la derecha (BotonPrincipal / BotonIcono).
 * - Cifras abajo, sobrias: el color solo en el número que importa (saldo
 *   pendiente en ámbar, pagado en verde) y, si aplica, la barra de avance.
 */

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

import Link from 'next/link'

import { colorModulo } from '@/shared/config/color-modulo'
import { cn } from '@/shared/utils/helpers'

export interface CifraDetalle {
  label: string
  valor: ReactNode
  /** Color del número: 'pendiente' (ámbar), 'ok' (verde) o neutro */
  tono?: 'pendiente' | 'ok'
}

export interface AvanceDetalle {
  /** 0–100 */
  porcentaje: number
  /** Texto a la derecha: "71% pagado" */
  texto: string
  /** Explicación a la izquierda (intereses, excedente…) */
  detalle?: ReactNode
}

interface EncabezadoDetalleProps {
  /** Ruta del módulo en el menú: da el color de la línea superior */
  modulo?: string
  /** Degradado propio de la línea (Mi perfil usa el del rol) */
  acento?: string
  /** Páginas padre; la actual es el título */
  migas?: { label: string; href: string }[]
  avatar: ReactNode
  titulo: ReactNode
  /** Badge de estado junto al título (InsigniaEstado) */
  insignia?: ReactNode
  /** Datos bajo el título: documento, vivienda, proyecto… (ChipDato) */
  datos?: ReactNode
  acciones?: ReactNode
  cifras?: CifraDetalle[]
  avance?: AvanceDetalle
}

const TONO: Record<NonNullable<CifraDetalle['tono']>, string> = {
  pendiente: 'text-amber-700 dark:text-amber-400',
  ok: 'text-emerald-700 dark:text-emerald-400',
}

export function EncabezadoDetalle({
  modulo,
  acento,
  migas,
  avatar,
  titulo,
  insignia,
  datos,
  acciones,
  cifras,
  avance,
}: EncabezadoDetalleProps) {
  const linea = acento ?? colorModulo(modulo).icono
  const pie = (cifras && cifras.length > 0) || avance

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className='relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
    >
      <span
        aria-hidden
        className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', linea)}
      />

      <div className='px-5 pb-5 pt-6 sm:px-6'>
        {migas && migas.length > 0 ? (
          <nav
            aria-label='Ruta'
            className='mb-3 flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400'
          >
            {migas.map((m, i) => (
              <span key={m.href} className='flex items-center gap-1'>
                {i > 0 ? (
                  <ChevronRight className='h-3 w-3 text-slate-400 dark:text-slate-500' />
                ) : null}
                <Link
                  href={m.href}
                  className='transition-colors hover:text-slate-900 dark:hover:text-white'
                >
                  {m.label}
                </Link>
              </span>
            ))}
          </nav>
        ) : null}

        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex min-w-0 items-center gap-4'>
            {avatar}
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                {typeof titulo === 'string' ? (
                  <h1 className='break-words text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-2xl'>
                    {titulo}
                  </h1>
                ) : (
                  titulo
                )}
                {insignia}
              </div>
              {datos ? (
                <div className='mt-1.5 flex flex-wrap items-center gap-2'>
                  {datos}
                </div>
              ) : null}
            </div>
          </div>
          {acciones ? (
            <div className='flex shrink-0 flex-wrap items-center gap-2'>
              {acciones}
            </div>
          ) : null}
        </div>
      </div>

      {pie ? (
        <div className='border-t border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-700/60 dark:bg-slate-900/30 sm:px-6'>
          {cifras && cifras.length > 0 ? (
            <dl className='grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-10'>
              {cifras.map(c => (
                <div key={c.label} className='min-w-0'>
                  <dt className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                    {c.label}
                  </dt>
                  <dd
                    className={cn(
                      'truncate text-lg font-bold tabular-nums',
                      c.tono ? TONO[c.tono] : 'text-slate-900 dark:text-white'
                    )}
                  >
                    {c.valor}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {avance ? (
            <div className={cifras && cifras.length > 0 ? 'mt-4' : undefined}>
              <div className='mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-xs text-slate-500 dark:text-slate-400'>
                <span>{avance.detalle ?? 'Avance del pago'}</span>
                <span className='text-sm font-semibold tabular-nums text-slate-900 dark:text-white'>
                  {avance.texto}
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/60'>
                <motion.div
                  className={cn('h-full rounded-full bg-gradient-to-r', linea)}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(Math.max(avance.porcentaje, 0), 100)}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </motion.header>
  )
}

/** Estado junto al título: badge suave con ícono (de estados.colors) */
export function InsigniaEstado({
  label,
  icon: Icon,
  clase,
  iconoRelleno = false,
}: {
  label: string
  icon?: LucideIcon
  /** Clases `badge` de estados.colors */
  clase: string
  iconoRelleno?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        clase
      )}
    >
      {Icon ? (
        <Icon className={cn('h-3.5 w-3.5', iconoRelleno && 'fill-current')} />
      ) : null}
      {label}
    </span>
  )
}

/** Dato en línea bajo el título; con href u onClick es interactivo */
export function ChipDato({
  icon: Icon,
  children,
  href,
  onClick,
  title,
  destacado = false,
}: {
  icon?: LucideIcon
  children: ReactNode
  href?: string
  onClick?: () => void
  title?: string
  /** Para el código de la vivienda: en negrita */
  destacado?: boolean
}) {
  const clases = cn(
    'inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-0.5 text-sm text-slate-600 dark:text-slate-300',
    destacado
      ? 'bg-slate-100 font-semibold text-slate-800 dark:bg-slate-700/60 dark:text-slate-100'
      : '',
    (href || onClick) &&
      'transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700/60 dark:hover:text-white'
  )
  const contenido = (
    <>
      {Icon ? (
        <Icon className='h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500' />
      ) : null}
      <span className='truncate'>{children}</span>
    </>
  )
  if (href)
    return (
      <Link href={href} className={clases} title={title}>
        {contenido}
      </Link>
    )
  if (onClick)
    return (
      <button type='button' onClick={onClick} className={clases} title={title}>
        {contenido}
      </button>
    )
  return (
    <span className={clases} title={title}>
      {contenido}
    </span>
  )
}
