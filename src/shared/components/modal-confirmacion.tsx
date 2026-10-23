/**
 * Modal de Confirmación Reutilizable
 * Componente genérico para confirmaciones de acciones destructivas o importantes
 *
 * @example
 * ```tsx
 * <ModalConfirmacion
 *   isOpen={modalAbierto}
 *   onClose={() => setModalAbierto(false)}
 *   onConfirm={handleEliminar}
 *   title="Eliminar Cliente"
 *   message="¿Estás seguro de eliminar al cliente Juan Pérez? Esta acción no se puede deshacer."
 *   confirmText="Eliminar"
 *   variant="danger"
 * />
 * ```
 */

'use client'

import { ReactNode, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, Trash2, X } from 'lucide-react'

import { logger } from '@/lib/utils/logger'

export interface ModalConfirmacionProps {
  /** Control de apertura del modal */
  isOpen: boolean

  /** Función para cerrar el modal */
  onClose: () => void

  /** Función a ejecutar al confirmar (puede ser async) */
  onConfirm: () => void | Promise<void>

  /** Título del modal */
  title: string

  /** Mensaje descriptivo de la acción (puede ser string o JSX) */
  message: string | ReactNode

  /** Texto del botón de confirmación (default: "Confirmar") */
  confirmText?: string

  /** Texto del botón de cancelación (default: "Cancelar") */
  cancelText?: string

  /** Variante del modal que define colores y ícono */
  variant?: 'danger' | 'warning' | 'info' | 'success'

  /** Mostrar loading mientras se ejecuta onConfirm */
  isLoading?: boolean
}

const variantConfig = {
  danger: {
    icon: Trash2,
    gradient:
      'from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800',
    buttonBg: 'bg-red-600 hover:bg-red-700',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    ringColor: 'ring-red-500/20',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    ringColor: 'ring-amber-500/20',
  },
  info: {
    icon: Info,
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    ringColor: 'ring-blue-500/20',
  },
  success: {
    icon: CheckCircle,
    gradient:
      'from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800',
    buttonBg: 'bg-green-600 hover:bg-green-700',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    ringColor: 'ring-green-500/20',
  },
}

export function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading: externalLoading,
}: ModalConfirmacionProps) {
  const [isLoadingInternal, setIsLoadingInternal] = useState(false)

  const config = variantConfig[variant]
  const Icon = config.icon
  const isLoading = externalLoading ?? isLoadingInternal

  const handleConfirm = async () => {
    setIsLoadingInternal(true)

    try {
      await onConfirm()
      onClose()
    } catch (error) {
      logger.error('Error en confirmación:', error)
    } finally {
      setIsLoadingInternal(false)
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
          onClick={handleCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            onClick={e => e.stopPropagation()}
            className='relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900'
          >
            {/* Header con gradiente */}
            <div
              className={`relative overflow-hidden bg-gradient-to-r ${config.gradient} px-6 py-4`}
            >
              {/* Patrón de fondo animado */}
              <div className='absolute inset-0 opacity-10'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]' />
              </div>

              {/* Header content */}
              <div className='relative flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className={`rounded-xl ${config.iconBg} p-2`}>
                    <Icon className={`h-5 w-5 ${config.iconColor}`} />
                  </div>
                  <h3 className='text-lg font-bold text-white'>{title}</h3>
                </div>

                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className='rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className='p-6'>
              <div className='text-gray-700 dark:text-gray-300'>
                {typeof message === 'string' ? (
                  <p className='whitespace-pre-line leading-relaxed'>
                    {message}
                  </p>
                ) : (
                  message
                )}
              </div>
            </div>

            {/* Footer con botones */}
            <div className='flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50'>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className='rounded-xl border-2 border-gray-300 px-5 py-2.5 font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700'
              >
                {cancelText}
              </button>

              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`rounded-xl px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${config.buttonBg} ${isLoading ? 'cursor-wait' : ''} `}
              >
                {isLoading ? (
                  <span className='flex items-center gap-2'>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className='h-4 w-4 rounded-full border-2 border-white border-t-transparent'
                    />
                    Procesando...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
