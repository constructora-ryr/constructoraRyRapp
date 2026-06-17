'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Hash, Save, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'

interface EditarActaModalProps {
  fuenteId: string
  tipoFuente: string
  numeroReferenciaInicial: string | null
  fechaActaInicial: string | null
  onClose: () => void
  onGuardado: () => void
}

export function EditarActaModal({
  fuenteId,
  tipoFuente,
  numeroReferenciaInicial,
  fechaActaInicial,
  onClose,
  onGuardado,
}: EditarActaModalProps) {
  const [numeroReferencia, setNumeroReferencia] = useState(
    numeroReferenciaInicial ?? ''
  )
  const [fechaActa, setFechaActa] = useState(fechaActaInicial ?? '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setNumeroReferencia(numeroReferenciaInicial ?? '')
    setFechaActa(fechaActaInicial ?? '')
    setError(null)
  }, [fuenteId, numeroReferenciaInicial, fechaActaInicial])

  const handleGuardar = async () => {
    if (!numeroReferencia.trim()) {
      setError('El número de acta es obligatorio')
      return
    }
    if (!fechaActa) {
      setError('La fecha del acta es obligatoria')
      return
    }

    setGuardando(true)
    setError(null)

    try {
      await fuentesPagoService.actualizarFuentePago(fuenteId, {
        numero_referencia: numeroReferencia.trim(),
        fecha_acta: fechaActa,
      })
      toast.success('Acta actualizada correctamente')
      onGuardado()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className='fixed inset-0 z-50 flex items-center justify-center p-4'
      >
        <div
          className='w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4'>
            <div>
              <p className='text-xs font-medium text-orange-100'>
                {tipoFuente}
              </p>
              <h2 className='text-base font-bold text-white'>Editar N° Acta</h2>
            </div>
            <button
              onClick={onClose}
              className='rounded-lg p-1.5 transition-colors hover:bg-white/20'
            >
              <X className='h-4 w-4 text-white' />
            </button>
          </div>

          {/* Cuerpo */}
          <div className='space-y-4 p-5'>
            {/* N° Acta */}
            <div>
              <label className='mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300'>
                <Hash className='h-3.5 w-3.5 text-orange-500' />
                N° Acta
                <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={numeroReferencia}
                onChange={e => setNumeroReferencia(e.target.value)}
                placeholder='Ej: 340'
                className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white'
                autoFocus
              />
            </div>

            {/* Fecha del Acta */}
            <div>
              <label className='mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300'>
                <CalendarDays className='h-3.5 w-3.5 text-orange-500' />
                Fecha del Acta
                <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                value={fechaActa}
                onChange={e => setFechaActa(e.target.value)}
                className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white'
              />
            </div>

            {/* Error */}
            {error && (
              <p className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300'>
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-900/50'>
            <button
              onClick={onClose}
              disabled={guardando}
              className='rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className='flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-sm font-medium text-white transition-all hover:from-orange-600 hover:to-amber-600 disabled:opacity-50'
            >
              <Save className='h-3.5 w-3.5' />
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
