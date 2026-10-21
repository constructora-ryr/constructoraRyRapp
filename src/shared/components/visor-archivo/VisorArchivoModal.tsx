'use client'

/**
 * Carcasa de los visores de archivo (abonos, documentos): overlay, encabezado
 * con el degradado de quien lo usa, teclado (Esc cierra, ← → navegan) y
 * cuerpo en columna en móvil / fila en escritorio.
 * El contenido (vista previa + panel de datos) lo pone cada visor.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { cn } from '@/shared/utils/helpers'

import { visorArchivoStyles as s } from './visor-archivo.styles'

export interface VisorNavegacion {
  /** Posición 1-based del elemento actual */
  actual: number
  total: number
  onAnterior?: () => void
  onSiguiente?: () => void
  /** Para los aria-label: "Abono anterior" */
  nombre?: string
}

interface VisorArchivoModalProps {
  isOpen: boolean
  onClose: () => void
  ariaLabel: string
  /** Degradado del encabezado: 'from-… via-… to-…' */
  gradient: string
  icono: ReactNode
  titulo: ReactNode
  subtitulo?: ReactNode
  /** Junto al título (estado, versión…) */
  insignia?: ReactNode
  /** Botones del encabezado (usar visorArchivoStyles.accion) */
  acciones?: ReactNode
  /** Solo teclado (← →); los botones van en la barra de VisorArchivoPreview */
  /** Solo teclado (← →); los botones van en la barra de VisorArchivoPreview */
  navegacion?: VisorNavegacion
  /** false mientras hay un modal hijo abierto: el teclado es suyo */
  tecladoActivo?: boolean
  /** Vista previa + panel de datos */
  children: ReactNode
  /** Modales hijos (se montan dentro para heredar el z-index) */
  extra?: ReactNode
}

export function VisorArchivoModal({
  isOpen,
  onClose,
  ariaLabel,
  gradient,
  icono,
  titulo,
  subtitulo,
  insignia,
  acciones,
  navegacion,
  tecladoActivo = true,
  children,
  extra,
}: VisorArchivoModalProps) {
  // Portal solo en cliente (SSR-safe)
  const [mounted, setMounted] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => setMounted(true), [])

  const onAnterior = navegacion?.onAnterior
  const onSiguiente = navegacion?.onSiguiente

  useEffect(() => {
    if (!isOpen || !tecladoActivo) return
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA') return
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && onAnterior) onAnterior()
      else if (e.key === 'ArrowRight' && onSiguiente) onSiguiente()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, tecladoActivo, onClose, onAnterior, onSiguiente])

  // Foco inicial en el botón cerrar
  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => closeRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key='overlay'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={s.overlay}
          />
          <motion.div
            key='modal'
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={s.modal}
            role='dialog'
            aria-modal='true'
            aria-label={ariaLabel}
          >
            <div className={cn(s.header.container, gradient)}>
              <span aria-hidden className={s.header.glow} />
              <div className={s.header.left}>
                <div className={s.header.iconWrap}>{icono}</div>
                <div className='min-w-0'>
                  <div className='flex min-w-0 items-center gap-2'>
                    <p className={s.header.title}>{titulo}</p>
                    {insignia}
                  </div>
                  {subtitulo ? (
                    <p className={s.header.subtitle}>{subtitulo}</p>
                  ) : null}
                </div>
              </div>

              <div className={s.header.actions}>
                {acciones}

                <button
                  ref={closeRef}
                  type='button'
                  onClick={onClose}
                  className={s.header.btnClose}
                  aria-label='Cerrar (Esc)'
                  title='Cerrar (Esc)'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            </div>

            <div className={s.body}>{children}</div>

            {extra}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
