'use client'

import type { ReactNode } from 'react'

import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

import Link from 'next/link'

import { colorModulo } from '@/shared/config/color-modulo'
import { cn } from '@/shared/utils/helpers'

interface Breadcrumb {
  label: string
  href?: string
}

export interface MetricaEncabezado {
  label: string
  valor: ReactNode
}

interface ListPageHeaderProps {
  icon: LucideIcon
  title: string
  /** Total junto al título ("Clientes 56"); se oculta si es null */
  count?: number | null
  subtitle?: string
  /**
   * Solo en páginas anidadas (Abonos › Registrar). En las de primer nivel
   * sobran: el menú ya dice dónde se está.
   */
  breadcrumbs?: Breadcrumb[]
  /** Ruta del módulo en el menú ('/clientes'): da el color del ícono */
  modulo?: string
  /** Cifras de contexto bajo el título, en texto (sin tarjetas) */
  metricas?: MetricaEncabezado[]
  /** Botones a la derecha: la acción principal es un BotonPrincipal */
  actions?: ReactNode
}

/**
 * Encabezado de página (listados y formularios). Sobrio a propósito: el
 * protagonista es el contenido. El color del módulo vive en el ícono y en
 * el botón de la acción principal, no en un banner.
 */
export function ListPageHeader({
  icon: Icon,
  title,
  count,
  subtitle,
  breadcrumbs,
  modulo,
  metricas,
  actions,
}: ListPageHeaderProps) {
  const color = colorModulo(modulo)

  return (
    <header className='space-y-3'>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav
          aria-label='Ruta'
          className='flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'
        >
          {breadcrumbs.map((b, i) => (
            <span key={b.label} className='flex items-center gap-1'>
              {i > 0 ? (
                <ChevronRight className='h-3 w-3 text-slate-400 dark:text-slate-500' />
              ) : null}
              {b.href ? (
                <Link
                  href={b.href}
                  className='transition-colors hover:text-slate-900 dark:hover:text-white'
                >
                  {b.label}
                </Link>
              ) : (
                <span className='font-medium text-slate-700 dark:text-slate-200'>
                  {b.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-center gap-3'>
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
              color.icono
            )}
          >
            <Icon className='h-5 w-5' />
          </span>
          <div className='min-w-0'>
            <h1 className='flex items-baseline gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>
              <span className='truncate'>{title}</span>
              {count != null ? (
                <span className='text-lg font-semibold tabular-nums text-slate-500 dark:text-slate-400'>
                  {count.toLocaleString('es-CO')}
                </span>
              ) : null}
            </h1>
            {subtitle ? (
              <p className='truncate text-sm text-slate-500 dark:text-slate-400'>
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className='flex shrink-0 flex-wrap items-center gap-2'>
            {actions}
          </div>
        ) : null}
      </div>

      {metricas && metricas.length > 0 ? (
        <dl className='flex flex-wrap gap-x-6 gap-y-2 text-sm'>
          {metricas.map(m => (
            <div key={m.label} className='flex items-baseline gap-1.5'>
              <dt className='text-slate-500 dark:text-slate-400'>{m.label}</dt>
              <dd className='font-semibold tabular-nums text-slate-900 dark:text-white'>
                {m.valor}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </header>
  )
}
