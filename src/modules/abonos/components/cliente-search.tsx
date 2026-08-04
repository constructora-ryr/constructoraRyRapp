'use client'

import { ArrowUpDown, Building2, Search, X } from 'lucide-react'

import { FormSelect } from '@/shared/components/ui/form-select'

import { seleccionClienteStyles as styles } from '../styles/seleccion-cliente.styles'

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

type OrdenClientes =
  | 'urgente'
  | 'mayor_pago'
  | 'nombre_az'
  | 'nombre_za'
  | 'vivienda_asc'
  | 'mayor_saldo'

interface ClienteSearchProps {
  busqueda: string
  onBusquedaChange: (value: string) => void
  totalResultados: number
  totalClientes: number
  proyectos?: string[]
  proyectoFiltro?: string
  onProyectoFiltroChange?: (v: string) => void
  ordenar?: OrdenClientes
  onOrdenarChange?: (v: OrdenClientes) => void
  promedioAvance?: number
  resumen?: {
    totalVentas: number
    saldoPendiente: number
  }
}

export function ClienteSearch({
  busqueda,
  onBusquedaChange,
  totalResultados,
  totalClientes,
  proyectos = [],
  proyectoFiltro = '',
  onProyectoFiltroChange,
  ordenar = 'urgente',
  onOrdenarChange,
  promedioAvance,
  resumen,
}: ClienteSearchProps) {
  const hayFiltro =
    busqueda.trim().length > 0 ||
    Boolean(proyectoFiltro) ||
    ordenar !== 'urgente'

  function limpiarFiltros() {
    onBusquedaChange('')
    onProyectoFiltroChange?.('')
    onOrdenarChange?.('urgente')
  }

  return (
    <div className={styles.search.container}>
      {/* Fila 1: input de búsqueda */}
      <div className={styles.search.inputWrapper}>
        <Search className={styles.search.iconLeft} />
        <input
          type='text'
          placeholder='Buscar por nombre, cédula, A1, Mz. A N°1...'
          value={busqueda}
          onChange={e => onBusquedaChange(e.target.value)}
          className={styles.search.input}
          autoFocus
        />
        {busqueda.trim() ? (
          <button
            onClick={() => onBusquedaChange('')}
            className={styles.search.clearButton}
            aria-label='Limpiar búsqueda'
          >
            <X className={styles.search.clearIcon} />
          </button>
        ) : null}
      </div>

      {/* Fila 2: proyecto + ordenar */}
      <div className={styles.search.controlsRow}>
        {/* Filtro por proyecto */}
        {proyectos.length > 0 ? (
          <div className={styles.search.controlGroup}>
            <Building2 className={styles.search.controlIcon} />
            <FormSelect
              value={proyectoFiltro}
              onChange={e => onProyectoFiltroChange?.(e.target.value)}
              className={`${styles.search.select} ${proyectoFiltro ? styles.search.selectActive : ''}`}
            >
              <option value=''>Todos los proyectos</option>
              {proyectos.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </FormSelect>
          </div>
        ) : null}

        {proyectos.length > 0 ? (
          <div className={styles.search.divider} />
        ) : null}

        {/* Ordenamiento */}
        <div className={styles.search.controlGroup}>
          <ArrowUpDown className={styles.search.controlIcon} />
          <FormSelect
            value={ordenar}
            onChange={e => onOrdenarChange?.(e.target.value as OrdenClientes)}
            className={`${styles.search.select} ${ordenar !== 'urgente' ? styles.search.selectActive : ''}`}
          >
            <option value='urgente'>↑ Más urgente primero</option>
            <option value='mayor_pago'>↓ Más avanzado (mayor %)</option>
            <option value='nombre_az'>A → Z &nbsp; Nombre</option>
            <option value='nombre_za'>Z → A &nbsp; Nombre</option>
            <option value='vivienda_asc'>Vivienda: A1, A2, B1...</option>
            <option value='mayor_saldo'>Mayor saldo pendiente ($)</option>
          </FormSelect>
        </div>
      </div>

      {/* Footer: conteo + resumen + limpiar */}
      <div className={styles.search.footer}>
        <span className={styles.search.resultCount}>
          {hayFiltro
            ? `${totalResultados} de ${totalClientes} cliente${totalClientes !== 1 ? 's' : ''}`
            : `${totalClientes} cliente${totalClientes !== 1 ? 's' : ''}`}
        </span>
        {resumen ? (
          <span className={styles.search.resumenLine}>
            <span className='text-gray-400 dark:text-gray-600'>Ventas</span>{' '}
            <span className='font-semibold text-gray-700 dark:text-gray-300'>
              {formatCOP(resumen.totalVentas)}
            </span>
            <span className={styles.search.resumenSep}>·</span>
            <span className='text-gray-400 dark:text-gray-600'>
              Pendiente
            </span>{' '}
            <span className='font-semibold text-orange-500 dark:text-orange-400'>
              {formatCOP(resumen.saldoPendiente)}
            </span>
            {typeof promedioAvance === 'number' ? (
              <>
                <span className={styles.search.resumenSep}>·</span>
                <span className='text-gray-400 dark:text-gray-600'>
                  Avance
                </span>{' '}
                <span
                  className={`font-semibold ${
                    promedioAvance >= 80
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : promedioAvance >= 40
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'text-amber-500 dark:text-amber-400'
                  }`}
                >
                  {promedioAvance}%
                </span>
              </>
            ) : null}
          </span>
        ) : null}
        {hayFiltro ? (
          <button
            onClick={limpiarFiltros}
            className='flex-shrink-0 text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400'
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </div>
  )
}
