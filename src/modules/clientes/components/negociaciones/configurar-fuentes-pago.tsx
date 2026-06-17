/**
 * Componente Configurar Fuentes de Pago
 *
 * Gestiona las 4 fuentes de pago para completar el valor de la negociación:
 * 1. Cuota Inicial (permite múltiples abonos)
 * 2. Crédito Hipotecario (pago único)
 * 3. Subsidio Mi Casa Ya (pago único)
 * 4. Subsidio Caja de Compensación (pago único)
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
 * ⭐ REFACTORIZADO: Usa hook useConfigurarFuentesPago para lógica
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  BadgeDollarSign,
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  HandCoins,
  Home,
  Info,
  Landmark,
  Loader2,
  Plus,
  Save,
  Shield,
  Trash2,
  Wallet,
} from 'lucide-react'

import { CreditoConstructoraForm } from '@/modules/fuentes-pago/components/CreditoConstructoraForm'
import { SectionLoadingSpinner } from '@/shared/components/ui'
import {
  esCreditoHipotecario,
  esCuotaInicial,
  esSubsidioCajaCompensacion,
  esSubsidioMiCasaYa,
} from '@/shared/constants/fuentes-pago.constants'

import { useConfigurarFuentesPago } from '../../hooks'
import type { TipoFuentePagoCatalogo } from '../../services/tipos-fuentes-pago.service'

interface ConfigurarFuentesPagoProps {
  negociacionId: string
  valorTotal: number
  onFuentesActualizadas?: () => void
}

// Mapeo icono (string de BD) → componente Lucide.
// El admin elige el icono desde el panel de configuración; se refleja aqui automaticamente.
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet,
  Building2,
  Home,
  Shield,
  CreditCard,
  Landmark,
  BadgeDollarSign,
  DollarSign,
  Banknote,
  HandCoins,
}

// Mapeo color (string de BD) → clases Tailwind.
// Mismo patrón que en TiposFuentesPagoLista del módulo de configuración.
const COLOR_CLASSES: Record<
  string,
  {
    bgLight: string
    bgDark: string
    textLight: string
    textDark: string
    borderLight: string
    borderDark: string
  }
> = {
  purple: {
    bgLight: 'bg-purple-50',
    bgDark: 'bg-purple-900/20',
    textLight: 'text-purple-600',
    textDark: 'text-purple-400',
    borderLight: 'border-purple-200',
    borderDark: 'border-purple-700',
  },
  blue: {
    bgLight: 'bg-blue-50',
    bgDark: 'bg-blue-900/20',
    textLight: 'text-blue-600',
    textDark: 'text-blue-400',
    borderLight: 'border-blue-200',
    borderDark: 'border-blue-700',
  },
  green: {
    bgLight: 'bg-green-50',
    bgDark: 'bg-green-900/20',
    textLight: 'text-green-600',
    textDark: 'text-green-400',
    borderLight: 'border-green-200',
    borderDark: 'border-green-700',
  },
  orange: {
    bgLight: 'bg-orange-50',
    bgDark: 'bg-orange-900/20',
    textLight: 'text-orange-600',
    textDark: 'text-orange-400',
    borderLight: 'border-orange-200',
    borderDark: 'border-orange-700',
  },
  cyan: {
    bgLight: 'bg-cyan-50',
    bgDark: 'bg-cyan-900/20',
    textLight: 'text-cyan-600',
    textDark: 'text-cyan-400',
    borderLight: 'border-cyan-200',
    borderDark: 'border-cyan-700',
  },
  red: {
    bgLight: 'bg-red-50',
    bgDark: 'bg-red-900/20',
    textLight: 'text-red-600',
    textDark: 'text-red-400',
    borderLight: 'border-red-200',
    borderDark: 'border-red-700',
  },
  pink: {
    bgLight: 'bg-pink-50',
    bgDark: 'bg-pink-900/20',
    textLight: 'text-pink-600',
    textDark: 'text-pink-400',
    borderLight: 'border-pink-200',
    borderDark: 'border-pink-700',
  },
  indigo: {
    bgLight: 'bg-indigo-50',
    bgDark: 'bg-indigo-900/20',
    textLight: 'text-indigo-600',
    textDark: 'text-indigo-400',
    borderLight: 'border-indigo-200',
    borderDark: 'border-indigo-700',
  },
  yellow: {
    bgLight: 'bg-yellow-50',
    bgDark: 'bg-yellow-900/20',
    textLight: 'text-yellow-600',
    textDark: 'text-yellow-400',
    borderLight: 'border-yellow-200',
    borderDark: 'border-yellow-700',
  },
  emerald: {
    bgLight: 'bg-emerald-50',
    bgDark: 'bg-emerald-900/20',
    textLight: 'text-emerald-600',
    textDark: 'text-emerald-400',
    borderLight: 'border-emerald-200',
    borderDark: 'border-emerald-700',
  },
  teal: {
    bgLight: 'bg-teal-50',
    bgDark: 'bg-teal-900/20',
    textLight: 'text-teal-600',
    textDark: 'text-teal-400',
    borderLight: 'border-teal-200',
    borderDark: 'border-teal-700',
  },
}

const COLORS_FALLBACK = {
  bgLight: 'bg-gray-50',
  bgDark: 'bg-gray-900/20',
  textLight: 'text-gray-600',
  textDark: 'text-gray-400',
  borderLight: 'border-gray-200',
  borderDark: 'border-gray-700',
}

/**
 * Deriva icono + colores desde los campos BD del tipo.
 * El admin controla `icono` y `color` desde el panel de configuración;
 * cualquier cambio ahi se refleja aquí sin modificar código.
 */
function getVisualConfig(tipo: TipoFuentePagoCatalogo) {
  const icon = ((tipo.icono && ICON_MAP[tipo.icono]) ??
    DollarSign) as React.ComponentType<{ className?: string }>
  const colors = (tipo.color && COLOR_CLASSES[tipo.color]) ?? COLORS_FALLBACK
  return { icon, ...colors }
}

export function ConfigurarFuentesPago({
  negociacionId,
  valorTotal,
  onFuentesActualizadas,
}: ConfigurarFuentesPagoProps) {
  // =====================================================
  // HOOK: Toda la lógica está en useConfigurarFuentesPago
  // =====================================================
  const {
    fuentesPago,
    cargando,
    cargandoTipos,
    tiposDisponibles,
    guardando,
    error,
    totales,
    cierreCompleto,
    porcentajeCubierto,
    agregarFuente,
    actualizarFuente,
    eliminarFuente,
    guardarFuentes,
  } = useConfigurarFuentesPago({
    negociacionId,
    valorTotal,
    onFuentesActualizadas,
  })

  // =====================================================
  // RENDER
  // =====================================================

  if (cargando) {
    return (
      <SectionLoadingSpinner
        label='Cargando configuración...'
        moduleName='negociaciones'
        icon={Wallet}
      />
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white'>
        <div className='flex items-start justify-between'>
          <div>
            <h2 className='text-2xl font-bold'>Configurar Fuentes de Pago</h2>
            <p className='mt-2 text-purple-100'>
              Configura las fuentes de pago para completar el valor de la
              negociación
            </p>
          </div>
        </div>

        {/* Resumen de valores */}
        <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='rounded-lg bg-white/10 p-4 backdrop-blur-sm'>
            <p className='text-sm text-purple-100'>Valor Total Negociación</p>
            <p className='mt-1 text-2xl font-bold'>
              ${valorTotal.toLocaleString('es-CO')}
            </p>
          </div>
          <div className='rounded-lg bg-white/10 p-4 backdrop-blur-sm'>
            <p className='text-sm text-purple-100'>Total Fuentes</p>
            <p className='mt-1 text-2xl font-bold'>
              ${totales.total.toLocaleString('es-CO')}
            </p>
            <p className='mt-1 text-xs text-purple-200'>
              {porcentajeCubierto.toFixed(1)}% cubierto
            </p>
          </div>
          <div className='rounded-lg bg-white/10 p-4 backdrop-blur-sm'>
            <p className='text-sm text-purple-100'>
              {totales.diferencia > 0
                ? 'Falta'
                : totales.diferencia < 0
                  ? 'Exceso'
                  : 'Completo'}
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                cierreCompleto
                  ? 'text-green-300'
                  : totales.diferencia > 0
                    ? 'text-yellow-300'
                    : 'text-red-300'
              }`}
            >
              ${Math.abs(totales.diferencia).toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className='mt-4'>
          <div className='h-3 overflow-hidden rounded-full bg-white/20'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(porcentajeCubierto, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full ${
                cierreCompleto
                  ? 'bg-green-400'
                  : porcentajeCubierto > 100
                    ? 'bg-red-400'
                    : 'bg-yellow-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Botones para agregar fuentes */}
      <div>
        <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
          <Plus className='h-5 w-5' />
          Agregar Fuente de Pago
        </h3>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4'>
          {cargandoTipos ? (
            <div className='col-span-full flex items-center justify-center gap-2 py-4 text-sm text-gray-500 dark:text-gray-400'>
              <Loader2 className='h-5 w-5 animate-spin' />
              Cargando fuentes disponibles...
            </div>
          ) : tiposDisponibles.length === 0 ? (
            <div className='col-span-full rounded-xl border-2 border-dashed border-gray-200 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400'>
              No hay fuentes de pago configuradas en el sistema.
            </div>
          ) : (
            tiposDisponibles.map(tipo => {
              const visual = getVisualConfig(tipo)
              const Icon = visual.icon
              const yaExiste = fuentesPago.some(f => f.tipo === tipo.nombre)
              const deshabilitado = yaExiste && !tipo.permite_multiples_abonos

              return (
                <button
                  key={tipo.id}
                  onClick={() =>
                    agregarFuente(tipo.nombre, tipo.permite_multiples_abonos)
                  }
                  disabled={deshabilitado}
                  className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                    deshabilitado
                      ? 'cursor-not-allowed opacity-50'
                      : `${visual.borderLight} hover:shadow-lg dark:${visual.borderDark} hover:scale-[1.02]`
                  }`}
                >
                  <div
                    className={`${visual.bgLight} dark:${visual.bgDark} absolute inset-0 opacity-50`}
                  />
                  <div className='relative'>
                    <Icon
                      className={`h-8 w-8 ${visual.textLight} dark:${visual.textDark} mb-2`}
                    />
                    <p
                      className={`font-semibold ${visual.textLight} dark:${visual.textDark}`}
                    >
                      {tipo.nombre}
                    </p>
                    <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                      {tipo.descripcion ?? ''}
                    </p>
                    {deshabilitado && (
                      <p className='mt-2 text-xs font-medium text-red-600 dark:text-red-400'>
                        Ya agregado
                      </p>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Lista de fuentes agregadas */}
      {fuentesPago.length > 0 && (
        <div>
          <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
            <BadgeDollarSign className='h-5 w-5' />
            Fuentes Configuradas ({fuentesPago.length})
          </h3>
          <div className='space-y-4'>
            <AnimatePresence mode='popLayout'>
              {fuentesPago.map((fuente, index) => {
                const tipoConfig = tiposDisponibles.find(
                  t => t.nombre === fuente.tipo
                )
                const visual = tipoConfig
                  ? getVisualConfig(tipoConfig)
                  : { icon: DollarSign, ...COLORS_FALLBACK }
                const Icon = visual.icon

                return (
                  <motion.div
                    key={`${fuente.tipo}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`rounded-xl border-2 ${visual.borderLight} dark:${visual.borderDark} overflow-hidden bg-white dark:bg-gray-800`}
                  >
                    {/* Header de la fuente */}
                    <div
                      className={`${visual.bgLight} dark:${visual.bgDark} flex items-center justify-between p-4`}
                    >
                      <div className='flex items-center gap-3'>
                        <Icon
                          className={`h-6 w-6 ${visual.textLight} dark:${visual.textDark}`}
                        />
                        <div>
                          <p
                            className={`font-semibold ${visual.textLight} dark:${visual.textDark}`}
                          >
                            {fuente.tipo}
                          </p>
                          {tipoConfig?.permite_multiples_abonos && (
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Abono #
                              {fuentesPago
                                .filter(f => f.tipo === fuente.tipo)
                                .indexOf(fuente) + 1}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarFuente(index)}
                        className='rounded-lg bg-red-500/10 p-2 text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400'
                      >
                        <Trash2 className='h-5 w-5' />
                      </button>
                    </div>

                    {/* Formulario */}
                    <div className='space-y-4 p-4'>
                      {/* Monto (Cuota Inicial) o Monto Aprobado (otras fuentes)
                          Para créditos con la constructora: es read-only (calculado por CreditoConstructoraForm) */}
                      {!tipoConfig?.logica_negocio?.genera_cuotas && (
                        <div>
                          <label className='mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                            <DollarSign className='h-4 w-4 text-purple-500' />
                            {esCuotaInicial(fuente.tipo)
                              ? 'Monto'
                              : 'Monto Aprobado'}{' '}
                            <span className='text-red-500'>*</span>
                          </label>
                          <div className='relative'>
                            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400'>
                              $
                            </span>
                            <input
                              type='text'
                              value={
                                fuente.monto_aprobado
                                  ? fuente.monto_aprobado.toLocaleString(
                                      'es-CO'
                                    )
                                  : ''
                              }
                              onChange={e => {
                                const valor = e.target.value
                                  .replace(/\./g, '')
                                  .replace(/,/g, '')
                                const numero = Number(valor)
                                if (!isNaN(numero)) {
                                  actualizarFuente(
                                    index,
                                    'monto_aprobado',
                                    numero
                                  )
                                }
                              }}
                              placeholder='0'
                              className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 pl-8 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                            />
                          </div>
                          {esCuotaInicial(fuente.tipo) ? (
                            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                              Dinero que el cliente ya tiene disponible
                            </p>
                          ) : null}
                        </div>
                      )}

                      {/* Crédito con la Constructora — form de amortización */}
                      {tipoConfig?.logica_negocio?.genera_cuotas && (
                        <CreditoConstructoraForm
                          parametrosIniciales={fuente.parametrosCredito}
                          onActualizar={(campo, valor) =>
                            actualizarFuente(index, campo, valor)
                          }
                        />
                      )}

                      {/* Entidad (si se requiere) */}
                      {tipoConfig?.requiere_entidad && (
                        <div>
                          <label className='mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                            <Building2 className='h-4 w-4 text-purple-500' />
                            {esCreditoHipotecario(fuente.tipo)
                              ? 'Banco'
                              : 'Entidad'}{' '}
                            {tipoConfig?.requiere_entidad && (
                              <span className='text-red-500'>*</span>
                            )}
                          </label>
                          {esCreditoHipotecario(fuente.tipo) ? (
                            <select
                              value={fuente.entidad || ''}
                              onChange={e =>
                                actualizarFuente(
                                  index,
                                  'entidad',
                                  e.target.value
                                )
                              }
                              className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                            >
                              <option value=''>Selecciona un banco</option>
                              <option value='Bancolombia'>Bancolombia</option>
                              <option value='Banco de Bogotá'>
                                Banco de Bogotá
                              </option>
                              <option value='Banco Agrario'>
                                Banco Agrario
                              </option>
                              <option value='Fondo Nacional del Ahorro'>
                                Fondo Nacional del Ahorro
                              </option>
                              <option value='BBVA'>BBVA</option>
                              <option value='Banco Caja Social'>
                                Banco Caja Social
                              </option>
                              <option value='Banco Popular'>
                                Banco Popular
                              </option>
                            </select>
                          ) : esSubsidioCajaCompensacion(fuente.tipo) ? (
                            <select
                              value={fuente.entidad || ''}
                              onChange={e =>
                                actualizarFuente(
                                  index,
                                  'entidad',
                                  e.target.value
                                )
                              }
                              className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                            >
                              <option value=''>
                                Selecciona una caja de compensación
                              </option>
                              <option value='COMFANDI'>COMFANDI</option>
                              <option value='COMFENALCO VALLE'>
                                COMFENALCO VALLE
                              </option>
                              <option value='COMFAMILIAR HUILA'>
                                COMFAMILIAR HUILA
                              </option>
                              <option value='COMFACAUCA'>COMFACAUCA</option>
                              <option value='COMFENALCO ANTIOQUIA'>
                                COMFENALCO ANTIOQUIA
                              </option>
                              <option value='COMPENSAR'>COMPENSAR</option>
                              <option value='COLSUBSIDIO'>COLSUBSIDIO</option>
                            </select>
                          ) : (
                            <input
                              type='text'
                              value={fuente.entidad || ''}
                              onChange={e =>
                                actualizarFuente(
                                  index,
                                  'entidad',
                                  e.target.value
                                )
                              }
                              placeholder='Nombre de la entidad'
                              className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                            />
                          )}
                        </div>
                      )}

                      {/* Número de Referencia (solo para fuentes que NO son Cuota Inicial) */}
                      {fuente.tipo !== 'Cuota Inicial' && (
                        <div>
                          <label className='mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                            <CreditCard className='h-4 w-4 text-purple-500' />
                            {esSubsidioCajaCompensacion(fuente.tipo) ||
                            esSubsidioMiCasaYa(fuente.tipo)
                              ? 'N° Acta'
                              : 'Número de Referencia'}
                          </label>
                          <input
                            type='text'
                            value={fuente.numero_referencia || ''}
                            onChange={e =>
                              actualizarFuente(
                                index,
                                'numero_referencia',
                                e.target.value
                              )
                            }
                            placeholder={
                              esSubsidioCajaCompensacion(fuente.tipo) ||
                              esSubsidioMiCasaYa(fuente.tipo)
                                ? 'Ej: 340'
                                : 'Ej: CRED-2024-001'
                            }
                            className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                          />
                        </div>
                      )}

                      {/* Fecha del Acta (solo para Caja de Compensación y Mi Casa Ya) */}
                      {(esSubsidioCajaCompensacion(fuente.tipo) ||
                        esSubsidioMiCasaYa(fuente.tipo)) && (
                        <div>
                          <label className='mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                            <CreditCard className='h-4 w-4 text-purple-500' />
                            Fecha del Acta
                          </label>
                          <input
                            type='date'
                            value={fuente.fecha_acta || ''}
                            onChange={e =>
                              actualizarFuente(
                                index,
                                'fecha_acta',
                                e.target.value || null
                              )
                            }
                            className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-900/20'
        >
          <AlertCircle className='h-5 w-5 flex-shrink-0 text-red-500' />
          <div>
            <p className='font-medium text-red-900 dark:text-red-100'>Error</p>
            <p className='mt-1 text-sm text-red-700 dark:text-red-300'>
              {error}
            </p>
          </div>
        </motion.div>
      )}

      {/* Estado de las fuentes */}
      {fuentesPago.length > 0 && (
        <div
          className={`rounded-xl border-2 p-4 ${
            cierreCompleto
              ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
              : 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
          }`}
        >
          <div className='flex items-start gap-3'>
            {cierreCompleto ? (
              <CheckCircle2 className='h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400' />
            ) : (
              <Info className='h-6 w-6 flex-shrink-0 text-yellow-600 dark:text-yellow-400' />
            )}
            <div className='flex-1'>
              <p
                className={`font-semibold ${
                  cierreCompleto
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-yellow-900 dark:text-yellow-100'
                }`}
              >
                {cierreCompleto
                  ? '¡Fuentes de Pago Completas!'
                  : 'Configuración Incompleta'}
              </p>
              <p
                className={`mt-1 text-sm ${
                  cierreCompleto
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}
              >
                {cierreCompleto
                  ? 'Las fuentes de pago cubren el 100% del valor de la negociación.'
                  : `La suma de las fuentes debe ser igual al valor total (${
                      totales.diferencia > 0 ? 'falta' : 'excede'
                    } $${Math.abs(totales.diferencia).toLocaleString('es-CO')})`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón de acción */}
      {fuentesPago.length > 0 && (
        <div className='flex justify-end'>
          <button
            onClick={guardarFuentes}
            disabled={guardando}
            className='rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
          >
            {guardando ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 className='h-5 w-5 animate-spin' />
                Guardando...
              </span>
            ) : (
              <span className='flex items-center justify-center gap-2'>
                <Save className='h-5 w-5' />
                Guardar Fuentes
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
