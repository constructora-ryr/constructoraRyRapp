/**
 * Filtros de la actividad: búsqueda, quién, qué, tipo de acción y periodo.
 */

'use client'

import { Search, X } from 'lucide-react'

import { FormSelect } from '@/shared/components/ui/form-select'
import { cn } from '@/shared/utils/helpers'

import { ACCIONES, GRUPOS } from '../config/presentacion'
import type { AccionAuditoria, FiltrosAuditoria, RangoFechas } from '../types'

const RANGOS: { id: RangoFechas; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: 'todo', label: 'Todo' },
]

const campo =
  'h-10 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'

const segmento = (activo: boolean) =>
  cn(
    'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
    activo
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  )

export function FiltrosActividad({
  filtros,
  cambiar,
  usuarios,
  hayFiltros,
  limpiar,
}: {
  filtros: FiltrosAuditoria
  cambiar: <K extends keyof FiltrosAuditoria>(
    campo: K,
    valor: FiltrosAuditoria[K]
  ) => void
  usuarios: { id: string; nombre: string }[]
  hayFiltros: boolean
  limpiar: () => void
}) {
  return (
    <div className='space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 sm:p-4'>
      <div className='grid gap-2 sm:grid-cols-[1fr_12rem_12rem]'>
        <label className='relative'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <input
            value={filtros.busqueda}
            onChange={e => cambiar('busqueda', e.target.value)}
            placeholder='Buscar cliente, casa, recibo, documento…'
            aria-label='Buscar en la actividad'
            className={cn(campo, 'pl-9 pr-3')}
          />
        </label>
        <FormSelect
          aria-label='Quién'
          value={filtros.usuarioId ?? ''}
          onChange={e => cambiar('usuarioId', e.target.value || null)}
          className={cn(campo, 'px-3')}
        >
          <option value=''>Todos los usuarios</option>
          {usuarios.map(u => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </FormSelect>
        <FormSelect
          aria-label='Qué'
          value={filtros.grupo ?? ''}
          onChange={e => cambiar('grupo', e.target.value || null)}
          className={cn(campo, 'px-3')}
        >
          <option value=''>Todo el sistema</option>
          {GRUPOS.map(g => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </FormSelect>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-wrap gap-2'>
          <div className='scrollbar-hide flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1 dark:bg-slate-900/60'>
            <button
              type='button'
              onClick={() => cambiar('accion', null)}
              className={segmento(!filtros.accion)}
            >
              Todas
            </button>
            {(Object.keys(ACCIONES) as AccionAuditoria[]).map(a => (
              <button
                key={a}
                type='button'
                onClick={() => cambiar('accion', a)}
                className={segmento(filtros.accion === a)}
              >
                <span
                  className={cn(
                    'mr-1.5 inline-block h-2 w-2 rounded-full',
                    ACCIONES[a].punto
                  )}
                />
                {ACCIONES[a].label}
              </button>
            ))}
          </div>
          <div className='flex gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-900/60'>
            {RANGOS.map(r => (
              <button
                key={r.id}
                type='button'
                onClick={() => cambiar('rango', r.id)}
                className={segmento(filtros.rango === r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {hayFiltros ? (
          <button
            type='button'
            onClick={limpiar}
            className='inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white'
          >
            <X className='h-3.5 w-3.5' />
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </div>
  )
}
