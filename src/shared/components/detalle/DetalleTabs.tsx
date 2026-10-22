'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'

export interface TabDetalle<T extends string> {
  id: T
  label: string
  icon: LucideIcon
  /** Contador (se oculta si es 0 o null) */
  count?: number | null
  /** Aviso (p.ej. falta la cédula) */
  alerta?: string | null
}

/** Colores por módulo (strings completos: Tailwind JIT no ve interpolaciones) */
const TEMA = {
  clientes: {
    activa:
      'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25',
    inactiva:
      'text-slate-500 hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300',
    contador:
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  },
  viviendas: {
    activa:
      'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25',
    inactiva:
      'text-slate-500 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300',
    contador:
      'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  },
  auditorias: {
    activa:
      'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25',
    inactiva:
      'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300',
    contador:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
} as const

interface DetalleTabsProps<T extends string> {
  tabs: TabDetalle<T>[]
  activa: T
  onCambiar: (tab: T) => void
  tema: keyof typeof TEMA
  /** Nombre accesible de la lista de pestañas */
  etiqueta: string
}

/** Pestañas segmentadas de las páginas de detalle (cliente, vivienda…) */
export function DetalleTabs<T extends string>({
  tabs,
  activa,
  onCambiar,
  tema,
  etiqueta,
}: DetalleTabsProps<T>) {
  const colores = TEMA[tema]
  return (
    <div className='scrollbar-hide -mx-1 overflow-x-auto px-1 pb-1'>
      <nav
        role='tablist'
        aria-label={etiqueta}
        className='inline-flex gap-1 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
      >
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activa === tab.id
          return (
            <button
              key={tab.id}
              type='button'
              role='tab'
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => onCambiar(tab.id)}
              className={`relative flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                isActive ? colores.activa : colores.inactiva
              }`}
            >
              <Icon className='h-4 w-4' />
              {tab.label}
              {tab.count ? (
                <span
                  className={`min-w-[1.25rem] rounded-full px-1.5 py-px text-center text-[11px] font-bold tabular-nums ${
                    isActive ? 'bg-white/25 text-white' : colores.contador
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
              {tab.alerta ? (
                <span
                  title={tab.alerta}
                  className='flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm'
                >
                  <AlertTriangle className='h-3 w-3' />
                  <span className='sr-only'>{tab.alerta}</span>
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
