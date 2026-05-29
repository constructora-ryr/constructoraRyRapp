/**
 * ViviendasFiltrosPremium - Filtros premium con diseño compacto
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ Diseño sticky con glassmorphism
 * ✅ Layout horizontal (flex)
 * ✅ Labels sr-only (accesibilidad)
 * ✅ Toggle de vista cards/tabla
 * ✅ Basado en patrón de Proyectos
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

import type { FiltrosViviendas } from '../types'

import { viviendasFiltrosStyles as styles } from './ViviendasFiltrosPremium.styles'

interface ViviendasFiltrosPremiumProps {
  filtros: FiltrosViviendas
  onActualizarFiltros: (filtros: Partial<FiltrosViviendas>) => void
  onLimpiarFiltros: () => void
  totalResultados: number
  proyectos?: Array<{ id: string; nombre: string }>
}

export function ViviendasFiltrosPremium({
  filtros,
  onActualizarFiltros,
  onLimpiarFiltros,
  totalResultados,
  proyectos = [],
}: ViviendasFiltrosPremiumProps) {
  const hayFiltros = Boolean(
    filtros.search || filtros.proyecto_id || filtros.estado
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={styles.container}
    >
      {/* Barra principal de búsqueda y filtros */}
      <div className={styles.searchBar}>
        {/* Búsqueda */}
        <div className={styles.searchWrapper}>
          <label htmlFor='search-viviendas' className={styles.label}>
            Buscar
          </label>
          <Search className={styles.searchIcon} />
          <input
            id='search-viviendas'
            type='text'
            value={filtros.search}
            onChange={e => onActualizarFiltros({ search: e.target.value })}
            placeholder='Buscar número, manzana, matrícula...'
            className={styles.searchInput}
          />
          {filtros.search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onActualizarFiltros({ search: '' })}
              className={styles.searchClearButton}
              aria-label='Limpiar búsqueda'
            >
              <X className='h-4 w-4' />
            </motion.button>
          )}
        </div>

        {/* Select Proyecto */}
        <div className='relative'>
          <label htmlFor='filter-proyecto' className={styles.label}>
            Proyecto
          </label>
          <select
            id='filter-proyecto'
            value={filtros.proyecto_id}
            onChange={e => onActualizarFiltros({ proyecto_id: e.target.value })}
            className={styles.select}
          >
            <option value=''>Todos los proyectos</option>
            {proyectos.map(proyecto => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Select Estado */}
        <div className='relative'>
          <label htmlFor='filter-estado' className={styles.label}>
            Estado
          </label>
          <select
            id='filter-estado'
            value={filtros.estado}
            onChange={e => onActualizarFiltros({ estado: e.target.value })}
            className={styles.select}
          >
            <option value=''>Todos los estados</option>
            <option value='Disponible'>🟢 Disponible</option>
            <option value='Asignada'>🔵 Asignada</option>
            <option value='Entregada'>🟣 Escriturada</option>
            <option value='Propietario'>🩵 Saldada</option>
          </select>
        </div>
      </div>

      {/* Footer con contador y limpiar */}
      <div className={styles.footer}>
        <p className={styles.resultCount}>
          {totalResultados} {totalResultados === 1 ? 'resultado' : 'resultados'}
        </p>

        <AnimatePresence>
          {hayFiltros && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={onLimpiarFiltros}
              className={styles.clearButton}
            >
              <X className='h-4 w-4' />
              Limpiar filtros
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
