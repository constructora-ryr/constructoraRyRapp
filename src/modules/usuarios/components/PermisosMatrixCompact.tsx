/**
 * ============================================
 * COMPONENTE: Matriz de Permisos Compacta (UX Moderno)
 * ============================================
 *
 * ✨ Inspirado en Auth0, AWS IAM, Firebase Console
 *
 * Características:
 * - Vista de tabla compacta tipo spreadsheet
 * - Filtros inteligentes (rol, módulo, búsqueda)
 * - Checkboxes visuales (verde/gris)
 * - Responsive (colapsa columnas en móvil)
 * - Edición en línea sin modales
 */

'use client'

import { useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckSquare,
  Info,
  Search,
  Shield,
  Square,
} from 'lucide-react'

import { logger } from '@/lib/utils/logger'
import { FormSelect } from '@/shared/components/ui/form-select'

import {
  useActualizarPermisoMutation,
  useTodosLosPermisosQuery,
} from '../hooks'
import type { PermisoRol } from '../services/permisos.service'
import type { Rol } from '../types'

export function PermisosMatrixCompact() {
  const { data: permisos = [], isLoading, error } = useTodosLosPermisosQuery()
  const actualizarPermisoMutation = useActualizarPermisoMutation()

  // Estados de filtros
  const [filtroRol, setFiltroRol] = useState<Rol | 'todos'>('todos')
  const [filtroModulo, setFiltroModulo] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')

  // Roles disponibles
  const roles: Rol[] = [
    'Administrador',
    'Contabilidad',
    'Administrador de Obra',
    'Gerencia',
  ]

  // Extraer módulos y acciones únicas
  const modulos = useMemo(
    () => Array.from(new Set(permisos.map(p => p.modulo))).sort(),
    [permisos]
  )

  // Agrupar permisos: { rol: { modulo: { accion: permiso } } }
  const permisosPorRolModulo = useMemo(() => {
    const result: Record<
      string,
      Record<string, Record<string, PermisoRol>>
    > = {}

    permisos.forEach(permiso => {
      if (!result[permiso.rol]) result[permiso.rol] = {}
      if (!result[permiso.rol][permiso.modulo])
        result[permiso.rol][permiso.modulo] = {}
      result[permiso.rol][permiso.modulo][permiso.accion] = permiso
    })

    return result
  }, [permisos])

  // Permisos filtrados
  const permisosFiltrados = useMemo(() => {
    let filtered = permisos

    if (filtroRol !== 'todos') {
      filtered = filtered.filter(p => p.rol === filtroRol)
    }

    if (filtroModulo !== 'todos') {
      filtered = filtered.filter(p => p.modulo === filtroModulo)
    }

    if (busqueda) {
      const search = busqueda.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.modulo.toLowerCase().includes(search) ||
          p.accion.toLowerCase().includes(search) ||
          p.descripcion?.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [permisos, filtroRol, filtroModulo, busqueda])

  const handleTogglePermiso = async (id: string, permitidoActual: boolean) => {
    try {
      await actualizarPermisoMutation.mutateAsync({
        id,
        permitido: !permitidoActual,
      })
    } catch (error) {
      logger.error('Error actualizando permiso:', error)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-xl border-2 border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20'>
        <div className='flex items-center gap-3'>
          <AlertCircle className='h-6 w-6 text-red-600 dark:text-red-400' />
          <div>
            <h3 className='font-semibold text-red-900 dark:text-red-100'>
              Error al cargar permisos
            </h3>
            <p className='text-sm text-red-700 dark:text-red-300'>
              {(error as Error).message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30'>
            <Shield className='h-5 w-5 text-white' />
          </div>
          <div>
            <h2 className='text-base font-bold text-gray-900 dark:text-white'>
              Matriz de Permisos RBAC
            </h2>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {permisosFiltrados.length} de {permisos.length} permisos
            </p>
          </div>
        </div>

        {/* Info Badge */}
        <div className='hidden items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 dark:border-indigo-800/50 dark:bg-indigo-900/20 sm:flex'>
          <Info className='h-4 w-4 text-indigo-500 dark:text-indigo-400' />
          <span className='text-xs text-indigo-700 dark:text-indigo-300'>
            Click para activar / desactivar
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className='flex flex-wrap items-center gap-2 rounded-xl border border-gray-200/50 bg-white/90 p-3 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90'>
        {/* Búsqueda */}
        <div className='relative min-w-[200px] flex-1'>
          <Search className='pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Buscar módulo, acción...'
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200'
          />
        </div>

        {/* Filtro Rol */}
        <FormSelect
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value as Rol | 'todos')}
          className='rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-1.5 text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200'
        >
          <option value='todos'>📋 Todos los roles</option>
          <option value='Administrador'>👑 Administrador</option>
          <option value='Contabilidad'>📊 Contabilidad</option>
          <option value='Administrador de Obra'>👁️ Admin. Obra</option>
          <option value='Gerencia'>💼 Gerencia</option>
        </FormSelect>

        {/* Filtro Módulo */}
        <FormSelect
          value={filtroModulo}
          onChange={e => setFiltroModulo(e.target.value)}
          className='rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-1.5 text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200'
        >
          <option value='todos'>📁 Todos los módulos</option>
          {modulos.map(mod => (
            <option key={mod} value={mod}>
              {mod}
            </option>
          ))}
        </FormSelect>

        {/* Limpiar Filtros */}
        {filtroRol !== 'todos' || filtroModulo !== 'todos' || busqueda ? (
          <button
            onClick={() => {
              setFiltroRol('todos')
              setFiltroModulo('todos')
              setBusqueda('')
            }}
            className='rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20'
          >
            Limpiar
          </button>
        ) : null}
      </div>

      {/* Tabla */}
      <div className='overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b border-gray-200 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-900/60'>
              <tr>
                <th className='sticky left-0 z-20 border-r border-gray-200 bg-gray-50/80 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400'>
                  Módulo
                </th>
                <th
                  className='sticky left-0 z-20 bg-gray-50/80 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-900/60 dark:text-gray-400'
                  style={{ left: '140px' }}
                >
                  Acción
                </th>
                {(filtroRol === 'todos' ? roles : [filtroRol as Rol]).map(
                  rol => (
                    <th
                      key={rol}
                      className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300'
                    >
                      <div className='flex items-center justify-center gap-1'>
                        {rol === 'Administrador' && '👑'}
                        {rol === 'Contabilidad' && '📊'}
                        {rol === 'Administrador de Obra' && '👁️'}
                        {rol === 'Gerencia' && '💼'}
                        <span className='hidden md:inline'>{rol}</span>
                        <span className='md:hidden'>{rol.slice(0, 4)}</span>
                      </div>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
              {modulos
                .filter(mod => filtroModulo === 'todos' || filtroModulo === mod)
                .map(modulo => {
                  const accionesDelModulo = Array.from(
                    new Set(
                      permisosFiltrados
                        .filter(p => p.modulo === modulo)
                        .map(p => p.accion)
                    )
                  ).sort()

                  if (accionesDelModulo.length === 0) return null

                  return accionesDelModulo.map((accion, idx) => (
                    <motion.tr
                      key={`${modulo}-${accion}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className='transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/30'
                    >
                      {/* Columna Módulo (merged) */}
                      {idx === 0 && (
                        <td
                          rowSpan={accionesDelModulo.length}
                          className='sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-3 align-top font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                        >
                          <div className='flex items-center gap-2'>
                            <span>📁</span>
                            <span>{modulo}</span>
                          </div>
                        </td>
                      )}

                      {/* Columna Acción */}
                      <td className='px-4 py-3 font-medium text-gray-700 dark:text-gray-300'>
                        {accion}
                      </td>

                      {/* Columnas de Roles con Checkboxes */}
                      {(filtroRol === 'todos' ? roles : [filtroRol as Rol]).map(
                        rol => {
                          const permiso =
                            permisosPorRolModulo[rol]?.[modulo]?.[accion]
                          const isAdmin = rol === 'Administrador'

                          return (
                            <td key={rol} className='px-4 py-3 text-center'>
                              {permiso ? (
                                <button
                                  onClick={() =>
                                    !isAdmin &&
                                    handleTogglePermiso(
                                      permiso.id,
                                      permiso.permitido
                                    )
                                  }
                                  disabled={
                                    isAdmin ||
                                    actualizarPermisoMutation.isPending
                                  }
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded transition-all ${
                                    permiso.permitido
                                      ? 'bg-green-500 text-white shadow-sm hover:bg-green-600'
                                      : 'bg-gray-200 text-gray-400 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                                  } ${
                                    isAdmin
                                      ? 'cursor-not-allowed opacity-60'
                                      : 'cursor-pointer hover:scale-110'
                                  } `}
                                  title={
                                    isAdmin
                                      ? 'Administrador tiene acceso total'
                                      : permiso.descripcion ||
                                        `${accion} en ${modulo}`
                                  }
                                >
                                  {permiso.permitido ? (
                                    <CheckSquare className='h-4 w-4' />
                                  ) : (
                                    <Square className='h-4 w-4' />
                                  )}
                                </button>
                              ) : (
                                <span className='text-gray-300 dark:text-gray-700'>
                                  -
                                </span>
                              )}
                            </td>
                          )
                        }
                      )}
                    </motion.tr>
                  ))
                })}
            </tbody>
          </table>
        </div>

        {/* Footer con leyenda */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/50 bg-gray-50/80 px-4 py-3 text-xs text-gray-600 dark:border-gray-700/50 dark:bg-gray-900/40 dark:text-gray-400'>
          <div className='flex items-center gap-4'>
            <span className='flex items-center gap-1.5'>
              <CheckSquare className='h-3.5 w-3.5 text-green-500' />
              Permitido
            </span>
            <span className='flex items-center gap-1.5'>
              <Square className='h-3.5 w-3.5 text-gray-400' />
              Denegado
            </span>
          </div>
          <span className='flex items-center gap-1.5'>
            <span>👑</span>
            <span>Administrador tiene control total (no editable)</span>
          </span>
        </div>
      </div>
    </div>
  )
}
