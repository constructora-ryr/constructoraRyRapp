'use client'

import { useCallback, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  DollarSign,
  Eye,
  Home,
  Loader2,
  MapPin,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react'

import {
  formatDateCompact,
  formatDateForInput,
  getTodayDateString,
} from '@/lib/utils/date.utils'
import { FormSelect } from '@/shared/components/ui/form-select'

import { useModalProcesarDevolucion } from '../../hooks/useModalProcesarDevolucion'
import type { MetodoDevolucion, RenunciaConInfo } from '../../types'
import { formatCOP } from '../../utils/renuncias.utils'

// ─────────────────────────────────────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────────────────────────────────────
const CONFETTI_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 160 - 80,
  y: -(Math.random() * 100 + 40),
  rotate: Math.random() * 360,
  scale: Math.random() * 0.5 + 0.5,
  delay: Math.random() * 0.3,
}))
const CONFETTI_COLORS = ['#FFD700', '#4ECDC4', '#A78BFA', '#06B6D4', '#34D399']

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = {
  overlay:
    'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4',
  container:
    'relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700',
  header:
    'sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-t-2xl',
  headerTitle: 'text-lg font-bold flex items-center gap-2',
  closeBtn: 'p-1.5 rounded-lg hover:bg-white/20 transition-colors',
  body: 'px-5 py-4 space-y-4',
  footer:
    'sticky bottom-0 px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl flex items-center justify-between',
  label:
    'block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1',
  input:
    'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all',
  select:
    'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all',
  textarea:
    'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none',
  errorBox:
    'flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300',
  infoRow: 'flex items-center gap-2 py-1',
  infoIcon: 'w-4 h-4 text-gray-400 flex-shrink-0',
  infoLabel: 'text-xs text-gray-500 dark:text-gray-400 min-w-[80px]',
  infoValue: 'text-sm font-semibold text-gray-900 dark:text-white',
  btnPrimary:
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white text-sm font-semibold hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg',
  btnSecondary:
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all',
  uploadZone:
    'flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50',
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface ProcesarDevolucionModalProps {
  renuncia: RenunciaConInfo
  onClose: () => void
  onExitosa?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function ProcesarDevolucionModal({
  renuncia,
  onClose,
  onExitosa,
}: ProcesarDevolucionModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const {
    fechaDevolucion,
    setFechaDevolucion,
    metodoDevolucion,
    setMetodoDevolucion,
    numeroComprobante,
    setNumeroComprobante,
    notasCierre,
    setNotasCierre,
    comprobante,
    handleComprobanteChange,
    formularioValido,
    fechaError,
    procesando,
    error,
    exitoso,
    handleConfirmar,
    metodosDisponibles,
  } = useModalProcesarDevolucion({
    renunciaId: renuncia.id,
    fechaRenuncia: formatDateForInput(renuncia.fecha_renuncia),
    onExitosa,
  })

  // ── Drag & drop ──────────────────────────────────────────────────────
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ── Procesando ─────────────────────────────────────────────────────────
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
          aria-label='Procesando devolución'
        >
          <div className={s.header}>
            <span className={s.headerTitle}>
              <DollarSign className='h-5 w-5' /> Procesando...
            </span>
          </div>
          <div className='flex flex-col items-center justify-center gap-4 py-16'>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            >
              <Loader2 className='h-10 w-10 text-green-500' />
            </motion.div>
            <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Registrando devolución...
            </p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ── Éxito ──────────────────────────────────────────────────────────────
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
          aria-label='Devolución procesada'
        >
          <div className='relative flex flex-col items-center justify-center overflow-hidden px-6 py-16'>
            {CONFETTI_PARTICLES.map(p => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  scale: p.scale,
                  rotate: p.rotate,
                }}
                transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
                className='absolute left-1/2 top-1/3 h-2 w-2 rounded-full'
                style={{
                  backgroundColor:
                    CONFETTI_COLORS[p.id % CONFETTI_COLORS.length],
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-xl shadow-green-500/30'>
                <CheckCircle className='h-10 w-10 text-white' />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='mt-6 text-center'
            >
              <h3 className='mb-1 text-xl font-bold text-gray-900 dark:text-white'>
                Devolución Procesada
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Renuncia cerrada exitosamente —{' '}
                {formatCOP(renuncia.monto_a_devolver)} devueltos
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className='mt-4 flex items-center gap-1 text-xs text-gray-400'
            >
              <Sparkles className='h-3 w-3' />
              <span>Cerrando automáticamente...</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ── Formulario ─────────────────────────────────────────────────────────
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
        aria-label='Procesar devolución'
      >
        {/* Header */}
        <div className={s.header}>
          <span className={s.headerTitle}>
            <DollarSign className='h-5 w-5' />
            Procesar Devolución
          </span>
          <button onClick={onClose} className={s.closeBtn}>
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Body */}
        <div className={s.body}>
          {/* Info renuncia */}
          <div className='space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50'>
            <div className={s.infoRow}>
              <User className={s.infoIcon} />
              <span className={s.infoLabel}>Cliente:</span>
              <span className={s.infoValue}>{renuncia.cliente.nombre}</span>
            </div>
            <div className={s.infoRow}>
              <Home className={s.infoIcon} />
              <span className={s.infoLabel}>Vivienda:</span>
              <span className={s.infoValue}>
                Manzana {renuncia.vivienda.manzana} · Casa{' '}
                {renuncia.vivienda.numero}
              </span>
            </div>
            <div className={s.infoRow}>
              <MapPin className={s.infoIcon} />
              <span className={s.infoLabel}>Proyecto:</span>
              <span className={s.infoValue}>{renuncia.proyecto.nombre}</span>
            </div>
            <div className={s.infoRow}>
              <Calendar className={s.infoIcon} />
              <span className={s.infoLabel}>Renuncia:</span>
              <span className={s.infoValue}>
                {formatDateCompact(renuncia.fecha_renuncia)}
              </span>
            </div>
            <div className={s.infoRow}>
              <DollarSign className={s.infoIcon} />
              <span className={s.infoLabel}>A devolver:</span>
              <span className='text-sm font-bold text-red-600 dark:text-red-400'>
                {formatCOP(renuncia.monto_a_devolver)}
              </span>
            </div>
            {renuncia.retencion_monto > 0 ? (
              <div className={s.infoRow}>
                <DollarSign className={s.infoIcon} />
                <span className={s.infoLabel}>Retenido:</span>
                <span className='text-sm font-semibold text-yellow-600 dark:text-yellow-400'>
                  {formatCOP(renuncia.retencion_monto)}
                </span>
              </div>
            ) : null}
          </div>

          {/* Fecha */}
          <div>
            <label className={s.label}>
              Fecha de devolución <span className='text-red-500'>*</span>
            </label>
            <input
              type='date'
              className={`${s.input} ${fechaError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              value={fechaDevolucion}
              min={formatDateForInput(renuncia.fecha_renuncia)}
              max={getTodayDateString()}
              onChange={e => setFechaDevolucion(e.target.value)}
            />
            {fechaError ? (
              <p className='mt-1 text-xs text-red-500'>
                <AlertTriangle className='mr-1 inline h-3 w-3' />
                {fechaError}
              </p>
            ) : null}
          </div>

          {/* Método */}
          <div>
            <label className={s.label}>
              Método de devolución <span className='text-red-500'>*</span>
            </label>
            <FormSelect
              className={s.select}
              value={metodoDevolucion}
              onChange={e =>
                setMetodoDevolucion(e.target.value as MetodoDevolucion)
              }
            >
              {metodosDisponibles.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </FormSelect>
          </div>

          {/* Número comprobante */}
          <div>
            <label className={s.label}>
              Número de comprobante{' '}
              <span className='font-normal normal-case text-gray-400'>
                (opcional)
              </span>
            </label>
            <input
              type='text'
              className={s.input}
              value={numeroComprobante}
              onChange={e => setNumeroComprobante(e.target.value)}
              placeholder='Ej: TRF-123456'
            />
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
              <div className='flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20'>
                <CheckCircle className='h-4 w-4 flex-shrink-0 text-green-600' />
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-green-700 dark:text-green-300'>
                    {comprobante.name}
                  </p>
                  <p className='text-xs text-green-600/70 dark:text-green-400/60'>
                    {formatFileSize(comprobante.size)}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={handlePreview}
                  className='inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900/30'
                  title='Ver archivo'
                >
                  <Eye className='h-3.5 w-3.5' />
                  Ver
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
                className={`${s.uploadZone} ${isDragging ? 'border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-950/20' : ''}`}
                role='button'
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ')
                    fileInputRef.current?.click()
                }}
              >
                <Upload
                  className={`mb-1 h-6 w-6 ${isDragging ? 'text-green-500' : 'text-gray-400'}`}
                />
                <p className='text-xs font-medium text-gray-600 dark:text-gray-300'>
                  {isDragging
                    ? 'Suelta el archivo aquí'
                    : 'Clic o arrastra tu archivo aquí'}
                </p>
                <p className='text-xs text-gray-400 dark:text-gray-500'>
                  PDF, PNG, JPG (máx 10 MB)
                </p>
              </div>
            )}
          </div>

          {/* Notas cierre */}
          <div>
            <label className={s.label}>
              Notas de cierre{' '}
              <span className='font-normal normal-case text-gray-400'>
                (opcional)
              </span>
            </label>
            <textarea
              rows={2}
              className={s.textarea}
              value={notasCierre}
              onChange={e => setNotasCierre(e.target.value)}
              placeholder='Observaciones sobre la devolución...'
            />
          </div>

          {/* Error */}
          {error ? (
            <div className={s.errorBox}>
              <AlertTriangle className='mt-0.5 h-4 w-4 flex-shrink-0' />
              <span>{error}</span>
            </div>
          ) : null}
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
