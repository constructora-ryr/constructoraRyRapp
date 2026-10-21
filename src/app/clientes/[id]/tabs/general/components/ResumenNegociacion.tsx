'use client'

/**
 * Resumen de la negociación vigente: valor, abonado, saldo y avance. El
 * desglose por fuente de pago vive en la pestaña Negociación. Los totales
 * salen de useResumenNegociacion, igual que en esa pestaña.
 */

import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Home,
  PiggyBank,
  Receipt,
  Star,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import Link from 'next/link'

import { getShortId } from '@/lib/utils/slug.utils'
import type { Negociacion } from '@/modules/clientes/types'
import { formatCOP } from '@/shared/components/list-page'
import { cn } from '@/shared/utils/helpers'

import { useResumenNegociacion } from '../hooks/useResumenNegociacion'

interface ResumenNegociacionProps {
  negociacion: Negociacion
  clienteId: string
  canVerAbonos: boolean
}

function Cifra({
  icon: Icon,
  label,
  valor,
  detalle,
  gradient,
  texto,
}: {
  icon: LucideIcon
  label: string
  valor: number
  detalle: string
  gradient: string
  texto: string
}) {
  return (
    <div className='flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-700/60 dark:bg-slate-900/30'>
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
          gradient
        )}
      >
        <Icon className='h-5 w-5' />
      </span>
      <div className='min-w-0'>
        <p className='text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
          {label}
        </p>
        <p
          className={cn(
            'text-lg font-black tabular-nums tracking-tight',
            texto
          )}
        >
          {formatCOP(valor)}
        </p>
        <p className='truncate text-[11px] text-slate-500 dark:text-slate-400'>
          {detalle}
        </p>
      </div>
    </div>
  )
}

export function ResumenNegociacion({
  negociacion,
  clienteId,
  canVerAbonos,
}: ResumenNegociacionProps) {
  const {
    valorVivienda,
    totalComprometido,
    interesesTotales,
    totalAbonado,
    saldo,
    pctPagado,
  } = useResumenNegociacion({ negociacion })

  const pagada = pctPagado >= 100 || saldo <= 0
  const total = interesesTotales > 0 ? totalComprometido : valorVivienda
  const vivienda = negociacion.viviendas
  const codigo = vivienda
    ? `${vivienda.manzanas?.nombre ?? ''}${vivienda.numero ?? ''}`
    : ''
  const proyecto = vivienda?.manzanas?.proyectos?.nombre

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
    >
      {/* Encabezado */}
      <div className='flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/60'>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
            pagada
              ? 'from-amber-400 to-orange-500'
              : 'from-pink-500 to-purple-600'
          )}
        >
          {pagada ? (
            <Star className='h-4 w-4 fill-white' />
          ) : (
            <Home className='h-4 w-4' />
          )}
        </span>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
              Negociación
            </h3>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset',
                pagada
                  ? 'bg-amber-50 text-amber-700 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300'
                  : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300'
              )}
            >
              {pagada ? (
                <CheckCircle2 className='h-3 w-3' />
              ) : (
                <Clock className='h-3 w-3' />
              )}
              {pagada ? 'Pagada por completo' : 'En curso'}
            </span>
          </div>
          {(codigo || proyecto) && (
            <p className='mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400'>
              {codigo && (
                <span className='inline-flex items-center gap-1 rounded-md bg-orange-50 px-1.5 py-px font-bold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300'>
                  <Home className='h-3 w-3' />
                  {codigo}
                </span>
              )}
              {proyecto && (
                <span className='inline-flex items-center gap-1'>
                  <Building2 className='h-3 w-3 text-green-600 dark:text-green-400' />
                  {proyecto}
                </span>
              )}
            </p>
          )}
        </div>
        {canVerAbonos && (
          <Link
            href={`/abonos/${getShortId(clienteId)}`}
            className='inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20'
          >
            <Receipt className='h-3.5 w-3.5' />
            Ver abonos
            <ArrowRight className='h-3.5 w-3.5' />
          </Link>
        )}
      </div>

      <div className='space-y-4 p-4'>
        {/* Cifras */}
        <div className='grid gap-3 sm:grid-cols-3'>
          <Cifra
            icon={Home}
            label={interesesTotales > 0 ? 'Total a pagar' : 'Valor total'}
            valor={total}
            detalle={
              interesesTotales > 0
                ? `Vivienda ${formatCOP(valorVivienda)} + intereses`
                : 'Precio de la vivienda'
            }
            gradient='from-blue-500 to-indigo-600'
            texto='text-slate-900 dark:text-white'
          />
          <Cifra
            icon={PiggyBank}
            label='Abonado'
            valor={totalAbonado}
            detalle='Total recibido'
            gradient='from-emerald-500 to-teal-600'
            texto='text-emerald-700 dark:text-emerald-400'
          />
          <Cifra
            icon={pagada ? CheckCircle2 : Wallet}
            label='Saldo'
            valor={Math.max(0, saldo)}
            detalle={pagada ? 'Pagado completamente' : 'Resta por pagar'}
            gradient={
              pagada
                ? 'from-amber-400 to-orange-500'
                : 'from-amber-500 to-rose-500'
            }
            texto={
              pagada
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-rose-700 dark:text-rose-400'
            }
          />
        </div>

        {/* Avance */}
        <div>
          <div className='mb-1.5 flex items-center justify-between text-xs'>
            <span className='font-semibold text-slate-600 dark:text-slate-300'>
              Avance de pago
            </span>
            <span
              className={cn(
                'font-black tabular-nums',
                pagada
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-cyan-700 dark:text-cyan-400'
              )}
            >
              {Math.round(pctPagado)}%
            </span>
          </div>
          <div className='h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60'>
            <motion.div
              className={cn(
                'h-full rounded-full bg-gradient-to-r',
                pagada
                  ? 'from-amber-400 to-orange-500'
                  : 'from-cyan-500 via-blue-500 to-indigo-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pctPagado, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  )
}
