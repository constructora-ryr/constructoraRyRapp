'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Search, X } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

import type { FiltrosViviendas } from '../types'

// ── Opciones ──────────────────────────────────────────────────────────────────

const ESTADO_OPTIONS: Array<{ value: string; label: string; dot?: string }> = [
  { value: '', label: 'Todos los estados' },
  { value: 'Vendidas', label: 'Vendidas', dot: 'bg-orange-400' },
  { value: 'Disponible', label: 'Disponible', dot: 'bg-emerald-400' },
  { value: 'Asignada', label: 'Asignada', dot: 'bg-blue-400' },
  { value: 'Entregada', label: 'Escriturada', dot: 'bg-violet-400' },
  { value: 'Propietario', label: 'Saldada', dot: 'bg-cyan-400' },
]

// ── FilterDropdown ────────────────────────────────────────────────────────────

interface FilterOption {
  value: string
  label: string
  dot?: string
}

interface FilterDropdownProps {
  value: string
  placeholder: string
  options: FilterOption[]
  onChange: (value: string) => void
}

function FilterDropdown({
  value,
  placeholder,
  options,
  onChange,
}: FilterDropdownProps) {
  const selected = options.find(o => o.value === value)
  const isActive = value !== ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={[
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all focus:outline-none',
            isActive
              ? 'border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-500/70 dark:bg-orange-900/20 dark:text-orange-300'
              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800/70',
          ].join(' ')}
        >
          {selected?.dot && isActive && (
            <span className={`h-2 w-2 shrink-0 rounded-full ${selected.dot}`} />
          )}
          <span>{selected?.label ?? placeholder}</span>
          <ChevronDown className='h-3.5 w-3.5 shrink-0 opacity-50' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='min-w-[190px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800'
      >
        {options.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className='flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700'
          >
            {option.dot ? (
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${option.dot} ${option.value === '' ? 'invisible' : ''}`}
              />
            ) : (
              <span className='h-2 w-2 shrink-0' />
            )}
            <span className='flex-1'>{option.label}</span>
            {option.value === value && (
              <Check className='h-3.5 w-3.5 shrink-0 text-orange-500' />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ViviendasFiltrosPremiumProps {
  filtros: FiltrosViviendas
  onActualizarFiltros: (filtros: Partial<FiltrosViviendas>) => void
  onLimpiarFiltros: () => void
  totalResultados: number
  proyectos?: Array<{ id: string; nombre: string }>
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ViviendasFiltrosPremium({
  filtros,
  onActualizarFiltros,
  onLimpiarFiltros,
  totalResultados,
  proyectos = [],
}: ViviendasFiltrosPremiumProps) {
  const hayFiltros = !!(filtros.search || filtros.proyecto_id || filtros.estado)

  const proyectoOptions: FilterOption[] = [
    { value: '', label: 'Todos los proyectos' },
    ...proyectos.map(p => ({ value: p.id, label: p.nombre })),
  ]

  return (
    <div className='sticky top-4 z-40 rounded-xl border border-gray-200/50 bg-white/90 p-4 shadow-2xl shadow-orange-500/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90'>
      <div className='flex items-center gap-2'>
        {/* Búsqueda */}
        <div className='relative flex-1'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
          <input
            type='text'
            placeholder='Buscar número, manzana, matrícula...'
            value={filtros.search}
            onChange={e => onActualizarFiltros({ search: e.target.value })}
            className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2 pl-10 pr-10 text-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:placeholder:text-gray-500'
          />
          {filtros.search && (
            <button
              onClick={() => onActualizarFiltros({ search: '' })}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        {/* Proyecto */}
        <FilterDropdown
          value={filtros.proyecto_id}
          placeholder='Todos los proyectos'
          options={proyectoOptions}
          onChange={v => onActualizarFiltros({ proyecto_id: v })}
        />

        {/* Estado */}
        <FilterDropdown
          value={filtros.estado}
          placeholder='Todos los estados'
          options={ESTADO_OPTIONS}
          onChange={v => onActualizarFiltros({ estado: v })}
        />
      </div>

      {/* Footer */}
      <div className='mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700'>
        <p className='text-xs font-medium text-gray-500 dark:text-gray-400'>
          {totalResultados} {totalResultados === 1 ? 'resultado' : 'resultados'}
        </p>
        <AnimatePresence>
          {hayFiltros && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={onLimpiarFiltros}
              className='inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600 transition-all hover:bg-orange-100 hover:text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-300'
            >
              <X className='h-3 w-3' />
              Limpiar filtros
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
