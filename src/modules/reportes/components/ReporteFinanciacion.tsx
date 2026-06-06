'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  BarChart3,
  Building2,
  DollarSign,
  Info,
  Landmark,
  ListChecks,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react'

import { useReporteFinanciacion } from '../hooks/useReporteFinanciacion'

import { ClientesEntidadTabla } from './ClientesEntidadTabla'
import { EntidadesResumenGrid } from './EntidadesResumenGrid'

export function ReporteFinanciacion() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useReporteFinanciacion()
  const [entidadSeleccionadaId, setEntidadSeleccionadaId] = useState<
    string | null
  >(null)

  const entidadSeleccionada = data?.entidades.find(
    e => e.id === entidadSeleccionadaId
  )

  const handleSeleccionar = (id: string) => {
    setEntidadSeleccionadaId(prev => (prev === id ? null : id))
  }

  if (isLoading) return <EstadoCargando />
  if (isError)
    return <EstadoError mensaje={error.message} onReintentar={refetch} />

  if (!data || data.entidades.length === 0)
    return <EstadoVacio onActualizar={refetch} actualizando={isFetching} />

  const reporte = data

  return (
    <div className='space-y-6'>
      {/* KPIs resumen */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <KpiResumen
          icono={Building2}
          label='Entidades activas'
          valor={reporte.entidades.length}
          colorIcono='from-blue-600 to-indigo-600'
        />
        <KpiResumen
          icono={Users}
          label='Clientes financiados'
          valor={reporte.totalClientesFinanciados}
          colorIcono='from-cyan-600 to-blue-600'
        />
        <KpiResumen
          icono={DollarSign}
          label='Monto total aprobado'
          valor={formatCOP(reporte.montoTotalAprobado)}
          colorIcono='from-emerald-600 to-teal-600'
        />
      </div>

      {/* Título sección con botón refrescar */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-base font-semibold text-gray-900 dark:text-white'>
            Distribución por entidad financiera
          </h2>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Selecciona una entidad para ver el detalle de sus clientes
          </p>
        </div>
        <button
          type='button'
          onClick={() => refetch()}
          disabled={isFetching}
          className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
          />
          Actualizar
        </button>
      </div>

      {/* Grilla de entidades */}
      <EntidadesResumenGrid
        entidades={reporte.entidades}
        entidadSeleccionadaId={entidadSeleccionadaId}
        onSeleccionar={handleSeleccionar}
      />

      {/* Tabla de detalle (aparece al seleccionar una entidad) */}
      {entidadSeleccionada && (
        <ClientesEntidadTabla entidad={entidadSeleccionada} />
      )}
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EstadoVacio({
  onActualizar,
  actualizando,
}: {
  onActualizar: () => void
  actualizando: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='space-y-5 rounded-xl border border-gray-200/50 bg-gradient-to-br from-white/90 via-indigo-50/90 to-violet-50/90 p-6 text-center shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-indigo-950/50'
    >
      {/* Icono con gradiente */}
      <div className='flex justify-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className='mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 shadow-2xl shadow-indigo-500/30'
        >
          <BarChart3 className='h-8 w-8 text-white' />
        </motion.div>
      </div>

      {/* Título y descripción */}
      <div className='space-y-2'>
        <h3 className='bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:via-gray-100 dark:to-indigo-100'>
          Sin datos de financiación
        </h3>
        <p className='mx-auto max-w-lg text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
          Aún no hay negociaciones activas con financiación por entidad
          asignada. Los datos aparecerán automáticamente cuando se registren.
        </p>
      </div>

      {/* Checklist */}
      <div className='rounded-xl border border-gray-200/80 bg-white/60 p-4 text-left shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/40'>
        <div className='mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300'>
          <ListChecks className='h-4 w-4' />
          ¿Qué necesitas para ver datos?
        </div>
        <div className='space-y-2.5'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
              <Landmark className='h-3 w-3 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Tener entidades financieras registradas
              </p>
              <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                Ve a Administración → Entidades Financieras para crearlas
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
              <Users className='h-3 w-3 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Asignar entidad en la fuente de pago de clientes
              </p>
              <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                Al registrar o editar una negociación, vincula la fuente de
                crédito con su entidad financiera
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
              <TrendingUp className='h-3 w-3 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Tener negociaciones activas o completadas
              </p>
              <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                Solo se incluyen negociaciones en estado Activa o Completada
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer informativo + botón actualizar */}
      <div className='flex items-start gap-3 border-t border-gray-200 pt-1 text-left dark:border-gray-700'>
        <Info className='mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400' />
        <p className='flex-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400'>
          Este reporte agrupa las fuentes de financiación activas por entidad,
          mostrando el monto total aprobado y los clientes vinculados a cada
          banco o fondo.
        </p>
        <button
          type='button'
          onClick={onActualizar}
          disabled={actualizando}
          className='flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20'
        >
          <RefreshCw
            className={`h-3 w-3 ${actualizando ? 'animate-spin' : ''}`}
          />
          Actualizar
        </button>
      </div>
    </motion.div>
  )
}

// ── Sub-componentes de estado ────────────────────────────────────────────────

function EstadoCargando() {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className='h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800'
          />
        ))}
      </div>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className='h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800'
          />
        ))}
      </div>
    </div>
  )
}

function EstadoError({
  mensaje,
  onReintentar,
}: {
  mensaje: string
  onReintentar: () => void
}) {
  return (
    <div className='flex flex-col items-center rounded-xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-800 dark:bg-red-950/20'>
      <AlertCircle className='mb-3 h-10 w-10 text-red-400' />
      <p className='text-sm font-medium text-red-700 dark:text-red-400'>
        Error al cargar el reporte
      </p>
      <p className='mt-1 text-xs text-red-500 dark:text-red-500'>{mensaje}</p>
      <button
        type='button'
        onClick={onReintentar}
        className='mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700'
      >
        Reintentar
      </button>
    </div>
  )
}

// ── KPI card local ───────────────────────────────────────────────────────────

interface KpiResumenProps {
  icono: React.ElementType
  label: string
  valor: string | number
  colorIcono: string
}

function KpiResumen({
  icono: Icono,
  label,
  valor,
  colorIcono,
}: KpiResumenProps) {
  return (
    <div className='flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorIcono} shadow-sm`}
      >
        <Icono className='h-5 w-5 text-white' />
      </div>
      <div>
        <p className='text-xs font-medium text-gray-500 dark:text-gray-400'>
          {label}
        </p>
        <p className='text-xl font-bold text-gray-900 dark:text-white'>
          {valor}
        </p>
      </div>
    </div>
  )
}

// ── Utilidad local ───────────────────────────────────────────────────────────

function formatCOP(valor: number): string {
  if (valor >= 1_000_000_000) return `$${(valor / 1_000_000_000).toFixed(1)} MM`
  if (valor >= 1_000_000) return `$${(valor / 1_000_000).toFixed(1)} M`
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)
}
