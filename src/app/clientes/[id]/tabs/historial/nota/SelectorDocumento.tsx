'use client'

/**
 * Vincular un documento del cliente a la nota: muestra el elegido (con
 * quitar) o un buscador desplegable con los documentos actuales.
 */

import { useMemo, useState } from 'react'

import { FileText, Paperclip, Search, X } from 'lucide-react'

import type { DocumentoVinculado } from '@/modules/clientes/types/notas-historial.types'

export function SelectorDocumento({
  documentos,
  seleccionado,
  onChange,
}: {
  documentos: DocumentoVinculado[]
  seleccionado: DocumentoVinculado | null
  onChange: (documento: DocumentoVinculado | null) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return q
      ? documentos.filter(d => d.titulo.toLowerCase().includes(q))
      : documentos
  }, [documentos, busqueda])

  if (seleccionado) {
    return (
      <div className='flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 dark:border-blue-500/30 dark:bg-blue-500/10'>
        <FileText className='h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-300' />
        <span className='min-w-0 flex-1 truncate text-sm font-semibold text-blue-900 dark:text-blue-100'>
          {seleccionado.titulo}
        </span>
        <button
          type='button'
          onClick={() => onChange(null)}
          aria-label='Quitar documento vinculado'
          className='flex h-8 w-8 items-center justify-center rounded-lg text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-500/20'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
    )
  }

  if (!abierto) {
    return (
      <button
        type='button'
        onClick={() => setAbierto(true)}
        disabled={documentos.length === 0}
        className='flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-300'
      >
        <Paperclip className='h-4 w-4' />
        {documentos.length === 0
          ? 'El cliente no tiene documentos para vincular'
          : 'Vincular un documento del cliente'}
      </button>
    )
  }

  return (
    <div className='overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700'>
      <div className='flex items-center gap-2 border-b border-slate-100 px-3 dark:border-slate-700'>
        <Search className='h-4 w-4 text-slate-400' />
        <input
          autoFocus
          type='search'
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder='Buscar documento…'
          aria-label='Buscar documento'
          className='h-10 flex-1 bg-transparent text-sm outline-none dark:text-white'
        />
        <button
          type='button'
          onClick={() => setAbierto(false)}
          aria-label='Cerrar buscador'
          className='rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
      <ul className='max-h-52 overflow-y-auto'>
        {filtrados.length === 0 ? (
          <li className='px-3 py-3 text-sm text-slate-500 dark:text-slate-400'>
            Sin coincidencias
          </li>
        ) : (
          filtrados.map(doc => (
            <li key={doc.id}>
              <button
                type='button'
                onClick={() => {
                  onChange(doc)
                  setAbierto(false)
                  setBusqueda('')
                }}
                className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-800 transition-colors hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-blue-500/10'
              >
                <FileText className='h-4 w-4 flex-shrink-0 text-blue-500' />
                <span className='truncate'>{doc.titulo}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
