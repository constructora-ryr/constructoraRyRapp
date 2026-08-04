/**
 * Component: EntidadesFinancierasLista
 *
 * Tabla profesional para administrar entidades financieras.
 * Con filtros, búsqueda, acciones inline y estados de UI.
 */

'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  CircleDollarSign,
  Edit2,
  Filter,
  Landmark,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'

import { useModal } from '@/shared/components/modals'
import { SectionLoadingSpinner } from '@/shared/components/ui'
import { FormSelect } from '@/shared/components/ui/form-select'

import {
  useEliminarEntidadFinanciera,
  useEntidadesFinancieras,
  useReactivarEntidadFinanciera,
} from '../hooks/useEntidadesFinancieras'
import type {
  EntidadColor,
  EntidadFinanciera,
  TipoEntidadFinanciera,
} from '../types/entidades-financieras.types'
import { TIPO_ENTIDAD_VALUES } from '../types/entidades-financieras.types'

import { EntidadFinancieraFormModal } from './EntidadFinancieraFormModal'

// =====================================================
// ICON MAP
// =====================================================

const tipoIcons: Record<TipoEntidadFinanciera, React.ElementType> = {
  Banco: Landmark,
  'Caja de Compensación': Building2,
  Cooperativa: CircleDollarSign,
  Otro: Building2,
}

// =====================================================
// COLOR MAP
// =====================================================

const colorClasses: Record<
  EntidadColor,
  { bg: string; text: string; border: string }
> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-800',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-800',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-800',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
  },
  lime: {
    bg: 'bg-lime-50 dark:bg-lime-950/30',
    text: 'text-lime-600 dark:text-lime-400',
    border: 'border-lime-200 dark:border-lime-800',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
  },
}

// =====================================================
// COMPONENT
// =====================================================

export function EntidadesFinancierasLista() {
  // State
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<TipoEntidadFinanciera | 'Todos'>(
    'Todos'
  )
  const [estadoFilter, setEstadoFilter] = useState<
    'Todos' | 'Activas' | 'Inactivas'
  >('Todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [entidadEdit, setEntidadEdit] = useState<EntidadFinanciera | null>(null)
  const { confirm } = useModal()

  // Queries & Mutations
  const {
    data: entidades,
    isLoading,
    isError,
    error,
    refetch,
  } = useEntidadesFinancieras()
  const eliminarMutation = useEliminarEntidadFinanciera()
  const reactivarMutation = useReactivarEntidadFinanciera()

  // Filtrar entidades
  const entidadesFiltradas = entidades?.filter(entidad => {
    const matchSearch =
      entidad.nombre.toLowerCase().includes(search.toLowerCase()) ||
      entidad.codigo.toLowerCase().includes(search.toLowerCase()) ||
      entidad.nit?.toLowerCase().includes(search.toLowerCase())

    const matchTipo = tipoFilter === 'Todos' || entidad.tipo === tipoFilter

    const matchEstado =
      estadoFilter === 'Todos' ||
      (estadoFilter === 'Activas' && entidad.activo) ||
      (estadoFilter === 'Inactivas' && !entidad.activo)

    return matchSearch && matchTipo && matchEstado
  })

  // Handlers
  const handleNuevo = () => {
    setEntidadEdit(null)
    setIsModalOpen(true)
  }

  const handleEdit = (entidad: EntidadFinanciera) => {
    setEntidadEdit(entidad)
    setIsModalOpen(true)
  }

  const handleEliminar = async (entidad: EntidadFinanciera) => {
    const confirmado = await confirm({
      title: 'Desactivar entidad',
      message: `¿Desactivar "${entidad.nombre}"?`,
      variant: 'danger',
      confirmText: 'Desactivar',
      cancelText: 'Cancelar',
    })
    if (!confirmado) return
    await eliminarMutation.mutateAsync(entidad.id)
  }

  const handleReactivar = async (entidad: EntidadFinanciera) => {
    await reactivarMutation.mutateAsync(entidad.id)
  }

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (isLoading) {
    return (
      <SectionLoadingSpinner
        label='Cargando entidades...'
        moduleName='clientes'
        icon={Building2}
      />
    )
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (isError) {
    return (
      <div className='rounded-xl border-2 border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='mt-0.5 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400' />
          <div>
            <h3 className='font-semibold text-red-900 dark:text-red-100'>
              Error al cargar entidades
            </h3>
            <p className='mt-1 text-sm text-red-700 dark:text-red-300'>
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <button
              onClick={() => refetch()}
              className='mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700'
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <div className='space-y-4'>
      {/* Header con búsqueda y filtros */}
      <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex flex-col items-start gap-3 lg:flex-row lg:items-center'>
          {/* Búsqueda */}
          <div className='relative w-full flex-1'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Buscar por nombre, código o NIT...'
              className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>

          {/* Filtro Tipo */}
          <div className='relative flex w-full items-center gap-2 lg:w-auto'>
            <Filter className='h-4 w-4 text-gray-400' />
            <FormSelect
              value={tipoFilter}
              onChange={e =>
                setTipoFilter(e.target.value as TipoEntidadFinanciera | 'Todos')
              }
              className='min-w-[200px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white lg:flex-none'
            >
              <option value='Todos'>Todos los tipos</option>
              {TIPO_ENTIDAD_VALUES.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </FormSelect>
          </div>

          {/* Filtro Estado */}
          <FormSelect
            value={estadoFilter}
            onChange={e =>
              setEstadoFilter(
                e.target.value as 'Todos' | 'Activas' | 'Inactivas'
              )
            }
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white lg:w-auto'
          >
            <option value='Todos'>Todos</option>
            <option value='Activas'>Activas</option>
            <option value='Inactivas'>Inactivas</option>
          </FormSelect>

          {/* Botón Nuevo */}
          <button
            onClick={handleNuevo}
            className='flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 lg:w-auto'
          >
            <Plus className='h-4 w-4' />
            Nueva Entidad
          </button>
        </div>

        {/* Contador */}
        <div className='mt-3 border-t border-gray-200 pt-3 dark:border-gray-700'>
          <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
            {entidadesFiltradas?.length || 0} entidad(es) encontrada(s)
          </p>
        </div>
      </div>

      {/* Tabla */}
      {entidadesFiltradas && entidadesFiltradas.length > 0 ? (
        <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300'>
                    Entidad
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300'>
                    Tipo
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300'>
                    Contacto
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300'>
                    Orden
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300'>
                    Estado
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                {entidadesFiltradas.map(entidad => {
                  const Icon = tipoIcons[entidad.tipo]
                  const colors =
                    colorClasses[entidad.color as EntidadColor] ||
                    colorClasses.gray

                  return (
                    <motion.tr
                      key={entidad.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className='transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    >
                      {/* Entidad */}
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`h-10 w-10 rounded-lg ${colors.bg} ${colors.border} flex flex-shrink-0 items-center justify-center border`}
                          >
                            <Icon className={`h-5 w-5 ${colors.text}`} />
                          </div>
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
                              {entidad.nombre}
                            </p>
                            <p className='font-mono text-xs text-gray-500 dark:text-gray-400'>
                              {entidad.codigo}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className='px-4 py-3'>
                        <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
                          {entidad.tipo}
                        </span>
                      </td>

                      {/* Contacto */}
                      <td className='px-4 py-3'>
                        <div className='space-y-0.5 text-xs'>
                          {entidad.telefono ? (
                            <p className='text-gray-600 dark:text-gray-400'>
                              {entidad.telefono}
                            </p>
                          ) : null}
                          {entidad.email_contacto ? (
                            <p className='max-w-xs truncate text-gray-600 dark:text-gray-400'>
                              {entidad.email_contacto}
                            </p>
                          ) : null}
                          {!entidad.telefono && !entidad.email_contacto ? (
                            <p className='italic text-gray-400 dark:text-gray-500'>
                              Sin contacto
                            </p>
                          ) : null}
                        </div>
                      </td>

                      {/* Orden */}
                      <td className='px-4 py-3 text-center'>
                        <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
                          {entidad.orden}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className='px-4 py-3 text-center'>
                        {entidad.activo ? (
                          <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400'>
                            <span className='h-1.5 w-1.5 rounded-full bg-green-500' />
                            Activa
                          </span>
                        ) : (
                          <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-400'>
                            <span className='h-1.5 w-1.5 rounded-full bg-gray-400' />
                            Inactiva
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className='px-4 py-3'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => handleEdit(entidad)}
                            className='rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30'
                            title='Editar'
                          >
                            <Edit2 className='h-4 w-4' />
                          </button>

                          {entidad.activo ? (
                            <button
                              onClick={() => handleEliminar(entidad)}
                              disabled={eliminarMutation.isPending}
                              className='rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30'
                              title='Desactivar'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivar(entidad)}
                              disabled={reactivarMutation.isPending}
                              className='rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-950/30'
                              title='Reactivar'
                            >
                              <RefreshCw className='h-4 w-4' />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Empty State
        <div className='rounded-xl border border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-800'>
          <div className='text-center'>
            <Building2 className='mx-auto mb-3 h-12 w-12 text-gray-400' />
            <h3 className='mb-1 text-lg font-semibold text-gray-900 dark:text-white'>
              No hay entidades
            </h3>
            <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
              {search || tipoFilter !== 'Todos' || estadoFilter !== 'Todos'
                ? 'No se encontraron entidades con los filtros seleccionados'
                : 'Comienza creando tu primera entidad financiera'}
            </p>
            {!search && tipoFilter === 'Todos' && estadoFilter === 'Todos' ? (
              <button
                onClick={handleNuevo}
                className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700'
              >
                <Plus className='h-4 w-4' />
                Nueva Entidad
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal */}
      <EntidadFinancieraFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEntidadEdit(null)
        }}
        entidad={entidadEdit}
      />
    </div>
  )
}
