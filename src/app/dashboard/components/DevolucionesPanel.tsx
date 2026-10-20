'use client'

import { memo } from 'react'

import { motion } from 'framer-motion'
import { ChevronRight, FileX, HandCoins, ShieldCheck } from 'lucide-react'

import Link from 'next/link'

import { construirURLCliente } from '@/lib/utils/slug.utils'

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

/** La ficha del cliente abre en la pestaña Negociación, donde se registra la devolución */
function abrirEnNegociacion() {
  try {
    sessionStorage.setItem('cliente-tab-intent', 'negociacion')
  } catch {
    // sessionStorage no disponible: la ficha abre en su pestaña por defecto
  }
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
              : totalCasos === 0
                ? 'Dinero a favor de clientes por devolver'
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
      ) : totalCasos === 0 ? (
        <EstadoVacio />
      ) : (
        <ul className='-mx-2 flex flex-col gap-0.5'>
          {devoluciones.items.map(d => {
            const href = permisos.clientes
              ? construirURLCliente({
                  id: d.clienteId,
                  nombre_completo: d.cliente ?? undefined,
                })
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
                  <ChevronRight className='h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600' />
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
                    onClick={abrirEnNegociacion}
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
                      <ChevronRight className='h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600' />
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

function EstadoVacio() {
  return (
    <div className='relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-white px-6 py-10 text-center dark:border-emerald-500/10 dark:from-emerald-500/[0.07] dark:to-transparent'>
      {/* Halo suave detrás del ícono */}
      <span
        aria-hidden
        className='absolute top-6 h-24 w-24 rounded-full bg-emerald-200/40 blur-2xl dark:bg-emerald-500/10'
      />
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className='relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100 dark:bg-slate-800 dark:text-emerald-400 dark:ring-emerald-500/20'
      >
        <ShieldCheck className='h-7 w-7' />
      </motion.span>
      <p className='relative mt-4 text-base font-semibold text-slate-900 dark:text-white'>
        Sin devoluciones pendientes
      </p>
      <p className='relative mt-1.5 max-w-xs text-sm text-slate-500 dark:text-slate-400'>
        No le debemos dinero a ningún cliente. Si alguien paga de más o una
        renuncia requiere devolución, aparecerá aquí.
      </p>
      <span className='relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'>
        <HandCoins className='h-3.5 w-3.5' />
        Todo al día con los clientes
      </span>
    </div>
  )
}

export const DevolucionesPanel = memo(DevolucionesPanelComponent)
