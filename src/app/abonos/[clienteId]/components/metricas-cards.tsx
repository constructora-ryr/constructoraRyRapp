'use client'

import { motion } from 'framer-motion'
import { Home, Info, Receipt, TrendingDown, TrendingUp } from 'lucide-react'

interface MetricasCardsProps {
  metricas: {
    valorVivienda: number
    totalComprometido: number
    interesesTotales: number
    totalAbonado: number
    saldoPendiente: number
    porcentajePagado: number
  }
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

const CIRCUNFERENCIA = 2 * Math.PI * 40

export function MetricasCards({ metricas }: MetricasCardsProps) {
  const pct = Math.min(Math.max(metricas.porcentajePagado, 0), 100)
  // Solo mostrar 100% en el texto si el saldo es realmente cero
  const pctTexto =
    metricas.saldoPendiente === 0 ? 100 : Math.min(Math.floor(pct), 99)
  const offset = CIRCUNFERENCIA - (pct / 100) * CIRCUNFERENCIA
  const tieneIntereses = metricas.interesesTotales > 0

  const ringColor = pct >= 80 ? '#10b981' : pct >= 40 ? '#3b82f6' : '#f59e0b'

  return (
    <div className='space-y-3'>
      {/* Banner informativo de financiamiento */}
      {tieneIntereses ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='flex items-start gap-2.5 rounded-xl border border-violet-200/70 bg-violet-50/80 px-4 py-3 dark:border-violet-800/40 dark:bg-violet-950/30'
        >
          <Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-violet-500 dark:text-violet-400' />
          <p className='text-xs leading-relaxed text-violet-800 dark:text-violet-200'>
            <span className='font-semibold'>
              Financiamiento con la constructora.
            </span>{' '}
            Este cliente tiene un crédito directo que genera intereses por{' '}
            <span className='font-bold text-violet-600 dark:text-violet-300'>
              {formatCurrency(metricas.interesesTotales)}
            </span>
            . Precio de vivienda:{' '}
            <span className='font-semibold'>
              {formatCurrency(metricas.valorVivienda)}
            </span>{' '}
            — Total con intereses:{' '}
            <span className='font-semibold'>
              {formatCurrency(metricas.totalComprometido)}
            </span>
            .
          </p>
        </motion.div>
      ) : null}

      {/* Panel unificado de métricas */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className='dark:border-white/8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm backdrop-blur dark:bg-white/[0.06] dark:shadow-none'
      >
        <div className='flex flex-col lg:flex-row'>
          {tieneIntereses ? (
            /* ── CON FINANCIAMIENTO: grid 2×2 (4 métricas) ── */
            <div className='grid flex-1 grid-cols-2 divide-x divide-y divide-gray-100 dark:divide-white/5'>
              <MetricaItem
                Icon={Home}
                gradient='from-blue-500 to-indigo-600'
                label='Valor Vivienda'
                subtitle='Precio pactado del inmueble'
                value={formatCurrency(metricas.valorVivienda)}
                valueColor='text-gray-900 dark:text-white'
                delay={0}
              />
              <MetricaItem
                Icon={Receipt}
                gradient='from-violet-500 to-purple-600'
                label='Total a Pagar'
                subtitle='Incluye intereses de financiamiento'
                value={formatCurrency(metricas.totalComprometido)}
                valueColor='text-gray-900 dark:text-white'
                delay={0.04}
                highlight
              />
              <MetricaItem
                Icon={TrendingUp}
                gradient='from-emerald-500 to-teal-600'
                label='Total Abonado'
                subtitle='Pagos recibidos a la fecha'
                value={formatCurrency(metricas.totalAbonado)}
                valueColor='text-emerald-600 dark:text-emerald-300'
                delay={0.08}
              />
              <MetricaItem
                Icon={TrendingDown}
                gradient='from-amber-500 to-orange-600'
                label='Saldo Pendiente'
                subtitle='Falta por recaudar'
                value={formatCurrency(metricas.saldoPendiente)}
                valueColor='text-amber-600 dark:text-amber-300'
                delay={0.12}
              />
            </div>
          ) : (
            /* ── SIN FINANCIAMIENTO: fila de 3 métricas ── */
            <div className='grid flex-1 grid-cols-3 divide-x divide-gray-100 dark:divide-white/5'>
              <MetricaItem
                Icon={Home}
                gradient='from-blue-500 to-indigo-600'
                label='Valor Vivienda'
                subtitle='Precio pactado del inmueble'
                value={formatCurrency(metricas.valorVivienda)}
                valueColor='text-gray-900 dark:text-white'
                delay={0}
              />
              <MetricaItem
                Icon={TrendingUp}
                gradient='from-emerald-500 to-teal-600'
                label='Total Abonado'
                subtitle='Pagos recibidos a la fecha'
                value={formatCurrency(metricas.totalAbonado)}
                valueColor='text-emerald-600 dark:text-emerald-300'
                delay={0.04}
              />
              <MetricaItem
                Icon={TrendingDown}
                gradient='from-amber-500 to-orange-600'
                label='Saldo Pendiente'
                subtitle='Falta por recaudar'
                value={formatCurrency(metricas.saldoPendiente)}
                valueColor='text-amber-600 dark:text-amber-300'
                delay={0.08}
              />
            </div>
          )}

          {/* Anillo de progreso — columna derecha */}
          <div className='flex items-center justify-center border-t border-gray-100 px-6 py-5 dark:border-white/5 lg:min-w-[140px] lg:border-l lg:border-t-0 lg:py-0'>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className='relative'
            >
              <svg
                width='100'
                height='100'
                viewBox='0 0 100 100'
                style={{ filter: `drop-shadow(0 0 10px ${ringColor}50)` }}
              >
                <circle
                  cx='50'
                  cy='50'
                  r='40'
                  fill='none'
                  stroke='rgba(255,255,255,0.06)'
                  strokeWidth='8'
                />
                <motion.circle
                  cx='50'
                  cy='50'
                  r='40'
                  fill='none'
                  stroke={ringColor}
                  strokeWidth='8'
                  strokeLinecap='round'
                  strokeDasharray={CIRCUNFERENCIA}
                  initial={{ strokeDashoffset: CIRCUNFERENCIA }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  style={{
                    transformOrigin: 'center',
                    transform: 'rotate(-90deg)',
                  }}
                />
              </svg>
              <div className='absolute inset-0 flex flex-col items-center justify-center leading-none'>
                <span className='text-2xl font-extrabold text-gray-900 dark:text-white'>
                  {pctTexto}%
                </span>
                <span className='mt-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-white/40'>
                  pagado
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Barra de progreso — ancho completo abajo */}
        <div className='h-1.5 bg-gray-100 dark:bg-white/5'>
          <motion.div
            className='h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
          />
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Celda de métrica individual ──────────────────── */

interface MetricaItemProps {
  Icon: React.ComponentType<{ className?: string }>
  gradient: string
  label: string
  subtitle: string
  value: string
  valueColor: string
  delay: number
  highlight?: boolean
}

function MetricaItem({
  Icon,
  gradient,
  label,
  subtitle,
  value,
  valueColor,
  delay,
  highlight,
}: MetricaItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative p-4 ${highlight ? 'bg-violet-50/40 dark:bg-violet-950/10' : ''}`}
    >
      <div className='mb-1.5 flex items-center gap-2.5'>
        <div
          className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradient} flex flex-shrink-0 items-center justify-center shadow-md`}
        >
          <Icon className='h-4 w-4 text-white' />
        </div>
        <div>
          <p className='text-xs font-medium leading-tight text-gray-500 dark:text-white/50'>
            {label}
          </p>
          <p className='text-[11px] leading-tight text-gray-400 dark:text-white/30'>
            {subtitle}
          </p>
        </div>
      </div>
      <p className={`text-xl font-extrabold leading-tight ${valueColor}`}>
        {value}
      </p>
    </motion.div>
  )
}
