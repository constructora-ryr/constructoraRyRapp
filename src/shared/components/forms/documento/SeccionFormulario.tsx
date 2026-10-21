import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/helpers'

/** Sección numerada del formulario de documento ("2 · Datos del documento") */
export function SeccionFormulario({
  numero,
  titulo,
  descripcion,
  gradient,
  children,
}: {
  numero: number
  titulo: string
  descripcion?: string
  /** Degradado del círculo numerado */
  gradient: string
  children: ReactNode
}) {
  return (
    <section className='space-y-3'>
      <header className='flex items-center gap-2.5'>
        <span
          className={cn(
            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-sm',
            gradient
          )}
        >
          {numero}
        </span>
        <div className='min-w-0'>
          <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
            {titulo}
          </h3>
          {descripcion ? (
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {descripcion}
            </p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  )
}
