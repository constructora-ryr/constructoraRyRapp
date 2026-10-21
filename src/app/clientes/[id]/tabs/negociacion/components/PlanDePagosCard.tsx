'use client'

/**
 * Plan de pagos: encabezado con acciones (descuento, ajuste, historial),
 * avisos, barra de distribución por fuente (colores de la configuración) y
 * una tarjeta por fuente. Las cuotas del crédito con la constructora se
 * despliegan debajo de la cuadrícula.
 */

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  History,
  Landmark,
  Lock,
  Percent,
  SlidersHorizontal,
} from 'lucide-react'

import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { formatCOP } from '@/shared/components/list-page'
import { Tooltip } from '@/shared/components/ui'
import { getFuenteColorClasses } from '@/shared/constants/fuentes-pago.constants'
import { cn } from '@/shared/utils/helpers'

import { AvisoNegociacion } from './AvisoNegociacion'
import { FuenteMiniCard } from './FuenteMiniCard'

type DocsPendientes = Parameters<typeof FuenteMiniCard>[0]['docsPendientes']

interface PlanDePagosCardProps {
  fuentes: FuentePago[]
  valorVivienda: number
  estaBalanceado: boolean
  /** Configuración por tipo: color e ícono */
  tiposFuentes: {
    nombre: string
    color?: string | null
    icono?: string | null
  }[]
  pendientesPorFuente: Record<string, DocsPendientes>
  totalDocsPendientes: number
  totalDocsObligatoriosPendientes: number
  /** Avisos de descuadre / excedente / pagos excedentes (los arma la pestaña) */
  avisos: ReactNode
  /** Cuotas del crédito desplegado (o null) */
  cuotas: ReactNode
  cuotasExpandidas: Record<string, boolean>
  esCredito: (tipo: string) => boolean
  onToggleCuotas: (fuenteId: string) => void
  onEditarActa?: (f: FuentePago) => void
  onEditarReferencia?: (f: FuentePago) => void
  onHistorial: () => void
  onDescuento?: () => void
  tieneDescuento: boolean
  onAjustar?: () => void
  onIrADocumentos?: () => void
}

export function PlanDePagosCard(p: PlanDePagosCardProps) {
  const total = p.fuentes.reduce((s, f) => s + (f.monto_aprobado ?? 0), 0)
  const config = (tipo: string) => p.tiposFuentes.find(t => t.nombre === tipo)
  const soloLectura = !p.onDescuento && !p.onAjustar

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.04 }}
      className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
    >
      {/* Encabezado */}
      <div className='flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/60 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm'>
            <Landmark className='h-4 w-4' />
          </span>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                Plan de pagos
              </h3>
              <span className='rounded-full bg-slate-100 px-2 py-px text-[11px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300'>
                {p.fuentes.length}{' '}
                {p.fuentes.length === 1 ? 'fuente' : 'fuentes'}
              </span>
              {p.fuentes.length > 0 && p.estaBalanceado && (
                <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-px text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300'>
                  <CheckCircle2 className='h-3 w-3' />
                  Cubierto
                </span>
              )}
            </div>
            {total > 0 && (
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Total comprometido{' '}
                <span className='font-semibold tabular-nums text-slate-700 dark:text-slate-200'>
                  {formatCOP(total)}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Tooltip content='Historial de cambios del plan' side='bottom'>
            <button
              type='button'
              onClick={p.onHistorial}
              aria-label='Historial de cambios del plan'
              className='flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-violet-50 hover:text-violet-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-violet-500/10 sm:h-9 sm:w-9'
            >
              <History className='h-4 w-4' />
            </button>
          </Tooltip>
          {p.onDescuento && (
            <button
              type='button'
              onClick={p.onDescuento}
              className='inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-800/50 dark:bg-violet-900/20 dark:text-violet-300 sm:h-9'
            >
              <Percent className='h-4 w-4' />
              {p.tieneDescuento ? 'Modificar descuento' : 'Aplicar descuento'}
            </button>
          )}
          {p.onAjustar && (
            <button
              type='button'
              onClick={p.onAjustar}
              className='inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-3 text-xs font-semibold text-white shadow-sm shadow-cyan-500/25 transition-all hover:-translate-y-0.5 hover:shadow-md sm:h-9'
            >
              <SlidersHorizontal className='h-4 w-4' />
              Ajustar cierre financiero
            </button>
          )}
          {soloLectura && (
            <span className='inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500'>
              <Lock className='h-3.5 w-3.5' />
              Solo lectura
            </span>
          )}
        </div>
      </div>

      <div className='space-y-4 p-4'>
        {p.avisos}

        {p.fuentes.length === 0 ? (
          <p className='py-6 text-center text-sm text-slate-400 dark:text-slate-500'>
            {p.onAjustar
              ? 'Sin fuentes de pago. Usa "Ajustar cierre financiero" para agregarlas.'
              : 'Sin fuentes de pago configuradas.'}
          </p>
        ) : (
          <>
            {p.totalDocsPendientes > 0 && p.onIrADocumentos && (
              <AvisoNegociacion
                tono='ambar'
                icon={AlertTriangle}
                titulo={`${p.totalDocsPendientes} documento${p.totalDocsPendientes !== 1 ? 's' : ''} pendiente${p.totalDocsPendientes !== 1 ? 's' : ''}`}
                texto={
                  p.totalDocsObligatoriosPendientes > 0
                    ? `${p.totalDocsObligatoriosPendientes} ${p.totalDocsObligatoriosPendientes === 1 ? 'es obligatorio' : 'son obligatorios'} para los desembolsos.`
                    : 'Súbelos en la pestaña Documentos.'
                }
                accion={{
                  label: 'Ir a documentos',
                  icon: ArrowUpRight,
                  onClick: p.onIrADocumentos,
                }}
              />
            )}

            {/* Distribución */}
            {total > 0 && (
              <div>
                <p className='mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
                  Distribución por fuente
                </p>
                <div className='flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60'>
                  {p.fuentes.map(f => (
                    <Tooltip
                      key={f.id}
                      delayDuration={100}
                      content={`${f.tipo}: ${formatCOP(f.monto_aprobado ?? 0)} (${(((f.monto_aprobado ?? 0) / total) * 100).toFixed(1)} %)`}
                    >
                      <span
                        className={cn(
                          'h-full min-w-[6px] first:rounded-l-full last:rounded-r-full',
                          getFuenteColorClasses(config(f.tipo)?.color).barra
                        )}
                        style={{
                          width: `${((f.monto_aprobado ?? 0) / total) * 100}%`,
                        }}
                      />
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            <div
              className={cn(
                'grid gap-3',
                p.fuentes.length === 1
                  ? 'grid-cols-1'
                  : p.fuentes.length === 2
                    ? 'sm:grid-cols-2'
                    : 'sm:grid-cols-2 xl:grid-cols-3'
              )}
            >
              {p.fuentes.map(fuente => (
                <FuenteMiniCard
                  key={fuente.id}
                  fuente={fuente}
                  valorVivienda={p.valorVivienda}
                  docsPendientes={p.pendientesPorFuente[fuente.id]}
                  colorToken={config(fuente.tipo)?.color ?? undefined}
                  iconoNombre={config(fuente.tipo)?.icono ?? undefined}
                  cuotasExpandidas={p.cuotasExpandidas[fuente.id]}
                  onToggleCuotas={
                    p.esCredito(fuente.tipo)
                      ? () => p.onToggleCuotas(fuente.id)
                      : undefined
                  }
                  onEditarActa={
                    p.onEditarActa ? () => p.onEditarActa?.(fuente) : undefined
                  }
                  onEditarReferencia={
                    p.onEditarReferencia
                      ? () => p.onEditarReferencia?.(fuente)
                      : undefined
                  }
                />
              ))}
            </div>

            {p.cuotas}
          </>
        )}
      </div>
    </motion.section>
  )
}
