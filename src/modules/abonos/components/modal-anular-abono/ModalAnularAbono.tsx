'use client'

import { memo, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  ChevronDown,
  Home,
  Loader2,
  PartyPopper,
  Sparkles,
  Tag,
  User,
  X,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'

import type { MotivoAnulacion } from '../../types'
import { formatearNumeroRecibo } from '../../utils/formato-recibo'

import { modalAnularAbonoStyles as s } from './ModalAnularAbono.styles'
import { useModalAnularAbono } from './useModalAnularAbono'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

// ─────────────────────────────────────────────────────────────────────────────
// Celebración de éxito: confetti (matching AccordionWizardSuccess)
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
// Subcomponente memoizado para la textarea
// Gestiona su propio estado local → el padre NO re-renderiza en cada tecla.
// ─────────────────────────────────────────────────────────────────────────────
const TextareaDetalle = memo(function TextareaDetalle({
  onChange,
  disabled,
  detalleObligatorio,
  maxChars,
}: {
  onChange: (valor: string) => void
  disabled: boolean
  detalleObligatorio: boolean
  maxChars: number
}) {
  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nueva = e.target.value
    if (nueva.length <= maxChars) {
      setValue(nueva)
      onChange(nueva)
    }
  }

  return (
    <div className={s.form.fieldGroup}>
      <label htmlFor='motivo-detalle' className={s.form.label}>
        Detalle adicional
        {detalleObligatorio ? (
          <span className={s.form.labelRequired}>*</span>
        ) : (
          <span className='ml-1 font-normal normal-case tracking-normal text-gray-400'>
            (opcional)
          </span>
        )}
      </label>
      <textarea
        id='motivo-detalle'
        rows={3}
        className={s.form.textarea}
        placeholder={
          detalleObligatorio
            ? 'Describe el motivo específico de la anulación…'
            : 'Información adicional sobre la anulación…'
        }
        value={value}
        onChange={handleChange}
        disabled={disabled}
      />
      <p className={s.form.charCount}>
        {value.length}/{maxChars}
      </p>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// Props — sin isOpen: el callsite controla el montaje con {cond && <Modal />}
// ─────────────────────────────────────────────────────────────────────────────
interface ModalAnularAbonoProps {
  abono: {
    id: string
    numero_recibo: string | number
    monto: number
    fecha_abono: string
    /** Nombre completo del cliente (opcional, para confirmación visual) */
    cliente_nombre?: string
    /** Texto de vivienda, ej: "Mz.A Casa No. 5" (opcional) */
    vivienda_info?: string
    /** Nombre del proyecto (opcional) */
    proyecto_nombre?: string
    /** Tipo/nombre de la fuente de pago (opcional) */
    fuente_tipo?: string
  }
  onClose: () => void
  /** Callback automático ~2s después de anulación exitosa. Debe cerrar el modal y refrescar datos. */
  onAnulacionExitosa?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
export function ModalAnularAbono({
  abono,
  onClose,
  onAnulacionExitosa,
}: ModalAnularAbonoProps) {
  const {
    motivoCategoria,
    detalleObligatorio,
    formularioValido,
    anulando,
    error,
    exitoso,
    motivos,
    detalleMaxChars,
    handleMotivoChange,
    handleDetalleChange,
    handleConfirmar,
  } = useModalAnularAbono({ abono, onAnulacionExitosa })

  // ── Vista: loading (animación profesional) ─────────────────────────────────
  if (anulando) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={s.overlay}
        onClick={() => {
          // Overlay no cierra este modal para evitar cierre accidental durante operaciones críticas
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={s.container}
          onClick={e => e.stopPropagation()}
          role='dialog'
          aria-modal='true'
          aria-label='Anulando abono'
        >
          <div className='flex flex-col items-center justify-center gap-6 px-6 py-16'>
            <div className='relative flex items-center justify-center'>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              >
                <Loader2 className='h-12 w-12 text-red-500 dark:text-red-400' />
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeOut',
                }}
                className='absolute inset-0 m-auto h-12 w-12 rounded-full bg-red-500/20'
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='space-y-2 text-center'
            >
              <p className='text-lg font-bold text-gray-900 dark:text-white'>
                Anulando abono…
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Este proceso puede tomar unos segundos.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ── Vista: éxito (celebración consistente con AccordionWizardSuccess) ─────
  if (exitoso) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm'
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className='relative flex flex-col items-center gap-4 p-8 text-center'
        >
          {/* Confetti */}
          <div className='pointer-events-none absolute inset-0 overflow-visible'>
            {CONFETTI_PARTICLES.map(p => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: [1, 1, 0],
                  scale: p.scale,
                  rotate: p.rotate,
                }}
                transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
                className='absolute left-1/2 top-1/2 h-2 w-2 rounded-full'
                style={{
                  backgroundColor:
                    CONFETTI_COLORS[p.id % CONFETTI_COLORS.length],
                }}
              />
            ))}
          </div>

          {/* Checkmark principal */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
              delay: 0.15,
            }}
            className='relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/40'
          >
            <CheckCircle className='h-10 w-10 text-white' strokeWidth={2.5} />
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1, repeat: 2, repeatType: 'loop' }}
              className='absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-30'
            />
          </motion.div>

          {/* Sparkles */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className='absolute -right-4 -top-2'
          >
            <Sparkles className='h-6 w-6 text-yellow-400' />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className='absolute -left-6 top-0'
          >
            <PartyPopper className='h-5 w-5 text-orange-400' />
          </motion.div>

          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className='text-2xl font-bold tracking-tight text-white'>
              ¡Abono anulado!
            </h2>
            <p className='mt-1 text-sm text-white/70'>
              Recibo {formatearNumeroRecibo(abono.numero_recibo)} anulado
              correctamente
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className='text-xs text-white/40'
          >
            Redirigiendo…
          </motion.p>
        </motion.div>
      </motion.div>
    )
  }

  // ── Vista: formulario ──────────────────────────────────────────────────────
  return (
    <div className={s.overlay} onClick={onClose}>
      <div
        className={s.container}
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-label='Anular abono'
      >
        {/* Header */}
        <div className={s.header.container}>
          <div className={s.header.left}>
            <div className={s.header.iconWrap}>
              <Ban className='h-4 w-4 text-white' />
            </div>
            <div>
              <p className={s.header.title}>Anular abono</p>
              <p className={s.header.subtitle}>Esta acción es irreversible</p>
            </div>
          </div>
          <button
            type='button'
            className={s.header.btnClose}
            onClick={onClose}
            disabled={anulando}
            aria-label='Cerrar'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Body */}
        <div className={s.body}>
          {/* Info del abono */}
          <div className={s.infoBadge}>
            <div className='min-w-0 flex-1'>
              <p className={s.infoBadgeLabel}>Recibo</p>
              <p className={s.infoBadgeValue}>
                {formatearNumeroRecibo(abono.numero_recibo)}
              </p>
            </div>
            <div className='min-w-0 flex-1'>
              <p className={s.infoBadgeLabel}>Monto</p>
              <p className={s.infoBadgeValue}>{formatCurrency(abono.monto)}</p>
            </div>
            <div className='min-w-0 flex-1'>
              <p className={s.infoBadgeLabel}>Fecha</p>
              <p className={s.infoBadgeValue}>
                {formatDateCompact(abono.fecha_abono)}
              </p>
            </div>
          </div>

          {/* Contexto: cliente, vivienda, fuente */}
          {abono.cliente_nombre || abono.vivienda_info || abono.fuente_tipo ? (
            <div className='grid grid-cols-1 gap-2.5 rounded-xl border border-gray-200 bg-gray-100/80 px-3 py-3 dark:border-gray-700/60 dark:bg-gray-800/80'>
              {abono.cliente_nombre ? (
                <div className='flex items-start gap-2'>
                  <User className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400' />
                  <div className='min-w-0'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
                      Cliente
                    </p>
                    <p className='truncate text-sm font-semibold text-gray-900 dark:text-gray-100'>
                      {abono.cliente_nombre}
                    </p>
                  </div>
                </div>
              ) : null}
              {abono.vivienda_info ? (
                <div className='flex items-start gap-2'>
                  <Home className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400' />
                  <div className='min-w-0'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
                      Vivienda
                      {abono.proyecto_nombre
                        ? ` — ${abono.proyecto_nombre}`
                        : ''}
                    </p>
                    <p className='truncate text-sm font-semibold text-gray-900 dark:text-gray-100'>
                      {abono.vivienda_info}
                    </p>
                  </div>
                </div>
              ) : null}
              {abono.fuente_tipo ? (
                <div className='flex items-start gap-2'>
                  <Tag className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400' />
                  <div className='min-w-0'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
                      Fuente de pago
                    </p>
                    <p className='truncate text-sm font-semibold text-gray-900 dark:text-gray-100'>
                      {abono.fuente_tipo}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Advertencia */}
          <div className={s.warningBox}>
            <AlertTriangle className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 dark:text-amber-400' />
            <p className={s.warningText}>
              Al anular este abono, el saldo de la fuente de pago y de la
              negociación se recalculará automáticamente. No se puede reactivar
              un abono anulado.
            </p>
          </div>

          {/* Motivo categoría */}
          <div className={s.form.fieldGroup}>
            <label htmlFor='motivo-categoria' className={s.form.label}>
              Motivo de la anulación
              <span className={s.form.labelRequired}>*</span>
            </label>
            <div className='relative'>
              <select
                id='motivo-categoria'
                className={s.form.select}
                value={motivoCategoria}
                onChange={e =>
                  handleMotivoChange(e.target.value as MotivoAnulacion | '')
                }
                disabled={anulando}
              >
                <option value=''>Seleccionar motivo…</option>
                {motivos.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            </div>
          </div>

          {/* Detalle libre — memoizado para no re-renderizar el padre en cada tecla */}
          <TextareaDetalle
            onChange={handleDetalleChange}
            disabled={anulando}
            detalleObligatorio={detalleObligatorio}
            maxChars={detalleMaxChars}
          />

          {/* Error */}
          {error ? (
            <p className={s.form.errorText} role='alert'>
              {error}
            </p>
          ) : null}
        </div>

        {/* Footer */}
        <div className={s.footer}>
          <button
            type='button'
            className={s.btnCancel}
            onClick={onClose}
            disabled={anulando}
          >
            Cancelar
          </button>
          <button
            type='button'
            className={s.btnConfirm}
            onClick={handleConfirmar}
            disabled={!formularioValido}
          >
            {anulando ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Anulando…
              </>
            ) : (
              <>
                <Ban className='h-4 w-4' />
                Anular abono
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
