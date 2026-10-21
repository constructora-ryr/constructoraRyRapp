'use client'

/**
 * Barra de filtros de documentos: búsqueda (atajo "/"), solo anclados y
 * categoría. El filtrado real y el conteo los hace useDocumentosLista (una
 * sola fuente); esta barra solo lee/escribe el store.
 */

import { useEffect, useRef } from 'react'

import { Pin, Search, X } from 'lucide-react'

import { FilterDropdown } from '@/shared/components/ui/filter-dropdown'
import { type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import { temaDocumentos } from '../../config/documentos-tema'
import { useDocumentosStore } from '../../store/documentos.store'
import type { CategoriaDocumento } from '../../types'

interface DocumentosFiltrosProps {
  categorias: CategoriaDocumento[]
  moduleName?: ModuleName
}

export function DocumentosFiltros({
  categorias = [],
  moduleName = 'proyectos',
}: DocumentosFiltrosProps) {
  const tema = temaDocumentos(moduleName)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    categoriaFiltro,
    busqueda,
    soloImportantes,
    setFiltroCategoria,
    setBusqueda,
    toggleSoloImportantes,
    limpiarFiltros,
  } = useDocumentosStore()

  // Atajo "/" para enfocar la búsqueda (como en las listas)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const escribiendo =
        el?.tagName === 'INPUT' ||
        el?.tagName === 'TEXTAREA' ||
        el?.isContentEditable
      if (e.key === '/' && !escribiendo) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const hayFiltros = !!(categoriaFiltro || busqueda || soloImportantes)

  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
      <div className='relative flex-1'>
        <label htmlFor='docs-busqueda' className='sr-only'>
          Buscar documentos
        </label>
        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <input
          ref={inputRef}
          id='docs-busqueda'
          type='search'
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder='Buscar por título, nombre de archivo o descripción…'
          className={cn(
            'h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-16 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white',
            tema.foco
          )}
        />
        {busqueda ? (
          <button
            type='button'
            onClick={() => setBusqueda('')}
            aria-label='Limpiar búsqueda'
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700'
          >
            <X className='h-4 w-4' />
          </button>
        ) : (
          <kbd className='pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 text-[11px] font-medium text-slate-400 dark:border-slate-600 dark:bg-slate-700 sm:block'>
            /
          </kbd>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={toggleSoloImportantes}
          aria-pressed={soloImportantes}
          className={cn(
            'inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-sm font-medium transition-colors',
            soloImportantes
              ? cn('border-transparent ring-1 ring-inset', tema.suave)
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700'
          )}
        >
          <Pin className={cn('h-4 w-4', soloImportantes && 'fill-current')} />
          Anclados
        </button>

        {categorias.length > 0 && (
          <FilterDropdown
            value={categoriaFiltro || ''}
            placeholder='Todas las categorías'
            allValue=''
            activeClassName={cn(
              'border-transparent ring-1 ring-inset',
              tema.suave
            )}
            options={[
              { value: '', label: 'Todas las categorías' },
              ...categorias.map(c => ({ value: c.id, label: c.nombre })),
            ]}
            onChange={v => setFiltroCategoria(v || null)}
          />
        )}

        {hayFiltros && (
          <button
            type='button'
            onClick={limpiarFiltros}
            className='h-10 px-2 text-sm font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-300'
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
