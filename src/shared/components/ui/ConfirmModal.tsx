// ============================================
// COMPONENT: ConfirmModal
// Modal de confirmación moderno y reutilizable
// ============================================

'use client'

import { useEffect } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  X,
  XCircle,
} from 'lucide-react'

type ConfirmType = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: ConfirmType
  isLoading?: boolean
}

const typeConfig = {
  danger: {
    icon: XCircle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100 dark:bg-red-900/20',
    buttonBg: 'bg-red-600 hover:bg-red-700',
    buttonText: 'text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
    buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    buttonText: 'text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/20',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    buttonText: 'text-white',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100 dark:bg-green-900/20',
    buttonBg: 'bg-green-600 hover:bg-green-700',
    buttonText: 'text-white',
  },
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  isLoading = false,
}: ConfirmModalProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, isLoading, onClose])

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm'
          />

          {/* Modal */}
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className='relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className='flex items-start gap-4 border-b border-gray-200 p-6 dark:border-gray-700'>
                {/* Icon */}
                <div className={`rounded-full p-3 ${config.iconBg}`}>
                  <Icon className={`h-6 w-6 ${config.iconColor}`} />
                </div>

                {/* Title */}
                <div className='flex-1'>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                    {title}
                  </h3>
                </div>

                {/* Close button */}
                {!isLoading && (
                  <button
                    onClick={onClose}
                    className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
                  >
                    <X className='h-5 w-5' />
                  </button>
                )}
              </div>

              {/* Body */}
              <div className='p-6'>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  {message}
                </p>
              </div>

              {/* Footer */}
              <div className='flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900'>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className='rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${config.buttonBg} ${config.buttonText}`}
                >
                  {isLoading ? (
                    <div className='flex items-center gap-2'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
