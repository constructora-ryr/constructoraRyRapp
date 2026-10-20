/**
 * ClientesTabla - Vista de tabla para clientes
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ DataTable variant='clean' con encabezado en degradado del módulo (fijo)
 * ✅ Colores de estado desde @/shared/config/estados.colors
 *
 * Columnas: Cliente (con documento) · Estado · Vivienda (con proyecto) ·
 * Pago (saldo + avance en una sola columna) · Acciones (menú ⋯)
 *
 * En móvil (< md) la misma información se muestra como tarjetas apiladas.
 */

'use client'

import { useMemo } from 'react'

import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import {
  Building2,
  Home,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
} from 'lucide-react'

import { formatNombreCompleto, toTitleCase } from '@/lib/utils/string.utils'
import { PagoProgreso } from '@/shared/components/list-page'
import { DataTable } from '@/shared/components/table/DataTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { CLIENTE_ESTADO_BADGE } from '@/shared/config/estados.colors'
import { cn } from '@/shared/utils/helpers'

import type { ClienteResumen } from '../types'

interface ClientesTablaProps {
  clientes: ClienteResumen[]
  onView?: (cliente: ClienteResumen) => void
  onEdit?: (cliente: ClienteResumen) => void
  onDelete?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
  initialSorting?: SortingState
}

// ── Estilos del módulo ───────────────────────────────────────────────────────
const styles = {
  avatar:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
  nombre: 'block truncate text-sm font-semibold text-slate-900 dark:text-white',
  secundario:
    'block truncate text-xs tabular-nums text-slate-500 dark:text-slate-400',
  badge:
    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
  chipVivienda:
    'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold ring-1 ring-inset',
  vacio: 'text-xs text-slate-300 dark:text-slate-600',
  accionesTrigger:
    'rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:data-[state=open]:bg-slate-700',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** "14890678" → "14.890.678" (solo si es numérico) */
const formatDocumento = (n: string | null | undefined) =>
  n && /^\d+$/.test(n) ? Number(n).toLocaleString('es-CO') : (n ?? '')

/** Activo con saldo 0 se muestra como Propietario (misma regla de siempre) */
function estadoVisible(c: ClienteResumen): string {
  const pagadoCompleto =
    c.estado === 'Propietario' ||
    (c.estado === 'Activo' && (c.vivienda?.saldo_pendiente ?? 1) === 0)
  return pagadoCompleto ? 'Propietario' : c.estado
}

const tieneVivienda = (c: ClienteResumen) =>
  (c.estado === 'Activo' || c.estado === 'Propietario') && !!c.vivienda

/** "A1" de la vivienda asignada o de interés */
function codigoVivienda(c: ClienteResumen): string {
  if (tieneVivienda(c) && c.vivienda) {
    return `${c.vivienda.nombre_manzana || ''}${c.vivienda.numero_vivienda || ''}`
  }
  if (c.estado === 'Interesado' && c.interes) {
    return `${c.interes.nombre_manzana || ''}${c.interes.numero_vivienda || ''}`
  }
  return ''
}

function datosPago(c: ClienteResumen) {
  if (!tieneVivienda(c) || !c.vivienda) return null
  const valorTotal = c.vivienda.valor_total_pagar || c.vivienda.valor_total || 0
  const saldo = c.vivienda.saldo_pendiente || 0
  const abonado = c.vivienda.total_abonado || 0
  const pagado = saldo === 0 && valorTotal > 0
  const porcentaje = pagado
    ? 100
    : valorTotal > 0
      ? Math.min(Math.floor((abonado / valorTotal) * 100), 99)
      : 0
  return { valorTotal, saldo, pagado, porcentaje }
}

// ── Celdas (compartidas por la tabla y las tarjetas móviles) ─────────────────
function configEstado(estado: string) {
  return (
    CLIENTE_ESTADO_BADGE[estado] ?? {
      label: estado,
      dot: 'bg-slate-400',
      badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
      icon: User,
      gradient: 'from-slate-500 to-slate-700',
      iconFilled: false,
    }
  )
}

function CeldaCliente({ c }: { c: ClienteResumen }) {
  const nombre = formatNombreCompleto(c.nombre_completo)
  const cfg = configEstado(estadoVisible(c))
  const Icono = cfg.icon
  return (
    <div className='flex min-w-0 items-center gap-3'>
      <span aria-hidden className={cn(styles.avatar, cfg.gradient)}>
        <Icono className={cn('h-4 w-4', cfg.iconFilled && 'fill-white')} />
      </span>
      <span className='min-w-0'>
        <span className={styles.nombre} title={nombre}>
          {nombre}
        </span>
        <span className={styles.secundario}>
          {c.tipo_documento ?? 'CC'} {formatDocumento(c.numero_documento)}
        </span>
      </span>
    </div>
  )
}

function CeldaEstado({ c }: { c: ClienteResumen }) {
  const cfg = configEstado(estadoVisible(c))
  const Icono = cfg.icon
  return (
    <span className={cn(styles.badge, cfg.badge)}>
      <Icono className={cn('h-3.5 w-3.5', cfg.iconFilled && 'fill-current')} />
      {cfg.label}
    </span>
  )
}

function CeldaVivienda({ c }: { c: ClienteResumen }) {
  const codigo = codigoVivienda(c)
  const esInteres = c.estado === 'Interesado'
  const proyecto = tieneVivienda(c)
    ? c.vivienda?.nombre_proyecto
    : esInteres
      ? c.interes?.nombre_proyecto
      : null

  if (!codigo && !proyecto) return <span className={styles.vacio}>—</span>

  const cfg = configEstado(estadoVisible(c))
  return (
    <span className='flex min-w-0 flex-col items-start gap-1'>
      {codigo ? (
        <span className={cn(styles.chipVivienda, cfg.badge)}>
          <Home className='h-3.5 w-3.5' />
          {codigo}
          {esInteres && (
            <span className='font-medium opacity-75'>· interés</span>
          )}
        </span>
      ) : (
        <span className={styles.vacio}>—</span>
      )}
      {proyecto && (
        <span className='flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
          <Building2 className='h-3 w-3 text-green-600 dark:text-green-400' />
          {toTitleCase(proyecto)}
        </span>
      )}
    </span>
  )
}

function CeldaPago({ c }: { c: ClienteResumen }) {
  const p = datosPago(c)
  if (!p) return <span className={styles.vacio}>—</span>
  return (
    <PagoProgreso
      valorTotal={p.valorTotal}
      saldo={p.saldo}
      porcentaje={p.porcentaje}
    />
  )
}

interface MenuAccionesProps {
  c: ClienteResumen
  onEdit?: (cliente: ClienteResumen) => void
  onDelete?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

function MenuAcciones({
  c,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: MenuAccionesProps) {
  const puedeEliminar =
    canDelete &&
    !!onDelete &&
    c.estadisticas.negociaciones_activas === 0 &&
    c.estado !== 'Propietario' &&
    c.estado !== 'En Proceso de Renuncia'
  const puedeEditar = canEdit && !!onEdit

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
            aria-label={`Acciones para ${c.nombre_completo}`}
            className={styles.accionesTrigger}
          >
            <MoreHorizontal className='h-4 w-4' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44'>
          {puedeEditar && (
            <DropdownMenuItem onClick={() => onEdit?.(c)}>
              <Pencil className='mr-2 h-4 w-4' />
              Editar
            </DropdownMenuItem>
          )}
          {puedeEliminar && (
            <>
              {puedeEditar && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => onDelete?.(c.id)}
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

/** A1, A2, … A10, B1 (orden natural); sin vivienda al final */
function compararVivienda(a: ClienteResumen, b: ClienteResumen): number {
  const va = codigoVivienda(a)
  const vb = codigoVivienda(b)
  if (!va && vb) return 1
  if (va && !vb) return -1
  if (!va && !vb) return 0
  return va.localeCompare(vb, undefined, { numeric: true })
}

// ── Componente ───────────────────────────────────────────────────────────────
export function ClientesTabla({
  clientes,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  initialSorting,
}: ClientesTablaProps) {
  const accionesProps = { onEdit, onDelete, canEdit, canDelete }

  const columns: ColumnDef<ClienteResumen>[] = [
    {
      accessorKey: 'nombre_completo',
      header: 'Cliente',
      size: 300,
      cell: ({ row }) => <CeldaCliente c={row.original} />,
    },
    {
      id: 'estado',
      accessorFn: row => estadoVisible(row),
      header: 'Estado',
      size: 130,
      cell: ({ row }) => <CeldaEstado c={row.original} />,
    },
    {
      id: 'vivienda',
      header: 'Vivienda',
      size: 190,
      accessorFn: row => codigoVivienda(row),
      sortingFn: (a, b) => compararVivienda(a.original, b.original),
      cell: ({ row }) => <CeldaVivienda c={row.original} />,
    },
    // Ordenable: primero quien más debe
    {
      id: 'pago',
      header: 'Pago',
      size: 220,
      accessorFn: row => datosPago(row)?.saldo ?? -1,
      sortDescFirst: true,
      cell: ({ row }) => <CeldaPago c={row.original} />,
    },
    {
      id: 'acciones',
      header: () => <span className='sr-only'>Acciones</span>,
      size: 56,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => <MenuAcciones c={row.original} {...accionesProps} />,
    },
  ]

  // Móvil: mismo orden por vivienda que la tabla
  const clientesMovil = useMemo(
    () => [...clientes].sort(compararVivienda),
    [clientes]
  )

  return (
    <>
      {/* Móvil: tarjetas apiladas */}
      <ul className='space-y-3 md:hidden'>
        {clientesMovil.map(c => {
          const pago = datosPago(c)
          return (
            <li key={c.id}>
              <div
                role={onView ? 'button' : undefined}
                tabIndex={onView ? 0 : undefined}
                onClick={onView ? () => onView(c) : undefined}
                onKeyDown={
                  onView
                    ? e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onView(c)
                        }
                      }
                    : undefined
                }
                className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/60 dark:active:bg-slate-700/40'
              >
                <div className='flex items-start justify-between gap-2'>
                  <CeldaCliente c={c} />
                  <MenuAcciones c={c} {...accionesProps} />
                </div>
                <div className='mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2'>
                  <CeldaEstado c={c} />
                  <CeldaVivienda c={c} />
                </div>
                {pago && (
                  <div className='mt-3 border-t border-slate-100 pt-3 dark:border-slate-700/60'>
                    <CeldaPago c={c} />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {/* Escritorio: tabla */}
      <div className='hidden md:block'>
        <DataTable
          columns={columns}
          data={clientes}
          initialSorting={initialSorting}
          onRowClick={onView}
          variant='clean'
          headerGradient='from-cyan-600 via-indigo-600 to-violet-600'
        />
      </div>
    </>
  )
}
