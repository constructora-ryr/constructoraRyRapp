/**
 * ConfiguracionPage - Vista principal de configuración de recargos
 * ✅ Tabla con CRUD completo
 * ✅ Modal para crear/editar
 * ✅ Diseño estándar compacto
 */

'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Edit2,
  Plus,
  Settings,
  Trash2,
  XCircle,
} from 'lucide-react'

import { FormularioConfiguracion } from '@/modules/configuracion/components/formulario-configuracion'
import { useConfiguracion } from '@/modules/configuracion/hooks/useConfiguracion'
import { type CrearConfiguracionDTO } from '@/modules/configuracion/services/configuracion.service'
import { Cargador } from '@/shared/components/carga'

export default function ConfiguracionPage() {
  const {
    configuraciones,
    loading,
    error,
    modoEdicion,
    configuracionSeleccionada,
    crear,
    actualizar,
    eliminar,
    toggleActivo,
    abrirEdicion,
    abrirCreacion,
    cerrarModal,
  } = useConfiguracion()

  const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getTipoColor = (tipo: string) => {
    const colores: Record<string, string> = {
      gastos_notariales:
        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      recargo_esquinera:
        'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      recargo_especial:
        'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      otros: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
    }
    return colores[tipo] || colores.otros
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      gastos_notariales: 'Gastos Notariales',
      recargo_esquinera: 'Recargo Esquinera',
      recargo_especial: 'Recargo Especial',
      otros: 'Otros',
    }
    return labels[tipo] || tipo
  }

  const handleEliminar = async (id: string) => {
    const exito = await eliminar(id)
    if (exito) {
      setConfirmEliminar(null)
    }
  }

  const handleGuardar = async (datos: CrearConfiguracionDTO) => {
    if (configuracionSeleccionada) {
      return await actualizar(configuracionSeleccionada.id, datos)
    } else {
      return await crear(datos)
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Cargador label='Cargando configuración' tamano='lg' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800'>
      <div className='mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8'>
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-2xl shadow-blue-500/20 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800'
        >
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
          <div className='relative z-10'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                  <Settings className='h-6 w-6 text-white' />
                </div>
                <div className='space-y-0.5'>
                  <h1 className='text-2xl font-bold text-white'>Recargos</h1>
                  <p className='text-xs text-blue-100 dark:text-blue-200'>
                    Gestiona gastos notariales y recargos •{' '}
                    {configuraciones.length} recargos
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={abrirCreacion}
                className='inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30'
              >
                <Plus className='h-4 w-4' />
                Nueva Recargo
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20'
          >
            <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          </motion.div>
        )}

        {/* Tabla */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'
        >
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50'>
                  <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Tipo
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Nombre
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Valor
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Estado
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                {configuraciones.map(config => (
                  <motion.tr
                    key={config.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50'
                  >
                    <td className='px-6 py-4'>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getTipoColor(config.tipo)}`}
                      >
                        {getTipoLabel(config.tipo)}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div>
                        <p className='text-sm font-medium text-gray-900 dark:text-white'>
                          {config.nombre}
                        </p>
                        {config.descripcion && (
                          <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                            {config.descripcion}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <DollarSign className='h-4 w-4 text-green-600 dark:text-green-400' />
                        <span className='text-sm font-bold text-green-600 dark:text-green-400'>
                          {formatCurrency(config.valor)}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <button
                        onClick={() => toggleActivo(config.id, !config.activo)}
                        className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors'
                        style={{
                          backgroundColor: config.activo
                            ? 'rgb(134 239 172 / 0.2)'
                            : 'rgb(248 113 113 / 0.2)',
                          color: config.activo
                            ? 'rgb(22 163 74)'
                            : 'rgb(220 38 38)',
                        }}
                      >
                        {config.activo ? (
                          <CheckCircle className='h-3 w-3' />
                        ) : (
                          <XCircle className='h-3 w-3' />
                        )}
                        {config.activo ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-end gap-2'>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => abrirEdicion(config)}
                          className='rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                          title='Editar'
                        >
                          <Edit2 className='h-4 w-4' />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfirmEliminar(config.id)}
                          className='rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                          title='Eliminar'
                        >
                          <Trash2 className='h-4 w-4' />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {configuraciones.length === 0 && (
            <div className='p-12 text-center'>
              <Settings className='mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-600' />
              <p className='mb-2 text-gray-600 dark:text-gray-400'>
                No hay recargos configurados
              </p>
              <button
                onClick={abrirCreacion}
                className='text-sm font-medium text-blue-600 hover:underline dark:text-blue-400'
              >
                Crear el primer recargo
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de formulario */}
      <AnimatePresence>
        {modoEdicion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
            onClick={cerrarModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className='w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800'
            >
              <h2 className='mb-6 text-xl font-bold text-gray-900 dark:text-white'>
                {configuracionSeleccionada ? 'Editar Recargo' : 'Nuevo Recargo'}
              </h2>
              <FormularioConfiguracion
                configuracion={configuracionSeleccionada}
                onGuardar={handleGuardar}
                onCancelar={cerrarModal}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {confirmEliminar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
            onClick={() => setConfirmEliminar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className='w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800'
            >
              <div className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
                  <AlertCircle className='h-8 w-8 text-red-600 dark:text-red-400' />
                </div>
                <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                  ¿Eliminar recargo?
                </h3>
                <p className='mb-6 text-gray-600 dark:text-gray-400'>
                  Esta acción no se puede deshacer.
                </p>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => handleEliminar(confirmEliminar)}
                    className='flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700'
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => setConfirmEliminar(null)}
                    className='flex-1 rounded-lg bg-gray-200 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
