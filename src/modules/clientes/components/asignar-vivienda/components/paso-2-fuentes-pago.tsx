'use client'

import { useCallback, useMemo } from 'react'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Info,
  Loader2,
} from 'lucide-react'

import { FuentePagoCard } from '@/modules/clientes/components/fuente-pago-card'
import { pageStyles as s } from '@/modules/clientes/pages/asignar-vivienda/styles'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { obtenerMonto } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'

import type {
  FuentePagoConfig,
  FuentePagoConfiguracion,
  FuentePagoErrores,
} from '../types'

interface Paso2FuentesPagoProps {
  // 🔥 Estado de carga
  cargandoTipos?: boolean
  fuentes: FuentePagoConfiguracion[]
  valorTotal: number
  totalFuentes: number
  diferencia: number
  sumaCierra: boolean
  erroresFuentes?: Record<TipoFuentePago, FuentePagoErrores>
  mostrarErrores?: boolean
  clienteId: string
  clienteNombre: string
  manzana?: string
  numeroVivienda?: string
  onFuenteEnabledChange: (tipo: TipoFuentePago, enabled: boolean) => void
  onFuenteConfigChange: (
    tipo: TipoFuentePago,
    config: FuentePagoConfig | null
  ) => void
}

export function Paso2FuentesPago({
  cargandoTipos = false,
  fuentes,
  valorTotal,
  totalFuentes,
  diferencia,
  sumaCierra,
  erroresFuentes,
  mostrarErrores = false,
  clienteId,
  clienteNombre,
  manzana,
  numeroVivienda,
  onFuenteEnabledChange,
  onFuenteConfigChange,
}: Paso2FuentesPagoProps) {
  // ============================================
  // REACT QUERY: CARGAR CONFIGURACIÓN DE CAMPOS
  // ============================================

  const { data: tiposConCampos = [], isLoading: cargandoCampos } =
    useTiposFuentesConCampos()

  // Paleta de colores para la barra de distribución (por índice)
  const FUENTE_COLORS = [
    {
      bar: 'bg-blue-500',
      dot: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
    },
    {
      bar: 'bg-green-500',
      dot: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400',
    },
    {
      bar: 'bg-amber-500',
      dot: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
    },
    {
      bar: 'bg-purple-500',
      dot: 'bg-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
    },
  ]

  // Fuentes activas con su monto calculado para la barra de distribución
  const fuentesConMonto = useMemo(() => {
    return fuentes
      .filter(f => f.enabled && f.config !== null)
      .map(f => {
        const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
        const camposConfig = tipoConCampos?.configuracion_campos?.campos || []
        const monto = obtenerMonto(f.config, camposConfig)
        return { tipo: f.tipo, monto }
      })
      .filter(f => f.monto > 0)
  }, [fuentes, tiposConCampos])

  // ✅ Memoizar callbacks para evitar re-renders innecesarios
  const handleEnabledChange = useCallback(
    (tipo: TipoFuentePago) => {
      return (enabled: boolean) => onFuenteEnabledChange(tipo, enabled)
    },
    [onFuenteEnabledChange]
  )

  const handleConfigChange = useCallback(
    (tipo: TipoFuentePago) => {
      return (config: FuentePagoConfig | null) =>
        onFuenteConfigChange(tipo, config)
    },
    [onFuenteConfigChange]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className='space-y-3'
    >
      {/* Información Guía */}
      <div className='rounded-lg border border-purple-200/50 bg-gradient-to-br from-purple-50/90 to-indigo-50/90 p-2.5 shadow-lg backdrop-blur-xl dark:border-purple-800/50 dark:from-purple-950/30 dark:to-indigo-950/30'>
        <p className='text-xs leading-relaxed text-purple-800 dark:text-purple-200'>
          <span className='font-bold'>💰 Instrucciones:</span> Activa y
          configura las <span className='font-semibold'>fuentes de pago</span>{' '}
          que el cliente utilizará para cubrir el valor total de la vivienda. La
          suma de todas las fuentes debe ser exactamente{' '}
          <span className='font-semibold'>
            ${valorTotal.toLocaleString('es-CO')}
          </span>
          . Puedes combinar cuota inicial, crédito hipotecario y subsidios.
        </p>
      </div>

      {/* 🔥 Estado de carga de fuentes desde BD */}
      {(cargandoTipos || cargandoCampos) && (
        <div className='rounded-lg border border-cyan-200/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-cyan-800/50 dark:bg-gray-800/80'>
          <div className='flex items-center gap-3'>
            <Loader2 className='h-5 w-5 animate-spin text-cyan-500' />
            <p className='text-sm font-medium text-cyan-700 dark:text-cyan-300'>
              {cargandoTipos
                ? 'Cargando fuentes de pago activas desde el sistema...'
                : 'Cargando configuración de campos dinámicos...'}
            </p>
          </div>
        </div>
      )}

      {/* 🔥 Lista dinámica de fuentes */}
      {!cargandoTipos && fuentes.length === 0 && (
        <div className='rounded-lg border border-yellow-200/50 bg-yellow-50/90 p-4 shadow-lg backdrop-blur-xl dark:border-yellow-800/50 dark:bg-yellow-950/30'>
          <p className='text-sm text-yellow-800 dark:text-yellow-200'>
            ⚠️ No hay fuentes de pago activas configuradas. Contacta al
            administrador.
          </p>
        </div>
      )}

      {!cargandoTipos && !cargandoCampos && fuentes.length > 0 && (
        <div className='space-y-3'>
          {/* Barra de distribución de financiamiento */}
          {fuentesConMonto.length > 0 && (
            <div className='rounded-lg border border-gray-200/50 bg-white/80 p-3 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='text-xs font-semibold text-gray-600 dark:text-gray-400'>
                  Distribución del financiamiento
                </span>
                <span
                  className={`text-xs font-bold ${
                    sumaCierra
                      ? 'text-green-600 dark:text-green-400'
                      : totalFuentes > 0
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-gray-400'
                  }`}
                >
                  ${totalFuentes.toLocaleString('es-CO')} / $
                  {valorTotal.toLocaleString('es-CO')}
                  {sumaCierra ? ' ✓' : ''}
                </span>
              </div>
              {/* Segmentos proporcionales */}
              <div className='flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-900/60'>
                {fuentesConMonto.map((f, i) => (
                  <motion.div
                    key={f.tipo}
                    className={`h-full rounded-sm ${FUENTE_COLORS[i % FUENTE_COLORS.length].bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(f.monto / valorTotal) * 100}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                ))}
              </div>
              {/* Leyenda */}
              <div className='mt-2 flex flex-wrap gap-x-4 gap-y-0.5'>
                {fuentesConMonto.map((f, i) => (
                  <div key={f.tipo} className='flex items-center gap-1.5'>
                    <div
                      className={`h-2 w-2 flex-shrink-0 rounded-sm ${FUENTE_COLORS[i % FUENTE_COLORS.length].dot}`}
                    />
                    <span className='text-[10px] text-gray-500 dark:text-gray-400'>
                      {f.tipo}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${FUENTE_COLORS[i % FUENTE_COLORS.length].text}`}
                    >
                      {((f.monto / valorTotal) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fuentes.map(fuente => {
            // ✅ Obtener configuración de campos para este tipo
            const tipoConCampos = tiposConCampos.find(
              t => t.nombre === fuente.tipo
            )
            const camposConfig =
              tipoConCampos?.configuracion_campos?.campos || []

            return (
              <FuentePagoCard
                key={fuente.tipo}
                tipo={fuente.tipo}
                config={fuente.config}
                camposConfig={camposConfig} // ← Pasar configuración dinámica
                enabled={fuente.enabled}
                valorTotal={valorTotal}
                errores={
                  mostrarErrores ? erroresFuentes?.[fuente.tipo] : undefined
                }
                clienteId={clienteId}
                clienteNombre={clienteNombre}
                manzana={manzana}
                numeroVivienda={numeroVivienda}
                onEnabledChange={handleEnabledChange(fuente.tipo)}
                onChange={handleConfigChange(fuente.tipo)}
              />
            )
          })}
        </div>
      )}

      <div
        className={`rounded-xl border-2 p-4 backdrop-blur-xl transition-all ${
          sumaCierra
            ? 'border-green-500 bg-gradient-to-br from-green-50/90 to-emerald-50/90 shadow-lg shadow-green-500/10 dark:from-green-950/30 dark:to-emerald-950/30'
            : totalFuentes > 0
              ? 'border-red-500 bg-gradient-to-br from-red-50/90 to-rose-50/90 shadow-lg shadow-red-500/10 dark:from-red-950/30 dark:to-rose-950/30'
              : 'border-gray-200 bg-white/80 shadow-xl dark:border-gray-700 dark:bg-gray-800/80'
        }`}
      >
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300'>
              <DollarSign className='h-4 w-4' />
              Total Fuentes de Pago
            </span>
            <span
              className={`text-lg font-bold ${
                sumaCierra
                  ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent'
                  : totalFuentes > 0
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent'
                    : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              ${totalFuentes.toLocaleString('es-CO')}
            </span>
          </div>

          <div className='h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600' />

          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
              Diferencia
            </span>
            <span
              className={`text-lg font-bold ${
                sumaCierra
                  ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent'
              }`}
            >
              ${diferencia.toLocaleString('es-CO')}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              sumaCierra
                ? s.alert.success
                : totalFuentes > 0
                  ? s.alert.error
                  : s.alert.info
            }
          >
            {sumaCierra ? (
              <>
                <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400' />
                <div>
                  <p className='text-sm font-bold text-green-800 dark:text-green-200'>
                    ¡Perfecto! Las fuentes cubren exactamente el valor total
                  </p>
                  <p className='mt-1 text-xs text-green-700 dark:text-green-300'>
                    Puedes continuar al siguiente paso
                  </p>
                </div>
              </>
            ) : totalFuentes > 0 ? (
              <>
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400' />
                <div>
                  <p className='text-sm font-bold text-red-800 dark:text-red-200'>
                    Las fuentes no coinciden con el valor total
                  </p>
                  <p className='mt-1 text-xs text-red-700 dark:text-red-300'>
                    {diferencia > 0
                      ? `Falta cubrir $${diferencia.toLocaleString('es-CO')}`
                      : `Sobra $${Math.abs(diferencia).toLocaleString('es-CO')}`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Info className='mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-600 dark:text-cyan-400' />
                <div>
                  <p className='text-sm font-bold text-cyan-800 dark:text-cyan-200'>
                    Activa y configura las fuentes de pago necesarias
                  </p>
                  <p className='mt-1 text-xs text-cyan-700 dark:text-cyan-300'>
                    La suma debe ser exactamente $
                    {valorTotal.toLocaleString('es-CO')}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
