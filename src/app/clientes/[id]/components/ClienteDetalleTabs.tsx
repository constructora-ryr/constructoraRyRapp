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

interface ClienteDetalleTabsProps<T extends string> {
  tabs: TabDetalle<T>[]
  activa: T
  onCambiar: (tab: T) => void
}

/** Pestañas del detalle (mismo estilo segmentado que Usuarios) */
export function ClienteDetalleTabs<T extends string>({
  tabs,
  activa,
  onCambiar,
}: ClienteDetalleTabsProps<T>) {
  return (
    <div className='scrollbar-hide -mx-1 overflow-x-auto px-1 pb-1'>
      <nav
        role='tablist'
        aria-label='Secciones del cliente'
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
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-500 hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300'
              }`}
            >
              <Icon className='h-4 w-4' />
              {tab.label}
              {tab.count ? (
                <span
                  className={`min-w-[1.25rem] rounded-full px-1.5 py-px text-center text-[11px] font-bold tabular-nums ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300'
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
