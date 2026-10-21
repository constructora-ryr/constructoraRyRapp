/**
 * ============================================
 * COMPONENTE: ModalMarcarPasoCompletado
 * ============================================
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * Modal para marcar un paso de validación como completado.
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - Componente: SOLO UI
 * - Hook: useModalMarcarPaso (lógica del modal)
 * - Mutation: useMarcarPasoCompletadoMutation (persistencia)
 *
 * Features:
 * - Formulario adaptativo según nivel de validación
 * - Upload de documento para pasos obligatorios
 * - Validación en tiempo real
 * - Toast de feedback
 *
 * @version 1.0.0 - 2025-12-11
 */

'use client'

import { useState } from 'react'

import { AlertCircle, CheckCircle, Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'

import { NivelValidacion } from '../types'

// ============================================
// TYPES
// ============================================

/** Información mínima de un paso/documento pendiente para mostrar en el modal */
export interface PasoInfo {
  nivel_validacion: string
  titulo?: string
  descripcion?: string
  [key: string]: unknown
}

interface ModalMarcarPasoCompletadoProps {
  isOpen: boolean
  paso: PasoInfo | null
  onClose: () => void
  onConfirmar: (datos: {
    fecha_completado: string
    documento_id?: string
    observaciones?: string
  }) => Promise<void>
}

// ============================================
// COMPONENTE
// ============================================

export function ModalMarcarPasoCompletado({
  isOpen,
  paso,
  onClose,
  onConfirmar,
}: ModalMarcarPasoCompletadoProps) {
  // ==========================================
  // Estado local
  // ==========================================

  const [fecha, setFecha] = useState(getTodayDateString())
  const [observaciones, setObservaciones] = useState('')
  const [documentoId, setDocumentoId] = useState<string | null>(null)
  const [tieneDocumento, setTieneDocumento] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ==========================================
  // Handlers
  // ==========================================

  const handleConfirmar = async () => {
    if (!paso) return

    // Validar documento obligatorio
    if (
      paso.nivel_validacion === NivelValidacion.DOCUMENTO_OBLIGATORIO &&
      !documentoId
    ) {
      toast.error('Debes subir el documento antes de marcar como completado')
      return
    }

    setIsSubmitting(true)

    try {
      await onConfirmar({
        fecha_completado: fecha,
        documento_id: documentoId || undefined,
        observaciones: observaciones || undefined,
      })

      toast.success('Paso marcado como completado')
      handleClose()
    } catch (error) {
      logger.error('Error marcando paso:', error)
      toast.error('Error al marcar paso como completado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFecha(getTodayDateString())
    setObservaciones('')
    setDocumentoId(null)
    setTieneDocumento(false)
    onClose()
  }

  const handleDocumentoSubido = (docId: string) => {
    setDocumentoId(docId)
    toast.success('Documento subido correctamente')
  }

  // ==========================================
  // Render: No mostrar si no está abierto
  // ==========================================

  if (!isOpen || !paso) return null

  const esObligatorio =
    paso.nivel_validacion === NivelValidacion.DOCUMENTO_OBLIGATORIO
  const esOpcional =
    paso.nivel_validacion === NivelValidacion.DOCUMENTO_OPCIONAL
  const esSoloConfirmacion =
    paso.nivel_validacion === NivelValidacion.SOLO_CONFIRMACION

  // ==========================================
  // Render: Modal
  // ==========================================

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
      <div className='relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800'>
        {/* Header con gradiente */}
        <div className='flex items-center justify-between bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-4'>
          <h2 className='text-lg font-bold text-white'>
            Marcar Paso como Completado
          </h2>
          <button
            onClick={handleClose}
            className='rounded-lg p-1 transition-colors hover:bg-white/20'
          >
            <X className='h-5 w-5 text-white' />
          </button>
        </div>

        {/* Body con scroll */}
        <div className='flex-1 space-y-4 overflow-y-auto p-6'>
          {/* Info del paso */}
          <div className='rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20'>
            <div className='flex items-start gap-3'>
              <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-600 dark:text-cyan-400' />
              <div className='flex-1'>
                <h3 className='text-sm font-bold text-cyan-900 dark:text-cyan-100'>
                  {paso.titulo}
                </h3>
                <p className='mt-1 text-xs text-cyan-700 dark:text-cyan-300'>
                  {paso.descripcion}
                </p>
              </div>
            </div>

            {/* Badge de nivel de validación */}
            <div className='mt-3'>
              {esObligatorio && (
                <span className='inline-flex items-center gap-1 rounded border border-red-300 bg-red-100 px-2 py-1 text-xs font-bold text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400'>
                  <AlertCircle className='h-3 w-3' />
                  Documento OBLIGATORIO
                </span>
              )}
              {esOpcional && (
                <span className='inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>
                  <AlertCircle className='h-3 w-3' />
                  Documento opcional
                </span>
              )}
              {esSoloConfirmacion && (
                <span className='inline-flex items-center gap-1 rounded border border-blue-300 bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
                  <CheckCircle className='h-3 w-3' />
                  Solo confirmación
                </span>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className='space-y-4'>
            {/* Fecha */}
            <div>
              <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Fecha <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                max={getTodayDateString()}
                className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-900/50'
                required
              />
            </div>

            {/* Documento - OBLIGATORIO */}
            {esObligatorio && (
              <div>
                <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Documento <span className='text-red-500'>*</span>
                </label>

                {!documentoId ? (
                  <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-cyan-500 dark:border-gray-700 dark:hover:border-cyan-500'>
                    <Upload className='mx-auto mb-2 h-8 w-8 text-gray-400 dark:text-gray-500' />
                    <p className='mb-1 text-sm text-gray-600 dark:text-gray-400'>
                      Arrastra el archivo aquí o haz clic para seleccionar
                    </p>
                    <p className='text-xs font-medium text-red-600 dark:text-red-400'>
                      ⚠️ Debes subir el documento antes de marcar como
                      completado
                    </p>
                    {/* TODO: Integrar DocumentoUploadCompact */}
                    <input
                      type='file'
                      accept='.pdf,.jpg,.jpeg,.png'
                      className='mt-3 text-sm'
                      onChange={e => {
                        // Simulación - integrar con DocumentoUploadCompact
                        if (e.target.files?.[0]) {
                          // Aquí iría la lógica de upload real
                          setTimeout(() => {
                            setDocumentoId('doc-id-simulado')
                            handleDocumentoSubido('doc-id-simulado')
                          }, 1000)
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className='flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900/20'>
                    <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                    <span className='flex-1 text-sm font-medium text-green-900 dark:text-green-100'>
                      Documento adjunto
                    </span>
                    <button
                      onClick={() => setDocumentoId(null)}
                      className='rounded p-1 transition-colors hover:bg-green-200 dark:hover:bg-green-900/50'
                    >
                      <X className='h-4 w-4 text-green-700 dark:text-green-300' />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Documento - OPCIONAL */}
            {esOpcional && (
              <div>
                <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Documento (Opcional)
                </label>

                {/* Checkbox: Tengo documento */}
                <div className='mb-3 flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='tiene-doc'
                    checked={tieneDocumento}
                    onChange={e => setTieneDocumento(e.target.checked)}
                    className='h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500'
                  />
                  <label
                    htmlFor='tiene-doc'
                    className='cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Tengo el documento
                  </label>
                </div>

                {/* Upload si marcó que tiene */}
                {tieneDocumento && !documentoId && (
                  <div className='rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-700'>
                    <input
                      type='file'
                      accept='.pdf,.jpg,.jpeg,.png'
                      className='text-sm'
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          setTimeout(() => {
                            setDocumentoId('doc-id-opcional')
                            handleDocumentoSubido('doc-id-opcional')
                          }, 1000)
                        }
                      }}
                    />
                  </div>
                )}

                {documentoId && (
                  <div className='flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900/20'>
                    <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                    <span className='flex-1 text-sm font-medium text-green-900 dark:text-green-100'>
                      Documento adjunto
                    </span>
                    <button
                      onClick={() => {
                        setDocumentoId(null)
                        setTieneDocumento(false)
                      }}
                      className='rounded p-1 transition-colors hover:bg-green-200 dark:hover:bg-green-900/50'
                    >
                      <X className='h-4 w-4 text-green-700 dark:text-green-300' />
                    </button>
                  </div>
                )}

                {/* Mensaje si no tiene documento */}
                {!tieneDocumento && (
                  <p className='mt-2 text-xs text-amber-600 dark:text-amber-400'>
                    ℹ️ Puedes marcar como completado sin documento. Si lo
                    obtienes después, puedes agregarlo editando este paso.
                  </p>
                )}
              </div>
            )}

            {/* Observaciones */}
            <div>
              <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Observaciones {!esObligatorio && '(Opcional)'}
              </label>
              <textarea
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                rows={3}
                placeholder={
                  esOpcional && !tieneDocumento
                    ? 'Ej: El banco no compartió el avalúo, pero confirmó valor de $115.000.000'
                    : 'Detalles adicionales sobre este paso...'
                }
                className='w-full resize-none rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-900/50'
              />
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className='flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700'>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className='rounded-lg border-2 border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={isSubmitting || (esObligatorio && !documentoId)}
            className={`rounded-lg px-4 py-2 font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              documentoId || !esObligatorio
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:from-cyan-700 hover:to-blue-700 hover:shadow-xl'
                : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700'
            }`}
          >
            {isSubmitting ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Guardando...
              </span>
            ) : (
              '✓ Marcar como Completado'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
