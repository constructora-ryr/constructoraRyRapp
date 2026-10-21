'use client'

/**
 * MODAL - DESCARTAR INTERÉS
 *
 * Modal de confirmación para descartar un interés de cliente.
 * Incluye campo de motivo opcional y diseño destructivo claro.
 */

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Building2,
  Home,
  Loader2,
  MessageSquare,
  X,
} from 'lucide-react'

import type { ClienteInteres } from '../../types'
import { sharedButtonStyles, sharedModalStyles } from '../styles/shared.styles'

interface ModalDescartarInteresProps {
  interes: ClienteInteres | null
  descartando: boolean
  onConfirmar: (motivo: string) => void
  onCancelar: () => void
}

export function ModalDescartarInteres({
  interes,
  descartando,
  onConfirmar,
  onCancelar,
}: ModalDescartarInteresProps) {
  const [motivo, setMotivo] = useState('')

  const handleConfirmar = () => {
    onConfirmar(motivo.trim())
    setMotivo('')
  }

  const handleCancelar = () => {
    setMotivo('')
    onCancelar()
  }

  return (
    <AnimatePresence>
      {interes && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={sharedModalStyles.overlay}
          onClick={handleCancelar}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
            onClick={e => e.stopPropagation()}
            className={sharedModalStyles.container.small}
          >
            {/* Header rojo destructivo */}
            <div className='relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 py-5'>
              <div className='absolute inset-0 opacity-10'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]' />
              </div>
              <div className='relative flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30 backdrop-blur-sm'>
                    <AlertTriangle className='h-6 w-6 text-white' />
                  </div>
                  <div>
                    <h2 className='text-lg font-bold text-white'>
                      Descartar Interés
                    </h2>
                    <p className='text-xs text-red-100'>
                      Esta acción cambiará el estado del interés
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={handleCancelar}
                  disabled={descartando}
                  className='flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-all hover:rotate-90 hover:bg-white/20 disabled:opacity-50'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className='space-y-4 px-6 py-5'>
              {/* Info del interés que se va a descartar */}
              <div className='space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30'>
                <div className='flex items-center gap-2 text-sm font-medium text-red-900 dark:text-red-200'>
                  <Building2 className='h-4 w-4 flex-shrink-0 text-red-500' />
                  <span>{interes.proyecto_nombre ?? 'Proyecto'}</span>
                </div>
                {interes.vivienda_numero && (
                  <div className='flex items-center gap-2 text-sm text-red-700 dark:text-red-300'>
                    <Home className='h-4 w-4 flex-shrink-0 text-red-400' />
                    <span>
                      {interes.manzana_nombre
                        ? `Manzana ${interes.manzana_nombre} · `
                        : ''}
                      Casa {interes.vivienda_numero}
                    </span>
                  </div>
                )}
              </div>

              {/* Motivo (opcional) */}
              <div>
                <label className='mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300'>
                  <MessageSquare className='h-4 w-4 text-gray-400' />
                  Motivo del descarte
                  <span className='font-normal text-gray-400'>(opcional)</span>
                </label>
                <textarea
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder='Ej: El cliente encontró otra opción, cambió de presupuesto...'
                  rows={3}
                  disabled={descartando}
                  className='w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-red-600'
                />
              </div>
            </div>

            {/* Footer */}
            <div className={sharedModalStyles.footer.wrapper}>
              <div className={sharedModalStyles.footer.content}>
                <motion.button
                  type='button'
                  onClick={handleCancelar}
                  disabled={descartando}
                  className={sharedButtonStyles.secondary}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type='button'
                  onClick={handleConfirmar}
                  disabled={descartando}
                  className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:from-red-700 hover:to-rose-700 hover:shadow-red-500/40 disabled:cursor-not-allowed disabled:opacity-50'
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {descartando ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Descartando...
                    </>
                  ) : (
                    <>
                      <X className='h-4 w-4' />
                      Confirmar Descarte
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
