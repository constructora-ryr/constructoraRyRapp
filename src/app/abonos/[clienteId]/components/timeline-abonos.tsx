'use client'

/**
 * Pagos recibidos del cliente, como un extracto: una fila por pago (más
 * reciente primero) con la fecha a la izquierda, la fuente, el recibo, el
 * método y el monto a la derecha, y el total al pie. Los pagos casi nunca
 * coinciden en el mismo día, así que la fecha va en la fila y no como
 * encabezado de grupo. Es un registro, no
 * una acción: estilo neutro para no competir con "Por cobrar".
 * Un clic abre el recibo con sus acciones. Muestra los más recientes y el
 * resto al pedirlo, para que la lista no crezca sin fin.
 */

import { useMemo, useState } from 'react'

import {
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  Receipt,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { fuenteVisual } from '@/modules/abonos/components/lista/fuente-visual'
import type { AbonoHistorial, FuentePago } from '@/modules/abonos/types'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import { Hueso } from '@/shared/components/carga'
import { formatCOP } from '@/shared/components/list-page'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'
import { cn } from '@/shared/utils/helpers'

import { TituloSeccion } from './titulo-seccion'

/** Pagos visibles antes de "Ver anteriores" */
const VISIBLES = 8

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
  const totalFiltrado = filtrados.reduce((s, a) => s + (a.monto || 0), 0)

  const filtros =
    !loading && chipsFuente.length > 1 ? (
      <div
        role='radiogroup'
        aria-label='Filtrar pagos por fuente'
        className='flex flex-wrap gap-1.5'
      >
        {[{ tipo: 'todas', n: abonos.length }, ...chipsFuente].map(c => {
          const activo = fuenteFiltro === c.tipo
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
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-colors',
                activo
                  ? 'bg-slate-900 text-white ring-slate-900 dark:bg-white dark:text-slate-900 dark:ring-white'
                  : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700'
              )}
            >
              {c.tipo === 'todas' ? 'Todas' : c.tipo}
              <span
                className={cn(
                  'tabular-nums',
                  activo ? 'opacity-70' : 'text-slate-400'
                )}
              >
                {c.n}
              </span>
            </button>
          )
        })}
      </div>
    ) : null

  return (
    <section className='space-y-3'>
      <TituloSeccion
        icon={Receipt}
        titulo='Pagos recibidos'
        detalle={
          loading
            ? 'Cargando…'
            : abonos.length > 0
              ? `${abonos.length} recibo${abonos.length !== 1 ? 's' : ''}`
              : null
        }
        acciones={filtros}
      />

      <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/60 dark:bg-slate-800/60'>
        {loading ? (
          <div className='space-y-3 p-4'>
            {[0, 1, 2].map(i => (
              <div key={i} className='flex items-center gap-3'>
                <Hueso className='h-8 w-8 rounded-lg' />
                <div className='flex-1 space-y-1.5'>
                  <Hueso className='h-3 w-32' />
                  <Hueso className='h-3 w-48' />
                </div>
                <Hueso className='h-4 w-24' />
              </div>
            ))}
          </div>
        ) : abonos.length === 0 ? (
          <div className='px-6 py-10 text-center'>
            <Receipt className='mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-slate-600' />
            <p className='text-sm font-semibold text-slate-600 dark:text-slate-300'>
              Aún no hay pagos registrados
            </p>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Aparecerán aquí al registrar el primer abono o desembolso.
            </p>
          </div>
        ) : (
          <>
            <ul>
              {visibles.map(abono => (
                <FilaPago
                  key={abono.id}
                  abono={abono}
                  tipo={tipoDe(abono)}
                  cuota={numeroCuota.get(abono.id)}
                  onVerDetalle={onVerDetalle}
                />
              ))}
              {ocultos > 0 ? (
                <li className='border-t border-slate-100 dark:border-slate-700/60'>
                  <button
                    type='button'
                    onClick={() => setVerTodos(v => !v)}
                    aria-expanded={verTodos}
                    className='flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/40'
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

            {/* Total al pie, como en un estado de cuenta */}
            <div className='flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40'>
              <span className='text-sm font-semibold text-slate-600 dark:text-slate-300'>
                {fuenteFiltro === 'todas'
                  ? 'Total recibido'
                  : `Total ${fuenteFiltro}`}
              </span>
              <span className='text-base font-bold tabular-nums text-slate-900 dark:text-white'>
                {formatCOP(fuenteFiltro === 'todas' ? total : totalFiltrado)}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

/** Una línea del extracto: fuente, recibo · método · referencia y monto */
function FilaPago({
  abono,
  tipo,
  cuota,
  onVerDetalle,
}: {
  abono: AbonoHistorial
  tipo: string | null
  cuota?: number
  onVerDetalle: (abono: AbonoHistorial) => void
}) {
  const { icon: Icono, text } = fuenteVisual(tipo ?? '')
  const trasladado = Boolean(abono.trasladado_desde_negociacion_id)
  const fecha = formatDateCompact(abono.fecha_abono)
  const meta = [
    abono.numero_recibo ? formatearNumeroRecibo(abono.numero_recibo) : null,
    abono.metodo_pago,
    abono.numero_referencia ? `Ref. ${abono.numero_referencia}` : null,
  ].filter(Boolean)

  return (
    <li className='border-t border-slate-100 first:border-t-0 dark:border-slate-700/60'>
      <button
        type='button'
        onClick={() => onVerDetalle(abono)}
        className='group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none dark:hover:bg-slate-700/30 dark:focus-visible:bg-slate-700/30'
      >
        <time
          dateTime={abono.fecha_abono}
          className='hidden w-24 shrink-0 text-sm tabular-nums text-slate-500 dark:text-slate-400 sm:block'
        >
          {fecha}
        </time>

        {/* Ícono discreto: el color de la fuente sin el bloque en degradado */}
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/60',
            trasladado ? 'text-amber-600 dark:text-amber-400' : text
          )}
        >
          {trasladado ? (
            <ArrowRightLeft className='h-4 w-4' />
          ) : (
            <Icono className='h-4 w-4' />
          )}
        </span>

        <span className='min-w-0 flex-1'>
          <span className='flex flex-wrap items-center gap-1.5'>
            <span className='text-sm font-medium text-slate-900 dark:text-white'>
              {tipo ?? 'Pago'}
            </span>
            {cuota ? (
              <span className='rounded-full bg-slate-100 px-2 py-px text-[11px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300'>
                Cuota {cuota}
              </span>
            ) : null}
            {trasladado ? (
              <span className='rounded-full bg-amber-100 px-2 py-px text-[11px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'>
                Trasladado
              </span>
            ) : null}
          </span>
          <span className='mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400'>
            {/* En celular la fecha no tiene columna: va al inicio de esta línea */}
            <span className='sm:hidden'>
              {fecha}
              {meta.length > 0 ? ' · ' : ''}
            </span>
            {meta.join(' · ')}
          </span>
        </span>

        <span className='flex shrink-0 items-center gap-1'>
          <span className='text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-base'>
            {formatCOP(abono.monto)}
          </span>
          <ChevronRight className='h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600' />
        </span>
      </button>
    </li>
  )
}
