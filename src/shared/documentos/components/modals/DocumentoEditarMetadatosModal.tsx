'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  FileCheck,
  Folder,
  Loader2,
  Save,
  X,
} from 'lucide-react'

import {
  AccordionWizardField,
  AccordionWizardTextarea,
  getAccordionWizardStyles,
} from '@/shared/components/accordion-wizard'
import { FormSelect } from '@/shared/components/ui/form-select'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import { useDocumentoEditarMetadatosModal } from '../../hooks/useDocumentoEditarMetadatosModal'
import type {
  CategoriaDocumento,
  DocumentoProyecto,
  TipoEntidad,
} from '../../types'

import { ConfirmarCambiosDocumentoModal } from './ConfirmarCambiosDocumentoModal'

interface DocumentoEditarMetadatosModalProps {
  isOpen: boolean
  documento: DocumentoProyecto
  categorias: CategoriaDocumento[]
  tipoEntidad?: TipoEntidad
  moduleName?: ModuleName
  onClose: () => void
  onEditado?: () => void | Promise<void>
}

export function DocumentoEditarMetadatosModal({
  isOpen,
  documento,
  categorias,
  tipoEntidad = 'proyecto',
  moduleName = 'proyectos',
  onClose,
  onEditado,
}: DocumentoEditarMetadatosModalProps) {
  const {
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    categoriaId,
    setCategoriaId,
    fechaDocumento,
    setFechaDocumento,
    fechaVencimiento,
    setFechaVencimiento,
    mostrarConfirmacionCerrar,
    mostrarConfirmacionGuardar,
    setMostrarConfirmacionGuardar,
    editando,
    hayCambios,
    resumenCambios,
    handleSubmit,
    confirmarGuardar,
    handleClose,
    confirmarCerrar,
    cancelarCerrar,
  } = useDocumentoEditarMetadatosModal({
    isOpen,
    documento,
    categorias,
    tipoEntidad,
    onClose,
    onEditado,
  })

  const styles = getAccordionWizardStyles(moduleName)
  const theme = moduleThemes[moduleName]

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            key='modal-editar-documento'
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className='relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900'
            >
              {/* Header */}
              <div
                className={`sticky top-0 z-10 flex items-center justify-between rounded-t-2xl bg-gradient-to-r px-6 py-4 ${theme.classes.gradient.primary}`}
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                    <FileCheck size={20} className='text-white' />
                  </div>
                  <div>
                    <h2 className='text-lg font-bold text-white'>
                      Editar Documento
                    </h2>
                    <p className='mt-0.5 text-xs text-white/80'>
                      Modifica la informacion sin cambiar el archivo
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={editando}
                  className='rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50'
                >
                  <X size={20} />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className='p-6'>
                {/* Card de campos */}
                <div
                  className={`mb-6 overflow-visible ${styles.section.active.replace('overflow-hidden', 'overflow-visible')}`}
                >
                  {/* Header de la card */}
                  <div className='flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800'>
                    <div className={styles.stepCircle.active}>
                      <FileCheck className='h-4 w-4 text-current opacity-70' />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                        Informacion del Documento
                      </h3>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        Completa los datos del documento
                      </p>
                    </div>
                  </div>

                  {/* Campos */}
                  <div className='space-y-4 px-6 py-5'>
                    {/* Titulo */}
                    <AccordionWizardField
                      label='Titulo del documento'
                      moduleName={moduleName}
                      required
                      minLength={3}
                      maxLength={200}
                      value={titulo}
                      onChange={e => setTitulo(e.target.value)}
                      disabled={editando}
                    />

                    {/* Descripcion */}
                    <AccordionWizardTextarea
                      label='Descripcion (opcional)'
                      moduleName={moduleName}
                      rows={2}
                      maxLength={1000}
                      value={descripcion}
                      onChange={e => setDescripcion(e.target.value)}
                      disabled={editando}
                    />

                    {/* Categoria */}
                    <div>
                      <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
                        <Folder size={14} />
                        Categoria
                      </label>
                      <FormSelect
                        value={categoriaId}
                        onChange={e => setCategoriaId(e.target.value)}
                        disabled={editando}
                        className={cn(
                          'w-full rounded-xl border-2 bg-white px-4 py-2.5 text-sm transition-all dark:bg-gray-900',
                          'focus:outline-none',
                          'disabled:opacity-50',
                          'border-gray-200 dark:border-gray-700',
                          'text-gray-900 dark:text-gray-100'
                        )}
                      >
                        <option value=''>Sin categoria</option>
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </FormSelect>
                    </div>

                    {/* Fechas */}
                    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                      <div>
                        <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
                          <Calendar size={12} />
                          Fecha del documento
                        </label>
                        <input
                          type='date'
                          value={fechaDocumento}
                          onChange={e => setFechaDocumento(e.target.value)}
                          disabled={editando}
                          className={cn(
                            'w-full rounded-xl border-2 bg-white px-4 py-2.5 text-sm transition-all dark:bg-gray-900',
                            'focus:outline-none disabled:opacity-50',
                            'border-gray-200 dark:border-gray-700'
                          )}
                        />
                      </div>
                      <div>
                        <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
                          <AlertCircle size={12} />
                          Vencimiento
                        </label>
                        <input
                          type='date'
                          value={fechaVencimiento}
                          onChange={e => setFechaVencimiento(e.target.value)}
                          disabled={editando}
                          min={fechaDocumento || undefined}
                          className={cn(
                            'w-full rounded-xl border-2 bg-white px-4 py-2.5 text-sm transition-all dark:bg-gray-900',
                            'focus:outline-none disabled:opacity-50',
                            'border-gray-200 dark:border-gray-700'
                          )}
                        />
                        {!fechaVencimiento ? (
                          <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                            Solo si expira
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={handleClose}
                    disabled={editando}
                    className={cn(
                      styles.navigation.backButton,
                      'flex-1 justify-center disabled:opacity-50'
                    )}
                  >
                    Cancelar
                  </button>
                  <div className='group relative flex-1'>
                    <button
                      type='submit'
                      disabled={editando || !titulo.trim() || !hayCambios}
                      className={cn(
                        styles.navigation.nextButton,
                        'w-full justify-center'
                      )}
                    >
                      {editando ? (
                        <>
                          <Loader2 size={16} className='animate-spin' />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                    {!hayCambios && !editando ? (
                      <div className='pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700'>
                        No hay cambios para guardar
                        <div className='absolute left-1/2 top-full -mt-1 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700' />
                      </div>
                    ) : null}
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Sub-modal: Confirmar descartar cambios */}
            <AnimatePresence>
              {mostrarConfirmacionCerrar ? (
                <motion.div
                  key='modal-confirmar-cerrar'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='absolute inset-0 z-10 flex items-center justify-center p-4'
                >
                  <div
                    className='absolute inset-0 bg-black/30'
                    onClick={cancelarCerrar}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={e => e.stopPropagation()}
                    className='relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800'
                  >
                    <div className='flex items-start gap-4'>
                      <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30'>
                        <AlertTriangle className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                      </div>
                      <div className='flex-1'>
                        <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                          Descartar cambios?
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Tienes cambios sin guardar. Si cierras ahora, se
                          perderan.
                        </p>
                      </div>
                    </div>
                    <div className='mt-6 flex gap-3'>
                      <button
                        onClick={cancelarCerrar}
                        className='flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      >
                        Continuar editando
                      </button>
                      <button
                        onClick={confirmarCerrar}
                        className='flex-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-red-700 hover:to-rose-700'
                      >
                        Descartar cambios
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirmar guardar cambios */}
      <ConfirmarCambiosDocumentoModal
        isOpen={mostrarConfirmacionGuardar}
        onClose={() => setMostrarConfirmacionGuardar(false)}
        onConfirm={confirmarGuardar}
        cambios={resumenCambios}
        isLoading={editando}
        nombreCategoria={categorias.find(c => c.id === categoriaId)?.nombre}
      />
    </>
  )
}
