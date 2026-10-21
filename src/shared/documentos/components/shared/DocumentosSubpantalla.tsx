'use client'

/**
 * Marco de las pantallas secundarias del tab Documentos (subir documento,
 * gestionar categorías): encabezado con el degradado del módulo, ícono,
 * título y botón Volver, y el contenido en una tarjeta blanca.
 */

import type { ReactNode } from 'react'

import { ArrowLeft, type LucideIcon } from 'lucide-react'

import { type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import { temaDocumentos } from '../../config/documentos-tema'

interface DocumentosSubpantallaProps {
  moduleName?: ModuleName
  icon: LucideIcon
  titulo: string
  descripcion: string
  onVolver: () => void
  children: ReactNode
}

export function DocumentosSubpantalla({
  moduleName,
  icon: Icon,
  titulo,
  descripcion,
  onVolver,
  children,
}: DocumentosSubpantallaProps) {
  const tema = temaDocumentos(moduleName)

  return (
    <div className='space-y-3'>
      <header
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gradient-to-r p-4 text-white shadow-lg sm:p-5',
          tema.gradient,
          tema.sombra
        )}
      >
        <span
          aria-hidden
          className='pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl'
        />
        <div className='relative flex items-center gap-3'>
          <span className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30'>
            <Icon className='h-5 w-5' />
          </span>
          <div className='min-w-0 flex-1'>
            <h2 className='text-base font-bold drop-shadow-sm sm:text-lg'>
              {titulo}
            </h2>
            <p className='text-xs text-white/85 sm:text-sm'>{descripcion}</p>
          </div>
          <button
            type='button'
            onClick={onVolver}
            className='inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 px-3 text-xs font-semibold transition-colors hover:bg-white/30'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='hidden sm:inline'>Volver a documentos</span>
            <span className='sm:hidden'>Volver</span>
          </button>
        </div>
      </header>

      <div className='rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 sm:p-5'>
        {children}
      </div>
    </div>
  )
}
