/**
 * ============================================
 * COMPONENTE: ConfirmarCambiosModal (Clientes)
 * ============================================
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * Modal para confirmar cambios antes de actualizar un cliente.
 * Muestra diff visual de campos modificados.
 *
 * Basado en: src/modules/proyectos/components/ConfirmarCambiosModal.tsx
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, CheckCircle2, Loader2, X } from 'lucide-react'

import type { Cambio } from '../hooks/useDetectarCambios'

interface ConfirmarCambiosModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cambios: Cambio[]
  isLoading?: boolean
  titulo?: string
}

export function ConfirmarCambiosModal({
  isOpen,
  onClose,
  onConfirm,
  cambios,
  isLoading = false,
  titulo = 'Cliente',
}: ConfirmarCambiosModalProps) {
  if (!isOpen) return null

  const tieneCambios = cambios.length > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            onClick={!isLoading ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className='relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
          >
            {/* Header */}
            <div className='relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-5 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800'>
              <div className='bg-grid-white/10 absolute inset-0' />
              <div className='relative z-10 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                    <AlertCircle className='h-6 w-6 text-white' />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold text-white'>
                      Confirmar Cambios
                    </h3>
                    <p className='text-xs text-cyan-100'>{titulo}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className='rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>
            </div>

            {/* Content - Con scroll */}
            <div className='min-h-0 flex-1 overflow-y-auto p-6'>
              {!tieneCambios ? (
                /* Sin cambios */
                <div className='rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50'>
                  <AlertCircle className='mx-auto h-12 w-12 text-gray-400' />
                  <h4 className='mt-3 text-base font-semibold text-gray-700 dark:text-gray-300'>
                    No hay cambios
                  </h4>
                  <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                    No se detectaron modificaciones en los datos del cliente
                  </p>
                </div>
              ) : (
                /* Lista de cambios */
                <div className='space-y-4'>
                  {/* Resumen */}
                  <div className='rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30'>
                    <div className='flex items-center gap-2'>
                      <CheckCircle2 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                      <p className='font-semibold text-blue-900 dark:text-blue-100'>
                        {cambios.length} campo{cambios.length !== 1 ? 's' : ''}{' '}
                        modificado{cambios.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className='mt-1 text-xs text-blue-700 dark:text-blue-300'>
                      Revisa los cambios antes de confirmar la actualización
                    </p>
                  </div>

                  {/* Cambios individuales */}
                  <div className='space-y-3'>
                    {cambios.map((cambio, index) => (
                      <div
                        key={index}
                        className='rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'
                      >
                        {/* Campo */}
                        <h5 className='mb-2 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white'>
                          <div className='flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white'>
                            {index + 1}
                          </div>
                          {cambio.campo}
                        </h5>

                        {/* Valor anterior (rojo) */}
                        <div className='mb-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-950/40'>
                          <p className='text-[10px] font-semibold text-red-600 dark:text-red-400'>
                            Anterior:
                          </p>
                          <p className='mt-0.5 text-sm text-red-900 line-through dark:text-red-100'>
                            {cambio.valorAnterior != null
                              ? String(cambio.valorAnterior)
                              : 'Sin valor'}
                          </p>
                        </div>

                        {/* Valor nuevo (verde) */}
                        <div className='rounded-lg border border-green-300 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-950/40'>
                          <p className='text-[10px] font-semibold text-green-600 dark:text-green-400'>
                            Nuevo:
                          </p>
                          <p className='mt-0.5 text-sm font-semibold text-green-900 dark:text-green-100'>
                            {cambio.valorNuevo != null
                              ? String(cambio.valorNuevo)
                              : 'Sin valor'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Fijo */}
            <div className='flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700'>
              <button
                onClick={onClose}
                disabled={isLoading}
                className='rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading || !tieneCambios}
                className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:from-cyan-700 hover:to-blue-700 hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Check className='h-4 w-4' />
                    <span>Confirmar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
