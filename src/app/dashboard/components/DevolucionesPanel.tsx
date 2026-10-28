'use client'

import { memo } from 'react'

import { motion } from 'framer-motion'
import { ChevronRight, FileX, ShieldCheck } from 'lucide-react'

import Link from 'next/link'

import { construirURLCliente } from '@/lib/utils/slug.utils'
import { conPestana } from '@/shared/hooks/usePestanaUrl'

import type { DashboardStatsData } from '../hooks/useDashboardStats'

import { Monto } from './Monto'

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

const ORIGEN_LABEL = {
  pago_excedente: 'Pagó de más',
  excedente_fuentes: 'Las fuentes superan el valor',
} as const

const plural = (n: number, s: string, p = `${s}s`) => (n === 1 ? s : p)

function iniciales(nombre: string | null): string {
  if (!nombre) return '?'
  const partes = nombre.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase()
}

export interface DevolucionesPermisos {
  clientes: boolean
  renuncias: boolean
}

interface DevolucionesPanelProps {
  loading: boolean
  alertas: DashboardStatsData['alertas']
  permisos: DevolucionesPermisos
}

function DevolucionesPanelComponent({
  loading,
  alertas,
  permisos,
}: DevolucionesPanelProps) {
  const devoluciones = alertas.devolucionesPendientes ?? {
    total: 0,
    monto: 0,
    items: [],
  }
  const renuncias = alertas.renunciasPendientes
  const totalCasos = devoluciones.total + renuncias.total
  const totalMonto = devoluciones.monto + renuncias.monto
  const ocultos = devoluciones.total - devoluciones.items.length

  if (!loading && totalCasos === 0) return <FranjaAlDia />

  return (
    <motion.section
      variants={itemVariants}
      aria-labelledby='devoluciones-title'
      className='flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none'
    >
      <div className='mb-5 flex items-start justify-between gap-3'>
        <div>
          <h2
            id='devoluciones-title'
            className='text-lg font-medium text-slate-900 dark:text-white'
          >
            Devoluciones a clientes
          </h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {loading
              ? 'Revisando…'
              : `${totalCasos} ${plural(totalCasos, 'pendiente')} por devolver`}
          </p>
        </div>
        {!loading && totalCasos > 0 && (
          <div className='text-right'>
            <p className='text-xl font-semibold text-slate-900 dark:text-white'>
              <Monto value={totalMonto} />
            </p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              en total
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/50'
            />
          ))}
        </div>
      ) : (
        <ul className='-mx-2 flex flex-col gap-0.5'>
          {devoluciones.items.map(d => {
            // La ficha abre en Negociación, donde se registra la devolución
            const href = permisos.clientes
              ? conPestana(
                  construirURLCliente({
                    id: d.clienteId,
                    nombre_completo: d.cliente ?? undefined,
                  }),
                  'negociacion'
                )
              : undefined
            const subtitulo = [
              d.vivienda && `Casa ${d.vivienda}`,
              ORIGEN_LABEL[d.origen],
            ]
              .filter(Boolean)
              .join(' · ')
            const body = (
              <>
                <span
                  aria-hidden
                  className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20'
                >
                  {iniciales(d.cliente)}
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-sm font-medium text-slate-900 dark:text-white'>
                    {d.cliente ?? 'Cliente'}
                  </span>
                  <span className='block truncate text-xs text-slate-500 dark:text-slate-400'>
                    {subtitulo}
                  </span>
                </span>
                <span className='shrink-0 text-sm font-semibold text-slate-900 dark:text-white'>
                  <Monto value={d.monto} focusable={!href} />
                </span>
                {href && (
                  <ChevronRight className='h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300' />
                )}
              </>
            )
            const cls =
              'group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors'
            return (
              <li key={d.refId}>
                {href ? (
                  <Link
                    href={href}
                    className={`${cls} hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-700/40`}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            )
          })}

          {renuncias.total > 0 && (
            <li>
              {(() => {
                const body = (
                  <>
                    <span
                      aria-hidden
                      className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-200/70 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20'
                    >
                      <FileX className='h-4 w-4' />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-sm font-medium text-slate-900 dark:text-white'>
                        {renuncias.total} {plural(renuncias.total, 'renuncia')}{' '}
                        por devolver
                      </span>
                      <span className='block truncate text-xs text-slate-500 dark:text-slate-400'>
                        Devolución de abonos tras la renuncia
                      </span>
                    </span>
                    {renuncias.monto > 0 && (
                      <span className='shrink-0 text-sm font-semibold text-slate-900 dark:text-white'>
                        <Monto
                          value={renuncias.monto}
                          focusable={!permisos.renuncias}
                        />
                      </span>
                    )}
                    {permisos.renuncias && (
                      <ChevronRight className='h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300' />
                    )}
                  </>
                )
                const cls =
                  'group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors'
                return permisos.renuncias ? (
                  <Link
                    href='/renuncias'
                    className={`${cls} hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-700/40`}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className={cls}>{body}</div>
                )
              })()}
            </li>
          )}

          {ocultos > 0 && (
            <li className='px-2 pt-2 text-xs text-slate-500 dark:text-slate-400'>
              y {ocultos} {plural(ocultos, 'cliente')} más
            </li>
          )}
        </ul>
      )}
    </motion.section>
  )
}

/**
 * Sin devoluciones: franja delgada en lugar de tarjeta, para que "todo bien"
 * no ocupe el espacio de un problema
 */
function FranjaAlDia() {
  return (
    // Aparece después de cargar, cuando la cascada del padre ya terminó:
    // necesita su propia animación de entrada o se queda invisible
    <motion.section
      variants={itemVariants}
      initial='hidden'
      animate='visible'
      aria-label='Devoluciones a clientes'
      className='flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-transparent'
    >
      <span className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-600/30'>
        <ShieldCheck className='h-4 w-4' />
      </span>
      <p className='min-w-0 text-sm'>
        <span className='font-semibold text-slate-900 dark:text-white'>
          Sin devoluciones pendientes
        </span>
        <span className='block text-slate-500 dark:text-slate-400 sm:inline'>
          <span className='hidden sm:inline'> · </span>
          No le debemos dinero a ningún cliente
        </span>
      </p>
    </motion.section>
  )
}

/** Casos pendientes (excedentes + renuncias): decide si va tarjeta o franja */
export function contarDevoluciones(
  alertas: DashboardStatsData['alertas']
): number {
  return (
    (alertas.devolucionesPendientes?.total ?? 0) +
    alertas.renunciasPendientes.total
  )
}

export const DevolucionesPanel = memo(DevolucionesPanelComponent)
