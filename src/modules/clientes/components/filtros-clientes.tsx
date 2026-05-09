/**
 * 🔍 Filtros Premium de Clientes
 * Búsqueda y filtros por estado con pill buttons visibles
 */

'use client'

import { Search, X } from 'lucide-react'

import { clientesListaStyles as styles } from '../styles/clientes-lista.styles'
import type { EstadoCliente } from '../types'

interface FiltrosClientesProps {
  busqueda: string
  estadoSeleccionado?: EstadoCliente | 'Todos'
  onBusquedaChange: (value: string) => void
  onEstadoChange: (estado: EstadoCliente | 'Todos') => void
  totalResultados: number
  totalClientes: number
}

const ESTADOS: Array<{
  value: EstadoCliente | 'Todos'
  label: string
  color: string
  activeColor: string
}> = [
  {
    value: 'Todos',
    label: 'Todos',
    color:
      'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-cyan-400 dark:hover:border-cyan-600',
    activeColor:
      'border-cyan-500 bg-cyan-500 text-white shadow-sm shadow-cyan-500/30',
  },
  {
    value: 'Interesado',
    label: 'Interesados',
    color:
      'border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-600',
    activeColor:
      'border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/30',
  },
  {
    value: 'Activo',
    label: 'Activos',
    color:
      'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400',
    activeColor:
      'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
  },
  {
    value: 'Renunció',
    label: 'Renunciaron',
    color:
      'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:border-red-400 dark:hover:border-red-600',
    activeColor:
      'border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/30',
  },
  {
    value: 'Inactivo',
    label: 'Inactivos',
    color:
      'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-500 hover:border-gray-400 dark:hover:border-gray-500',
    activeColor:
      'border-gray-500 bg-gray-500 text-white shadow-sm shadow-gray-500/30',
  },
  {
    value: 'Propietario',
    label: 'Propietarios',
    color:
      'border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:border-amber-500 dark:hover:border-amber-500',
    activeColor:
      'border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-500/30',
  },
]

export function FiltrosClientes({
  busqueda,
  estadoSeleccionado = 'Todos',
  onBusquedaChange,
  onEstadoChange,
  totalResultados,
  totalClientes,
}: FiltrosClientesProps) {
  const handleClearSearch = () => {
    onBusquedaChange('')
  }

  const handleClearFilters = () => {
    onBusquedaChange('')
    onEstadoChange('Todos')
  }

  const hayBusqueda = busqueda.trim().length > 0
  const hayFiltrosActivos = estadoSeleccionado !== 'Todos' || hayBusqueda

  return (
    <div className={styles.filtros.container}>
      {/* FILA 1: Búsqueda */}
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <label htmlFor='search-clientes' className='sr-only'>
            Buscar
          </label>
          <Search className={styles.filtros.searchIconLeft} />
          <input
            id='search-clientes'
            type='text'
            placeholder='Buscar cliente por nombre, cédula o teléfono...'
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            className={styles.filtros.searchInput}
          />
          {hayBusqueda && (
            <button
              onClick={handleClearSearch}
              className={styles.filtros.clearButton}
              aria-label='Limpiar búsqueda'
            >
              <X className={styles.filtros.clearIcon} />
            </button>
          )}
        </div>
      </div>

      {/* FILA 2: Pill buttons de estado */}
      <div className='flex flex-wrap items-center gap-1.5 pt-2'>
        {ESTADOS.map(estado => {
          const isActive = estadoSeleccionado === estado.value
          return (
            <button
              key={estado.value}
              onClick={() => onEstadoChange(estado.value)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${
                isActive
                  ? estado.activeColor
                  : `bg-white dark:bg-gray-900/30 ${estado.color}`
              }`}
            >
              {estado.label}
            </button>
          )
        })}
      </div>

      {/* FOOTER: Contador + Limpiar */}
      <div className={styles.filtros.footer}>
        <div className='flex items-center gap-3'>
          <p className={styles.filtros.resultCount}>
            <span>
              {totalResultados === totalClientes
                ? `${totalClientes} cliente${totalClientes !== 1 ? 's' : ''}`
                : `${totalResultados} de ${totalClientes} clientes`}
            </span>
          </p>

          {hayFiltrosActivos && (
            <button
              onClick={handleClearFilters}
              className={styles.filtros.clearFiltersButton}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
