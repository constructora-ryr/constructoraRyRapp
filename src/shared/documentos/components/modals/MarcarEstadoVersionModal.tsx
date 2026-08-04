'use client'

/**
 * 🎨 MODAL DE MARCAR ESTADO DE VERSIÓN - PRESENTACIONAL
 *
 * Componente PURO sin lógica de negocio
 * Toda la lógica está en: useMarcarEstadoVersion hook
 */

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'

import { FormSelect } from '@/shared/components/ui/form-select'
import { useMarcarEstadoVersion } from '@/shared/documentos/hooks/useMarcarEstadoVersion'

// ============================================================================
// TYPES
// ============================================================================

export type AccionEstado = 'erronea' | 'obsoleta' | 'restaurar'

export interface MarcarEstadoVersionModalProps {
  isOpen: boolean
  documentoId: string
  proyectoId: string
  documentoPadreId?: string // ✅ ID del documento padre para invalidar query
  accion: AccionEstado
  versionActual?: number
  versionesDisponibles?: Array<{ id: string; version: number; titulo: string }>
  onClose: () => void
  onSuccess?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MarcarEstadoVersionModal({
  isOpen,
  documentoId,
  proyectoId,
  documentoPadreId,
  accion,
  versionActual,
  versionesDisponibles = [],
  onClose,
  onSuccess,
}: MarcarEstadoVersionModalProps) {
  // ✅ HOOK CON TODA LA LÓGICA
  const {
    motivo,
    setMotivo,
    versionCorrectaId,
    setVersionCorrectaId,
    motivoPersonalizado,
    config,
    isPending,
    isValid,
    handleSubmit,
    handleClose,
    handleSelectMotivo,
    handleActivarMotivoPersonalizado,
    handleVolverMotivosPredef,
  } = useMarcarEstadoVersion({
    documentoId,
    proyectoId,
    documentoPadreId, // ✅ Pasar ID del documento padre
    accion,
    onSuccess,
    onClose,
  })

  const Icon = config.icon

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <div
        key='modal-estado-version'
        className='fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className='relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${config.gradient} px-6 py-4`}>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                <Icon className='h-5 w-5 text-white' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-white'>
                  {config.titulo}
                </h3>
                {versionActual && (
                  <p className='text-xs text-white/90'>
                    Versión {versionActual}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className='space-y-4 p-6'>
            {/* Descripción */}
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {config.descripcion}
            </p>

            {/* Motivo (solo para errónea y obsoleta) */}
            {accion !== 'restaurar' && (
              <div>
                <label
                  htmlFor='motivo'
                  className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'
                >
                  Motivo *
                </label>

                {/* Motivos predefinidos */}
                {config.motivosPredef.length > 0 && !motivoPersonalizado && (
                  <div className='mb-3 space-y-2'>
                    {config.motivosPredef.map(motivoPredef => (
                      <button
                        key={motivoPredef}
                        onClick={() => handleSelectMotivo(motivoPredef)}
                        className={`w-full rounded-lg border-2 px-4 py-2.5 text-left text-sm transition-all ${
                          motivo === motivoPredef
                            ? `border-${config.color}-500 bg-${config.color}-50 dark:bg-${config.color}-950/30`
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                      >
                        {motivoPredef}
                      </button>
                    ))}
                    <button
                      onClick={handleActivarMotivoPersonalizado}
                      className='w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-left text-sm text-gray-600 transition-all hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
                    >
                      ✍️ Escribir motivo personalizado...
                    </button>
                  </div>
                )}

                {/* Campo de texto (si eligió personalizado o no hay predefinidos) */}
                {(motivoPersonalizado || config.motivosPredef.length === 0) && (
                  <div>
                    <textarea
                      id='motivo'
                      value={motivo}
                      onChange={e => setMotivo(e.target.value)}
                      placeholder='Describe el motivo...'
                      rows={3}
                      className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-600'
                      autoFocus
                    />
                    {motivoPersonalizado && (
                      <button
                        onClick={handleVolverMotivosPredef}
                        className='mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      >
                        ← Volver a motivos predefinidos
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Versión correcta (solo para errónea) */}
            {accion === 'erronea' && versionesDisponibles.length > 0 && (
              <div>
                <label
                  htmlFor='version-correcta'
                  className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'
                >
                  Versión correcta (opcional)
                </label>
                <FormSelect
                  id='version-correcta'
                  value={versionCorrectaId}
                  onChange={e => setVersionCorrectaId(e.target.value)}
                  className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-600'
                >
                  <option value=''>-- Ninguna --</option>
                  {versionesDisponibles
                    .filter(v => v.id !== documentoId) // No mostrar la versión actual
                    .map(version => (
                      <option key={version.id} value={version.id}>
                        Versión {version.version} - {version.titulo}
                      </option>
                    ))}
                </FormSelect>
                <p className='mt-1.5 text-xs text-gray-500 dark:text-gray-400'>
                  Selecciona la versión que corrige este error
                </p>
              </div>
            )}

            {/* Alert de confirmación para restaurar */}
            {accion === 'restaurar' && (
              <div className='rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
                <div className='flex gap-3'>
                  <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500' />
                  <div className='flex-1'>
                    <h4 className='text-sm font-semibold text-green-900 dark:text-green-100'>
                      ¿Confirmar restauración?
                    </h4>
                    <p className='mt-1 text-xs text-green-700 dark:text-green-300'>
                      La versión volverá a estado &quot;Válida&quot; y se
                      eliminarán las marcas de error u obsolescencia
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className='flex gap-3 pt-2'>
              <button
                onClick={handleClose}
                disabled={isPending}
                className='flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !isValid}
                className={`flex-1 rounded-lg bg-gradient-to-r ${config.gradient} px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isPending ? (
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Procesando...
                  </div>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
