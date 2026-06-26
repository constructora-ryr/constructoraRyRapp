'use client'

/**
 * AjusteCierreFinancieroModal
 *
 * Shell del modal: solo portal + estructura visual.
 * Toda la lógica de estado y validación vive en useModalAjusteState.
 */

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Home,
  Lock,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { formatCurrency } from '@/shared/utils/format'

import type { DatosAjusteCierreFinanciero } from '../hooks'

import {
  AdvertenciaDocumentos,
  FilaFuente,
  FilaNueva,
  SeccionMotivo,
  SelectorNuevoTipo,
  useModalAjusteState,
} from './rebalancear'

// ============================================
// TIPOS
// ============================================

interface AjusteCierreFinancieroModalProps {
  isOpen: boolean
  onClose: () => void
  fuentesPago: FuentePago[]
  valorVivienda: number
  tiposDisponibles: {
    nombre: string
    descripcion: string
    requiere_entidad?: boolean
    color?: string
  }[]
  tiposConfig: {
    nombre: string
    requiere_entidad?: boolean
    tipo_entidad_requerido?: string | null
  }[]
  requisitosMap: Map<string, string[]>
  entidadesPorTipoEntidad: Map<string, string[]>
  onGuardar: (datos: DatosAjusteCierreFinanciero) => void
  isGuardando: boolean
}

// ============================================
// COMPONENTE
// ============================================

export function AjusteCierreFinancieroModal({
  isOpen,
  onClose,
  fuentesPago,
  valorVivienda,
  tiposDisponibles,
  tiposConfig,
  requisitosMap,
  entidadesPorTipoEntidad,
  onGuardar,
  isGuardando,
}: AjusteCierreFinancieroModalProps) {
  const {
    ajustes,
    nuevas,
    motivo,
    notas,
    mostrandoAdvertencia,
    hasAttemptedSave,
    setMotivo,
    setNotas,
    tiposConfigMap,
    resolverEntidades,
    restriccionesMap,
    subtotal,
    diferencia,
    estaBalanceado,
    todasFuentesBloqueadas,
    sugerenciaAjuste,
    nuevasConMontoCero,
    ajustesConMontoInvalido,
    ajustesConEntidadFaltante,
    nuevasConEntidadFaltante,
    erroresRebalanceo,
    puedeGuardar,
    motivoRequiereNotas,
    fuentesExistentesQueInvalidan,
    fuentesNuevasQueNecesitanCarta,
    hayCambiosConAdvertencia,
    handleCambioMonto,
    handleCambioEntidad,
    handleToggleEliminar,
    handleAgregarTipo,
    handleCambioNueva,
    handleEliminarNueva,
    handleAplicarSugerencia,
    handleGuardar,
  } = useModalAjusteState({
    isOpen,
    fuentesPago,
    valorVivienda,
    tiposConfig,
    requisitosMap,
    entidadesPorTipoEntidad,
    onGuardar,
    isGuardando,
  })

  if (!isOpen || typeof document === 'undefined') return null

  const ocultarAgregarFuente =
    estaBalanceado && todasFuentesBloqueadas && nuevas.length === 0
  const motivoPendiente = estaBalanceado && motivo === ''

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm'
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className='fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4'
            onClick={e => e.stopPropagation()}
          >
            <div className='relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-gray-900 sm:max-w-2xl sm:rounded-2xl'>
              {/* ── Header ─────────────────────────────────── */}
              <div className='flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-5 py-4'>
                <div className='flex items-center gap-2.5'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/20'>
                    <Lock className='h-4 w-4 text-white' />
                  </div>
                  <div>
                    <h2 className='text-base font-bold leading-tight text-white'>
                      Ajustar Cierre Financiero
                    </h2>
                    <p className='mt-0.5 text-xs text-cyan-100'>
                      Solo Administrador
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={onClose}
                  className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>

              {/* ── Subheader: valor objetivo + suma de fuentes ── */}
              <div className='flex-shrink-0 border-b border-gray-200 bg-gray-50/80 px-5 py-3.5 dark:border-gray-700 dark:bg-gray-800/60'>
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/30'>
                      <Home className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
                    </div>
                    <div>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        Valor de la vivienda
                      </p>
                      <p className='text-xl font-bold tabular-nums text-gray-900 dark:text-white'>
                        {formatCurrency(valorVivienda)}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-gray-400 dark:text-gray-500'>
                      Suma de fuentes
                    </p>
                    <p
                      className={`text-lg font-bold tabular-nums ${
                        estaBalanceado
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {formatCurrency(subtotal)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Body scrollable ─────────────────────────── */}
              <div className='flex-1 space-y-3 overflow-y-auto bg-white px-5 py-4 dark:bg-gray-900'>
                {/* Fuentes existentes */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-1.5'>
                    <CreditCard className='h-3.5 w-3.5 text-gray-400 dark:text-gray-500' />
                    <p className='text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                      Fuentes configuradas
                    </p>
                  </div>
                  {ajustes.map(ajuste => {
                    const restricciones = restriccionesMap.get(ajuste.id)
                    if (!restricciones) return null
                    return (
                      <FilaFuente
                        key={ajuste.id}
                        ajuste={ajuste}
                        restricciones={restricciones}
                        onChange={handleCambioMonto}
                        onCambioEntidad={handleCambioEntidad}
                        onToggleEliminar={handleToggleEliminar}
                        requiereEntidad={
                          tiposConfigMap.get(ajuste.tipo)?.requiere_entidad ??
                          false
                        }
                        entidades={resolverEntidades(ajuste.tipo)}
                        hasMontoError={ajustesConMontoInvalido.has(ajuste.id)}
                        hasEntidadError={
                          hasAttemptedSave &&
                          ajustesConEntidadFaltante.has(ajuste.id)
                        }
                      />
                    )
                  })}
                </div>

                {/* Fuentes nuevas */}
                {nuevas.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-1.5'>
                      <Sparkles className='h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400' />
                      <p className='text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400'>
                        Nuevas fuentes
                      </p>
                    </div>
                    {nuevas.map((fuente, i) => (
                      <FilaNueva
                        key={i}
                        fuente={fuente}
                        index={i}
                        onChange={handleCambioNueva}
                        onEliminar={handleEliminarNueva}
                        requiereEntidad={
                          tiposConfigMap.get(fuente.tipo)?.requiere_entidad ??
                          false
                        }
                        entidades={resolverEntidades(fuente.tipo)}
                        hasError={nuevasConMontoCero.has(i)}
                        hasEntidadError={
                          hasAttemptedSave && nuevasConEntidadFaltante.has(i)
                        }
                      />
                    ))}
                  </div>
                )}

                {/* Picker de nueva fuente — se oculta cuando está balanceado y todas las fuentes están bloqueadas */}
                {!ocultarAgregarFuente && (
                  <SelectorNuevoTipo
                    tiposDisponibles={tiposDisponibles}
                    onAgregar={handleAgregarTipo}
                  />
                )}

                {/* Motivo y notas */}
                <SeccionMotivo
                  motivo={motivo}
                  notas={notas}
                  motivoRequiereNotas={motivoRequiereNotas}
                  onMotivoChange={setMotivo}
                  onNotasChange={setNotas}
                />
              </div>

              {/* ── Footer fijo ─────────────────────────────── */}
              <div className='flex-shrink-0 space-y-3 border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-900'>
                {/* Advertencia de documentos que se invalidarán */}
                <AdvertenciaDocumentos
                  visible={mostrandoAdvertencia}
                  fuentesExistentes={fuentesExistentesQueInvalidan}
                  fuentesNuevas={fuentesNuevasQueNecesitanCarta}
                />

                {/* Errores de validación de montos mínimos */}
                {erroresRebalanceo.filter(e => e.campo !== 'balance').length >
                  0 && (
                  <div className='space-y-1'>
                    {erroresRebalanceo
                      .filter(e => e.campo !== 'balance')
                      .map(err => (
                        <p
                          key={err.campo}
                          className='flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400'
                        >
                          <AlertTriangle className='h-3.5 w-3.5 flex-shrink-0' />
                          {err.mensaje}
                        </p>
                      ))}
                  </div>
                )}

                {/* Auto-sugerencia */}
                {!estaBalanceado && sugerenciaAjuste && (
                  <div className='flex items-start gap-2.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3.5 py-2.5 dark:border-cyan-700/50 dark:bg-cyan-900/20'>
                    <Wand2 className='mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400' />
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-semibold text-cyan-700 dark:text-cyan-300'>
                        Ajuste sugerido
                      </p>
                      <p className='mt-0.5 text-xs text-cyan-600 dark:text-cyan-400'>
                        Reducir <strong>{sugerenciaAjuste.tipo}</strong> en{' '}
                        <strong>{formatCurrency(Math.abs(diferencia))}</strong>{' '}
                        cuadra el cierre financiero.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={handleAplicarSugerencia}
                      className='shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600'
                    >
                      Aplicar
                    </button>
                  </div>
                )}

                {/* Indicador de balance */}
                {estaBalanceado ? (
                  <div className='flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 dark:border-emerald-800/60 dark:bg-emerald-900/20'>
                    <CheckCircle2 className='h-3.5 w-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400' />
                    <span className='flex-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300'>
                      Ecuación balanceada
                    </span>
                    <span className='text-xs tabular-nums text-emerald-600/70 dark:text-emerald-400/70'>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                ) : (
                  <div className='flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 dark:border-red-800/60 dark:bg-red-900/20'>
                    <AlertTriangle className='h-4 w-4 flex-shrink-0 text-red-500 dark:text-red-400' />
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <span className='text-xs font-semibold text-red-600 dark:text-red-400'>
                          {diferencia > 0
                            ? `Déficit: ${formatCurrency(Math.abs(diferencia))}`
                            : `Excedente: ${formatCurrency(Math.abs(diferencia))}`}
                        </span>
                        <span className='text-xs tabular-nums text-gray-400'>
                          {formatCurrency(subtotal)} /{' '}
                          {formatCurrency(valorVivienda)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Indicador pendiente: motivo faltante cuando el balance ya está OK */}
                {motivoPendiente && (
                  <p className='flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400'>
                    <AlertTriangle className='h-3 w-3 flex-shrink-0' />
                    Selecciona un motivo para poder guardar
                  </p>
                )}

                {/* Acciones */}
                <div className='flex items-center gap-2.5'>
                  <button
                    type='button'
                    onClick={onClose}
                    disabled={isGuardando}
                    className='flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700/40'
                  >
                    Cancelar
                  </button>
                  <button
                    type='button'
                    onClick={handleGuardar}
                    disabled={!puedeGuardar}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      puedeGuardar
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-700 hover:to-blue-700'
                        : 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700/40 dark:text-gray-500'
                    }`}
                  >
                    {isGuardando
                      ? 'Guardando...'
                      : mostrandoAdvertencia && hayCambiosConAdvertencia
                        ? 'Entendido, guardar'
                        : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
