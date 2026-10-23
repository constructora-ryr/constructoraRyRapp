'use client'

import { useRef } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  CheckCircle,
  DollarSign,
  FileText,
  FileX,
  Home,
  Loader2,
  Shield,
  Upload,
  User,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { SectionLoadingSpinner } from '@/shared/components/ui'

import { useModalRegistrarRenuncia } from '../../hooks/useModalRegistrarRenuncia'
import { formatCOP } from '../../utils/renuncias.utils'

// ─────────────────────────────────────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────────────────────────────────────
const CONFETTI_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 200 - 100,
  y: -(Math.random() * 120 + 40),
  rotate: Math.random() * 360,
  scale: Math.random() * 0.5 + 0.5,
  delay: Math.random() * 0.3,
}))
const CONFETTI_COLORS = [
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
  '#A78BFA',
  '#F97316',
  '#06B6D4',
]

// ─────────────────────────────────────────────────────────────────────────────
// Styles (inline para modal — componente self-contained)
// ─────────────────────────────────────────────────────────────────────────────
const s = {
  overlay:
    'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4',
  container:
    'relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700',
  header:
    'sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800 text-white rounded-t-2xl',
  headerTitle: 'text-lg font-bold flex items-center gap-2',
  closeBtn: 'p-1.5 rounded-lg hover:bg-white/20 transition-colors',
  body: 'px-5 py-4 space-y-4',
  footer:
    'sticky bottom-0 px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl flex items-center justify-between',
  label:
    'block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1',
  input:
    'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all',
  textarea:
    'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none',
  charCount: 'text-right text-xs text-gray-400 mt-0.5',
  errorBox:
    'flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300',
  warningBox:
    'flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-700 dark:text-yellow-300',
  infoRow: 'flex items-center gap-2 py-1.5',
  infoIcon: 'w-4 h-4 text-gray-400 flex-shrink-0',
  infoLabel: 'text-xs text-gray-500 dark:text-gray-400 min-w-[80px]',
  infoValue: 'text-sm font-semibold text-gray-900 dark:text-white',
  btnPrimary:
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800 text-white text-sm font-semibold hover:from-red-700 hover:via-rose-700 hover:to-pink-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg',
  btnSecondary:
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all',
  stepIndicator: 'flex items-center gap-2 text-xs text-white/80',
  uploadZone:
    'flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50',
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface RegistrarRenunciaModalProps {
  negociacionId: string
  onClose: () => void
  onExitosa?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function RegistrarRenunciaModal({
  negociacionId,
  onClose,
  onExitosa,
}: RegistrarRenunciaModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    validacion,
    validando,
    puedeRegistrar,
    paso,
    irAPaso2,
    volverAPaso1,
    motivo,
    handleMotivoChange,
    motivoMaxChars,
    retencionMonto,
    handleRetencionMontoChange,
    retencionMotivo,
    handleRetencionMotivoChange,
    formularioRenuncia,
    handleFormularioChange,
    textoConfirmacion,
    setTextoConfirmacion,
    totalAbonado,
    montoADevolver,
    retencionEnRango,
    paso1Valido,
    paso2Valido,
    registrando,
    error,
    exitoso,
    handleConfirmar,
  } = useModalRegistrarRenuncia({ negociacionId, onExitosa })

  // ── Validando ──────────────────────────────────────────────────────────
  if (validando) {
    return typeof window !== 'undefined'
      ? createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={s.overlay}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={s.container}
              onClick={e => e.stopPropagation()}
              role='dialog'
              aria-modal='true'
              aria-label='Validando renuncia'
            >
              <div className={s.header}>
                <span className={s.headerTitle}>
                  <FileX className='h-5 w-5' /> Registrar Renuncia
                </span>
              </div>
              <div className='flex flex-col items-center justify-center gap-4 py-16'>
                <SectionLoadingSpinner
                  label='Validando negociación...'
                  moduleName='renuncias'
                  icon={FileX}
                  className='flex flex-col items-center justify-center gap-6 py-16'
                />
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )
      : null
  }

  // ── No puede renunciar ─────────────────────────────────────────────────
  if (!puedeRegistrar && validacion) {
    return typeof window !== 'undefined'
      ? createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={s.overlay}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={s.container}
              onClick={e => e.stopPropagation()}
              role='dialog'
              aria-modal='true'
              aria-label='No se puede renunciar'
            >
              <div className={s.header}>
                <span className={s.headerTitle}>
                  <Ban className='h-5 w-5' /> No se puede registrar
                </span>
                <button onClick={onClose} className={s.closeBtn}>
                  <X className='h-4 w-4' />
                </button>
              </div>
              <div className={s.body}>
                <div className={s.errorBox}>
                  <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0' />
                  <div>
                    <p className='font-semibold'>Renuncia bloqueada</p>
                    <p className='mt-1'>{validacion.motivo_bloqueo}</p>
                  </div>
                </div>
                <div className='mt-3 space-y-1'>
                  <div className={s.infoRow}>
                    <User className={s.infoIcon} />
                    <span className={s.infoLabel}>Cliente:</span>
                    <span className={s.infoValue}>
                      {validacion.negociacion.cliente_nombre}
                    </span>
                  </div>
                  <div className={s.infoRow}>
                    <Home className={s.infoIcon} />
                    <span className={s.infoLabel}>Vivienda:</span>
                    <span className={s.infoValue}>
                      Mz. {validacion.negociacion.manzana_nombre} Casa{' '}
                      {validacion.negociacion.vivienda_numero}
                    </span>
                  </div>
                </div>
              </div>
              <div className={s.footer}>
                <div />
                <button onClick={onClose} className={s.btnSecondary}>
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )
      : null
  }

  // ── Registrando (loading) ──────────────────────────────────────────────
  if (registrando) {
    return typeof window !== 'undefined'
      ? createPortal(
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
              aria-label='Registrando renuncia'
            >
              <div className={s.header}>
                <span className={s.headerTitle}>
                  <FileX className='h-5 w-5' /> Registrando...
                </span>
              </div>
              <div className='flex flex-col items-center justify-center gap-4 py-16'>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: 'linear',
                  }}
                >
                  <Loader2 className='h-10 w-10 text-red-500' />
                </motion.div>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Se está registrando la renuncia del cliente...
                </p>
                <div className='flex flex-col items-center gap-1'>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Ejecutando cascada de actualizaciones
                  </p>
                  <div className='mt-1 flex items-center gap-1.5'>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className='h-1.5 w-1.5 rounded-full bg-red-400'
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )
      : null
  }

  // ── Éxito ──────────────────────────────────────────────────────────────
  if (exitoso) {
    return typeof window !== 'undefined'
      ? createPortal(
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
              aria-label='Renuncia registrada'
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
                    transition={{
                      duration: 1.2,
                      delay: p.delay,
                      ease: 'easeOut',
                    }}
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
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
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
                    Renuncia Registrada Exitosamente
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {montoADevolver > 0
                      ? `Devolución pendiente: ${formatCOP(montoADevolver)}`
                      : 'Sin devolución requerida — renuncia cerrada automáticamente.'}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className='mt-5 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 dark:border-gray-700 dark:bg-gray-800'
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: 'linear',
                    }}
                  >
                    <Loader2 className='h-3.5 w-3.5 text-gray-400' />
                  </motion.div>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    Redirigiendo al módulo de renuncias...
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )
      : null
  }

  // ── Wizard principal ───────────────────────────────────────────────────
  const negInfo = validacion?.negociacion

  return typeof window !== 'undefined'
    ? createPortal(
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
            aria-label='Registrar renuncia'
          >
            {/* Header */}
            <div className={s.header}>
              <span className={s.headerTitle}>
                <FileX className='h-5 w-5' />
                Registrar Renuncia
              </span>
              <div className='flex items-center gap-3'>
                <span className={s.stepIndicator}>Paso {paso} de 2</span>
                <button onClick={onClose} className={s.closeBtn}>
                  <X className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence mode='wait'>
              {paso === 1 ? (
                <motion.div
                  key='paso1'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={s.body}
                >
                  {/* Info negociación */}
                  <div className='space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50'>
                    <div className={s.infoRow}>
                      <User className={s.infoIcon} />
                      <span className={s.infoLabel}>Cliente:</span>
                      <span className={s.infoValue}>
                        {negInfo?.cliente_nombre}
                      </span>
                    </div>
                    <div className={s.infoRow}>
                      <Home className={s.infoIcon} />
                      <span className={s.infoLabel}>Vivienda:</span>
                      <span className={s.infoValue}>
                        Mz. {negInfo?.manzana_nombre} Casa{' '}
                        {negInfo?.vivienda_numero}
                      </span>
                    </div>
                    <div className={s.infoRow}>
                      <DollarSign className={s.infoIcon} />
                      <span className={s.infoLabel}>Total Abonado:</span>
                      <span className='text-sm font-bold text-green-600 dark:text-green-400'>
                        {formatCOP(totalAbonado)}
                      </span>
                    </div>
                  </div>

                  {/* Motivo */}
                  <div>
                    <label className={s.label}>
                      Motivo de renuncia <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                      rows={3}
                      className={s.textarea}
                      placeholder='Describe el motivo de la renuncia (mín. 10 caracteres)...'
                      value={motivo}
                      onChange={e => handleMotivoChange(e.target.value)}
                    />
                    <p className={s.charCount}>
                      {motivo.length}/{motivoMaxChars}
                    </p>
                  </div>

                  {/* Retención */}
                  <div className='space-y-3 rounded-lg border-2 border-dashed border-gray-200 p-3 dark:border-gray-700'>
                    <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                      <Shield className='h-3.5 w-3.5' />
                      Retención (opcional)
                    </p>
                    <div>
                      <label className={s.label}>Monto a retener</label>
                      <input
                        type='number'
                        min={0}
                        max={totalAbonado}
                        className={s.input}
                        value={retencionMonto || ''}
                        onChange={e =>
                          handleRetencionMontoChange(Number(e.target.value))
                        }
                        placeholder='0'
                      />
                      {!retencionEnRango ? (
                        <p className='mt-1 text-xs text-red-500'>
                          Máximo: {formatCOP(totalAbonado)}
                        </p>
                      ) : null}
                    </div>
                    {retencionMonto > 0 ? (
                      <div>
                        <label className={s.label}>
                          Motivo de retención{' '}
                          <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='text'
                          className={s.input}
                          value={retencionMotivo}
                          onChange={e =>
                            handleRetencionMotivoChange(e.target.value)
                          }
                          placeholder='Justificación de la retención...'
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Formulario de renuncia (opcional) */}
                  <div>
                    <label className={s.label}>
                      Formulario de renuncia{' '}
                      <span className='font-normal normal-case text-gray-400'>
                        (opcional)
                      </span>
                    </label>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='.pdf,.png,.jpg,.jpeg'
                      className='hidden'
                      onChange={e =>
                        handleFormularioChange(e.target.files?.[0] ?? null)
                      }
                    />
                    {formularioRenuncia ? (
                      <div className='flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/20'>
                        <FileText className='h-4 w-4 flex-shrink-0 text-rose-600 dark:text-rose-400' />
                        <span className='flex-1 truncate text-sm text-rose-700 dark:text-rose-300'>
                          {formularioRenuncia.name}
                        </span>
                        <button
                          onClick={() => {
                            handleFormularioChange(null)
                            if (fileInputRef.current)
                              fileInputRef.current.value = ''
                          }}
                          className='text-xs font-medium text-red-500 hover:text-red-700'
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={s.uploadZone}
                        role='button'
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ')
                            fileInputRef.current?.click()
                        }}
                      >
                        <Upload className='mb-1 h-6 w-6 text-gray-400' />
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Adjuntar formulario diligenciado
                        </p>
                        <p className='mt-0.5 text-[10px] text-gray-400 dark:text-gray-500'>
                          PDF, PNG, JPG (máx 10 MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Resumen financiero */}
                  <div className='space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Total Abonado a la fecha:
                      </span>
                      <span className='font-semibold text-gray-900 dark:text-white'>
                        {formatCOP(totalAbonado)}
                      </span>
                    </div>
                    {retencionMonto > 0 ? (
                      <div className='flex justify-between text-sm'>
                        <span className='text-red-600 dark:text-red-400'>
                          Retención:
                        </span>
                        <span className='font-semibold text-red-600 dark:text-red-400'>
                          - {formatCOP(retencionMonto)}
                        </span>
                      </div>
                    ) : null}
                    <div className='mt-1 flex justify-between border-t border-red-200 pt-1 text-sm font-bold dark:border-red-800'>
                      <span className='text-gray-900 dark:text-white'>
                        A devolver:
                      </span>
                      <span className='text-red-700 dark:text-red-300'>
                        {formatCOP(montoADevolver)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key='paso2'
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={s.body}
                >
                  {/* Warning irreversible */}
                  <div className={s.warningBox}>
                    <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0' />
                    <div>
                      <p className='font-bold'>Acción irreversible</p>
                      <p className='mt-1'>
                        Una vez registrada, la renuncia NO se puede cancelar ni
                        deshacer.
                      </p>
                    </div>
                  </div>

                  {/* Efectos cascada */}
                  <div className='rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50'>
                    <p className='mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300'>
                      Esta acción ejecutará automáticamente:
                    </p>
                    <ul className='space-y-1.5 text-xs text-gray-600 dark:text-gray-400'>
                      <li className='flex items-center gap-2'>
                        <span className='h-1.5 w-1.5 rounded-full bg-red-500' />
                        Negociación →{' '}
                        <span className='font-semibold text-red-600 dark:text-red-400'>
                          Cerrada por Renuncia
                        </span>
                      </li>
                      <li className='flex items-center gap-2'>
                        <span className='h-1.5 w-1.5 rounded-full bg-green-500' />
                        Vivienda →{' '}
                        <span className='font-semibold text-green-600 dark:text-green-400'>
                          Disponible
                        </span>
                      </li>
                      <li className='flex items-center gap-2'>
                        <span className='h-1.5 w-1.5 rounded-full bg-gray-400' />
                        Fuentes de pago →{' '}
                        <span className='font-semibold'>Inactivas</span>
                      </li>
                      <li className='flex items-center gap-2'>
                        <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                        Snapshots guardados para auditoría
                      </li>
                    </ul>
                  </div>

                  {/* Resumen */}
                  <div className='space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20'>
                    <p className='mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300'>
                      Resumen financiero:
                    </p>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Total Abonado:
                      </span>
                      <span className='font-semibold'>
                        {formatCOP(totalAbonado)}
                      </span>
                    </div>
                    {retencionMonto > 0 ? (
                      <div className='flex justify-between text-sm'>
                        <span className='text-red-600 dark:text-red-400'>
                          Retención:
                        </span>
                        <span className='font-semibold text-red-600'>
                          - {formatCOP(retencionMonto)}
                        </span>
                      </div>
                    ) : null}
                    <div className='mt-1 flex justify-between border-t border-red-200 pt-1 text-sm font-bold dark:border-red-800'>
                      <span>Monto a devolver:</span>
                      <span className='text-red-700 dark:text-red-300'>
                        {formatCOP(montoADevolver)}
                      </span>
                    </div>
                  </div>

                  {/* Input CONFIRMAR */}
                  <div>
                    <label className={s.label}>
                      Escribe{' '}
                      <span className='font-bold text-red-600'>CONFIRMAR</span>{' '}
                      para continuar
                    </label>
                    <input
                      type='text'
                      className={s.input}
                      value={textoConfirmacion}
                      onChange={e => setTextoConfirmacion(e.target.value)}
                      placeholder='CONFIRMAR'
                      autoComplete='off'
                    />
                  </div>

                  {/* Error */}
                  {error ? (
                    <div className={s.errorBox}>
                      <AlertTriangle className='mt-0.5 h-4 w-4 flex-shrink-0' />
                      <span>{error}</span>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className={s.footer}>
              {paso === 1 ? (
                <>
                  <button onClick={onClose} className={s.btnSecondary}>
                    Cancelar
                  </button>
                  <button
                    onClick={irAPaso2}
                    disabled={!paso1Valido}
                    className={s.btnPrimary}
                  >
                    Siguiente
                    <ArrowRight className='h-4 w-4' />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={volverAPaso1} className={s.btnSecondary}>
                    <ArrowLeft className='h-4 w-4' />
                    Atrás
                  </button>
                  <button
                    onClick={handleConfirmar}
                    disabled={!paso2Valido}
                    className={s.btnPrimary}
                  >
                    <FileX className='h-4 w-4' />
                    Registrar Renuncia
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )
    : null
}
