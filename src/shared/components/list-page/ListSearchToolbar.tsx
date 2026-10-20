'use client'

import { useEffect, useRef } from 'react'

import { Search, X } from 'lucide-react'

interface ListSearchToolbarProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** Texto del contador, p.ej. "56 clientes" o "9 de 56 clientes" */
  resultado: string
  /** Si se define, muestra "Limpiar filtros" (hay búsqueda o filtro activo) */
  onLimpiar?: () => void
}

/**
 * Barra de búsqueda + contador en una sola fila. Atajo "/" para enfocar.
 */
export function ListSearchToolbar({
  value,
  onChange,
  placeholder,
  resultado,
  onLimpiar,
}: ListSearchToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
      <div className='relative flex-1'>
        <label htmlFor='list-search' className='sr-only'>
          {placeholder}
        </label>
        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <input
          ref={inputRef}
          id='list-search'
          type='search'
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className='h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-16 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-700'
        />
        {value ? (
          <button
            type='button'
            onClick={() => onChange('')}
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
      <div className='flex shrink-0 items-center gap-3 text-sm text-slate-500 dark:text-slate-400'>
        <span aria-live='polite'>{resultado}</span>
        {onLimpiar && (
          <button
            type='button'
            onClick={onLimpiar}
            className='font-medium text-slate-700 underline-offset-2 hover:underline dark:text-slate-200'
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
