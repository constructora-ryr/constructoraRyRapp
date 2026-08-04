'use client'

import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

import { FilterDropdown } from '@/shared/components/ui/filter-dropdown'

import { renunciasStyles as styles } from '../styles/renuncias.styles'
import type { EstadoRenuncia, FiltrosRenuncias } from '../types'

interface Proyecto {
  id: string
  nombre: string
}

interface RenunciasFiltrosPremiumProps {
  filtros: FiltrosRenuncias
  onFiltrosChange: (filtros: FiltrosRenuncias) => void
  onLimpiar: () => void
  totalResultados: number
  proyectos: Proyecto[]
}

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos los estados' },
  {
    value: 'Pendiente Devolución',
    label: 'Pendiente Devolución',
    dot: 'bg-yellow-400',
  },
  { value: 'Cerrada', label: 'Cerrada', dot: 'bg-green-400' },
]

export function RenunciasFiltrosPremium({
  filtros,
  onFiltrosChange,
  onLimpiar,
  totalResultados,
  proyectos,
}: RenunciasFiltrosPremiumProps) {
  const hayFiltrosActivos =
    (filtros.busqueda && filtros.busqueda.length > 0) ||
    (filtros.estado && filtros.estado !== 'todos') ||
    (filtros.proyecto_id && filtros.proyecto_id.length > 0)

  const proyectoOptions = [
    { value: '', label: 'Todos los proyectos' },
    ...proyectos.map(p => ({ value: p.id, label: p.nombre })),
  ]

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={styles.filtros.container}
    >
      <div className={styles.filtros.grid}>
        {/* Búsqueda */}
        <div className={styles.filtros.searchWrapper}>
          <label className={styles.filtros.label} htmlFor='renuncias-search'>
            Buscar
          </label>
          <Search className={styles.filtros.searchIcon} />
          <input
            id='renuncias-search'
            type='text'
            placeholder='Buscar por cliente, documento, vivienda...'
            value={filtros.busqueda ?? ''}
            onChange={e =>
              onFiltrosChange({ ...filtros, busqueda: e.target.value })
            }
            className={styles.filtros.searchInput}
          />
        </div>

        {/* Estado */}
        <FilterDropdown
          value={filtros.estado ?? 'todos'}
          placeholder='Todos los estados'
          options={ESTADO_OPTIONS}
          allValue='todos'
          onChange={v =>
            onFiltrosChange({
              ...filtros,
              estado: v as EstadoRenuncia | 'todos',
            })
          }
        />

        {/* Proyecto */}
        <FilterDropdown
          value={filtros.proyecto_id ?? ''}
          placeholder='Todos los proyectos'
          options={proyectoOptions}
          onChange={v => onFiltrosChange({ ...filtros, proyecto_id: v })}
        />
      </div>

      {/* Footer */}
      <div className={styles.filtros.footer}>
        <p className={styles.filtros.resultCount}>
          {totalResultados} renuncia{totalResultados !== 1 ? 's' : ''}{' '}
          encontrada
          {totalResultados !== 1 ? 's' : ''}
        </p>
        {hayFiltrosActivos ? (
          <button
            type='button'
            onClick={onLimpiar}
            className={styles.filtros.clearButton}
          >
            <X className='h-3 w-3' />
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}
