'use client'

import { Check, Search } from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'

import type { FiltrosAbonos, RangoFecha } from '../../hooks/useAbonosList'

import { abonosListaStyles as s } from './abonos-lista.styles'

interface AbonosListFiltrosProps {
  filtros: FiltrosAbonos
  fuentesUnicas: string[]
  entidadesUnicas: string[]
  totalFiltrado: number
  montoTotalFiltrado: number
  actualizarFiltros: (f: Partial<FiltrosAbonos>) => void
  limpiarFiltros: () => void
  toggleMostrarActivos: () => void
  toggleMostrarAnulados: () => void
  toggleMostrarRenunciados: () => void
}

interface PillProps {
  activo: boolean
  label: string
  claseActiva: string
  onClick: () => void
}

function FilterPill({ activo, label, claseActiva, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
        activo ? claseActiva : s.filtros.pillOff
      }`}
    >
      {activo ? (
        <Check className='h-3 w-3' />
      ) : (
        <span className='inline-block h-3 w-3 rounded-sm border border-gray-300 dark:border-gray-600' />
      )}
      {label}
    </button>
  )
}

const RANGOS: { value: RangoFecha; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'este-mes', label: 'Este mes' },
  { value: 'mes-anterior', label: 'Mes anterior' },
  { value: 'ultimos-3-meses', label: 'Últ. trimestre' },
  { value: 'este-ano', label: 'Este año' },
  { value: 'personalizado', label: 'Personalizado' },
]

export function AbonosListFiltros({
  filtros,
  fuentesUnicas,
  entidadesUnicas,
  totalFiltrado,
  montoTotalFiltrado,
  actualizarFiltros,
  limpiarFiltros,
  toggleMostrarActivos,
  toggleMostrarAnulados,
  toggleMostrarRenunciados,
}: AbonosListFiltrosProps) {
  const hayFiltrosActivos =
    filtros.busqueda ||
    filtros.fuente !== 'todas' ||
    filtros.entidad !== 'todas' ||
    filtros.rango !== 'todo'

  return (
    <div className={s.filtros.container}>
      {/* Fila 1: búsqueda + fuente ─────────────────────────────────────── */}
      <div className='flex items-center gap-2'>
        <div className={s.filtros.searchWrapper}>
          <label htmlFor='busqueda-abonos' className='sr-only'>
            Buscar abono
          </label>
          <Search className={s.filtros.searchIcon} />
          <input
            id='busqueda-abonos'
            type='text'
            value={filtros.busqueda}
            onChange={e => actualizarFiltros({ busqueda: e.target.value })}
            placeholder='Nombre, CC, RYR-15, A17, Las Américas...'
            className={s.filtros.searchInput}
          />
        </div>

        <label htmlFor='filtro-fuente' className='sr-only'>
          Fuente de pago
        </label>
        <select
          id='filtro-fuente'
          value={filtros.fuente}
          onChange={e => actualizarFiltros({ fuente: e.target.value })}
          className={`${s.filtros.select} min-w-[180px]`}
        >
          <option value='todas'>Todas las fuentes</option>
          {fuentesUnicas.map(f => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {entidadesUnicas.length > 0 && (
          <>
            <label htmlFor='filtro-entidad' className='sr-only'>
              Entidad
            </label>
            <select
              id='filtro-entidad'
              value={filtros.entidad}
              onChange={e => actualizarFiltros({ entidad: e.target.value })}
              className={`${s.filtros.select} min-w-[160px]`}
            >
              <option value='todas'>Todas las entidades</option>
              {entidadesUnicas.map(e => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Fila 2: botones de rango ─────────────────────────────────────── */}
      <div className='mt-3 flex flex-wrap items-center gap-1.5'>
        <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
          Período:
        </span>
        {RANGOS.map(r => (
          <button
            key={r.value}
            onClick={() =>
              actualizarFiltros({
                rango: r.value,
                fechaDesde: '',
                fechaHasta: '',
              })
            }
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              filtros.rango === r.value
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700/60 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {r.label}
          </button>
        ))}

        {/* Inputs de rango personalizado */}
        {filtros.rango === 'personalizado' && (
          <div className='ml-1 flex items-center gap-2'>
            <input
              type='date'
              value={filtros.fechaDesde}
              onChange={e => actualizarFiltros({ fechaDesde: e.target.value })}
              className={`${s.filtros.select} w-36 text-xs`}
            />
            <span className='text-xs text-gray-400'>—</span>
            <input
              type='date'
              value={filtros.fechaHasta}
              onChange={e => actualizarFiltros({ fechaHasta: e.target.value })}
              className={`${s.filtros.select} w-36 text-xs`}
            />
          </div>
        )}
      </div>

      {/* Fila 3: resumen + pills ──────────────────────────────────────── */}
      <div className='mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700'>
        <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
          <span className='font-semibold text-gray-800 dark:text-gray-200'>
            {totalFiltrado}
          </span>{' '}
          {totalFiltrado === 1 ? 'resultado' : 'resultados'}
          {totalFiltrado > 0 ? (
            <>
              {' '}
              ·{' '}
              <span className='font-semibold text-violet-700 dark:text-violet-400'>
                {formatCurrency(montoTotalFiltrado)}
              </span>
            </>
          ) : null}
        </p>

        <div className='flex items-center gap-1.5'>
          <span className='mr-1 text-xs text-gray-400 dark:text-gray-500'>
            Mostrar:
          </span>
          <FilterPill
            activo={filtros.mostrarActivos}
            label='Activos'
            claseActiva={s.filtros.pillActivo}
            onClick={toggleMostrarActivos}
          />
          <FilterPill
            activo={filtros.mostrarAnulados}
            label='Anulados'
            claseActiva={s.filtros.pillAnulado}
            onClick={toggleMostrarAnulados}
          />
          <FilterPill
            activo={filtros.mostrarRenunciados}
            label='Renunciados'
            claseActiva={s.filtros.pillRenunciado}
            onClick={toggleMostrarRenunciados}
          />
          {hayFiltrosActivos ? (
            <>
              <span className='mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700' />
              <button onClick={limpiarFiltros} className={s.filtros.limpiarBtn}>
                Limpiar filtros
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
