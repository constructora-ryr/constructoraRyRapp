'use client'

/** Tarjeta de una categoría en el gestor: ícono de color, nombre y acciones */

import { Lock, Pencil, Trash2 } from 'lucide-react'

import { LoadingSpinner } from '@/shared/components/ui/Loading'
import { Tooltip } from '@/shared/components/ui/Tooltip'

import type { CategoriaDocumento } from '../../types'
import { colorCategoria } from '../../utils/categoria-color'
import { CategoriaIcon } from '../shared/categoria-icon'

interface CategoriaCardProps {
  categoria: CategoriaDocumento
  onEditar: (categoria: CategoriaDocumento) => void
  /** Solo administradores; no se ofrece en categorías del sistema */
  onEliminar?: (categoria: CategoriaDocumento) => void
  eliminando?: boolean
}

const btnAccion =
  'flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors disabled:opacity-50'

export function CategoriaCard({
  categoria,
  onEditar,
  onEliminar,
  eliminando = false,
}: CategoriaCardProps) {
  const hex = colorCategoria(categoria.color)

  return (
    <div className='group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60'>
      {/* Franja con el color de la categoría */}
      <span
        aria-hidden
        className='absolute inset-y-0 left-0 w-1'
        style={{ backgroundColor: hex }}
      />

      <span
        className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl'
        style={{ backgroundColor: `${hex}1f` }}
      >
        <CategoriaIcon icono={categoria.icono} color={hex} size={22} />
      </span>

      <div className='min-w-0 flex-1'>
        <div className='flex min-w-0 items-center gap-2'>
          <p className='truncate text-sm font-semibold text-slate-900 dark:text-white'>
            {categoria.nombre}
          </p>
          {categoria.es_sistema ? (
            <span className='inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-px text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-700 dark:text-slate-300'>
              <Lock className='h-2.5 w-2.5' />
              Sistema
            </span>
          ) : null}
        </div>
        <p className='line-clamp-2 text-xs text-slate-500 dark:text-slate-400'>
          {categoria.descripcion || 'Sin descripción'}
        </p>
      </div>

      <div className='flex flex-shrink-0 items-center gap-0.5'>
        <Tooltip content='Editar' side='top'>
          <button
            type='button'
            onClick={() => onEditar(categoria)}
            aria-label={`Editar ${categoria.nombre}`}
            className={`${btnAccion} hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-300`}
          >
            <Pencil className='h-4 w-4' />
          </button>
        </Tooltip>
        {onEliminar ? (
          <Tooltip content='Eliminar' side='top'>
            <button
              type='button'
              onClick={() => onEliminar(categoria)}
              disabled={eliminando}
              aria-label={`Eliminar ${categoria.nombre}`}
              className={`${btnAccion} hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-300`}
            >
              {eliminando ? (
                <LoadingSpinner size='sm' />
              ) : (
                <Trash2 className='h-4 w-4' />
              )}
            </button>
          </Tooltip>
        ) : null}
      </div>
    </div>
  )
}
