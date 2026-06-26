'use client'

/**
 * ============================================
 * BANNER DOCUMENTO REQUERIDO (PREMIUM)
 * ============================================
 *
 * Banner moderno que informa sobre el requisito
 * y guía al usuario hacia el botón del header.
 *
 * DISEÑO: Gradiente vibrante + glassmorphism + indicador visual
 */

import { motion } from 'framer-motion'
import { AlertTriangle, IdCard } from 'lucide-react'

interface BannerDocumentoRequeridoProps {
  /** Abre el formulario de subida de cédula directamente */
  onSubirDocumento?: () => void

  /**
   * 'bloqueante' (default): banner rojo/naranja prominente
   * 'advertencia': banner ámbar suave (usar solo cuando el botón de subida no está disponible)
   */
  variant?: 'bloqueante' | 'advertencia'

  /** Texto descriptivo personalizado. Si no se pasa, se usa el mensaje por defecto. */
  mensaje?: string
}

export function BannerDocumentoRequerido({
  onSubirDocumento,
  variant = 'bloqueante',
  mensaje,
}: BannerDocumentoRequeridoProps) {
  if (variant === 'advertencia') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className='rounded-xl border border-amber-300 bg-amber-50 p-3.5 shadow-sm dark:border-amber-700/60 dark:bg-amber-900/20'
      >
        <div className='flex items-start gap-3'>
          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-800/50'>
            <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
          </div>
          <div className='flex-1'>
            <h4 className='mb-0.5 text-sm font-semibold text-amber-900 dark:text-amber-200'>
              Documento de identidad pendiente
            </h4>
            <p className='text-xs leading-relaxed text-amber-800 dark:text-amber-300'>
              El expediente de este cliente está incompleto. Sube la cédula o
              pasaporte para mantener el registro actualizado.
            </p>
            {onSubirDocumento && (
              <button
                onClick={onSubirDocumento}
                className='mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm transition-all hover:bg-amber-50 active:scale-95 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60'
              >
                <IdCard className='h-3.5 w-3.5' />
                Subir Cédula / Pasaporte
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className='rounded-xl border-2 border-orange-500 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-4 text-white shadow-xl dark:border-orange-700'
    >
      <div className='flex items-start gap-3'>
        {/* Icono animado con glassmorphism */}
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
          <AlertTriangle className='h-5 w-5 animate-pulse text-white' />
        </div>

        {/* Contenido */}
        <div className='flex flex-1 flex-wrap items-center justify-between gap-3'>
          <div>
            <h3 className='mb-0.5 text-base font-bold'>
              Documento de Identidad Requerido
            </h3>
            <p className='text-sm leading-relaxed text-white/90'>
              {mensaje ??
                'Para asignar una vivienda a este cliente primero debes subir su cédula o pasaporte.'}
            </p>
          </div>
          {onSubirDocumento && (
            <button
              onClick={onSubirDocumento}
              className='inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow-lg transition-all hover:bg-orange-50 hover:shadow-xl active:scale-95'
            >
              <IdCard className='h-4 w-4' />
              Subir Cédula / Pasaporte
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
