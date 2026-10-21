'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { AlertCircle, Clock, Home, MessageSquare, X } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { ClienteInteres } from '@/modules/clientes/types'
import { formatCOP } from '@/shared/components/list-page'
import { cn } from '@/shared/utils/helpers'

import {
  ICONO_ORIGEN,
  ICONO_PROYECTO,
  INTERES_ESTADO_VISUAL,
} from './interes-visual'

interface InteresCardProps {
  interes: ClienteInteres
  canDescartar: boolean
  descartando: boolean
  onDescartar: (interes: ClienteInteres) => void
}

export function InteresCard({
  interes,
  canDescartar,
  descartando,
  onDescartar,
}: InteresCardProps) {
  const est =
    INTERES_ESTADO_VISUAL[interes.estado] ?? INTERES_ESTADO_VISUAL.Activo
  const EstIcono = est.icon
  const IconoOrigen = ICONO_ORIGEN[interes.origen || 'Otro'] ?? AlertCircle
  const descartado = interes.estado === 'Descartado'
  const codigo = interes.vivienda_numero
    ? `${interes.manzana_nombre ?? ''}${interes.vivienda_numero}`
    : ''

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60',
        descartado && 'opacity-70'
      )}
    >
      {/* Proyecto + estado */}
      <div className='flex items-start gap-3'>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
            descartado
              ? 'from-slate-400 to-slate-500'
              : 'from-green-500 to-emerald-600'
          )}
        >
          <ICONO_PROYECTO className='h-5 w-5' />
        </span>
        <div className='min-w-0 flex-1'>
          <h4 className='break-words text-[15px] font-bold leading-snug text-slate-900 dark:text-white'>
            {interes.proyecto_nombre ?? 'Proyecto'}
          </h4>
          {interes.origen && (
            <p className='mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
              <IconoOrigen className='h-3.5 w-3.5 shrink-0' />
              {interes.origen}
            </p>
          )}
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
            est.badge
          )}
        >
          <EstIcono className='h-3.5 w-3.5' />
          {est.label}
        </span>
      </div>

      {/* Vivienda */}
      {codigo && (
        <div className='mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/40'>
          <span className='inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20'>
            <Home className='h-3.5 w-3.5' />
            {codigo}
          </span>
          <span className='text-xs text-slate-500 dark:text-slate-400'>
            Vivienda de interés
          </span>
          {interes.vivienda_valor ? (
            <span className='ml-auto text-sm font-bold tabular-nums text-slate-900 dark:text-white'>
              {formatCOP(interes.vivienda_valor)}
            </span>
          ) : null}
        </div>
      )}

      {/* Notas */}
      {interes.notas && (
        <p className='mt-3 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300'>
          <MessageSquare className='mt-0.5 h-4 w-4 shrink-0 text-slate-400' />
          <span className='break-words italic'>“{interes.notas}”</span>
        </p>
      )}

      {/* Motivo del descarte */}
      {descartado && interes.motivo_descarte && (
        <div className='mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-800/50 dark:bg-rose-950/30'>
          <p className='text-[11px] font-semibold uppercase tracking-wide text-rose-500 dark:text-rose-400'>
            Motivo del descarte
          </p>
          <p className='mt-0.5 text-sm text-rose-800 dark:text-rose-300'>
            {interes.motivo_descarte}
          </p>
        </div>
      )}

      {/* Pie (pegado abajo: las tarjetas de una fila terminan alineadas) */}
      <div className='flex-1' />
      <div className='mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/60'>
        <span
          className='flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400'
          title={formatDateCompact(interes.fecha_interes)}
        >
          <Clock className='h-3.5 w-3.5' />
          Registrado{' '}
          {formatDistanceToNow(new Date(interes.fecha_interes), {
            addSuffix: true,
            locale: es,
          })}
        </span>
        {interes.estado === 'Activo' && canDescartar ? (
          <button
            type='button'
            onClick={() => onDescartar(interes)}
            disabled={descartando}
            className='inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 sm:h-8'
          >
            <X className='h-3.5 w-3.5' />
            {descartando ? 'Descartando…' : 'Descartar'}
          </button>
        ) : null}
        {interes.estado === 'Convertido' && (
          <span className='inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
            <EstIcono className='h-3.5 w-3.5' />
            Pasó a negociación
          </span>
        )}
      </div>
    </motion.article>
  )
}
