'use client'

import { useCallback, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowDownToLine,
  Calendar,
  CheckCircle,
  DollarSign,
  Eye,
  Loader2,
  Receipt,
  Upload,
  X,
} from 'lucide-react'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { FormSelect } from '@/shared/components/ui/form-select'
import { formatCurrency } from '@/shared/utils/format'

import {
  METODOS_DEVOLUCION,
  useDevolucionExcedente,
} from './useDevolucionExcedente'
import type { MetodoDevolucionExcedente } from './useDevolucionExcedente'

interface ProcesarDevolucionExcedenteModalProps {
  negociacionId: string
  montoExcedente: number
  nombreCliente: string
  onClose: () => void
  onExitosa?: () => void
}

const s = {
  overlay:
    'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4',
  container:
    'relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700',
  header:
    'sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-2xl',
  body: 'px-5 py-4 space-y-4',
  footer:
    'sticky bottom-0 px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl flex items-center justify-between',
  label:
    'block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1',
  input:
    'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all',
  uploadZone:
    'flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50',
  btnPrimary:
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg',
  btnSecondary:
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all',
  errorBox:
    'flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300',
}

export function ProcesarDevolucionExcedenteModal({
  negociacionId,
  montoExcedente,
  nombreCliente,
  onClose,
  onExitosa,
}: ProcesarDevolucionExcedenteModalProps) {
  const [isDragging, setIsDragging] = useState(false)

  const {
    fileInputRef,
    fecha,
    setFecha,
    metodo,
    setMetodo,
    numeroComprobante,
    setNumeroComprobante,
    notas,
    setNotas,
    comprobante,
    handleComprobanteChange,
    fechaError,
    formularioValido,
    procesando,
    exitoso,
    error,
    handleConfirmar,
  } = useDevolucionExcedente({ negociacionId, montoExcedente, onExitosa })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0] ?? null
      if (file) handleComprobanteChange(file)
    },
    [handleComprobanteChange]
  )

  const handlePreview = useCallback(() => {
    if (!comprobante) return
    const url = URL.createObjectURL(comprobante)
    window.open(url, '_blank')
  }, [comprobante])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ── Procesando ───────────────────────────────────────────────
  if (procesando) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={s.overlay}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={s.container}
          onClick={e => e.stopPropagation()}
          role='dialog'
          aria-modal='true'
        >
          <div className={s.header}>
            <span className='flex items-center gap-2 text-lg font-bold'>
              <DollarSign className='h-5 w-5' /> Procesando...
            </span>
          </div>
          <div className='flex flex-col items-center justify-center gap-4 py-16'>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            >
              <Loader2 className='h-10 w-10 text-amber-500' />
            </motion.div>
            <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Registrando devolución...
            </p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ── Éxito ────────────────────────────────────────────────────
  if (exitoso) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={s.overlay}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={s.container}
          onClick={e => e.stopPropagation()}
          role='dialog'
          aria-modal='true'
        >
          <div className='flex flex-col items-center justify-center gap-4 px-6 py-16'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30'>
                <CheckCircle className='h-10 w-10 text-white' />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='text-center'
            >
              <h3 className='mb-1 text-xl font-bold text-gray-900 dark:text-white'>
                Devolución Registrada
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {formatCurrency(montoExcedente)} devueltos a {nombreCliente}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ── Formulario ───────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={s.overlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={s.container}
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-label='Registrar devolución de excedente'
      >
        {/* Header */}
        <div className={s.header}>
          <span className='flex items-center gap-2 text-base font-bold'>
            <ArrowDownToLine className='h-5 w-5' />
            Registrar Devolución de Excedente
          </span>
          <button
            onClick={onClose}
            className='rounded-lg p-1.5 transition-colors hover:bg-white/20'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Body */}
        <div className={s.body}>
          {/* Resumen del excedente */}
          <div className='rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/20'>
            <div className='mb-1 flex items-center gap-2'>
              <DollarSign className='h-4 w-4 text-amber-600 dark:text-amber-400' />
              <p className='text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400'>
                Monto a devolver
              </p>
            </div>
            <p className='text-2xl font-bold text-amber-800 dark:text-amber-300'>
              {formatCurrency(montoExcedente)}
            </p>
            <p className='mt-0.5 text-xs text-amber-700/70 dark:text-amber-400/70'>
              Cliente: {nombreCliente}
            </p>
          </div>

          {/* Fecha */}
          <div>
            <label className={s.label}>
              Fecha de devolución <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <Calendar className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                type='date'
                className={`${s.input} pl-9 ${fechaError ? 'border-red-400 focus:border-red-500' : ''}`}
                value={fecha}
                max={getTodayDateString()}
                onChange={e => setFecha(e.target.value)}
              />
            </div>
            {fechaError && (
              <p className='mt-1 flex items-center gap-1 text-xs text-red-500'>
                <AlertTriangle className='h-3 w-3' /> {fechaError}
              </p>
            )}
          </div>

          {/* Método */}
          <div>
            <label className={s.label}>
              Método de devolución <span className='text-red-500'>*</span>
            </label>
            <FormSelect
              className={s.input}
              value={metodo}
              onChange={e =>
                setMetodo(e.target.value as MetodoDevolucionExcedente)
              }
            >
              {METODOS_DEVOLUCION.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </FormSelect>
          </div>

          {/* Número de comprobante */}
          <div>
            <label className={s.label}>
              Número de comprobante{' '}
              <span className='font-normal normal-case text-gray-400'>
                (opcional)
              </span>
            </label>
            <div className='relative'>
              <Receipt className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                className={`${s.input} pl-9`}
                value={numeroComprobante}
                onChange={e => setNumeroComprobante(e.target.value)}
                placeholder='Ej: TRF-123456'
              />
            </div>
          </div>

          {/* Upload comprobante */}
          <div>
            <label className={s.label}>
              Comprobante <span className='text-red-500'>*</span>
            </label>
            <input
              ref={fileInputRef}
              type='file'
              accept='.pdf,.png,.jpg,.jpeg'
              className='hidden'
              onChange={e =>
                handleComprobanteChange(e.target.files?.[0] ?? null)
              }
            />
            {comprobante ? (
              <div className='flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20'>
                <CheckCircle className='h-4 w-4 flex-shrink-0 text-amber-600' />
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-amber-700 dark:text-amber-300'>
                    {comprobante.name}
                  </p>
                  <p className='text-xs text-amber-600/70'>
                    {formatFileSize(comprobante.size)}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={handlePreview}
                  className='inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/30'
                >
                  <Eye className='h-3.5 w-3.5' /> Ver
                </button>
                <button
                  type='button'
                  onClick={() => {
                    handleComprobanteChange(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className='text-xs text-red-500 hover:text-red-700'
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`${s.uploadZone} ${isDragging ? 'border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/20' : ''}`}
                role='button'
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ')
                    fileInputRef.current?.click()
                }}
              >
                <Upload
                  className={`mb-1 h-6 w-6 ${isDragging ? 'text-amber-500' : 'text-gray-400'}`}
                />
                <p className='text-xs font-medium text-gray-600 dark:text-gray-300'>
                  {isDragging
                    ? 'Suelta el archivo aquí'
                    : 'Clic o arrastra el comprobante'}
                </p>
                <p className='text-xs text-gray-400'>
                  PDF, PNG, JPG (máx 10 MB)
                </p>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className={s.label}>
              Observaciones{' '}
              <span className='font-normal normal-case text-gray-400'>
                (opcional)
              </span>
            </label>
            <textarea
              rows={2}
              className={s.input}
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder='Notas adicionales sobre la devolución...'
            />
          </div>

          {/* Error */}
          {error && (
            <div className={s.errorBox}>
              <AlertTriangle className='mt-0.5 h-4 w-4 flex-shrink-0' />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={s.footer}>
          <button onClick={onClose} className={s.btnSecondary}>
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!formularioValido}
            className={s.btnPrimary}
          >
            <CheckCircle className='h-4 w-4' />
            Confirmar Devolución
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
