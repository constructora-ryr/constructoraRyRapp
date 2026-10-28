'use client'

import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import Link from 'next/link'

import { AnimatedCounter } from '@/shared/components/ui/AnimatedCounter'

import type { DashboardStatsData } from '../hooks/useDashboardStats'
import { formatCOPCompact } from '../utils/dashboard-format'

import type { KpiDelta } from './KpiCard'
import { Monto } from './Monto'
import { SparklineRecaudo } from './SparklineRecaudo'

export interface HeroAction {
  label: string
  href: string
  primary?: boolean
}

/** Cifra principal del panel: el recaudo del mes con su tendencia */
export interface HeroRecaudo {
  mes: string
  valor: number
  abonos: number
  delta?: KpiDelta
  /** Referencia cuando el mes va en cero */
  anterior: { mes: string; valor: number }
  serie: DashboardStatsData['recaudoMensual']
  href?: string
}

interface DashboardHeroProps {
  saludo: string
  nombre: string
  rol: string
  fechaHoy: string
  actions: HeroAction[]
  /** Solo si el usuario puede ver abonos */
  recaudo?: HeroRecaudo
  loading: boolean
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 120, damping: 20 },
  },
}

const DELTA_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus }

/** Sobre el rojo, verde/rojo no se distinguen: lo dice la flecha */
function deltaClass({ direction, upIsGood = true }: KpiDelta): string {
  if (direction === 'flat') return 'bg-white/10 text-white/80'
  return (direction === 'up') === upIsGood
    ? 'bg-white/20 text-white'
    : 'bg-black/20 text-white/90'
}

/**
 * Panel de marca del dashboard: degradado del rojo RyR con la retícula de
 * plano del login. A la izquierda el saludo y las acciones; a la derecha el
 * recaudo del mes y su tendencia.
 */
export function DashboardHero({
  saludo,
  nombre,
  rol,
  fechaHoy,
  actions,
  recaudo,
  loading,
}: DashboardHeroProps) {
  return (
    <motion.section
      variants={itemVariants}
      className='relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-700 to-rose-950 text-white shadow-xl shadow-red-900/20 dark:from-red-700 dark:via-red-800 dark:to-rose-950 dark:shadow-red-950/40'
    >
      {/* Fondo de marca */}
      <div
        aria-hidden
        className='absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-rose-300/25 blur-[100px]'
      />
      <div
        aria-hidden
        className='absolute -bottom-36 -left-20 -z-10 h-72 w-72 rounded-full bg-black/25 blur-[90px]'
      />
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_top_left,black_25%,transparent_75%)]'
      />
      <span
        aria-hidden
        className='absolute -top-1/4 right-[38%] -z-10 hidden h-[150%] w-px rotate-[24deg] bg-gradient-to-b from-transparent via-white/30 to-transparent lg:block'
      />

      <div
        className={`grid gap-8 p-6 sm:p-8 ${recaudo ? 'lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-12' : ''}`}
      >
        {/* Saludo y acciones */}
        <div className='flex min-w-0 flex-col'>
          <p className='flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white'>
            <span className='relative flex h-1.5 w-1.5'>
              <span className='absolute inset-0 rounded-full bg-white opacity-75 motion-safe:animate-ping' />
              <span className='relative h-1.5 w-1.5 rounded-full bg-white' />
            </span>
            {fechaHoy}
          </p>
          <h1
            className='mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-4xl'
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            {saludo},<br className='sm:hidden' /> {nombre}
          </h1>
          {rol && (
            <span className='mt-3 inline-flex w-fit items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/25'>
              {rol}
            </span>
          )}

          {actions.length > 0 && (
            <div className='mt-6 flex flex-wrap gap-2'>
              {actions.map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.98] ${
                    action.primary
                      ? 'bg-white text-red-700 shadow-lg shadow-red-950/30 hover:bg-red-50'
                      : 'bg-white/10 text-white ring-1 ring-inset ring-white/25 hover:bg-white/20'
                  }`}
                >
                  <Plus className='h-4 w-4' />
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {recaudo && <TarjetaRecaudo recaudo={recaudo} loading={loading} />}
      </div>
    </motion.section>
  )
}

function TarjetaRecaudo({
  recaudo,
  loading,
}: {
  recaudo: HeroRecaudo
  loading: boolean
}) {
  const DeltaIcon = recaudo.delta ? DELTA_ICON[recaudo.delta.direction] : null
  const enCero = !loading && recaudo.valor === 0

  return (
    <div className='min-w-0 rounded-2xl bg-black/15 p-5 ring-1 ring-inset ring-white/15 backdrop-blur-sm'>
      <div className='flex items-center justify-between gap-3'>
        <p className='text-sm font-medium text-white/80'>
          Recaudo de {recaudo.mes}
        </p>
        {recaudo.href && (
          <Link
            href={recaudo.href}
            className='inline-flex items-center gap-0.5 rounded-md text-xs font-semibold text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
          >
            Abonos <ArrowUpRight className='h-3.5 w-3.5' />
          </Link>
        )}
      </div>

      {loading ? (
        <div className='mt-2 h-11 w-40 animate-pulse rounded-lg bg-white/15' />
      ) : enCero ? (
        // Un "$0" gigante no informa nada: se dice en palabras y se da la
        // referencia del mes anterior
        <div className='mt-2'>
          <p className='text-2xl font-semibold tracking-tight'>
            Aún sin abonos este mes
          </p>
          {recaudo.anterior.valor > 0 && (
            <p className='mt-1 text-sm text-white/75'>
              En {recaudo.anterior.mes} se recaudaron{' '}
              <Monto
                value={recaudo.anterior.valor}
                className='font-semibold text-white !decoration-white/40'
              />
            </p>
          )}
        </div>
      ) : (
        <Monto
          value={recaudo.valor}
          className='mt-1 inline-block !decoration-white/40'
        >
          <AnimatedCounter
            value={recaudo.valor}
            format={formatCOPCompact}
            className='text-4xl font-bold tabular-nums tracking-tight md:text-5xl'
          />
        </Monto>
      )}

      {!loading && !enCero && (
        <div className='mt-2 flex flex-wrap items-center gap-2 text-xs'>
          {recaudo.delta && DeltaIcon && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${deltaClass(recaudo.delta)}`}
            >
              <DeltaIcon className='h-3.5 w-3.5' />
              {recaudo.delta.label}
            </span>
          )}
          <span className='text-white/75'>
            {recaudo.abonos}{' '}
            {recaudo.abonos === 1 ? 'abono registrado' : 'abonos registrados'}
          </span>
        </div>
      )}

      <div className='mt-4'>
        {loading ? (
          <div className='h-16 animate-pulse rounded-lg bg-white/10' />
        ) : (
          <SparklineRecaudo data={recaudo.serie} />
        )}
      </div>
    </div>
  )
}
