'use client'

/**
 * Historial de pagos del cliente (abonos válidos, más reciente primero):
 * cada fila con el color de su fuente, recibo, fecha, método y monto.
 * Un clic abre el recibo con sus acciones. Muestra los más recientes y el
 * resto al pedirlo, para que la lista no crezca sin fin.
 */

import { useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  Hash,
  Receipt,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import {
  fuenteVisual,
  metodoVisual,
} from '@/modules/abonos/components/lista/fuente-visual'
import { TEMA_ABONOS } from '@/modules/abonos/styles/tema-abonos'
import type { AbonoHistorial, FuentePago } from '@/modules/abonos/types'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import { Hueso } from '@/shared/components/carga'
import { formatCOP } from '@/shared/components/list-page'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'
import { cn } from '@/shared/utils/helpers'

/** Pagos visibles antes de "Ver anteriores" */
const VISIBLES = 6

interface TimelineAbonosProps {
  abonos: AbonoHistorial[]
  fuentesPago?: Pick<FuentePago, 'id' | 'tipo'>[]
  loading: boolean
  onVerDetalle: (abono: AbonoHistorial) => void
}

export function TimelineAbonos({
  abonos,
  fuentesPago = [],
  loading,
  onVerDetalle,
}: TimelineAbonosProps) {
  const tipoDe = useMemo(() => {
    const mapa = new Map(fuentesPago.map(f => [f.id, f.tipo]))
    return (a: AbonoHistorial) =>
      mapa.get(a.fuente_pago_id) ?? a.fuente_tipo ?? null
  }, [fuentesPago])

  // N° de cuota de los pagos del crédito con la constructora: por fuente y
  // en orden de fecha (el orden de pago = orden de cuota)
  const numeroCuota = useMemo(() => {
    const mapa = new Map<string, number>()
    const porFuente = new Map<string, AbonoHistorial[]>()
    for (const a of abonos) {
      if (!esCreditoConstructora(tipoDe(a))) continue
      const grupo = porFuente.get(a.fuente_pago_id) ?? []
      grupo.push(a)
      porFuente.set(a.fuente_pago_id, grupo)
    }
    for (const grupo of porFuente.values()) {
      ;[...grupo]
        .sort(
          (x, y) =>
            new Date(x.fecha_abono).getTime() -
            new Date(y.fecha_abono).getTime()
        )
        .forEach((a, i) => mapa.set(a.id, i + 1))
    }
    return mapa
  }, [abonos, tipoDe])

  const total = abonos.reduce((s, a) => s + (a.monto || 0), 0)

  // Filtro por fuente (solo si los pagos vienen de más de una)
  const [fuenteFiltro, setFuenteFiltro] = useState<string>('todas')
  const chipsFuente = useMemo(() => {
    const conteo = new Map<string, number>()
    for (const a of abonos) {
      const t = tipoDe(a) ?? 'Pago'
      conteo.set(t, (conteo.get(t) ?? 0) + 1)
    }
    return [...conteo.entries()].map(([tipo, n]) => ({ tipo, n }))
  }, [abonos, tipoDe])
  const filtrados =
    fuenteFiltro === 'todas'
      ? abonos
      : abonos.filter(a => (tipoDe(a) ?? 'Pago') === fuenteFiltro)

  const [verTodos, setVerTodos] = useState(false)
  const ocultos = Math.max(0, filtrados.length - VISIBLES)
  const visibles = verTodos ? filtrados : filtrados.slice(0, VISIBLES)

  return (
    <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
      <header className='flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/60'>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${TEMA_ABONOS.icono}`}
        >
          <Receipt className='h-5 w-5' />
        </span>
        <div className='min-w-0 flex-1'>
          <h2 className='text-sm font-bold text-slate-900 dark:text-white'>
            Historial de pagos
          </h2>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {loading ? (
              'Cargando…'
            ) : abonos.length === 0 ? (
              'Sin pagos todavía'
            ) : (
              <>
                {abonos.length} recibo{abonos.length !== 1 ? 's' : ''} ·{' '}
                <span className='font-bold tabular-nums text-emerald-600 dark:text-emerald-400'>
                  {formatCOP(total)}
                </span>
              </>
            )}
          </p>
        </div>

        {!loading && chipsFuente.length > 1 ? (
          <div
            role='radiogroup'
            aria-label='Filtrar pagos por fuente'
            className='flex w-full flex-wrap gap-1.5 sm:w-auto'
          >
            {[{ tipo: 'todas', n: abonos.length }, ...chipsFuente].map(c => {
              const activo = fuenteFiltro === c.tipo
              const visual = c.tipo === 'todas' ? null : fuenteVisual(c.tipo)
              const IconoChip = visual?.icon
              return (
                <button
                  key={c.tipo}
                  type='button'
                  role='radio'
                  aria-checked={activo}
                  onClick={() => {
                    setFuenteFiltro(c.tipo)
                    setVerTodos(false)
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
                    activo
                      ? 'bg-violet-600 text-white ring-violet-600 dark:bg-violet-500 dark:ring-violet-500'
                      : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700'
                  )}
                >
                  {IconoChip ? <IconoChip className='h-3.5 w-3.5' /> : null}
                  {c.tipo === 'todas' ? 'Todas' : c.tipo}
                  <span
                    className={cn(
                      'tabular-nums',
                      activo ? 'text-white/80' : 'text-slate-400'
                    )}
                  >
                    {c.n}
                  </span>
                </button>
              )
            })}
          </div>
        ) : null}
      </header>

      {loading ? (
        <div className='space-y-3 p-4'>
          {[0, 1, 2].map(i => (
            <div key={i} className='flex items-center gap-3'>
              <Hueso className='h-10 w-10 rounded-xl' />
              <div className='flex-1 space-y-1.5'>
                <Hueso className='h-3 w-24' />
                <Hueso className='h-3 w-40' />
              </div>
              <Hueso className='h-4 w-20' />
            </div>
          ))}
        </div>
      ) : abonos.length === 0 ? (
        <div className='px-6 py-10 text-center'>
          <span className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-400 dark:bg-violet-500/10 dark:text-violet-300'>
            <Receipt className='h-6 w-6' />
          </span>
          <p className='text-sm font-semibold text-slate-600 dark:text-slate-300'>
            Aún no hay pagos registrados
          </p>
          <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
            Aparecerán aquí al registrar el primer abono o desembolso.
          </p>
        </div>
      ) : (
        <ul className='divide-y divide-slate-100 dark:divide-slate-700/60'>
          {visibles.map((abono, i) => {
            const tipo = tipoDe(abono)
            const { icon: Icono, gradient } = fuenteVisual(tipo ?? '')
            const metodo = metodoVisual(abono.metodo_pago ?? '')
            const IconoMetodo = metodo.icon
            const trasladado = Boolean(abono.trasladado_desde_negociacion_id)
            const cuota = numeroCuota.get(abono.id)

            return (
              <motion.li
                key={abono.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.03 }}
              >
                <button
                  type='button'
                  onClick={() => onVerDetalle(abono)}
                  className='group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-violet-50/60 focus-visible:bg-violet-50/60 focus-visible:outline-none dark:hover:bg-violet-500/5 dark:focus-visible:bg-violet-500/5'
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                      trasladado ? 'from-amber-500 to-orange-600' : gradient
                    )}
                  >
                    {trasladado ? (
                      <ArrowRightLeft className='h-4 w-4' />
                    ) : (
                      <Icono className='h-4 w-4' />
                    )}
                  </span>

                  <span className='min-w-0 flex-1 md:flex md:items-center md:gap-4'>
                    <span className='flex flex-wrap items-center gap-1.5 md:min-w-0 md:flex-1'>
                      {abono.numero_recibo ? (
                        <span className='font-mono text-xs font-bold text-violet-700 dark:text-violet-300'>
                          {formatearNumeroRecibo(abono.numero_recibo)}
                        </span>
                      ) : null}
                      <span className='text-sm font-semibold text-slate-900 dark:text-white'>
                        {tipo ?? 'Pago'}
                      </span>
                      {cuota ? (
                        <span className='rounded-full bg-violet-100 px-2 py-px text-[11px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'>
                          Cuota {cuota}
                        </span>
                      ) : null}
                      {trasladado ? (
                        <span className='rounded-full bg-amber-100 px-2 py-px text-[11px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'>
                          Trasladado
                        </span>
                      ) : null}
                    </span>
                    <span className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 md:mt-0 md:shrink-0 md:justify-end'>
                      <span className='tabular-nums'>
                        {formatDateCompact(abono.fecha_abono)}
                      </span>
                      {abono.metodo_pago ? (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-px text-[11px] font-medium ring-1 ring-inset',
                            metodo.cls
                          )}
                        >
                          <IconoMetodo className='h-3 w-3' />
                          {abono.metodo_pago}
                        </span>
                      ) : null}
                      {abono.numero_referencia ? (
                        <span className='inline-flex items-center gap-0.5'>
                          <Hash className='h-3 w-3' />
                          {abono.numero_referencia}
                        </span>
                      ) : null}
                    </span>
                  </span>

                  <span className='flex shrink-0 items-center gap-1 md:w-40 md:justify-end'>
                    <span className='text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-base'>
                      {formatCOP(abono.monto)}
                    </span>
                    <ChevronRight className='h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500 dark:text-slate-600' />
                  </span>
                </button>
              </motion.li>
            )
          })}
          {ocultos > 0 ? (
            <li>
              <button
                type='button'
                onClick={() => setVerTodos(v => !v)}
                aria-expanded={verTodos}
                className='flex w-full items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50/60 dark:text-violet-300 dark:hover:bg-violet-500/5'
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    verTodos && 'rotate-180'
                  )}
                />
                {verTodos
                  ? 'Ver solo los más recientes'
                  : `Ver los ${ocultos} anteriores`}
              </button>
            </li>
          ) : null}
        </ul>
      )}
    </section>
  )
}
