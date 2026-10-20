'use client'

import type { ReactNode } from 'react'

import { ChevronRight, LayoutDashboard, type LucideIcon } from 'lucide-react'

import Link from 'next/link'

interface Breadcrumb {
  label: string
  href?: string
}

interface ListPageHeaderProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  /** Botones a la derecha (acción principal) */
  actions?: ReactNode
  /**
   * Degradado del banner con el color del módulo, p.ej.
   * 'from-cyan-600 via-blue-600 to-indigo-600'. Sin él, encabezado plano.
   */
  heroGradient?: string
  /** Solo sin heroGradient: clases del cuadro del ícono, p.ej. 'bg-cyan-50 text-cyan-600' */
  iconClassName?: string
}

/**
 * Encabezado para páginas de listado (Clientes, Viviendas, …).
 * Con `heroGradient` es un banner compacto con el color del módulo.
 */
export function ListPageHeader({
  icon: Icon,
  title,
  subtitle,
  breadcrumbs,
  actions,
  heroGradient,
  iconClassName = 'bg-slate-100 text-slate-600',
}: ListPageHeaderProps) {
  const hero = !!heroGradient

  const migas = breadcrumbs && breadcrumbs.length > 0 && (
    <nav
      aria-label='Ruta'
      className={`mb-3 flex items-center gap-1 text-xs ${hero ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}
    >
      {breadcrumbs.map((b, i) => (
        <span key={b.label} className='flex items-center gap-1'>
          {i > 0 && (
            <ChevronRight
              className={`h-3 w-3 ${hero ? 'text-white/40' : 'text-slate-300 dark:text-slate-600'}`}
            />
          )}
          {b.href ? (
            <Link
              href={b.href}
              className={`flex items-center gap-1 transition-colors ${hero ? 'hover:text-white' : 'hover:text-slate-900 dark:hover:text-white'}`}
            >
              {i === 0 && <LayoutDashboard className='h-3 w-3' />}
              {b.label}
            </Link>
          ) : (
            <span
              className={`font-semibold ${hero ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}
            >
              {b.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )

  if (hero) {
    return (
      <header
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${heroGradient} px-6 py-5 shadow-lg shadow-blue-900/10`}
      >
        {/* Decoración sutil */}
        <span
          aria-hidden
          className='pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl'
        />
        <span
          aria-hidden
          className='pointer-events-none absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-white/10 blur-2xl'
        />
        <div className='relative'>
          {migas}
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-center gap-3'>
              <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm'>
                <Icon className='h-6 w-6' />
              </span>
              <div className='min-w-0'>
                <h1 className='truncate text-2xl font-bold tracking-tight text-white'>
                  {title}
                </h1>
                {subtitle && (
                  <p className='text-sm text-white/80'>{subtitle}</p>
                )}
              </div>
            </div>
            {actions && (
              <div className='flex shrink-0 flex-wrap gap-2'>{actions}</div>
            )}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <div className='min-w-0'>
        {migas}
        <div className='flex items-center gap-3'>
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
          >
            <Icon className='h-5 w-5' />
          </span>
          <div className='min-w-0'>
            <h1 className='truncate text-2xl font-semibold tracking-tight text-slate-900 dark:text-white'>
              {title}
            </h1>
            {subtitle && (
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
      {actions && (
        <div className='flex shrink-0 flex-wrap gap-2'>{actions}</div>
      )}
    </header>
  )
}
