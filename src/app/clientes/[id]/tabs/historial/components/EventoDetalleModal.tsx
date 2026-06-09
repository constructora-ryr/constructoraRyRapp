/**
 * EventoDetalleModal - Shell reutilizable para todos los tipos de evento
 * La presentación del contenido se delega a renderers específicos por tipo.
 */

'use client'

import { motion } from 'framer-motion'
import { Clock, User, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import {
  HEADER_GRADIENTS_POR_TIPO,
  historialStyles as styles,
} from '../historial-tab.styles'
import { getEventoRenderer } from '../renderers'

interface EventoDetalleModalProps {
  evento: EventoHistorialHumanizado
  onClose: () => void
}

export function EventoDetalleModal({
  evento,
  onClose,
}: EventoDetalleModalProps) {
  const IconoEvento = evento.icono
  const Renderer = getEventoRenderer(evento.tipo)
  const headerGradient =
    HEADER_GRADIENTS_POR_TIPO[evento.tipo] ??
    'bg-gradient-to-r from-gray-600 via-slate-600 to-zinc-600'

  const fechaFormateada = new Date(evento.fecha).toLocaleString('es-CO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return createPortal(
    <div className={styles.modal.overlay}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={styles.modal.backdrop}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={styles.modal.container}
      >
        {/* Header con gradiente de color del evento */}
        <div className={`${styles.modal.header} ${headerGradient}`}>
          <div className={styles.modal.headerRow}>
            <div className={styles.modal.headerTitleGroup}>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                <IconoEvento className='h-5 w-5 text-white' />
              </div>
              <div>
                <h3 className='text-sm font-bold text-white'>
                  {evento.titulo}
                </h3>
                {evento.metadata?.esNota ? (
                  <p className='text-xs text-white/70'>Nota manual</p>
                ) : (
                  <p className='text-xs text-white/80'>{evento.descripcion}</p>
                )}
              </div>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        </div>

        {/* Banda: quién / cuándo */}
        <div className='flex items-center gap-4 border-b border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900/60'>
          <div className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400'>
            <User className='h-3.5 w-3.5' />
            <span className='font-medium text-gray-700 dark:text-gray-300'>
              {evento.usuario.nombres ?? evento.usuario.email}
            </span>
            {evento.usuario.rol ? (
              <span className='rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold dark:bg-gray-700'>
                {evento.usuario.rol}
              </span>
            ) : null}
          </div>
          <div className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400'>
            <Clock className='h-3.5 w-3.5' />
            <span>{fechaFormateada}</span>
          </div>
        </div>

        {/* Body → renderer específico */}
        <div className={styles.modal.body}>
          <Renderer evento={evento} />
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
