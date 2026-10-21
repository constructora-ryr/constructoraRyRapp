'use client'

/**
 * Selector de categoría en tarjetas (ícono y color de cada categoría).
 * Bloqueado cuando la categoría la impone el flujo (cédula, requisito).
 */

import { Ban, Check, Lock } from 'lucide-react'

import { CategoriaIcon } from '@/shared/documentos/components/shared/categoria-icon'
import { colorCategoria } from '@/shared/documentos/utils/categoria-color'
import { cn } from '@/shared/utils/helpers'

import type { CategoriaDocumentoBase } from './documento-form.types'

interface CategoriaSelectorProps {
  categorias: CategoriaDocumentoBase[]
  value: string
  onChange: (value: string) => void
  /** Motivo por el que no se puede cambiar (se muestra en lugar del selector) */
  bloqueadaPor?: string
}

function Opcion({
  activo,
  color,
  onClick,
  children,
}: {
  activo: boolean
  color: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        'relative flex min-h-[3rem] items-center gap-2.5 rounded-xl border bg-white px-3 py-2 text-left text-sm transition-all dark:bg-slate-900/60',
        activo
          ? 'font-semibold text-slate-900 shadow-sm ring-2 dark:text-white'
          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
      )}
      style={
        activo
          ? {
              borderColor: 'transparent',
              backgroundColor: `${color}12`,
              ['--tw-ring-color' as string]: color,
            }
          : undefined
      }
    >
      {children}
      {activo ? (
        <Check className='ml-auto h-4 w-4 flex-shrink-0' style={{ color }} />
      ) : null}
    </button>
  )
}

export function CategoriaSelector({
  categorias,
  value,
  onChange,
  bloqueadaPor,
}: CategoriaSelectorProps) {
  const seleccionada = categorias.find(c => c.id === value)

  if (bloqueadaPor) {
    const hex = colorCategoria(seleccionada?.color)
    return (
      <div className='flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/60'>
        {seleccionada ? (
          <span
            className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg'
            style={{ backgroundColor: `${hex}1f` }}
          >
            <CategoriaIcon
              icono={seleccionada.icono ?? 'Folder'}
              color={hex}
              size={16}
            />
          </span>
        ) : null}
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-slate-900 dark:text-white'>
            {seleccionada?.nombre ?? 'Sin categoría'}
          </p>
          <p className='flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
            <Lock className='h-3 w-3' />
            {bloqueadaPor}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
      {categorias.map(categoria => {
        const hex = colorCategoria(categoria.color)
        return (
          <Opcion
            key={categoria.id}
            activo={value === categoria.id}
            color={hex}
            onClick={() => onChange(categoria.id)}
          >
            <span
              className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg'
              style={{ backgroundColor: `${hex}1f` }}
            >
              <CategoriaIcon
                icono={categoria.icono ?? 'Folder'}
                color={hex}
                size={16}
              />
            </span>
            <span className='min-w-0 truncate' title={categoria.nombre}>
              {categoria.nombre}
            </span>
          </Opcion>
        )
      })}
      <Opcion activo={!value} color='#64748B' onClick={() => onChange('')}>
        <span className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800'>
          <Ban className='h-4 w-4' />
        </span>
        <span className='text-slate-500 dark:text-slate-400'>
          Sin categoría
        </span>
      </Opcion>
    </div>
  )
}
