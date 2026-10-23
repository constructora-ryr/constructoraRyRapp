/**
 * ViviendasTabla - Vista de tabla para viviendas
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ DataTable variant='clean' con encabezado en degradado del módulo (fijo)
 * ✅ Colores de estado desde @/shared/config/estados.colors
 *
 * Columnas: Vivienda ("A1" + manzana/casa + proyecto) · Cliente · Estado ·
 * Matrícula y dirección · Pago · Acciones (menú ⋯)
 *
 * En móvil (< md) la misma información se muestra como tarjetas apiladas.
 */

'use client'

import { useMemo } from 'react'

import { type ColumnDef } from '@tanstack/react-table'
import {
  Building2,
  Home,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Trash2,
  User,
} from 'lucide-react'

import { toTitleCase } from '@/lib/utils/string.utils'
import { formatCOP, PagoProgreso } from '@/shared/components/list-page'
import { DataTable } from '@/shared/components/table/DataTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { VIVIENDA_ESTADO_BADGE } from '@/shared/config/estados.colors'
import { cn } from '@/shared/utils/helpers'

import type { Vivienda } from '../types'

interface ViviendasTablaProps {
  viviendas: Vivienda[]
  onView?: (vivienda: Vivienda) => void
  onEdit?: (vivienda: Vivienda) => void
  onDelete?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

// ── Estilos del módulo ───────────────────────────────────────────────────────
const styles = {
  tile: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
  codigo: 'text-base font-bold leading-tight text-slate-900 dark:text-white',
  secundario:
    'block truncate text-xs tabular-nums text-slate-500 dark:text-slate-400',
  badge:
    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
  esquinera:
    'inline-flex items-center rounded-md bg-amber-100 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  vacio: 'text-xs text-slate-300 dark:text-slate-600',
  accionesTrigger:
    'rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:data-[state=open]:bg-slate-700',
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function configEstado(estado: string) {
  return (
    VIVIENDA_ESTADO_BADGE[estado] ?? {
      label: estado,
      dot: 'bg-slate-400',
      badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
      icon: Home,
      gradient: 'from-slate-500 to-slate-700',
      iconFilled: false,
    }
  )
}

/** "A1" = manzana + número, como se nombra en toda la app */
const codigoVivienda = (v: Vivienda) => `${v.manzanas?.nombre ?? ''}${v.numero}`

const estaNegociada = (v: Vivienda) => v.estado !== 'Disponible'

/** A1, A2, … A10, B1 (orden natural por manzana y número) */
function compararVivienda(a: Vivienda, b: Vivienda): number {
  const ma = a.manzanas?.nombre ?? ''
  const mb = b.manzanas?.nombre ?? ''
  if (ma !== mb) return ma.localeCompare(mb)
  return (parseInt(a.numero, 10) || 0) - (parseInt(b.numero, 10) || 0)
}

// ── Celdas (compartidas por la tabla y las tarjetas móviles) ─────────────────
function CeldaVivienda({ v }: { v: Vivienda }) {
  // Siempre una casa (temática del módulo); el color del cuadro indica el estado
  const cfg = configEstado(v.estado)
  const proyecto = toTitleCase(v.manzanas?.proyectos?.nombre)
  return (
    <div className='flex min-w-0 items-center gap-3'>
      <span aria-hidden className={cn(styles.tile, cfg.gradient)}>
        <Home className='h-5 w-5' />
      </span>
      <span className='min-w-0'>
        <span className='flex items-center gap-1.5'>
          <span className={styles.codigo}>{codigoVivienda(v)}</span>
          {v.es_esquinera && (
            <span className={styles.esquinera}>Esquinera</span>
          )}
        </span>
        <span className={styles.secundario}>
          Manzana {v.manzanas?.nombre ?? '—'} · Casa {v.numero}
        </span>
        {proyecto && (
          <span className='flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
            <Building2 className='h-3 w-3 text-orange-500 dark:text-orange-400' />
            {proyecto}
          </span>
        )}
      </span>
    </div>
  )
}

function CeldaCliente({ v }: { v: Vivienda }) {
  const nombre = v.clientes?.nombre_completo
  if (!estaNegociada(v) || !nombre) {
    return (
      <span className='text-xs italic text-slate-400 dark:text-slate-500'>
        Sin asignar
      </span>
    )
  }
  return (
    <span className='block min-w-0'>
      <span className='flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white'>
        <User className='h-3.5 w-3.5 shrink-0 text-slate-400' />
        <span className='truncate' title={toTitleCase(nombre)}>
          {toTitleCase(nombre)}
        </span>
      </span>
      {v.clientes?.telefono && (
        <span className='mt-0.5 flex items-center gap-1 text-xs tabular-nums text-slate-500 dark:text-slate-400'>
          <Phone className='h-3 w-3 shrink-0' />
          {v.clientes.telefono}
        </span>
      )}
    </span>
  )
}

function CeldaEstado({ v }: { v: Vivienda }) {
  const cfg = configEstado(v.estado)
  const Icono = cfg.icon
  return (
    <span className={cn(styles.badge, cfg.badge)}>
      <Icono className='h-3.5 w-3.5' />
      {cfg.label}
    </span>
  )
}

function CeldaMatricula({ v }: { v: Vivienda }) {
  if (!v.matricula_inmobiliaria && !v.nomenclatura) {
    return <span className={styles.vacio}>—</span>
  }
  return (
    <span className='block min-w-0'>
      <span className='block truncate text-sm font-medium tabular-nums text-slate-700 dark:text-slate-200'>
        {v.matricula_inmobiliaria || '—'}
      </span>
      {v.nomenclatura && (
        <span className='flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
          <MapPin className='h-3 w-3 shrink-0' />
          <span className='truncate'>{toTitleCase(v.nomenclatura)}</span>
        </span>
      )}
    </span>
  )
}

function CeldaPago({ v }: { v: Vivienda }) {
  const valorTotal = v.valor_total || 0
  if (!estaNegociada(v)) {
    // Disponible: se muestra el precio
    return (
      <span className='block'>
        <span className='text-sm font-semibold tabular-nums text-slate-900 dark:text-white'>
          {formatCOP(valorTotal)}
        </span>
        <span className={styles.secundario}>precio</span>
      </span>
    )
  }
  return (
    <PagoProgreso
      valorTotal={v.valor_negociado || valorTotal}
      saldo={v.saldo_pendiente || 0}
      porcentaje={Math.floor(v.porcentaje_pagado || 0)}
    />
  )
}

interface MenuAccionesProps {
  v: Vivienda
  onEdit?: (vivienda: Vivienda) => void
  onDelete?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

function MenuAcciones({
  v,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: MenuAccionesProps) {
  const puedeEditar = canEdit && !!onEdit
  // Solo se elimina una vivienda sin negociación
  const puedeEliminar = canDelete && !!onDelete && v.estado === 'Disponible'

  // El detalle se abre con clic en la fila: el menú es solo para acciones
  if (!puedeEditar && !puedeEliminar) return null

  return (
    // Evita que el clic en el menú abra el detalle (la fila/tarjeta es clicable)
    <div
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
      className='inline-flex'
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            aria-label={`Acciones para la vivienda ${codigoVivienda(v)}`}
            className={styles.accionesTrigger}
          >
            <MoreHorizontal className='h-4 w-4' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44'>
          {puedeEditar && (
            <DropdownMenuItem onClick={() => onEdit?.(v)}>
              <Pencil className='mr-2 h-4 w-4' />
              Editar
            </DropdownMenuItem>
          )}
          {puedeEliminar && (
            <>
              {puedeEditar && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => onDelete?.(v.id)}
                className='text-red-600 focus:text-red-700 dark:text-red-400'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ── Componente ───────────────────────────────────────────────────────────────
export function ViviendasTabla({
  viviendas,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ViviendasTablaProps) {
  const accionesProps = { onEdit, onDelete, canEdit, canDelete }

  const columns: ColumnDef<Vivienda>[] = [
    {
      id: 'identificador',
      header: 'Vivienda',
      size: 260,
      accessorFn: row => codigoVivienda(row),
      sortingFn: (a, b) => compararVivienda(a.original, b.original),
      cell: ({ row }) => <CeldaVivienda v={row.original} />,
    },
    {
      id: 'cliente',
      header: 'Cliente',
      size: 240,
      accessorFn: row =>
        estaNegociada(row) ? (row.clientes?.nombre_completo ?? '') : '',
      cell: ({ row }) => <CeldaCliente v={row.original} />,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 130,
      cell: ({ row }) => <CeldaEstado v={row.original} />,
    },
    {
      accessorKey: 'matricula_inmobiliaria',
      header: 'Matrícula y dirección',
      size: 200,
      cell: ({ row }) => <CeldaMatricula v={row.original} />,
    },
    // Ordenable: primero las que más deben
    {
      id: 'pago',
      header: 'Pago',
      size: 220,
      accessorFn: row => (estaNegociada(row) ? row.saldo_pendiente || 0 : -1),
      sortDescFirst: true,
      cell: ({ row }) => <CeldaPago v={row.original} />,
    },
    {
      id: 'acciones',
      header: () => <span className='sr-only'>Acciones</span>,
      size: 56,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => <MenuAcciones v={row.original} {...accionesProps} />,
    },
  ]

  const viviendasMovil = useMemo(
    () => [...viviendas].sort(compararVivienda),
    [viviendas]
  )

  return (
    <>
      {/* Móvil: tarjetas apiladas */}
      <ul className='space-y-3 md:hidden'>
        {viviendasMovil.map(v => (
          <li key={v.id}>
            <div
              role={onView ? 'button' : undefined}
              tabIndex={onView ? 0 : undefined}
              onClick={onView ? () => onView(v) : undefined}
              onKeyDown={
                onView
                  ? e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onView(v)
                      }
                    }
                  : undefined
              }
              className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/60 dark:active:bg-slate-700/40'
            >
              <div className='flex items-start justify-between gap-2'>
                <CeldaVivienda v={v} />
                <MenuAcciones v={v} {...accionesProps} />
              </div>
              <div className='mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
                <CeldaEstado v={v} />
                <CeldaCliente v={v} />
              </div>
              <div className='mt-3 border-t border-slate-100 pt-3 dark:border-slate-700/60'>
                <CeldaPago v={v} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla */}
      <div className='hidden md:block'>
        <DataTable
          columns={columns}
          data={viviendas}
          pageSize={20}
          initialSorting={[{ id: 'identificador', desc: false }]}
          onRowClick={onView}
          variant='clean'
          headerGradient='from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-amber-800'
        />
      </div>
    </>
  )
}
