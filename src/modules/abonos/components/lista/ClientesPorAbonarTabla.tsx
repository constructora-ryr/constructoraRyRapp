'use client'

/**
 * Clientes con negociación activa para elegir a quién registrarle un abono.
 * Columnas: Cliente · Vivienda (con proyecto) · Fuentes de pago (cuánto ha
 * entrado de cada una) · Saldo y avance · acción "Abonar".
 * En móvil (< md) la misma información va en tarjetas apiladas.
 */

import { useMemo } from 'react'

import { type ColumnDef } from '@tanstack/react-table'
import { ArrowRight, Building2, Home } from 'lucide-react'

import { formatNombreCompleto, toTitleCase } from '@/lib/utils/string.utils'
import { TEMA_ABONOS } from '@/modules/abonos/styles/tema-abonos'
import { formatCOP, PagoProgreso } from '@/shared/components/list-page'
import { DataTable } from '@/shared/components/table/DataTable'
import { cn } from '@/shared/utils/helpers'

import type { NegociacionConAbonos } from '../../types'

import { avatarGradient, fuenteVisual, inicialesCliente } from './fuente-visual'

interface ClientesPorAbonarTablaProps {
  negociaciones: NegociacionConAbonos[]
  onAbrir: (negociacion: NegociacionConAbonos) => void
}

const styles = {
  avatar:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-sm',
  nombre: 'block truncate text-sm font-semibold text-slate-900 dark:text-white',
  secundario:
    'block truncate text-xs tabular-nums text-slate-500 dark:text-slate-400',
  chipVivienda:
    'inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-700 ring-1 ring-inset ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  botonAbonar: `inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 ${TEMA_ABONOS.boton}`,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** "14890678" → "14.890.678" (solo si es numérico) */
const formatDocumento = (n: string | null | undefined) =>
  n && /^\d+$/.test(n) ? Number(n).toLocaleString('es-CO') : (n ?? '')

const nombreDe = (n: NegociacionConAbonos) =>
  formatNombreCompleto(`${n.cliente.nombres} ${n.cliente.apellidos}`)

const codigoVivienda = (n: NegociacionConAbonos) =>
  `${n.vivienda.manzana?.nombre || ''}${n.vivienda.numero || ''}`

/** A1, A2, … A10, B1 (orden natural) */
const compararVivienda = (a: NegociacionConAbonos, b: NegociacionConAbonos) =>
  codigoVivienda(a).localeCompare(codigoVivienda(b), undefined, {
    numeric: true,
  })

const valorTotalDe = (n: NegociacionConAbonos) =>
  n.valor_total_pagar || n.valor_total || 0

// ── Celdas (compartidas por la tabla y las tarjetas) ─────────────────────────

function CeldaCliente({ n }: { n: NegociacionConAbonos }) {
  const nombre = nombreDe(n)
  return (
    <div className='flex min-w-0 items-center gap-3'>
      <span
        aria-hidden
        className={cn(styles.avatar, avatarGradient(n.cliente.id))}
      >
        {inicialesCliente(n.cliente)}
      </span>
      <span className='min-w-0'>
        <span className={styles.nombre} title={nombre}>
          {nombre}
        </span>
        <span className={styles.secundario}>
          CC {formatDocumento(n.cliente.numero_documento)}
        </span>
      </span>
    </div>
  )
}

function CeldaVivienda({ n }: { n: NegociacionConAbonos }) {
  const codigo = codigoVivienda(n)
  return (
    <span className='flex min-w-0 flex-col items-start gap-1'>
      <span className={styles.chipVivienda}>
        <Home className='h-3.5 w-3.5' />
        {codigo || 'Vivienda'}
      </span>
      {n.proyecto?.nombre ? (
        <span className='flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
          <Building2 className='h-3 w-3 text-green-600 dark:text-green-400' />
          {toTitleCase(n.proyecto.nombre)}
        </span>
      ) : null}
    </span>
  )
}

/** Un ícono por fuente; el anillo inferior muestra cuánto ha entrado */
function CeldaFuentes({ n }: { n: NegociacionConAbonos }) {
  if (n.fuentes_pago.length === 0)
    return <span className='text-xs text-slate-300 dark:text-slate-600'>—</span>

  return (
    <span className='flex flex-wrap gap-1.5'>
      {n.fuentes_pago.map(f => {
        const { icon: Icono, gradient, solid } = fuenteVisual(f.tipo)
        const aprobado = f.monto_aprobado || 0
        const recibido = f.monto_recibido || 0
        const pct =
          aprobado > 0
            ? Math.min(100, Math.round((recibido / aprobado) * 100))
            : 0
        const completa = aprobado > 0 && recibido >= aprobado
        return (
          <span
            key={f.id}
            title={`${f.tipo}${f.entidad ? ` · ${f.entidad}` : ''}: ${formatCOP(recibido)} de ${formatCOP(aprobado)}${completa ? ' ✓' : ''}`}
            className='flex w-8 flex-col items-center gap-0.5'
          >
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
                gradient,
                recibido === 0 && 'opacity-40 grayscale-[40%]'
              )}
            >
              <Icono className='h-3.5 w-3.5' />
            </span>
            <span className='block h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700'>
              <span
                className={cn('block h-full rounded-full', solid)}
                style={{ width: `${pct}%` }}
              />
            </span>
          </span>
        )
      })}
    </span>
  )
}

/**
 * Lo que las fuentes cubren por encima del total (p.ej. un bono de feria que
 * baja el precio sin tocar las fuentes): se le devuelve al cliente. El saldo
 * es lo que falta recibir de las fuentes, así que lo incluye.
 */
const excedenteDe = (n: NegociacionConAbonos) =>
  Math.max(0, (n.total_fuentes_pago || 0) - valorTotalDe(n))

function CeldaPago({ n }: { n: NegociacionConAbonos }) {
  const valorTotal = valorTotalDe(n)
  const excedente = excedenteDe(n)
  const devuelto = n.excedente_devolucion_estado === 'procesada'
  return (
    <div className='min-w-0'>
      <PagoProgreso
        valorTotal={valorTotal}
        saldo={n.saldo_pendiente || 0}
        porcentaje={Math.floor(n.porcentaje_pagado || 0)}
      />
      <span className='mt-0.5 block text-xs tabular-nums text-emerald-700 dark:text-emerald-400'>
        Abonado {formatCOP(n.total_abonado || 0)}
      </span>
      {excedente > 0 ? (
        <span
          title={`Las fuentes de pago suman ${formatCOP(n.total_fuentes_pago || 0)}, ${formatCOP(excedente)} más que el total a pagar. Ese excedente ${devuelto ? 'ya se devolvió' : 'se le devuelve'} al cliente.`}
          className={cn(
            'mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ring-1 ring-inset',
            devuelto
              ? 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700/60 dark:text-slate-300'
              : 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300'
          )}
        >
          Excedente {formatCOP(excedente)} ·{' '}
          {devuelto ? 'devuelto' : 'por devolver'}
        </span>
      ) : null}
    </div>
  )
}

// ── Componente ───────────────────────────────────────────────────────────────

export function ClientesPorAbonarTabla({
  negociaciones,
  onAbrir,
}: ClientesPorAbonarTablaProps) {
  const columns: ColumnDef<NegociacionConAbonos>[] = [
    {
      id: 'cliente',
      header: 'Cliente',
      size: 280,
      accessorFn: row => `${row.cliente.apellidos} ${row.cliente.nombres}`,
      cell: ({ row }) => <CeldaCliente n={row.original} />,
    },
    {
      id: 'vivienda',
      header: 'Vivienda',
      size: 170,
      accessorFn: row => codigoVivienda(row),
      sortingFn: (a, b) => compararVivienda(a.original, b.original),
      cell: ({ row }) => <CeldaVivienda n={row.original} />,
    },
    {
      id: 'fuentes',
      header: 'Fuentes de pago',
      size: 170,
      enableSorting: false,
      cell: ({ row }) => <CeldaFuentes n={row.original} />,
    },
    // Ordenable: primero quien más debe
    {
      id: 'saldo',
      header: 'Saldo y avance',
      size: 240,
      accessorFn: row => row.saldo_pendiente || 0,
      sortDescFirst: true,
      cell: ({ row }) => <CeldaPago n={row.original} />,
    },
    {
      id: 'accion',
      header: () => <span className='sr-only'>Acción</span>,
      size: 110,
      enableSorting: false,
      meta: { align: 'right' },
      cell: () => (
        // La fila entera abre el cliente; el botón lo hace evidente
        <span className={styles.botonAbonar}>
          Abonar
          <ArrowRight className='h-3.5 w-3.5' />
        </span>
      ),
    },
  ]

  // Móvil: mismo orden por vivienda que la tabla
  const enOrden = useMemo(
    () => [...negociaciones].sort(compararVivienda),
    [negociaciones]
  )

  return (
    <>
      {/* Móvil: tarjetas apiladas */}
      <ul className='space-y-3 md:hidden'>
        {enOrden.map(n => (
          <li key={n.id}>
            <button
              type='button'
              onClick={() => onAbrir(n)}
              className='w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 active:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/60 dark:active:bg-slate-700/40'
            >
              <div className='flex items-start justify-between gap-3'>
                <CeldaCliente n={n} />
                <CeldaVivienda n={n} />
              </div>
              <div className='mt-3 border-t border-slate-100 pt-3 dark:border-slate-700/60'>
                <CeldaPago n={n} />
              </div>
              <div className='mt-3 flex items-center justify-between gap-3'>
                <CeldaFuentes n={n} />
                <span className={styles.botonAbonar}>
                  Abonar
                  <ArrowRight className='h-3.5 w-3.5' />
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla */}
      <div className='hidden md:block'>
        <DataTable
          columns={columns}
          data={negociaciones}
          initialSorting={[{ id: 'vivienda', desc: false }]}
          onRowClick={onAbrir}
          pageSize={25}
          variant='clean'
          headerGradient={TEMA_ABONOS.degradado}
        />
      </div>
    </>
  )
}
