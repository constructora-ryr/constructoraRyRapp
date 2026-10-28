'use client'

import { useMemo, useState } from 'react'

import { ArrowLeft, Download, ExternalLink, Search, X } from 'lucide-react'

import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { construirURLCliente } from '@/lib/utils/slug.utils'
import { formatCurrency } from '@/shared/utils/format'
import { cn } from '@/shared/utils/helpers'

import type {
  ClienteEnEntidad,
  EntidadFinancieraResumen,
  EstadoDesembolso,
} from '../types'
import {
  avance,
  etiquetaTipo,
  exportarCSV,
  nombreArchivo,
  TEXTOS_CATEGORIA,
  textoReferencia,
} from '../utils/reportes.utils'

import { BarraDesembolso, IconoEntidad } from './piezas'

type Filtro = 'todos' | 'pendientes' | 'desembolsados'

const ESTADO_CHIP: Record<EstadoDesembolso, { texto: string; clase: string }> =
  {
    desembolsado: {
      texto: 'Desembolsado',
      clase:
        'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
    },
    parcial: {
      texto: 'Parcial',
      clase:
        'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25',
    },
    pendiente: {
      texto: 'Pendiente',
      clase:
        'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25',
    },
  }

function coincide(c: ClienteEnEntidad, texto: string): boolean {
  if (!texto) return true
  const q = texto.toLowerCase()
  return [
    c.clienteNombre,
    c.clienteDocumento,
    c.viviendaLabel,
    c.numeroReferencia,
  ]
    .filter(Boolean)
    .some(v => String(v).toLowerCase().includes(q))
}

interface DetalleEntidadProps {
  entidad: EntidadFinancieraResumen
  /** Solo en celular: vuelve a la lista */
  onVolver?: () => void
}

/** Clientes de una entidad: lo aprobado, lo girado y la referencia o acta */
export function DetalleEntidad({ entidad, onVolver }: DetalleEntidadProps) {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const textos = TEXTOS_CATEGORIA[entidad.categoria]
  const pct = avance(entidad.montoTotalAprobado, entidad.totalDesembolsado)

  const conteo = {
    todos: entidad.clientes.length,
    pendientes: entidad.fuentesPendientes,
    desembolsados: entidad.clientes.length - entidad.fuentesPendientes,
  }
  const visibles = useMemo(
    () =>
      entidad.clientes.filter(
        c =>
          coincide(c, busqueda.trim()) &&
          (filtro === 'todos' ||
            (filtro === 'pendientes') ===
              (c.estadoDesembolso !== 'desembolsado'))
      ),
    [entidad.clientes, busqueda, filtro]
  )

  return (
    <section
      aria-labelledby='detalle-entidad-titulo'
      className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
    >
      {/* Encabezado de la entidad */}
      <div className='border-b border-slate-100 p-5 dark:border-slate-700/60'>
        {onVolver && (
          <button
            type='button'
            onClick={onVolver}
            className='mb-4 inline-flex min-h-[40px] items-center gap-1.5 rounded-lg pr-2 text-sm font-medium text-sky-700 dark:text-sky-300'
          >
            <ArrowLeft className='h-4 w-4' />
            Entidades
          </button>
        )}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-3'>
            <IconoEntidad tipoFuente={entidad.tipoFuente} tamano='lg' />
            <div className='min-w-0'>
              <h2
                id='detalle-entidad-titulo'
                className='truncate text-lg font-bold text-slate-900 dark:text-white'
              >
                {entidad.nombre}
              </h2>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                {etiquetaTipo(entidad.tipo)} · {entidad.totalClientesUnicos}{' '}
                {entidad.totalClientesUnicos === 1 ? 'cliente' : 'clientes'}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={() =>
              exportarCSV(
                [entidad],
                nombreArchivo('financiacion', entidad.nombre)
              )
            }
            className='inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50'
          >
            <Download className='h-4 w-4' />
            <span className='hidden sm:inline'>Exportar</span>
          </button>
        </div>

        <dl className='mt-4 grid grid-cols-3 gap-3'>
          <Total label='Aprobado' valor={entidad.montoTotalAprobado} />
          <Total
            label='Desembolsado'
            valor={entidad.totalDesembolsado}
            clase='text-emerald-700 dark:text-emerald-400'
          />
          <Total
            label='Pendiente'
            valor={entidad.totalPendiente}
            clase={
              entidad.totalPendiente > 0
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-slate-500 dark:text-slate-400'
            }
          />
        </dl>
        <div className='mt-3 flex items-center gap-3'>
          <BarraDesembolso porcentaje={pct} />
          <span className='shrink-0 text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300'>
            {Math.floor(pct)}%
          </span>
        </div>
      </div>

      {/* Herramientas */}
      <div className='flex flex-col gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-700/60 sm:flex-row sm:items-center'>
        <label className='relative flex-1'>
          <span className='sr-only'>Buscar cliente</span>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <input
            type='search'
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder='Cliente, documento, casa o referencia'
            className='h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/30 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-900'
          />
          {busqueda && (
            <button
              type='button'
              onClick={() => setBusqueda('')}
              aria-label='Limpiar búsqueda'
              className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </label>
        <div
          role='group'
          aria-label='Filtrar por desembolso'
          className='flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900/60'
        >
          {(['todos', 'pendientes', 'desembolsados'] as const).map(f => (
            <button
              key={f}
              type='button'
              onClick={() => setFiltro(f)}
              aria-pressed={filtro === f}
              className={cn(
                'flex-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors sm:flex-none',
                filtro === f
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              {f} <span className='tabular-nums opacity-70'>{conteo[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className='px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400'>
          {entidad.clientes.length === 0
            ? 'Esta entidad no tiene clientes.'
            : 'Ningún cliente coincide con la búsqueda o el filtro.'}
        </p>
      ) : (
        <>
          <TablaClientes
            clientes={visibles}
            entidad={entidad}
            columnaValor={textos.valor}
            columnaReferencia={textos.referencia}
          />
          <TarjetasClientes clientes={visibles} entidad={entidad} />
        </>
      )}
    </section>
  )
}

function Total({
  label,
  valor,
  clase = 'text-slate-900 dark:text-white',
}: {
  label: string
  valor: number
  clase?: string
}) {
  return (
    <div className='min-w-0'>
      <dt className='text-xs font-medium text-slate-500 dark:text-slate-400'>
        {label}
      </dt>
      <dd
        className={cn(
          'truncate text-sm font-bold tabular-nums sm:text-base',
          clase
        )}
      >
        {formatCurrency(valor)}
      </dd>
    </div>
  )
}

function urlCliente(c: ClienteEnEntidad): string {
  return construirURLCliente({
    id: c.clienteId,
    nombre_completo: c.clienteNombre,
  })
}

function Casa({ label }: { label: string | null }) {
  return label ? (
    <span className='inline-flex rounded-lg bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25'>
      {label}
    </span>
  ) : (
    <span className='text-xs text-slate-400'>—</span>
  )
}

function Desembolso({ c }: { c: ClienteEnEntidad }) {
  const chip = ESTADO_CHIP[c.estadoDesembolso]
  return (
    <div>
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
          chip.clase
        )}
      >
        {chip.texto}
      </span>
      <p className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
        {c.estadoDesembolso === 'desembolsado'
          ? c.fechaDesembolso
            ? formatDateCompact(c.fechaDesembolso)
            : null
          : `Faltan ${formatCurrency(c.saldoPendiente)}`}
      </p>
    </div>
  )
}

function TablaClientes({
  clientes,
  entidad,
  columnaValor,
  columnaReferencia,
}: {
  clientes: ClienteEnEntidad[]
  entidad: EntidadFinancieraResumen
  columnaValor: string
  columnaReferencia: string
}) {
  return (
    <div className='hidden overflow-x-auto md:block'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-slate-100 text-left text-xs font-medium text-slate-500 dark:border-slate-700/60 dark:text-slate-400'>
            <th className='py-2.5 pl-5 pr-3 font-medium'>Casa</th>
            <th className='px-3 py-2.5 font-medium'>Cliente</th>
            <th className='px-3 py-2.5 text-right font-medium'>
              {columnaValor}
            </th>
            <th className='px-3 py-2.5 font-medium'>Desembolso</th>
            <th className='px-3 py-2.5 font-medium'>{columnaReferencia}</th>
            <th className='py-2.5 pl-3 pr-5'>
              <span className='sr-only'>Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 dark:divide-slate-700/50'>
          {clientes.map(c => (
            <tr
              key={c.fuenteId}
              className='transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-700/30'
            >
              <td className='py-3 pl-5 pr-3'>
                <Casa label={c.viviendaLabel} />
              </td>
              <td className='px-3 py-3'>
                <p className='font-medium text-slate-900 dark:text-white'>
                  {c.clienteNombre}
                </p>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  {[c.clienteTipoDocumento, c.clienteDocumento]
                    .filter(Boolean)
                    .join(' ')}
                </p>
              </td>
              <td className='px-3 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-white'>
                {formatCurrency(c.montoAprobado)}
              </td>
              <td className='px-3 py-3'>
                <Desembolso c={c} />
              </td>
              <td className='px-3 py-3 text-xs text-slate-600 dark:text-slate-300'>
                {textoReferencia(c, entidad.categoria) || '—'}
              </td>
              <td className='py-3 pl-3 pr-5 text-right'>
                <Link
                  href={urlCliente(c)}
                  aria-label={`Abrir ficha de ${c.clienteNombre}`}
                  className='inline-flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:text-slate-500 dark:hover:bg-sky-500/10 dark:hover:text-sky-300'
                >
                  <ExternalLink className='h-4 w-4' />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TarjetasClientes({
  clientes,
  entidad,
}: {
  clientes: ClienteEnEntidad[]
  entidad: EntidadFinancieraResumen
}) {
  return (
    <ul className='divide-y divide-slate-100 dark:divide-slate-700/50 md:hidden'>
      {clientes.map(c => {
        const referencia = textoReferencia(c, entidad.categoria)
        return (
          <li key={c.fuenteId}>
            <Link
              href={urlCliente(c)}
              className='block px-5 py-4 transition-colors active:bg-slate-50 dark:active:bg-slate-700/30'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <Casa label={c.viviendaLabel} />
                    <p className='truncate text-sm font-semibold text-slate-900 dark:text-white'>
                      {c.clienteNombre}
                    </p>
                  </div>
                  <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                    {[c.clienteTipoDocumento, c.clienteDocumento]
                      .filter(Boolean)
                      .join(' ')}
                    {referencia &&
                      ` · ${TEXTOS_CATEGORIA[entidad.categoria].referencia} ${referencia}`}
                  </p>
                </div>
                <p className='shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-white'>
                  {formatCurrency(c.montoAprobado)}
                </p>
              </div>
              <div className='mt-2'>
                <Desembolso c={c} />
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
