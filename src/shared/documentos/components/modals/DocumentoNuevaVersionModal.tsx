'use client'

/**
 * 📤 MODAL PARA SUBIR NUEVA VERSIÓN DE DOCUMENTO (PROYECTOS)
 *
 * Modal compacto diseño basado en Document Edit Metadatos Modal
 * - Campos: archivo, título editable, fecha documento, fecha vencimiento opcional, descripción cambios
 * - Colores: Cyan/Azul (tema Clientes)
 * - Portal rendering para z-index garantizado
 */

import { ChangeEvent, FormEvent, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Calendar,
  FileText,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import {
  formatDateForDB,
  formatDateForInput,
  getTodayDateString,
} from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'
import {
  formatosArchivo,
  validarArchivoDocumento,
} from '@/shared/documentos/config/tipos-archivo'
import { documentosKeys } from '@/shared/documentos/hooks/useDocumentosQuery'
import { DocumentosService } from '@/shared/documentos/services/documentos.service'
import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'
import type { TipoEntidad } from '@/shared/documentos/types/entidad.types'

interface DocumentoNuevaVersionModalProps {
  isOpen: boolean
  documento: DocumentoProyecto
  onClose: () => void
  onSuccess?: () => void
  tipoEntidad?: TipoEntidad
}

export function DocumentoNuevaVersionModal({
  isOpen,
  documento,
  onClose,
  onSuccess,
  tipoEntidad = 'proyecto',
}: DocumentoNuevaVersionModalProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Estados del formulario
  const [archivo, setArchivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState(documento.titulo)
  const [fechaDocumento, setFechaDocumento] = useState(
    documento.fecha_documento
      ? formatDateForInput(documento.fecha_documento)
      : getTodayDateString()
  )
  const [fechaVencimiento, setFechaVencimiento] = useState(
    documento.fecha_vencimiento
      ? formatDateForInput(documento.fecha_vencimiento)
      : ''
  )
  const [cambios, setCambios] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const errorArchivo = validarArchivoDocumento(file, tipoEntidad)
    if (errorArchivo) {
      setError(errorArchivo)
      return
    }

    setError(null)
    setArchivo(file)

    // Auto-completar título con nombre del archivo (sin extensión)
    const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '')
    setTitulo(nombreSinExtension)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!archivo) {
      setError('Debes seleccionar un archivo')
      return
    }

    if (!titulo.trim()) {
      setError('Debes ingresar un título para el documento')
      return
    }

    // ✅ Validación: Fecha de vencimiento no puede ser anterior a fecha de documento
    // Comparar strings YYYY-MM-DD para evitar timezone shift
    if (
      fechaDocumento &&
      fechaVencimiento &&
      fechaVencimiento < fechaDocumento
    ) {
      setError(
        'La fecha de vencimiento no puede ser anterior a la fecha del documento'
      )
      toast.error('Fecha de vencimiento inválida')
      return
    }

    if (!user) {
      setError('Debes iniciar sesión')
      return
    }

    setSubiendo(true)
    setError(null)

    try {
      await DocumentosService.crearNuevaVersion(
        documento.id,
        archivo,
        user.id,
        tipoEntidad,
        cambios.trim() || undefined,
        titulo.trim(),
        fechaDocumento ? formatDateForDB(fechaDocumento) : undefined,
        fechaVencimiento ? formatDateForDB(fechaVencimiento) : undefined
      )

      // ✅ Invalidar caché de React Query - GENÉRICO según tipoEntidad
      const docRecord = documento as unknown as Record<string, unknown>
      const entidadId =
        tipoEntidad === 'proyecto'
          ? documento.proyecto_id
          : tipoEntidad === 'vivienda'
            ? (docRecord.vivienda_id as string | undefined)
            : (docRecord.cliente_id as string | undefined)

      queryClient.invalidateQueries({
        queryKey: documentosKeys.list(entidadId ?? '', tipoEntidad),
      })

      toast.success('Nueva versión creada exitosamente')
      onSuccess?.()
      handleClose()
    } catch (error: unknown) {
      logger.error('Error al crear nueva versión:', error)
      const mensaje =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as Record<string, unknown>).message)
            : 'Error al subir la nueva versión'
      setError(mensaje)
      toast.error('Error al crear nueva versión', { description: mensaje })
    } finally {
      setSubiendo(false)
    }
  }

  const handleClose = () => {
    if (subiendo) return
    setArchivo(null)
    setTitulo(documento.titulo)
    setFechaDocumento(
      documento.fecha_documento
        ? formatDateForInput(documento.fecha_documento)
        : getTodayDateString()
    )
    setFechaVencimiento(
      documento.fecha_vencimiento
        ? formatDateForInput(documento.fecha_vencimiento)
        : ''
    )
    setCambios('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  // ✅ Advertencia si fecha nueva es anterior a la actual
  // Comparar solo la parte YYYY-MM-DD para evitar timezone shift con new Date()
  const fechaActualStr = documento.fecha_documento
    ? documento.fecha_documento.slice(0, 10)
    : null
  const mostrarAdvertenciaFecha =
    fechaActualStr && fechaDocumento && fechaDocumento < fechaActualStr

  // ✅ Validación en tiempo real: Fecha de vencimiento vs Fecha de documento
  const fechaVencimientoInvalida =
    fechaDocumento && fechaVencimiento && fechaVencimiento < fechaDocumento

  const modalContent = (
    <AnimatePresence>
      <div
        className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className='relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
        >
          {/* Header - Verde/Esmeralda (tema Proyectos) */}
          <div className='sticky top-0 z-10 rounded-t-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                  <Upload className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>
                    Subir Nueva Versión
                  </h2>
                  <p className='mt-0.5 text-sm text-white/90'>
                    {documento.titulo}
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={handleClose}
                disabled={subiendo}
                className='rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className='space-y-5 p-6'>
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='rounded-lg border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
              >
                ⚠️ {error}
              </motion.div>
            )}

            {/* Archivo */}
            <div>
              <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Nuevo archivo *
              </label>
              {!archivo ? (
                <label
                  htmlFor='file-upload-version'
                  className='group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-cyan-300 bg-cyan-50 p-6 transition-all hover:border-cyan-500 hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-950/30 dark:hover:border-cyan-600'
                >
                  <div className='rounded-full bg-cyan-100 p-3 group-hover:bg-cyan-200 dark:bg-cyan-900/30'>
                    <Upload className='h-6 w-6 text-cyan-600 dark:text-cyan-400' />
                  </div>
                  <div className='text-center'>
                    <p className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      Seleccionar archivo
                    </p>
                    <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                      PDF, Imágenes, Word, Excel • Máx. 50MB
                    </p>
                  </div>
                  <input
                    id='file-upload-version'
                    type='file'
                    onChange={handleFileSelect}
                    accept={formatosArchivo(tipoEntidad).accept}
                    className='hidden'
                    disabled={subiendo}
                  />
                </label>
              ) : (
                <div className='flex items-center gap-3 rounded-xl border-2 border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-800 dark:bg-cyan-950/30'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-white'>
                    <FileText className='h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
                      {archivo.name}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {(archivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setArchivo(null)
                      setTitulo(documento.titulo) // Restaurar título original
                    }}
                    className='rounded-lg p-1 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30'
                    disabled={subiendo}
                  >
                    <X className='h-4 w-4 text-red-600 dark:text-red-400' />
                  </button>
                </div>
              )}
            </div>

            {/* Título del documento */}
            {archivo && (
              <>
                <div>
                  <label
                    htmlFor='titulo'
                    className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'
                  >
                    Título del documento *
                  </label>
                  <input
                    id='titulo'
                    type='text'
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder='Ej: Certificado de Tradición Actualizado'
                    className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-cyan-600'
                    disabled={subiendo}
                    required
                  />
                  <p className='mt-1.5 text-xs text-gray-500 dark:text-gray-400'>
                    💡 Puedes editar el título para hacerlo más descriptivo
                  </p>
                </div>

                {/* Grid de fechas */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {/* Fecha del documento */}
                  <div>
                    <label
                      htmlFor='fecha-documento'
                      className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'
                    >
                      <Calendar className='mr-1 inline h-3.5 w-3.5' />
                      Fecha del documento
                    </label>
                    <input
                      id='fecha-documento'
                      type='date'
                      value={fechaDocumento}
                      onChange={e => setFechaDocumento(e.target.value)}
                      className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-cyan-600'
                      disabled={subiendo}
                    />
                  </div>

                  {/* Fecha de vencimiento */}
                  <div>
                    <label
                      htmlFor='fecha-vencimiento'
                      className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'
                    >
                      <Calendar className='mr-1 inline h-3.5 w-3.5' />
                      Fecha de vencimiento (opcional)
                    </label>
                    <input
                      id='fecha-vencimiento'
                      type='date'
                      value={fechaVencimiento}
                      onChange={e => setFechaVencimiento(e.target.value)}
                      className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-cyan-600'
                      disabled={subiendo}
                    />
                  </div>
                </div>

                {/* Advertencia de fecha anterior */}
                {mostrarAdvertenciaFecha && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20'
                  >
                    <div className='flex items-center gap-2'>
                      <AlertTriangle className='h-4 w-4 text-yellow-600 dark:text-yellow-500' />
                      <p className='text-xs text-yellow-700 dark:text-yellow-300'>
                        <strong>Advertencia:</strong> La fecha del nuevo
                        documento es anterior a la versión actual. ¿Estás seguro
                        de continuar?
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ✅ Advertencia de fecha de vencimiento inválida */}
                {fechaVencimientoInvalida && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'
                  >
                    <div className='flex items-center gap-2'>
                      <AlertTriangle className='h-4 w-4 text-red-600 dark:text-red-500' />
                      <p className='text-xs text-red-700 dark:text-red-300'>
                        <strong>Error:</strong> La fecha de vencimiento no puede
                        ser anterior a la fecha del documento.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Descripción de cambios */}
                <div>
                  <label
                    htmlFor='cambios'
                    className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'
                  >
                    Descripción de cambios (opcional)
                  </label>
                  <textarea
                    id='cambios'
                    value={cambios}
                    onChange={e => setCambios(e.target.value)}
                    placeholder='Ej: Actualización con información más reciente del cliente'
                    rows={3}
                    className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-cyan-600'
                    disabled={subiendo}
                  />
                  <p className='mt-1.5 text-xs text-gray-500 dark:text-gray-400'>
                    Explica brevemente qué cambió en esta versión
                  </p>
                </div>
              </>
            )}

            {/* Botones */}
            <div className='flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700'>
              <button
                type='button'
                onClick={handleClose}
                disabled={subiendo}
                className='flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={
                  !archivo ||
                  !titulo.trim() ||
                  subiendo ||
                  !!fechaVencimientoInvalida
                }
                className='flex-1 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {subiendo ? (
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  'Subir Nueva Versión'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  // Renderizar en Portal para garantizar z-index
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
