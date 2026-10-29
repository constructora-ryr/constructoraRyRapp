'use client'

/**
 * Carcasa de modales de detalle (historial del cliente, auditoría…):
 * encabezado con degradado, ícono, título y cerrar; franja opcional bajo el
 * encabezado; contenido con scroll y pie opcional. En celular sube desde
 * abajo; Esc o el fondo lo cierran.
 */

import { useEffect, type ReactNode } from 'react'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, type LucideIcon } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { VisorNavegacion } from '@/shared/components/visor-archivo'
import { cn } from '@/shared/utils/helpers'

interface ModalDetalleProps {
  onClose: () => void
  /** Degradado del encabezado: 'from-… via-… to-…' */
  gradient: string
  icon: LucideIcon
  titulo: string
  subtitulo?: ReactNode
  /** Franja bajo el encabezado (quién/cuándo) */
  franja?: ReactNode
  /** Pie fijo (botones de un formulario) */
  pie?: ReactNode
  children: ReactNode
  /** Si se está guardando: no se cierra con Esc ni con el fondo */
  bloqueado?: boolean
  /** Anterior / siguiente (botones en el encabezado y ← →) */
  navegacion?: VisorNavegacion
}

export function ModalDetalle({
  onClose,
  gradient,
  icon: Icon,
  titulo,
  subtitulo,
  franja,
  pie,
  children,
  bloqueado = false,
  navegacion,
}: ModalDetalleProps) {
  const onAnterior = navegacion?.onAnterior
  const onSiguiente = navegacion?.onSiguiente

  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const escribiendo =
        el?.tagName === 'INPUT' ||
        el?.tagName === 'TEXTAREA' ||
        el?.isContentEditable
      // defaultPrevented: Esc ya lo usó algo de adentro (un menú del editor)
      if (e.key === 'Escape' && !bloqueado && !e.defaultPrevented) onClose()
      else if (escribiendo) return
      else if (e.key === 'ArrowLeft' && onAnterior) onAnterior()
      else if (e.key === 'ArrowRight' && onSiguiente) onSiguiente()
    }
    document.addEventListener('keydown', alPresionar)
    return () => document.removeEventListener('keydown', alPresionar)
  }, [onClose, bloqueado, onAnterior, onSiguiente])

  return createPortal(
    <div className='fixed inset-0 z-[500] flex items-end justify-center sm:items-center sm:p-4'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={bloqueado ? undefined : onClose}
        className='absolute inset-0 bg-slate-950/60'
      />

      <motion.div
        role='dialog'
        aria-modal='true'
        aria-label={titulo}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className='relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-slate-900 sm:max-h-[88vh] sm:max-w-2xl sm:rounded-2xl'
      >
        <header
          className={cn(
            'relative flex items-center gap-3 overflow-hidden bg-gradient-to-r px-4 py-4 text-white sm:px-5',
            gradient
          )}
        >
          <span
            aria-hidden
            className='pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl'
          />
          <span className='relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30'>
            <Icon className='h-5 w-5' />
          </span>
          <div className='relative min-w-0 flex-1'>
            <h3 className='line-clamp-2 break-words text-base font-bold leading-snug'>
              {titulo}
            </h3>
            {subtitulo ? (
              <p className='line-clamp-2 break-words text-sm leading-snug text-white/80'>
                {subtitulo}
              </p>
            ) : null}
          </div>
          {navegacion && navegacion.total > 1 ? (
            <div className='relative flex flex-shrink-0 items-center rounded-xl border border-white/30 bg-white/10'>
              <button
                type='button'
                onClick={onAnterior}
                disabled={!onAnterior}
                aria-label={`${navegacion.nombre ?? 'Elemento'} anterior (←)`}
                title='Anterior (←)'
                className='flex h-9 w-8 items-center justify-center rounded-l-xl transition-colors hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>
              <span className='hidden px-1 text-xs font-semibold tabular-nums sm:inline'>
                {navegacion.actual} / {navegacion.total}
              </span>
              <button
                type='button'
                onClick={onSiguiente}
                disabled={!onSiguiente}
                aria-label={`${navegacion.nombre ?? 'Elemento'} siguiente (→)`}
                title='Siguiente (→)'
                className='flex h-9 w-8 items-center justify-center rounded-r-xl transition-colors hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          ) : null}
          <button
            type='button'
            onClick={onClose}
            disabled={bloqueado}
            aria-label='Cerrar (Esc)'
            className='relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/15 transition-colors hover:bg-white/30 disabled:opacity-50'
          >
            <X className='h-4 w-4' />
          </button>
        </header>

        {franja ? (
          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 sm:px-5'>
            {franja}
          </div>
        ) : null}

        <div className='flex-1 overflow-y-auto p-4 sm:p-5'>{children}</div>

        {pie ? (
          <footer className='flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-end sm:px-5'>
            {pie}
          </footer>
        ) : null}
      </motion.div>
    </div>,
    document.body
  )
}
