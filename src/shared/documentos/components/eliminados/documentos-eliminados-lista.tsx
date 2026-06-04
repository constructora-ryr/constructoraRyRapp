'use client'

/**
 * 🗑️ COMPONENTE PRESENTACIONAL: DocumentosEliminadosLista (Admin Only - Premium UX)
 *
 * Papelera global unificada de todos los módulos
 * - Multi-módulo: Proyectos, Viviendas, Clientes
 * - Estadísticas premium con gradientes
 * - Filtros avanzados: Módulo, Búsqueda, Fechas, Ordenamiento
 * - Cards con badges de módulo
 * - Diseño profesional con glassmorphism
 */

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Calendar,
  FileText,
  Filter,
  Home,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  User,
  X,
} from 'lucide-react'

import { LoadingState } from '@/shared/components/layout/LoadingState'
import { ConfirmacionModal } from '@/shared/components/modals'
import { EmptyState } from '@/shared/components/ui/EmptyState'

import { useDocumentosEliminados } from '../../hooks'
import type { DocumentoProyecto } from '../../types/documento.types'

import { DocumentoEliminadoCard } from './documento-eliminado-card'

// Configuración visual por módulo
const MODULOS_CONFIG = {
  proyectos: {
    icono: FileText,
    label: 'Proyectos',
    color: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50 dark:bg-green-950/30',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-300 dark:border-green-700',
  },
  viviendas: {
    icono: Home,
    label: 'Viviendas',
    color: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50 dark:bg-orange-950/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-300 dark:border-orange-700',
  },
  clientes: {
    icono: User,
    label: 'Clientes',
    color: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/30',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    borderColor: 'border-cyan-300 dark:border-cyan-700',
  },
} as const

type ModuloKey = keyof typeof MODULOS_CONFIG

export function DocumentosEliminadosLista() {
  const {
    documentos,
    cargando,
    error,
    estadisticas,
    busqueda,
    setBusqueda,
    moduloFiltro,
    setModuloFiltro,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    ordenamiento,
    setOrdenamiento,
    handleRestaurar,
    handleEliminarDefinitivo,
    restaurando,
    eliminando,
    refrescar,
    modalRestaurar,
    setModalRestaurar,
    confirmarRestaurar,
    modalEliminar,
    setModalEliminar,
    confirmarEliminarDefinitivo,
    confirmacionTexto,
    setConfirmacionTexto,
  } = useDocumentosEliminados()

  // Estados de carga/error
  if (cargando) {
    return <LoadingState message='Cargando papelera de todos los módulos...' />
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title='Error al cargar papelera'
        description={error.message}
        moduleName='papelera'
      />
    )
  }

  const hayFiltrosActivos =
    busqueda || moduloFiltro !== 'todos' || fechaDesde || fechaHasta

  return (
    <div className='space-y-4'>
      {/* 📊 ESTADÍSTICAS PREMIUM - Grid con gradientes */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'
      >
        {/* Total global */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className='group relative overflow-hidden rounded-xl border border-red-200/50 bg-gradient-to-br from-red-500/10 to-gray-500/10 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:border-red-800/50 dark:from-red-900/20 dark:to-gray-900/20'
        >
          <div className='absolute inset-0 bg-gradient-to-br from-red-500/5 to-gray-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
          <div className='relative z-10 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-gray-600 shadow-lg shadow-red-500/50'>
              <Trash2 className='h-5 w-5 text-white' />
            </div>
            <div className='flex-1'>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {estadisticas.total}
              </p>
              <p className='mt-0.5 text-xs font-medium text-gray-600 dark:text-gray-400'>
                Total Eliminados
              </p>
            </div>
          </div>
        </motion.div>

        {/* Proyectos */}
        {Object.entries(estadisticas.porModulo).map(([modulo, cantidad]) => {
          const config = MODULOS_CONFIG[modulo as ModuloKey]
          if (!config) return null
          const IconoModulo = config.icono

          return (
            <motion.div
              key={modulo}
              whileHover={{ scale: 1.02, y: -2 }}
              className='group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80'
              onClick={() =>
                setModuloFiltro(
                  modulo as 'proyectos' | 'viviendas' | 'clientes'
                )
              }
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
              />
              <div className='relative z-10 flex items-center gap-3'>
                <div
                  className={`h-10 w-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}
                >
                  <IconoModulo className='h-5 w-5 text-white' />
                </div>
                <div className='flex-1'>
                  <p
                    className={`bg-gradient-to-br text-2xl font-bold ${config.color} bg-clip-text text-transparent`}
                  >
                    {cantidad}
                  </p>
                  <p className='mt-0.5 text-xs font-medium text-gray-600 dark:text-gray-400'>
                    {config.label}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* 🔍 FILTROS AVANZADOS - Sticky */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='sticky top-4 z-40 rounded-xl border border-gray-200/50 bg-white/90 p-4 shadow-2xl shadow-red-500/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90'
      >
        {/* Fila 1: Búsqueda, Módulo, Ordenamiento */}
        <div className='mb-3 grid grid-cols-1 gap-3 md:grid-cols-3'>
          {/* Búsqueda */}
          <div className='relative'>
            <label htmlFor='search-global' className='sr-only'>
              Buscar en todos los módulos
            </label>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
            <input
              id='search-global'
              type='text'
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder='Buscar por título, entidad, usuario...'
              className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm transition-all placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900/50'
            />
          </div>

          {/* Filtro por módulo */}
          <div className='relative'>
            <Filter className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
            <select
              value={moduloFiltro}
              onChange={e =>
                setModuloFiltro(
                  e.target.value as
                    | 'todos'
                    | 'proyectos'
                    | 'viviendas'
                    | 'clientes'
                )
              }
              className='w-full appearance-none rounded-lg border-2 border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900/50'
              aria-label='Filtrar por módulo'
            >
              <option value='todos'>Todos los módulos</option>
              {Object.entries(MODULOS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <div className='relative'>
            <TrendingDown className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
            <select
              value={ordenamiento}
              onChange={e =>
                setOrdenamiento(
                  e.target.value as 'recientes' | 'antiguos' | 'alfabetico'
                )
              }
              className='w-full appearance-none rounded-lg border-2 border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900/50'
              aria-label='Ordenar por'
            >
              <option value='recientes'>Más recientes primero</option>
              <option value='antiguos'>Más antiguos primero</option>
              <option value='alfabetico'>Orden alfabético</option>
            </select>
          </div>
        </div>

        {/* Fila 2: Rango de fechas */}
        <div className='mb-3 grid grid-cols-1 gap-3 md:grid-cols-2'>
          <div className='relative'>
            <Calendar className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
            <input
              type='date'
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900/50'
              aria-label='Desde fecha'
            />
          </div>
          <div className='relative'>
            <Calendar className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
            <input
              type='date'
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900/50'
              aria-label='Hasta fecha'
            />
          </div>
        </div>

        {/* Barra de estado y acciones */}
        <div className='flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700'>
          <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
            <span className='font-bold text-red-600 dark:text-red-400'>
              {estadisticas.filtrados}
            </span>{' '}
            de <span className='font-bold'>{estadisticas.total}</span>{' '}
            documentos
          </p>
          <div className='flex items-center gap-2'>
            {hayFiltrosActivos ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setBusqueda('')
                  setModuloFiltro('todos')
                  setFechaDesde('')
                  setFechaHasta('')
                }}
                className='inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
              >
                <X className='h-3.5 w-3.5' />
                Limpiar filtros
              </motion.button>
            ) : null}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refrescar}
              className='inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Actualizar
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 📋 LISTA DE DOCUMENTOS ELIMINADOS */}
      {documentos.length === 0 ? (
        <EmptyState
          icon={hayFiltrosActivos ? Filter : Trash2}
          title={hayFiltrosActivos ? 'Sin resultados' : 'Papelera vacía'}
          description={
            hayFiltrosActivos
              ? 'No se encontraron documentos con los filtros aplicados. Intenta ajustar los filtros.'
              : 'Todo limpio. Los documentos que elimines aparecerán aquí antes de ser borrados definitivamente.'
          }
          moduleName='papelera'
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='space-y-4'
        >
          {documentos.map((documento, index: number) => (
            <motion.div
              key={documento.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <DocumentoEliminadoCard
                documento={documento as unknown as DocumentoProyecto}
                modulo={
                  documento.modulo as 'proyectos' | 'viviendas' | 'clientes'
                }
                onRestaurarTodo={(id, titulo) =>
                  handleRestaurar(id, titulo, documento.modulo)
                }
                onEliminarDefinitivo={(id, titulo) =>
                  handleEliminarDefinitivo(id, titulo, documento.modulo)
                }
                restaurando={restaurando === documento.id}
                eliminando={eliminando === documento.id}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 🆕 MODALES CUSTOM */}
      {/* Modal: Confirmar restauración */}
      <ConfirmacionModal
        isOpen={modalRestaurar.isOpen}
        onClose={() =>
          setModalRestaurar({ isOpen: false, documentoId: '', titulo: '' })
        }
        onConfirm={confirmarRestaurar}
        variant='success'
        title='¿Restaurar documento?'
        message={(() => {
          const MODULO_LABELS: Record<string, string> = {
            proyectos: 'proyecto',
            viviendas: 'vivienda',
            clientes: 'cliente',
          }
          const moduloLabel =
            MODULO_LABELS[modalRestaurar.modulo ?? ''] ?? 'registro'
          return (
            <>
              <p>
                El documento <strong>{modalRestaurar.titulo}</strong> volverá a
                la lista de documentos activos.
              </p>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                Podrás encontrarlo en el {moduloLabel} correspondiente.
              </p>
            </>
          )
        })()}
        confirmText='Sí, restaurar'
        isLoading={restaurando !== null}
        loadingText='Restaurando...'
      />

      {/* Modal: Confirmar eliminación definitiva con prompt */}
      <ConfirmacionModal
        isOpen={modalEliminar.isOpen}
        onClose={() => {
          setModalEliminar({ isOpen: false, documentoId: '', titulo: '' })
          setConfirmacionTexto('')
        }}
        onConfirm={confirmarEliminarDefinitivo}
        variant='danger'
        title='⚠️ Eliminar PERMANENTEMENTE'
        message={
          <div className='space-y-4'>
            <p className='text-left font-semibold'>
              Esta acción NO se puede deshacer. Se eliminará:
            </p>
            <ul className='list-inside list-disc space-y-1 text-left text-sm text-gray-700 dark:text-gray-300'>
              <li>
                Documento: <strong>{modalEliminar.titulo}</strong>
              </li>
              <li>Registro de la base de datos</li>
              <li>Archivo del almacenamiento</li>
              <li>Historial de versiones</li>
            </ul>
            <div className='border-t border-red-200 pt-2 dark:border-red-800'>
              <label
                htmlFor='confirm-delete'
                className='mb-2 block text-left text-sm font-medium'
              >
                Escribe{' '}
                <span className='rounded bg-red-100 px-2 py-0.5 font-mono dark:bg-red-900/30'>
                  ELIMINAR
                </span>{' '}
                para confirmar:
              </label>
              <input
                id='confirm-delete'
                type='text'
                value={confirmacionTexto}
                onChange={e => setConfirmacionTexto(e.target.value)}
                placeholder='ELIMINAR'
                className='w-full rounded-lg border-2 border-red-300 bg-white px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-700 dark:bg-gray-900'
                autoFocus
              />
            </div>
          </div>
        }
        confirmText='Eliminar definitivo'
        isLoading={eliminando !== null}
        loadingText='Eliminando...'
      />
    </div>
  )
}
