'use client'

/**
 * DescuentoModal — Modal para aplicar/modificar descuento en negociación
 *
 * Permite al admin:
 * - Aplicar un descuento (monto en COP)
 * - Seleccionar tipo de descuento
 * - Escribir motivo obligatorio
 * - Ver preview del impacto financiero
 * - Quitar descuento existente
 *
 * El trigger `calcular_valor_total_pagar()` recalcula automáticamente.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { DollarSign, Percent, Trash2, X } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatCurrencyInput, parseCurrency } from '@/modules/viviendas/utils'
import { formatCurrency } from '@/shared/utils/format'

import {
  LABELS_TIPO_DESCUENTO,
  TIPOS_DESCUENTO,
  type DatosDescuento,
  type TipoDescuento,
} from '../hooks/useDescuentoMutation'

import { descuentoModalStyles as styles } from './DescuentoModal.styles'

// ============================================
// TYPES
// ============================================

interface DescuentoModalProps {
  isOpen: boolean
  onClose: () => void
  onGuardar: (datos: DatosDescuento) => void
  isGuardando: boolean
  valorNegociado: number
  descuentoActual: number
  tipoDescuentoActual?: string | null
  motivoDescuentoActual?: string | null
  esAdmin?: boolean
}

// ============================================
// COMPONENT
// ============================================

export function DescuentoModal({
  isOpen,
  onClose,
  onGuardar,
  isGuardando,
  valorNegociado,
  descuentoActual,
  tipoDescuentoActual,
  motivoDescuentoActual,
  esAdmin = false,
}: DescuentoModalProps) {
  const esEdicion = descuentoActual > 0

  // ─── Form state ──────────────────────────────────────────────────────────
  const [montoRaw, setMontoRaw] = useState('')
  const [tipo, setTipo] = useState<TipoDescuento>('comercial')
  const [motivo, setMotivo] = useState('')
  const [touched, setTouched] = useState(false)

  // ─── Inicializar con datos existentes ────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      if (esEdicion) {
        setMontoRaw(String(descuentoActual))
        setTipo((tipoDescuentoActual as TipoDescuento) || 'comercial')
        setMotivo(motivoDescuentoActual ?? '')
      } else {
        setMontoRaw('')
        setTipo('comercial')
        setMotivo('')
      }
      setTouched(false)
    }
  }, [
    isOpen,
    esEdicion,
    descuentoActual,
    tipoDescuentoActual,
    motivoDescuentoActual,
  ])

  // ─── Valores calculados ──────────────────────────────────────────────────
  const montoNum = useMemo(() => parseCurrency(montoRaw), [montoRaw])

  const porcentaje = useMemo(() => {
    if (valorNegociado <= 0 || montoNum <= 0) return 0
    return Number(((montoNum / valorNegociado) * 100).toFixed(2))
  }, [montoNum, valorNegociado])

  const nuevoTotal = useMemo(() => {
    return Math.max(0, valorNegociado - montoNum)
  }, [valorNegociado, montoNum])

  // ─── Validación ──────────────────────────────────────────────────────────
  const errores = useMemo(() => {
    const errs: { monto?: string; motivo?: string } = {}
    if (montoNum <= 0) errs.monto = 'El monto debe ser mayor a $0'
    else if (montoNum >= valorNegociado)
      errs.monto = 'El descuento no puede ser igual o mayor al valor negociado'
    else if (!esAdmin && montoNum > valorNegociado * 0.5)
      errs.monto = 'El descuento no puede superar el 50% del valor negociado'
    else if (esAdmin && montoNum > valorNegociado * 0.99)
      errs.monto = 'El descuento no puede superar el 99% del valor negociado'
    if (!motivo.trim()) errs.motivo = 'El motivo es obligatorio'
    else if (motivo.trim().length < 10)
      errs.motivo = 'El motivo debe tener al menos 10 caracteres'
    return errs
  }, [montoNum, valorNegociado, motivo, esAdmin])

  const puedeGuardar = !errores.monto && !errores.motivo && !isGuardando

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    setTouched(true)
    if (!puedeGuardar) return
    onGuardar({
      descuento_aplicado: montoNum,
      tipo_descuento: tipo,
      motivo_descuento: motivo.trim(),
    })
  }, [puedeGuardar, onGuardar, montoNum, tipo, motivo])

  const handleQuitarDescuento = useCallback(() => {
    onGuardar({
      descuento_aplicado: 0,
      tipo_descuento: null,
      motivo_descuento: null,
    })
  }, [onGuardar])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  // ─── Render ──────────────────────────────────────────────────────────────
  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={styles.overlay}
          onClick={onClose}
          onKeyDown={handleKeyDown}
          role='dialog'
          aria-modal='true'
          aria-label={esEdicion ? 'Modificar descuento' : 'Aplicar descuento'}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={styles.container}
            onClick={e => e.stopPropagation()}
          >
            {/* ─── Header ───── */}
            <div className={styles.header.container}>
              <div className='flex items-center gap-2'>
                <Percent className='h-5 w-5 text-white/80' />
                <div>
                  <h2 className={styles.header.title}>
                    {esEdicion ? 'Modificar Descuento' : 'Aplicar Descuento'}
                  </h2>
                  <p className={styles.header.subtitle}>
                    Valor negociado: {formatCurrency(valorNegociado)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={styles.header.closeButton}
                aria-label='Cerrar'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            {/* ─── Body ───── */}
            <div className={styles.body.container}>
              {/* Monto del descuento */}
              <div>
                <label htmlFor='descuento-monto' className={styles.body.label}>
                  Monto del descuento (COP) *
                </label>
                <div className='relative'>
                  <DollarSign className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <input
                    id='descuento-monto'
                    type='text'
                    inputMode='numeric'
                    value={formatCurrencyInput(montoRaw)}
                    onChange={e => setMontoRaw(e.target.value)}
                    placeholder='$ 0'
                    className={`${styles.body.input} pl-9 ${touched && errores.monto ? 'border-red-400 dark:border-red-600' : ''}`}
                  />
                </div>
                {touched && errores.monto ? (
                  <p className={styles.body.error}>{errores.monto}</p>
                ) : null}
              </div>

              {/* Tipo de descuento */}
              <div>
                <label htmlFor='descuento-tipo' className={styles.body.label}>
                  Tipo de descuento *
                </label>
                <select
                  id='descuento-tipo'
                  value={tipo}
                  onChange={e => setTipo(e.target.value as TipoDescuento)}
                  className={styles.body.select}
                >
                  {TIPOS_DESCUENTO.map(t => (
                    <option key={t} value={t}>
                      {LABELS_TIPO_DESCUENTO[t]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label htmlFor='descuento-motivo' className={styles.body.label}>
                  Motivo del descuento *
                </label>
                <textarea
                  id='descuento-motivo'
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder='Describe el motivo del descuento...'
                  rows={2}
                  className={`${styles.body.textarea} ${touched && errores.motivo ? 'border-red-400 dark:border-red-600' : ''}`}
                />
                {touched && errores.motivo ? (
                  <p className={styles.body.error}>{errores.motivo}</p>
                ) : null}
              </div>

              {/* Preview financiero */}
              <div className={styles.preview.container}>
                <div className={styles.preview.row}>
                  <span className={styles.preview.label}>Valor negociado</span>
                  <span className={styles.preview.value}>
                    {formatCurrency(valorNegociado)}
                  </span>
                </div>
                <div className={styles.preview.row}>
                  <span className={styles.preview.label}>
                    Descuento ({porcentaje}%)
                  </span>
                  <span className={styles.preview.valueDanger}>
                    {montoNum > 0 ? `-${formatCurrency(montoNum)}` : '$0'}
                  </span>
                </div>
                <div className={styles.preview.separator} />
                <div className={styles.preview.row}>
                  <span className={styles.preview.label}>
                    Nuevo valor total a pagar
                  </span>
                  <span className={styles.preview.valueSuccess}>
                    {formatCurrency(nuevoTotal)}
                  </span>
                </div>
                {montoNum > 0 ? (
                  <div className='mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-700/50 dark:bg-amber-900/20'>
                    <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400' />
                    <p className='text-xs text-amber-700 dark:text-amber-300'>
                      Al aplicar este descuento se generará un descuadre de{' '}
                      <strong>{formatCurrency(montoNum)}</strong> en las fuentes
                      de pago. Deberás corregirlo en el{' '}
                      <strong>Ajuste de Cierre Financiero</strong> después de
                      guardar.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* ─── Footer ───── */}
            <div className={styles.footer.container}>
              {esEdicion ? (
                <button
                  onClick={handleQuitarDescuento}
                  disabled={isGuardando}
                  className={styles.footer.removeButton}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                  Quitar descuento
                </button>
              ) : null}
              <button
                onClick={onClose}
                disabled={isGuardando}
                className={styles.footer.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!puedeGuardar}
                className={styles.footer.submitButton}
              >
                {isGuardando ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : null}
                {esEdicion ? 'Actualizar Descuento' : 'Aplicar Descuento'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
