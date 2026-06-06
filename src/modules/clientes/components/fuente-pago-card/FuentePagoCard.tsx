/**
 * Smart Card Adaptiva para Fuentes de Pago V6 - CAMPOS DINÁMICOS
 *
 * ✨ ARQUITECTURA MODULAR:
 * - Configuración de campos desde BD (sin hardcode)
 * - CampoFormularioDinamico renderiza cualquier tipo
 * - Escalable: agregar fuentes sin cambiar código
 * - React Query para caché y tiempo real
 *
 * ✨ DISEÑO COMPACTO Y EFICIENTE:
 * - Vista compacta por defecto (info esencial en una línea)
 * - Expansión inteligente al click (todos los detalles)
 * - Estados visuales claros (completo, pendiente)
 * - Inputs reducidos (py-2) para mejor densidad
 *
 * 📋 SISTEMA DE DOCUMENTOS (MENSAJE CLARO):
 * - Si requiere carta → Mensaje informativo
 * - Usuario sabe que debe subir desde pestaña Documentos
 * - Sistema crea pendiente automático
 *
 * @version 6.0 - Sistema de Campos Dinámicos
 */

'use client'

import { memo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  DollarSign,
  Gift,
  Home,
  X,
} from 'lucide-react'

import type { TipoFuentePago } from '@/modules/clientes/types'
import { obtenerMonto } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import type { CampoConfig } from '@/modules/configuracion/types/campos-dinamicos.types'
import {
  esCreditoHipotecario,
  esCuotaInicial,
  esSubsidioCajaCompensacion,
  esSubsidioMiCasaYa,
} from '@/shared/constants/fuentes-pago.constants'

import type {
  FuentePagoConfig,
  FuentePagoErrores,
} from '../asignar-vivienda/types'

import { CampoFormularioDinamico } from './CampoFormularioDinamico'
import { useFuentePagoCard } from './useFuentePagoCard'

// ============================================
// CONFIGURACIÓN VISUAL
// ============================================

type TipoConfigItem = {
  icon: typeof DollarSign
  color: string
  bgColor: string
  borderColor: string
  descripcion: string
  requiereCarta: boolean
  requiereEntidad?: boolean // Si necesita banco o caja de compensación
  obligatorio?: boolean
}

const TIPO_CONFIG: Record<TipoFuentePago, TipoConfigItem> = {
  'Cuota Inicial': {
    icon: Home,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-300 dark:border-green-700',
    descripcion: 'Cuota inicial del cliente (pago directo)',
    requiereCarta: false,
  },
  'Crédito Hipotecario': {
    icon: Building2,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
    descripcion: 'Crédito bancario aprobado',
    requiereCarta: true,
    requiereEntidad: true, // ✅ Requiere banco
  },
  'Subsidio Mi Casa Ya': {
    icon: Gift,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
    descripcion: 'Subsidio nacional de vivienda',
    requiereCarta: true,
    requiereEntidad: false, // ❌ NO requiere banco/caja (solo número resolución)
  },
  'Subsidio Caja Compensación': {
    icon: DollarSign,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-300 dark:border-orange-700',
    descripcion: 'Subsidio de caja de compensación',
    requiereCarta: true,
    requiereEntidad: true, // ✅ Requiere caja de compensación
  },
}

// 🔥 Configuración por defecto para fuentes dinámicas desconocidas
const DEFAULT_TIPO_CONFIG: TipoConfigItem = {
  icon: DollarSign,
  color: 'text-cyan-600 dark:text-cyan-400',
  bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
  borderColor: 'border-cyan-300 dark:border-cyan-700',
  descripcion: 'Fuente de pago personalizada',
  requiereCarta: true,
  requiereEntidad: false,
  obligatorio: false,
}

/**
 * 🔥 Obtener configuración de tipo (con fallback para fuentes dinámicas)
 */
function getTipoConfig(tipo: TipoFuentePago): TipoConfigItem {
  return TIPO_CONFIG[tipo] || DEFAULT_TIPO_CONFIG
}

// ============================================
// PROPS
// ============================================

export interface FuentePagoCardProps {
  tipo: TipoFuentePago
  config: FuentePagoConfig | null
  /** ✨ Configuración dinámica de campos desde BD */
  camposConfig: CampoConfig[]
  enabled?: boolean
  valorTotal: number
  errores?: FuentePagoErrores
  clienteId: string
  clienteNombre: string
  manzana?: string
  numeroVivienda?: string
  onEnabledChange?: (enabled: boolean) => void
  onChange: (config: FuentePagoConfig | null) => void
}

// ============================================
// COMPONENTE (SMART CARD ADAPTIVA)
// ============================================

function FuentePagoCardComponent(props: FuentePagoCardProps) {
  const {
    tipo,
    config,
    camposConfig,
    valorTotal,
    errores: _errores,
    onChange,
    enabled = false,
    onEnabledChange,
  } = props

  // ✨ ESTADO DE EXPANSIÓN (se expande automáticamente al activar)
  const [isExpanded, setIsExpanded] = useState(enabled)

  // ✅ Hook con lógica de campos dinámicos
  const hook = useFuentePagoCard({
    tipo,
    config,
    camposConfig, // ← Pasar configuración de campos
    obligatorio: getTipoConfig(tipo).obligatorio || false,
    enabledProp: props.enabled,
    onEnabledChange: props.onEnabledChange,
    onChange,
  })

  const tipoConfig = getTipoConfig(tipo) // 🔥 Usar función con fallback
  const Icon = tipoConfig.icon

  // 🔥 Obtener monto usando campos dinámicos
  const monto = obtenerMonto(config, camposConfig)

  const porcentaje =
    monto > 0 && valorTotal > 0
      ? ((monto / valorTotal) * 100).toFixed(1)
      : '0.0'

  // ✨ DETERMINAR ESTADO VISUAL (solo si está enabled y configurado)
  const getEstadoVisual = () => {
    if (!enabled || monto === 0) return null // No mostrar badge si no está activa o sin monto

    // ✅ Solo validar CAMPOS (no documentos)
    const tieneEntidad =
      !tipoConfig.requiereEntidad ||
      (config?.entidad && config.entidad.trim() !== '')
    const tieneReferencia =
      esCuotaInicial(tipo) ||
      (config?.numero_referencia && config.numero_referencia.trim() !== '')

    // ✅ Si todos los campos requeridos están llenos → Badge verde "Configurado"
    if (tieneEntidad && tieneReferencia) {
      return {
        icon: CheckCircle2,
        label: 'Configurado',
        color: 'text-green-600',
        bg: 'bg-green-100',
      }
    }

    // ❌ Si faltan campos → Sin badge (o podrías mostrar "Incompleto" si prefieres)
    return null
  }

  const estadoVisual = getEstadoVisual()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-all duration-200 ${
        enabled
          ? 'border-gray-200 bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800'
          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
      }`}
    >
      {/* 🎯 VISTA COMPACTA (SIEMPRE VISIBLE) */}
      <div
        className='flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50'
        onClick={() => enabled && setIsExpanded(!isExpanded)}
      >
        {/* Left: Icono + Info Principal */}
        <div className='flex flex-1 items-center gap-3'>
          {/* Toggle Enabled */}
          {!tipoConfig.obligatorio && (
            <label
              className='relative inline-flex cursor-pointer items-center'
              onClick={e => e.stopPropagation()}
            >
              <input
                type='checkbox'
                className='peer sr-only'
                checked={enabled}
                onChange={e => {
                  const isChecked = e.target.checked
                  onEnabledChange?.(isChecked)
                  // 🔥 Si activa, expandir automáticamente
                  setIsExpanded(isChecked)
                }}
              />
              <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700"></div>
            </label>
          )}

          {/* Icono de tipo */}
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${enabled ? tipoConfig.bgColor : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <Icon
              className={`h-4 w-4 ${enabled ? tipoConfig.color : 'text-gray-500'}`}
            />
          </div>

          {/* Info principal */}
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <h4 className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
                {tipo}
                {config?.entidad && (
                  <span className='ml-1 text-xs font-normal text-gray-500'>
                    - {config.entidad}
                  </span>
                )}
              </h4>
            </div>

            {enabled && monto > 0 && (
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                ${monto.toLocaleString('es-CO')} ({porcentaje}%)
              </p>
            )}
            {!enabled && (
              <p className='text-xs text-gray-500'>
                Clic en el toggle para activar
              </p>
            )}
          </div>
        </div>

        {/* Right: Solo badge de estado */}
        <div className='flex items-center gap-2'>
          {/* Badge de estado (solo si está enabled y tiene config) */}
          {estadoVisual && (
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${estadoVisual.bg} ${estadoVisual.color}`}
            >
              <estadoVisual.icon className='h-3 w-3' />
              <span className='hidden sm:inline'>{estadoVisual.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* 🎯 VISTA EXPANDIDA (CON ANIMACIÓN) */}
      <AnimatePresence>
        {enabled && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='overflow-hidden border-t border-gray-200 dark:border-gray-700'
          >
            <div className='space-y-3 bg-gray-50/50 p-3 dark:bg-gray-700/20'>
              {/* ============================================ */}
              {/* CAMPOS DINÁMICOS DESDE BD */}
              {/* ============================================ */}

              {camposConfig
                .sort((a, b) => a.orden - b.orden) // ← Ordenar por propiedad "orden"
                .map(campoConfig => (
                  <CampoFormularioDinamico
                    key={campoConfig.nombre}
                    config={campoConfig}
                    value={hook.valores[campoConfig.nombre] || null}
                    onChange={valor =>
                      hook.handleCampoChange(campoConfig.nombre, valor)
                    }
                    onEntidadSeleccionada={hook.handleEntidadSeleccionada}
                    error={hook.errores[campoConfig.nombre]}
                  />
                ))}

              {/* Mensaje de porcentaje (solo para monto_aprobado) */}
              {!!config?.monto_aprobado && valorTotal > 0 && (
                <div className='rounded-lg border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 px-3 py-2 dark:border-cyan-800 dark:from-cyan-950/30 dark:to-blue-950/30'>
                  <p className='text-xs font-medium text-cyan-800 dark:text-cyan-200'>
                    💰 Representa el{' '}
                    <span className='font-bold'>{porcentaje}%</span> del valor
                    total (${valorTotal.toLocaleString('es-CO')})
                  </p>
                </div>
              )}

              {/* Mensaje informativo para documentación */}
              {tipoConfig.requiereCarta && (
                <div>
                  {/* Mensaje específico según tipo de fuente */}
                  <div className='rounded-lg border border-blue-200 bg-blue-50/80 p-3 dark:border-blue-800 dark:bg-blue-950/30'>
                    <div className='flex items-start gap-2'>
                      <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                      <div className='flex-1'>
                        <p className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
                          {esCreditoHipotecario(tipo) &&
                            '📄 Carta de Aprobación del Banco'}
                          {esSubsidioMiCasaYa(tipo) &&
                            '📄 Carta de Asignación del Subsidio'}
                          {esSubsidioCajaCompensacion(tipo) &&
                            '📄 Carta de Asignación de la Caja'}
                          {!esCreditoHipotecario(tipo) &&
                            !esSubsidioMiCasaYa(tipo) &&
                            !esSubsidioCajaCompensacion(tipo) &&
                            '📄 Documentación Requerida'}
                        </p>
                        <p className='mt-1 text-xs text-blue-700 dark:text-blue-300'>
                          Una vez asignada la vivienda, ve a la pestaña{' '}
                          <span className='font-semibold'>
                            &quot;Documentos&quot;
                          </span>{' '}
                          del cliente para subir{' '}
                          {esCreditoHipotecario(tipo)
                            ? 'la carta de aprobación del banco'
                            : esSubsidioMiCasaYa(tipo)
                              ? 'la carta de asignación del subsidio'
                              : esSubsidioCajaCompensacion(tipo)
                                ? 'la carta de asignación de la caja de compensación'
                                : 'la documentación requerida'}
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mostrar estado de documento si ya existe */}
                  {config?.carta_aprobacion_url && (
                    <div className='mt-2 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-2.5 dark:border-green-800 dark:bg-green-900/20'>
                      <div className='flex items-center gap-2'>
                        <CheckCircle2 className='h-4 w-4 text-green-600' />
                        <span className='text-sm font-medium text-green-800 dark:text-green-200'>
                          {esCreditoHipotecario(tipo) &&
                            'Carta del banco registrada'}
                          {esSubsidioMiCasaYa(tipo) &&
                            'Carta del subsidio registrada'}
                          {esSubsidioCajaCompensacion(tipo) &&
                            'Carta de la caja registrada'}
                          {!esCreditoHipotecario(tipo) &&
                            !esSubsidioMiCasaYa(tipo) &&
                            !esSubsidioCajaCompensacion(tipo) &&
                            'Documento registrado'}
                        </span>
                      </div>
                      <button
                        type='button'
                        onClick={hook.handleRemoveDocument}
                        className='rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900/30'
                        title='Desvincular documento'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ✅ Exportar con React.memo para optimización de rendimiento
// Solo re-renderiza si las props relevantes cambian
export const FuentePagoCard = memo(
  FuentePagoCardComponent,
  (prevProps, nextProps) => {
    // Comparación personalizada: solo re-renderizar si estas props cambian
    return (
      prevProps.tipo === nextProps.tipo &&
      prevProps.enabled === nextProps.enabled &&
      prevProps.valorTotal === nextProps.valorTotal &&
      JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config) &&
      JSON.stringify(prevProps.errores) === JSON.stringify(nextProps.errores) &&
      JSON.stringify(prevProps.camposConfig) ===
        JSON.stringify(nextProps.camposConfig) // ← Comparar configuración de campos
    )
  }
)
