/**
 * Página: Configuración de Fuentes de Pago
 *
 * Panel de administración para configurar campos dinámicos
 * de cada tipo de fuente de pago.
 *
 * Ruta: /admin/configuracion/fuentes-pago
 *
 * @version 1.0 - Diseño Compacto Premium
 */

'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  BadgeDollarSign,
  Banknote,
  Building2,
  CreditCard,
  DollarSign,
  HandCoins,
  Home,
  Landmark,
  Settings,
  Shield,
  Sparkles,
  Wallet,
} from 'lucide-react'

import { configuradorStyles as s } from '@/modules/configuracion/components/configurador-campos/configurador-campos.styles'
import { ConfiguradorCamposModal } from '@/modules/configuracion/components/configurador-campos/ConfiguradorCamposModal'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'
import type { TipoFuentePagoConCampos } from '@/modules/configuracion/types/campos-dinamicos.types'
import { Cargador } from '@/shared/components/carga'

// ============================================
// ICONOS DINÁMICOS (TODOS LOS DISPONIBLES)
// ============================================

const ICONOS_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
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

function obtenerIcono(nombreIcono: string) {
  return ICONOS_MAP[nombreIcono] || DollarSign // Fallback a DollarSign si no existe
}

// ============================================
// COLOR MAP: CSS name → hex (para gradientes y alpha)
// ============================================

const COLOR_HEX_MAP: Record<string, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  orange: '#f97316',
  purple: '#a855f7',
  red: '#ef4444',
  cyan: '#06b6d4',
  pink: '#ec4899',
  indigo: '#6366f1',
  yellow: '#eab308',
  emerald: '#10b981',
}

function toHex(color: string) {
  return COLOR_HEX_MAP[color] ?? color
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function FuentesPagoConfigPage() {
  // ============================================
  // ESTADO
  // ============================================

  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipoSeleccionado, setTipoSeleccionado] =
    useState<TipoFuentePagoConCampos | null>(null)

  // ============================================
  // REACT QUERY
  // ============================================

  const {
    data: tipos = [],
    isLoading,
    isError,
    error,
  } = useTiposFuentesConCampos()

  // ============================================
  // HANDLERS
  // ============================================

  const handleAbrirConfigurador = (tipo: TipoFuentePagoConCampos) => {
    setTipoSeleccionado(tipo)
    setModalAbierto(true)
  }

  const handleCerrarConfigurador = () => {
    setModalAbierto(false)
    setTipoSeleccionado(null)
  }

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div className={s.page.container}>
      <div className={s.page.content}>
        {/* ============================================ */}
        {/* HEADER HERO (COMPACTO - ESTÁNDAR PROYECTOS) */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={s.header.container}
        >
          <div className={s.header.pattern} />
          <div className={s.header.content}>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className={s.header.iconContainer}>
                  <Settings className={s.header.icon} />
                </div>
                <div className='space-y-0.5'>
                  <h1 className={s.header.title}>
                    Configuración de Fuentes de Pago
                  </h1>
                  <p className={s.header.subtitle}>
                    Administra los campos dinámicos de cada tipo de fuente
                  </p>
                </div>
              </div>
              <span className={s.header.badge}>
                <Sparkles className='h-3.5 w-3.5' />
                {tipos.length} Tipos Activos
              </span>
            </div>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* LOADING */}
        {/* ============================================ */}
        {isLoading && (
          <Cargador label='Cargando tipos de fuentes' className='py-12' />
        )}

        {/* ============================================ */}
        {/* ERROR */}
        {/* ============================================ */}
        {isError && (
          <div className={s.error.container}>
            <div className='flex items-start gap-3'>
              <AlertCircle className={s.error.icon} />
              <div className='flex-1'>
                <p className={s.error.title}>
                  Error al cargar tipos de fuentes
                </p>
                <p className={s.error.message}>{(error as Error)?.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* GRID DE TIPOS */}
        {/* ============================================ */}
        {!isLoading && !isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'
          >
            {tipos.map((tipo, index) => {
              const Icon = obtenerIcono(tipo.icono)
              const numCampos = tipo.configuracion_campos?.campos?.length || 0

              return (
                <motion.div
                  key={tipo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={s.tipoCard.container}
                >
                  {/* Gradiente hover */}
                  <div
                    className={s.tipoCard.gradient}
                    style={{
                      background: `linear-gradient(135deg, ${tipo.color}, ${tipo.color}99)`,
                    }}
                  />

                  {/* Contenido */}
                  <div className={s.tipoCard.content}>
                    {/* Icono */}
                    <div
                      className={s.tipoCard.iconContainer}
                      style={{ background: tipo.color }}
                    >
                      <Icon className={s.tipoCard.icon} />
                    </div>

                    {/* Info */}
                    <div className={s.tipoCard.info}>
                      <h3 className={s.tipoCard.name}>{tipo.nombre}</h3>
                      <p className={s.tipoCard.description}>
                        {tipo.descripcion || 'Sin descripción'}
                      </p>

                      {/* Badge de campos */}
                      <div className='mt-2 flex items-center gap-2'>
                        <span
                          className={s.tipoCard.badge}
                          style={{
                            background:
                              numCampos > 0
                                ? `${toHex(tipo.color)}20`
                                : '#f3f4f620',
                            color:
                              numCampos > 0 ? toHex(tipo.color) : '#9ca3af',
                          }}
                        >
                          {numCampos} campo{numCampos !== 1 ? 's' : ''}
                        </span>
                        {tipo.es_subsidio && (
                          <span
                            className={`${s.tipoCard.badge} bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400`}
                          >
                            Subsidio
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón */}
                    <button
                      type='button'
                      onClick={() => handleAbrirConfigurador(tipo)}
                      className={s.tipoCard.button}
                      style={{
                        background: `linear-gradient(135deg, ${toHex(tipo.color)}, ${toHex(tipo.color)}cc)`,
                        color: '#fff',
                      }}
                    >
                      <Settings className='h-4 w-4' />
                      Configurar
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Info adicional */}
        {!isLoading && !isError && tipos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 dark:border-cyan-800 dark:from-cyan-950/30 dark:to-blue-950/30'
          >
            <div className='flex items-start gap-3'>
              <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-600 dark:text-cyan-400' />
              <div className='flex-1'>
                <p className='mb-1 text-sm font-semibold text-cyan-900 dark:text-cyan-100'>
                  💡 ¿Cómo funciona?
                </p>
                <ul className='list-inside list-disc space-y-1 text-xs text-cyan-800 dark:text-cyan-200'>
                  <li>
                    Los campos configurados aquí se mostrarán automáticamente en
                    el formulario de asignación de viviendas
                  </li>
                  <li>
                    Puedes reordenar los campos arrastrándolos en el modal de
                    configuración
                  </li>
                  <li>
                    Los cambios se reflejan inmediatamente (gracias a React
                    Query con caché de 5 minutos)
                  </li>
                  <li>
                    Tipos soportados: texto, moneda, números, fechas, selects de
                    bancos/cajas, etc.
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ============================================ */}
      {/* MODAL CONFIGURADOR */}
      {/* ============================================ */}
      <AnimatePresence>
        {modalAbierto && tipoSeleccionado && (
          <ConfiguradorCamposModal
            isOpen={modalAbierto}
            tipoId={tipoSeleccionado.id}
            tipoNombre={tipoSeleccionado.nombre}
            tipoColor={tipoSeleccionado.color}
            configuracionInicial={tipoSeleccionado.configuracion_campos}
            onClose={handleCerrarConfigurador}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
