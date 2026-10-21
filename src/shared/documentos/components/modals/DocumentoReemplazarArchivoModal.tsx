'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileText,
  Loader2,
  Lock,
  RefreshCw,
  Shield,
  Upload,
  X,
} from 'lucide-react'

import { type ModuleName } from '@/shared/config/module-themes'

import { formatosArchivo } from '../../config/tipos-archivo'
import { useReemplazarArchivoForm } from '../../hooks'
import type { DocumentoProyecto, TipoEntidad } from '../../types'

import { getReemplazarArchivoModalStyles } from './DocumentoReemplazarArchivoModal.styles'

// Helper para iconos de fase
const getFaseIcon = (fase: string) => {
  switch (fase) {
    case 'validando':
      return <Shield size={16} className='text-blue-500' />
    case 'descargando':
      return <Download size={16} className='text-indigo-500' />
    case 'creando-backup':
      return <FileText size={16} className='text-purple-500' />
    case 'subiendo':
      return <Upload size={16} className='text-pink-500' />
    case 'actualizando':
      return <Database size={16} className='text-violet-500' />
    case 'finalizando':
      return <CheckCircle2 size={16} className='text-green-500' />
    default:
      return <Loader2 size={16} className='animate-spin text-gray-500' />
  }
}

// Helper para porcentaje por fase
const getFasePorcentaje = (faseId: string): number => {
  const porcentajes: Record<string, number> = {
    validando: 10,
    descargando: 25,
    'creando-backup': 45,
    subiendo: 65,
    actualizando: 85,
    finalizando: 100,
  }
  return porcentajes[faseId] || 0
}

interface DocumentoReemplazarArchivoModalProps {
  isOpen: boolean
  documento: DocumentoProyecto
  tipoEntidad?: TipoEntidad
  moduleName?: ModuleName
  onClose: () => void
  onReemplazado?: () => void | Promise<void>
}

export function DocumentoReemplazarArchivoModal({
  isOpen,
  documento,
  tipoEntidad = 'proyecto',
  moduleName = 'proyectos',
  onClose,
  onReemplazado,
}: DocumentoReemplazarArchivoModalProps) {
  // Generar estilos dinámicos según módulo
  const styles = getReemplazarArchivoModalStyles(moduleName)

  const {
    nuevoArchivo,
    justificacion,
    password,
    dragActive,
    reemplazando,
    progreso,
    isSubmitDisabled,
    setJustificacion,
    setPassword,
    handleDrag,
    handleDrop,
    handleFileChange,
    removeFile,
    handleSubmit,
    handleClose,
  } = useReemplazarArchivoForm({
    tipoEntidad,
    onSuccess: onReemplazado,
    onClose,
  })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          key='modal-reemplazar-archivo'
          className={styles.backdrop}
          onClick={e => e.stopPropagation()}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className={styles.backdropOverlay}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={styles.modal}
          >
            {/* Header con advertencia */}
            <div className={styles.header.container}>
              <div className={styles.header.content}>
                <div className={styles.header.leftSection}>
                  <div className={styles.header.icon}>
                    <Shield size={20} className='text-white' />
                  </div>
                  <div>
                    <h2 className={styles.header.title}>
                      Reemplazar Archivo
                      <span className={styles.header.badge}>Admin</span>
                    </h2>
                    <p className={styles.header.subtitle}>
                      Validación de seguridad requerida
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={reemplazando}
                  className={styles.header.closeButton}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Advertencia */}
            <div className={styles.warning.container}>
              <div className={styles.warning.content}>
                <AlertTriangle size={16} className={styles.warning.icon} />
                <div className='flex-1'>
                  <h3 className={styles.warning.title}>
                    ⚠️ Advertencia Importante
                  </h3>
                  <ul className={styles.warning.list}>
                    <li>
                      • Archivo actual será{' '}
                      <strong>eliminado permanentemente</strong>
                    </li>
                    <li>
                      • <strong>No se creará nueva versión</strong> (sin
                      versionado)
                    </li>
                    <li>
                      • Acción <strong>registrada en auditoría</strong>
                    </li>
                    <li>• Solo para corrección de errores administrativos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form
              onSubmit={e =>
                handleSubmit(e, {
                  id: documento.id,
                  nombre_archivo: documento.nombre_archivo,
                  url_storage: documento.url_storage,
                  tamano_bytes: documento.tamano_bytes,
                  version: documento.version,
                })
              }
              className={styles.form.container}
            >
              {/* Archivo actual */}
              <div className={styles.currentFile.container}>
                <div className={styles.currentFile.label}>
                  <FileText size={14} />
                  Archivo actual (v{documento.version}):
                </div>
                <p className={styles.currentFile.filename}>
                  {documento.titulo}.pdf
                </p>
                <p className={styles.currentFile.size}>
                  {(documento.tamano_bytes / 1024).toFixed(2)} KB
                </p>
              </div>

              {/* Subir nuevo archivo */}
              <div>
                <label className={styles.form.label}>
                  <Upload size={14} />
                  Nuevo archivo *
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`${styles.dragDrop.containerBase} ${
                    dragActive
                      ? styles.dragDrop.containerActive
                      : styles.dragDrop.containerInactive
                  } ${reemplazando ? styles.dragDrop.containerDisabled : ''}`}
                >
                  <input
                    type='file'
                    onChange={handleFileChange}
                    disabled={reemplazando}
                    accept={formatosArchivo(tipoEntidad).accept}
                    className={styles.dragDrop.input}
                  />

                  <div className={styles.dragDrop.content}>
                    <div className={styles.dragDrop.iconWrapper}>
                      <Upload size={18} className={styles.dragDrop.icon} />
                    </div>

                    {nuevoArchivo ? (
                      <>
                        <p className={styles.dragDrop.filename}>
                          {nuevoArchivo.name}
                        </p>
                        <p className={styles.dragDrop.fileSize}>
                          {(nuevoArchivo.size / 1024).toFixed(2)} KB
                        </p>
                        <button
                          type='button'
                          onClick={removeFile}
                          disabled={reemplazando}
                          className={styles.dragDrop.changeButton}
                        >
                          Cambiar archivo
                        </button>
                      </>
                    ) : (
                      <>
                        <p className={styles.dragDrop.emptyTitle}>
                          Arrastra un archivo o haz clic
                        </p>
                        <p className={styles.dragDrop.emptySubtitle}>
                          PDF, JPG, PNG, DOC, XLS (máx. 50MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Justificación */}
              <div>
                <label className={styles.form.label}>
                  <FileText size={14} />
                  Justificación *
                </label>
                <textarea
                  value={justificacion}
                  onChange={e => setJustificacion(e.target.value)}
                  required
                  minLength={10}
                  disabled={reemplazando}
                  rows={3}
                  className={styles.form.textarea}
                  placeholder='Explica por qué estás reemplazando este archivo (mínimo 10 caracteres)...'
                />
                <p className={styles.form.helperText}>
                  {justificacion.length}/10 caracteres mínimos
                </p>
              </div>

              {/* Contraseña de confirmación */}
              <div className='max-w-md'>
                <label className={styles.form.label}>
                  <Lock size={14} />
                  Confirma tu contraseña *
                </label>
                <input
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={reemplazando}
                  className={styles.form.input}
                  placeholder='Tu contraseña de admin'
                />
                <p className={styles.form.helperText}>
                  Confirma tu identidad para proceder
                </p>
              </div>

              {/* Barra de progreso profesional con fases */}
              {reemplazando && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='space-y-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30'
                >
                  {/* Header del progreso */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='relative'>
                        <div className='border-3 h-8 w-8 animate-spin rounded-full border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400'></div>
                        <div className='absolute inset-0 flex items-center justify-center'>
                          {getFaseIcon(progreso.fase)}
                        </div>
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                          {progreso.mensaje}
                        </p>
                        <p className='mt-0.5 text-xs text-gray-600 dark:text-gray-400'>
                          Fase: {progreso.fase}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent'>
                        {progreso.porcentaje}%
                      </p>
                    </div>
                  </div>

                  {/* Barra de progreso animada */}
                  <div className='relative h-3 overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progreso.porcentaje}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className='absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg'
                    >
                      {/* Efecto de brillo */}
                      <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent'></div>
                    </motion.div>
                  </div>

                  {/* Lista de fases con checkmarks */}
                  <div className='grid grid-cols-3 gap-2 pt-2'>
                    {[
                      { id: 'validando', label: 'Validar' },
                      { id: 'descargando', label: 'Descargar' },
                      { id: 'creando-backup', label: 'Backup' },
                      { id: 'subiendo', label: 'Subir' },
                      { id: 'actualizando', label: 'Actualizar' },
                      { id: 'finalizando', label: 'Finalizar' },
                    ].map(step => {
                      const isCurrent = progreso.fase === step.id
                      const isCompleted =
                        progreso.porcentaje > getFasePorcentaje(step.id)

                      return (
                        <div
                          key={step.id}
                          className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-all ${
                            isCurrent
                              ? 'bg-blue-100 font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                              : isCompleted
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={12} />
                          ) : isCurrent ? (
                            <Loader2 size={12} className='animate-spin' />
                          ) : (
                            <div className='h-3 w-3 rounded-full border-2 border-current opacity-30'></div>
                          )}
                          <span>{step.label}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Mensaje de advertencia */}
                  <div className='flex items-start gap-2 border-t border-blue-200 pt-2 dark:border-blue-800'>
                    <AlertTriangle
                      size={14}
                      className='mt-0.5 flex-shrink-0 text-amber-500'
                    />
                    <p className='text-xs text-gray-600 dark:text-gray-400'>
                      No cierres esta ventana hasta que el proceso finalice
                      completamente
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Botones */}
              <div className={styles.buttons.container}>
                <button
                  type='button'
                  onClick={handleClose}
                  disabled={reemplazando}
                  className={styles.buttons.cancel}
                >
                  Cancelar
                </button>

                {/* Wrapper para tooltip */}
                <div className={styles.buttons.tooltipWrapper}>
                  <button
                    type='submit'
                    disabled={isSubmitDisabled}
                    className={styles.buttons.submit}
                  >
                    {reemplazando ? (
                      <>
                        <Loader2 size={14} className='animate-spin' />
                        Reemplazando...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        Confirmar Reemplazo
                      </>
                    )}
                  </button>

                  {/* Tooltip informativo */}
                  {!reemplazando &&
                    (!nuevoArchivo ||
                      justificacion.length < 10 ||
                      !password) && (
                      <div className={styles.tooltip.container}>
                        {!nuevoArchivo && (
                          <div>• Debes seleccionar un archivo nuevo</div>
                        )}
                        {nuevoArchivo && justificacion.length < 10 && (
                          <div>
                            • Justificación debe tener mínimo 10 caracteres (
                            {justificacion.length}/10)
                          </div>
                        )}
                        {nuevoArchivo &&
                          justificacion.length >= 10 &&
                          !password && (
                            <div>• Debes confirmar tu contraseña</div>
                          )}
                        <div className={styles.tooltip.arrow}></div>
                      </div>
                    )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
