'use client'

/**
 * ImpactoFinancieroModal - Modal que muestra el impacto de cambiar valor_base
 * cuando la vivienda tiene una negociación activa.
 *
 * Opciones para el admin:
 * 1. Guardar + Sincronizar negociación (actualiza valor_negociado)
 * 2. Guardar sin sincronizar (dejar valores independientes)
 * 3. Cancelar
 */

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  ShieldAlert,
  User,
  XCircle,
} from 'lucide-react'

import { SectionLoadingSpinner } from '@/shared/components/ui'
import { Modal } from '@/shared/components/ui/Modal'
import { formatCurrency } from '@/shared/utils/format'

import type { ImpactoFinanciero } from '../hooks/useEditarVivienda'

type EstadoModal = 'idle' | 'loading' | 'success' | 'error'

interface ImpactoFinancieroModalProps {
  isOpen: boolean
  onClose: () => void
  impacto: ImpactoFinanciero
  onConfirmarConSync: () => void
  onConfirmarSinSync: () => void
  isLoading: boolean
  estado?: EstadoModal
  sincronizando?: boolean
}

export function ImpactoFinancieroModal({
  isOpen,
  onClose,
  impacto,
  onConfirmarConSync,
  onConfirmarSinSync,
  isLoading: _isLoading,
  estado = 'idle',
  sincronizando = false,
}: ImpactoFinancieroModalProps) {
  const {
    negociacion,
    valorBaseAnterior,
    valorBaseNuevo,
    diferencia,
    bloqueado,
    motivoBloqueo,
  } = impacto
  const subio = diferencia > 0
  const isBlocked = estado === 'loading' || estado === 'success'

  function handleClose() {
    if (!isBlocked) {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Impacto Financiero Detectado'
      description='El cambio de precio afecta una negociación activa'
      size='md'
      gradientColor='orange'
      icon={
        estado === 'success' ? (
          <CheckCircle2 className='h-6 w-6 text-white' />
        ) : (
          <AlertTriangle className='h-6 w-6 text-white' />
        )
      }
    >
      <div className='space-y-4 px-6 py-4'>
        {/* ── ESTADO: SUCCESS ──────────────────────────── */}
        {estado === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col items-center justify-center gap-4 py-8'
          >
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/30'>
              <CheckCircle2 className='h-9 w-9 text-white' strokeWidth={2.5} />
            </div>
            <div className='text-center'>
              <p className='text-base font-bold text-gray-900 dark:text-white'>
                ¡Cambios guardados!
              </p>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                Los datos se actualizaron correctamente
              </p>
            </div>
          </motion.div>
        ) : estado === 'loading' ? (
          /* ── ESTADO: LOADING ──────────────────────────────── */
          <SectionLoadingSpinner
            label={
              sincronizando
                ? 'Sincronizando negociación...'
                : 'Guardando cambios...'
            }
            moduleName='viviendas'
            icon={RefreshCw}
            className='flex flex-col items-center justify-center gap-6 py-10'
          />
        ) : (
          /* ── ESTADO: IDLE ─────────────────────────────── */
          <div className='space-y-4'>
            {/* Cliente afectado */}
            <div className='flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-800/40 dark:bg-cyan-950/20'>
              <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-600/10 dark:bg-cyan-400/10'>
                <User className='h-5 w-5 text-cyan-700 dark:text-cyan-400' />
              </div>
              <div className='min-w-0'>
                <p className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                  Cliente con negociación activa
                </p>
                <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                  {negociacion.cliente_nombre}
                </p>
              </div>
            </div>

            {/* Comparación de valores */}
            <div className='overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700'>
              <div className='grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700'>
                {/* Valor anterior */}
                <div className='bg-red-50/50 p-3 text-center dark:bg-red-950/10'>
                  <p className='mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400'>
                    Valor anterior
                  </p>
                  <p className='text-sm font-bold tabular-nums text-gray-900 dark:text-white'>
                    {formatCurrency(valorBaseAnterior)}
                  </p>
                </div>
                {/* Valor nuevo */}
                <div className='bg-emerald-50/50 p-3 text-center dark:bg-emerald-950/10'>
                  <p className='mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400'>
                    Valor nuevo
                  </p>
                  <p className='text-sm font-bold tabular-nums text-gray-900 dark:text-white'>
                    {formatCurrency(valorBaseNuevo)}
                  </p>
                </div>
              </div>
              {/* Diferencia */}
              <div
                className={`flex items-center justify-center gap-2 py-2.5 ${
                  subio
                    ? 'border-t border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20'
                    : 'border-t border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/20'
                }`}
              >
                {subio ? (
                  <ArrowUp className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                ) : (
                  <ArrowDown className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                )}
                <span
                  className={`text-sm font-bold tabular-nums ${
                    subio
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {subio ? '+' : ''}
                  {formatCurrency(diferencia)}
                </span>
              </div>
            </div>

            {/* Datos financieros actuales */}
            <div className='space-y-1.5 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50'>
              <p className='text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                Negociación actual
              </p>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500 dark:text-gray-400'>
                  Valor negociado:
                </span>
                <span className='font-semibold tabular-nums text-gray-900 dark:text-white'>
                  {formatCurrency(negociacion.valor_negociado)}
                </span>
              </div>
              {negociacion.descuento_aplicado > 0 ? (
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Descuento:
                  </span>
                  <span className='font-semibold tabular-nums text-amber-600 dark:text-amber-400'>
                    -{formatCurrency(negociacion.descuento_aplicado)}
                  </span>
                </div>
              ) : null}
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500 dark:text-gray-400'>
                  Total abonado:
                </span>
                <span className='font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'>
                  {formatCurrency(negociacion.total_abonado)}
                </span>
              </div>
            </div>

            {/* Bloqueo */}
            {bloqueado ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800/40 dark:bg-red-950/20'
              >
                <ShieldAlert className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400' />
                <div>
                  <p className='text-sm font-bold text-red-800 dark:text-red-300'>
                    Cambio no permitido
                  </p>
                  <p className='mt-0.5 text-xs text-red-700 dark:text-red-400'>
                    {motivoBloqueo}
                  </p>
                </div>
              </motion.div>
            ) : null}

            {/* Nota informativa */}
            {!bloqueado ? (
              <div className='rounded-lg border border-blue-200/70 bg-blue-50 p-2.5 dark:border-blue-800/40 dark:bg-blue-950/20'>
                <p className='text-xs text-blue-800 dark:text-blue-300'>
                  <strong>Sincronizar</strong> actualizará el valor negociado al
                  nuevo precio. Después deberás redistribuir las fuentes de pago
                  desde la pestaña Negociación del cliente.
                </p>
              </div>
            ) : null}

            {/* Acciones */}
            <div className='flex flex-col gap-2 pt-1'>
              {!bloqueado ? (
                <>
                  {/* Opción 1: Guardar + Sincronizar */}
                  <button
                    onClick={onConfirmarConSync}
                    disabled={isBlocked}
                    className='flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700 disabled:opacity-50 dark:from-orange-700 dark:via-amber-700 dark:to-amber-800'
                  >
                    <RefreshCw className='h-4 w-4' />
                    Guardar y sincronizar negociación
                  </button>

                  {/* Opción 2: Guardar sin sincronizar */}
                  <button
                    onClick={onConfirmarSinSync}
                    disabled={isBlocked}
                    className='flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                  >
                    <DollarSign className='h-4 w-4' />
                    Solo guardar vivienda (no sincronizar)
                  </button>
                </>
              ) : null}

              {/* Cancelar */}
              <button
                onClick={onClose}
                disabled={isBlocked}
                className='flex w-full items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              >
                <XCircle className='h-4 w-4' />
                Cancelar
              </button>
            </div>
          </div>
        )}{' '}
        {/* fin ternario idle/loading/success */}
      </div>
    </Modal>
  )
}
