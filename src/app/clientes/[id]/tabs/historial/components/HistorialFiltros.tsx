'use client'

/**
 * Encabezado del historial: resumen (total, desde cuándo, semana/mes,
 * críticos), búsqueda, agregar nota, ver ocultos (admins) y categorías con
 * su contador. Las categorías sin eventos no se muestran.
 */

import {
  AlertTriangle,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  Handshake,
  Heart,
  History,
  Layers,
  LogOut,
  NotebookPen,
  Search,
  UserPen,
  X,
  type LucideIcon,
} from 'lucide-react'

import type { ResumenHistorial } from '@/modules/clientes/utils/historial-timeline.utils'
import { cn } from '@/shared/utils/helpers'

const CATEGORIAS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'todos', label: 'Todos', icon: Layers },
  { id: 'clientes', label: 'Cliente', icon: UserPen },
  { id: 'negociaciones', label: 'Negociación', icon: Handshake },
  { id: 'abonos_historial', label: 'Abonos', icon: DollarSign },
  { id: 'documentos_cliente', label: 'Documentos', icon: FileText },
  { id: 'intereses', label: 'Intereses', icon: Heart },
  { id: 'renuncias', label: 'Renuncias', icon: LogOut },
  { id: 'notas', label: 'Notas', icon: NotebookPen },
]

interface HistorialFiltrosProps {
  resumen: ResumenHistorial
  /** Fecha del primer evento ya formateada */
  desde: string | null
  conteoPorCategoria: Record<string, number>
  busqueda: string
  onBusquedaChange: (valor: string) => void
  categoriaActiva: string
  onCategoriaChange: (categoria: string) => void
  onAgregarNota?: () => void
  /** Solo admins */
  mostrarOcultos?: boolean
  onToggleOcultos?: () => void
}

function Dato({
  valor,
  label,
  tono = 'normal',
}: {
  valor: number
  label: string
  tono?: 'normal' | 'alerta'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ring-1 ring-inset',
        tono === 'alerta'
          ? 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300'
          : 'bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-700'
      )}
    >
      {tono === 'alerta' ? <AlertTriangle className='h-3 w-3' /> : null}
      <strong className='font-bold tabular-nums'>{valor}</strong>
      {label}
    </span>
  )
}

export function HistorialFiltros({
  resumen,
  desde,
  conteoPorCategoria,
  busqueda,
  onBusquedaChange,
  categoriaActiva,
  onCategoriaChange,
  onAgregarNota,
  mostrarOcultos,
  onToggleOcultos,
}: HistorialFiltrosProps) {
  const categorias = CATEGORIAS.filter(
    c => c.id === 'todos' || (conteoPorCategoria[c.id] ?? 0) > 0
  )

  return (
    <div className='space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 sm:p-5'>
      {/* Resumen + agregar nota */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/25 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800'>
            <History className='h-5 w-5' />
          </span>
          <div className='min-w-0'>
            <h3 className='text-base font-bold text-slate-900 dark:text-white'>
              Línea de tiempo
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {resumen.total} {resumen.total === 1 ? 'evento' : 'eventos'}
              {desde ? ` · desde ${desde}` : ''}
            </p>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Dato valor={resumen.estaSemana} label='esta semana' />
          <Dato valor={resumen.esteMes} label='este mes' />
          {resumen.criticos > 0 ? (
            <Dato valor={resumen.criticos} label='críticos' tono='alerta' />
          ) : null}
          {onAgregarNota ? (
            <button
              type='button'
              onClick={onAgregarNota}
              className='inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:shadow-lg'
            >
              <NotebookPen className='h-4 w-4' />
              Agregar nota
            </button>
          ) : null}
        </div>
      </div>

      {/* Búsqueda + ocultos */}
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <label htmlFor='historial-busqueda' className='sr-only'>
            Buscar en el historial
          </label>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <input
            id='historial-busqueda'
            type='search'
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder='Buscar por evento, descripción o persona…'
            className='h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:focus:ring-cyan-900'
          />
          {busqueda ? (
            <button
              type='button'
              onClick={() => onBusquedaChange('')}
              aria-label='Limpiar búsqueda'
              className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700'
            >
              <X className='h-4 w-4' />
            </button>
          ) : null}
        </div>
        {onToggleOcultos ? (
          <button
            type='button'
            onClick={onToggleOcultos}
            aria-pressed={mostrarOcultos}
            title='Eventos ocultados por un administrador'
            className={cn(
              'inline-flex h-10 flex-shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors',
              mostrarOcultos
                ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-600/50 dark:bg-amber-500/10 dark:text-amber-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300'
            )}
          >
            {mostrarOcultos ? (
              <Eye className='h-4 w-4' />
            ) : (
              <EyeOff className='h-4 w-4' />
            )}
            <span className='hidden sm:inline'>
              {mostrarOcultos ? 'Viendo ocultos' : 'Ver ocultos'}
            </span>
          </button>
        ) : null}
      </div>

      {/* Categorías con contador (deslizable en móvil) */}
      <div className='-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]'>
        {categorias.map(({ id, label, icon: Icon }) => {
          const activa = categoriaActiva === id
          return (
            <button
              key={id}
              type='button'
              onClick={() => onCategoriaChange(id)}
              aria-pressed={activa}
              className={cn(
                'inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-all',
                activa
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              <Icon className='h-4 w-4' />
              {label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[11px] font-bold tabular-nums',
                  activa
                    ? 'bg-white/25 text-white'
                    : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {conteoPorCategoria[id] ?? 0}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
