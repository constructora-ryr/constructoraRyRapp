'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  DollarSign,
  Home,
  TrendingUp,
} from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import type { Negociacion } from '@/modules/clientes/types'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'

import { useResumenNegociacion } from '../hooks/useResumenNegociacion'

interface ResumenNegociacionProps {
  negociacion: Negociacion
  clienteId: string
}

export function ResumenNegociacion({
  negociacion,
  clienteId,
}: ResumenNegociacionProps) {
  const {
    valorVivienda,
    totalComprometido,
    interesesTotales,
    totalAbonado,
    saldo: saldoPendiente,
    pctPagado,
  } = useResumenNegociacion({ negociacion })

  const { esAdmin, puede } = usePermisosQuery()
  const canVerAbonos = esAdmin || puede('abonos', 'ver')

  const porcentaje = pctPagado
  const estaCompleta = porcentaje >= 100

  const proyecto = negociacion.viviendas?.manzanas?.proyectos?.nombre
  const manzana = negociacion.viviendas?.manzanas?.nombre
  const numero = negociacion.viviendas?.numero

  const progressColor = estaCompleta
    ? 'from-emerald-400 to-emerald-500'
    : porcentaje >= 60
      ? 'from-blue-400 to-cyan-500'
      : porcentaje >= 30
        ? 'from-amber-400 to-orange-400'
        : 'from-red-400 to-rose-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className='relative overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800'
    >
      {/* Top accent */}
      <div
        className={`absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r ${estaCompleta ? 'from-emerald-400 to-teal-400' : 'from-cyan-500 to-blue-500'}`}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <div className='flex items-center justify-between px-4 py-3'>
        {/* Left: badge + breadcrumb */}
        <div className='flex flex-col gap-1'>
          {/* Status badge */}
          <div className='flex items-center gap-2'>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                estaCompleta
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300'
              }`}
            >
              {estaCompleta ? (
                <CheckCircle2 className='h-3 w-3' />
              ) : (
                <DollarSign className='h-3 w-3' />
              )}
              {estaCompleta ? 'Negociación Completada' : 'Negociación Activa'}
            </span>
          </div>

          {/* Location breadcrumb */}
          {(proyecto || manzana || numero) && (
            <div className='flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400'>
              {proyecto && (
                <>
                  <Building2 className='h-3 w-3 flex-shrink-0 text-gray-400 dark:text-gray-500' />
                  <span className='font-medium text-gray-700 dark:text-gray-300'>
                    {proyecto}
                  </span>
                </>
              )}
              {(manzana || numero) && (
                <>
                  <span className='text-gray-300 dark:text-gray-600'>·</span>
                  <Home className='h-3 w-3 flex-shrink-0 text-gray-400 dark:text-gray-500' />
                  <span>
                    {[
                      manzana && `Manzana ${manzana}`,
                      numero && `Casa ${numero}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: CTA */}
        {canVerAbonos ? (
          <a
            href={`/abonos/${clienteId}`}
            className='flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 dark:border-cyan-800/50 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/40'
          >
            <TrendingUp className='h-3 w-3' />
            Ver abonos
            <ArrowRight className='h-3 w-3' />
          </a>
        ) : null}
      </div>

      {/* ── Metrics ────────────────────────────────────── */}
      <div
        className={`grid divide-x divide-gray-100 border-t border-gray-100 dark:divide-gray-700/60 dark:border-gray-700/60 ${
          interesesTotales > 0 ? 'grid-cols-4' : 'grid-cols-3'
        }`}
      >
        {/* Precio vivienda — contexto */}
        <div className='px-4 py-3'>
          <p className='mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
            {interesesTotales > 0 ? 'Precio Vivienda' : 'Valor Total'}
          </p>
          <p className='text-xl font-black tabular-nums tracking-tight text-gray-700 dark:text-gray-300'>
            {formatCurrency(valorVivienda)}
          </p>
          <p className='mt-0.5 text-[10px] text-gray-400 dark:text-gray-500'>
            Precio vivienda
          </p>
        </div>

        {/* Total a pagar (solo cuando hay intereses) */}
        {interesesTotales > 0 ? (
          <div className='bg-indigo-50/40 px-4 py-3 dark:bg-indigo-900/10'>
            <p className='mb-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400'>
              Total a pagar
            </p>
            <p className='text-xl font-black tabular-nums tracking-tight text-indigo-700 dark:text-indigo-300'>
              {formatCurrency(totalComprometido)}
            </p>
            <p className='mt-0.5 text-[10px] text-indigo-400 dark:text-indigo-500'>
              +{formatCurrency(interesesTotales)} intereses
            </p>
          </div>
        ) : null}

        {/* Abonado — positivo */}
        <div className='border-r border-gray-100 bg-emerald-50/50 px-4 py-3 dark:border-gray-700/60 dark:bg-emerald-900/10'>
          <p className='mb-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-500'>
            Abonado
          </p>
          <p className='text-xl font-black tabular-nums tracking-tight text-emerald-700 dark:text-emerald-400'>
            {formatCurrency(totalAbonado)}
          </p>
          <p className='mt-0.5 text-[10px] text-emerald-500/80 dark:text-emerald-500/60'>
            Total pagado
          </p>
        </div>

        {/* Saldo — héroe */}
        <div
          className={`px-4 py-3 ${
            estaCompleta
              ? 'bg-emerald-50/80 dark:bg-emerald-900/15'
              : 'bg-amber-50/60 dark:bg-amber-900/10'
          }`}
        >
          <p
            className={`mb-1 text-[10px] font-semibold uppercase tracking-widest ${
              estaCompleta
                ? 'text-emerald-600 dark:text-emerald-500'
                : 'text-amber-600 dark:text-amber-500'
            }`}
          >
            Saldo
          </p>
          <p
            className={`text-xl font-black tabular-nums tracking-tight ${
              estaCompleta
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            {formatCurrency(saldoPendiente)}
          </p>
          <p className='mt-0.5 text-[10px] text-gray-400 dark:text-gray-500'>
            {estaCompleta ? 'Pagado completamente' : 'Resta por pagar'}
          </p>
        </div>
      </div>

      {/* ── Progress bar ───────────────────────────────── */}
      <div className='px-4 py-2.5'>
        <div className='flex items-center gap-2'>
          <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${porcentaje}%` }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <span className='text-[11px] font-bold tabular-nums text-gray-500 dark:text-gray-400'>
            {Math.round(porcentaje)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}
