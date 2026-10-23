/**
 * ProyectosTabla - Vista de tabla para proyectos
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ DataTable variant='clean' con encabezado en degradado del módulo (fijo)
 *
 * Columnas: Proyecto (+ ubicación) · Estado · Manzanas · Inventario
 * (vendidas / disponibles / por crear) · Acciones (menú ⋯)
 *
 * En móvil (< md) la misma información se muestra como tarjetas apiladas.
 */

'use client'

import { type ColumnDef } from '@tanstack/react-table'
import {
  Archive,
  ArchiveRestore,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  HardHat,
  MapPin,
  MoreHorizontal,
  PauseCircle,
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

import { toTitleCase } from '@/lib/utils/string.utils'
import { DataTable } from '@/shared/components/table/DataTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/utils/helpers'

import type { Proyecto } from '../types'
import { formatearEstadoProyecto } from '../utils/estado.utils'

interface ProyectosTablaProps {
  proyectos: Proyecto[]
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
  onView?: (proyecto: Proyecto) => void
  onArchive?: (id: string) => void
  onRestore?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

// ── Estilos del módulo ───────────────────────────────────────────────────────
const styles = {
  tile: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm',
  nombre: 'block truncate text-sm font-semibold text-slate-900 dark:text-white',
  secundario:
    'flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400',
  badge:
    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
  chip: 'inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20',
  accionesTrigger:
    'rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:data-[state=open]:bg-slate-700',
}

// Estado del proyecto → ícono + badge (alineado con las tarjetas de filtro)
const ESTADO: Record<string, { icon: LucideIcon; badge: string }> = {
  en_proceso: {
    icon: Clock,
    badge:
      'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
  },
  en_construccion: {
    icon: HardHat,
    badge:
      'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
  },
  en_planificacion: {
    icon: ClipboardList,
    badge:
      'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
  },
  pausado: {
    icon: PauseCircle,
    badge:
      'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
  },
  completado: {
    icon: CheckCircle2,
    badge:
      'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  },
}

const ARCHIVADO = {
  icon: Archive,
  badge:
    'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20',
}

/** Vendidas / disponibles / por crear con los conteos reales de viviendas */
function inventario(p: Proyecto) {
  const planeadas = p.manzanas.reduce((s, m) => s + (m.totalViviendas || 0), 0)
  const creadas = p.manzanas.reduce((s, m) => s + (m.viviendasCreadas ?? 0), 0)
  const vendidas = p.manzanas.reduce(
    (s, m) => s + (m.viviendasVendidas || 0),
    0
  )
  const disponibles = p.manzanas.reduce(
    (s, m) => s + (m.viviendasDisponibles ?? 0),
    0
  )
  const total = Math.max(planeadas, creadas)
  const porCrear = Math.max(0, total - creadas)
  const pct = total > 0 ? Math.round((vendidas / total) * 100) : 0
  return { total, vendidas, disponibles, porCrear, pct }
}

// ── Celdas (compartidas por la tabla y las tarjetas móviles) ─────────────────
function CeldaProyecto({ p }: { p: Proyecto }) {
  return (
    <div className='flex min-w-0 items-center gap-3'>
      <span aria-hidden className={styles.tile}>
        <Building2 className='h-5 w-5' />
      </span>
      <span className='min-w-0'>
        <span className={styles.nombre} title={toTitleCase(p.nombre)}>
          {toTitleCase(p.nombre)}
        </span>
        {p.ubicacion && (
          <span className={styles.secundario}>
            <MapPin className='h-3 w-3 shrink-0' />
            <span className='truncate'>{toTitleCase(p.ubicacion)}</span>
          </span>
        )}
      </span>
    </div>
  )
}

function CeldaEstado({ p }: { p: Proyecto }) {
  const cfg = p.archivado
    ? ARCHIVADO
    : (ESTADO[p.estado] ?? { icon: Clock, badge: ARCHIVADO.badge })
  const Icono = cfg.icon
  return (
    <span className={cn(styles.badge, cfg.badge)}>
      <Icono className='h-3.5 w-3.5' />
      {p.archivado ? 'Archivado' : formatearEstadoProyecto(p.estado)}
    </span>
  )
}

function CeldaManzanas({ p }: { p: Proyecto }) {
  const n = p.manzanas.length
  return (
    <span className={styles.chip}>
      <Boxes className='h-3.5 w-3.5' />
      {n} {n === 1 ? 'manzana' : 'manzanas'}
    </span>
  )
}

function CeldaInventario({ p }: { p: Proyecto }) {
  const inv = inventario(p)
  if (inv.total === 0) {
    return <span className='text-xs text-slate-400'>Sin viviendas</span>
  }
  const w = (n: number) => `${(n / inv.total) * 100}%`
  return (
    <span className='block min-w-[180px]'>
      <span className='flex items-baseline justify-between gap-3 text-sm'>
        <span className='text-slate-600 dark:text-slate-300'>
          <span className='font-semibold text-slate-900 dark:text-white'>
            {inv.vendidas}
          </span>{' '}
          de {inv.total} vendidas
        </span>
        <span className='text-xs font-semibold tabular-nums text-green-700 dark:text-green-400'>
          {inv.pct}%
        </span>
      </span>
      <span
        className='mt-1 flex h-2 w-full gap-[2px] overflow-hidden rounded-[4px]'
        aria-hidden
      >
        {inv.vendidas > 0 && (
          <span
            className='h-full bg-gradient-to-r from-green-500 to-emerald-600'
            style={{ width: w(inv.vendidas) }}
          />
        )}
        {inv.disponibles > 0 && (
          <span
            className='h-full bg-emerald-300 dark:bg-emerald-500/50'
            style={{ width: w(inv.disponibles) }}
          />
        )}
        {inv.porCrear > 0 && (
          <span
            className='h-full bg-slate-200 dark:bg-slate-700'
            style={{ width: w(inv.porCrear) }}
          />
        )}
      </span>
      <span className='mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500 dark:text-slate-400'>
        <span className='flex items-center gap-1'>
          <span className='h-1.5 w-1.5 rounded-full bg-emerald-400' />
          {inv.disponibles}{' '}
          {inv.disponibles === 1 ? 'disponible' : 'disponibles'}
        </span>
        {inv.porCrear > 0 && (
          <span className='flex items-center gap-1'>
            <span className='h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600' />
            {inv.porCrear} por crear
          </span>
        )}
      </span>
    </span>
  )
}

interface MenuAccionesProps {
  p: Proyecto
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
  onRestore?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

function MenuAcciones({
  p,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  canEdit,
  canDelete,
}: MenuAccionesProps) {
  const puedeEditar = canEdit && !!onEdit && !p.archivado
  const puedeArchivar = canEdit && !!onArchive && !p.archivado
  const puedeRestaurar = canEdit && !!onRestore && p.archivado
  const muestraEliminar = canDelete && !!onDelete
  // Solo se elimina un proyecto sin manzanas
  const tieneManzanas = p.manzanas.length > 0

  // El detalle se abre con clic en la fila: el menú es solo para acciones
  if (!puedeEditar && !puedeArchivar && !puedeRestaurar && !muestraEliminar) {
    return null
  }

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
            aria-label={`Acciones para ${toTitleCase(p.nombre)}`}
            className={styles.accionesTrigger}
          >
            <MoreHorizontal className='h-4 w-4' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-52'>
          {puedeEditar && (
            <DropdownMenuItem onClick={() => onEdit?.(p)}>
              <Pencil className='mr-2 h-4 w-4' />
              Editar
            </DropdownMenuItem>
          )}
          {puedeArchivar && (
            <DropdownMenuItem onClick={() => onArchive?.(p.id)}>
              <Archive className='mr-2 h-4 w-4' />
              Archivar
            </DropdownMenuItem>
          )}
          {puedeRestaurar && (
            <DropdownMenuItem onClick={() => onRestore?.(p.id)}>
              <ArchiveRestore className='mr-2 h-4 w-4' />
              Restaurar
            </DropdownMenuItem>
          )}
          {muestraEliminar && (
            <>
              {(puedeEditar || puedeArchivar || puedeRestaurar) && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                disabled={tieneManzanas}
                onClick={() => !tieneManzanas && onDelete?.(p.id)}
                className='text-red-600 focus:text-red-700 dark:text-red-400'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                <span className='flex flex-col'>
                  Eliminar
                  {tieneManzanas && (
                    <span className='text-[11px] font-normal text-slate-500'>
                      Tiene manzanas: archívalo
                    </span>
                  )}
                </span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ── Componente ───────────────────────────────────────────────────────────────
export function ProyectosTabla({
  proyectos,
  onEdit,
  onDelete,
  onView,
  onArchive,
  onRestore,
  canEdit,
  canDelete,
}: ProyectosTablaProps) {
  const accionesProps = {
    onEdit,
    onDelete,
    onArchive,
    onRestore,
    canEdit,
    canDelete,
  }

  const columns: ColumnDef<Proyecto>[] = [
    {
      accessorKey: 'nombre',
      header: 'Proyecto',
      size: 300,
      cell: ({ row }) => <CeldaProyecto p={row.original} />,
    },
    {
      id: 'estado',
      accessorFn: row => (row.archivado ? 'zz_archivado' : row.estado),
      header: 'Estado',
      size: 160,
      cell: ({ row }) => <CeldaEstado p={row.original} />,
    },
    {
      id: 'manzanas',
      accessorFn: row => row.manzanas.length,
      header: 'Manzanas',
      size: 130,
      cell: ({ row }) => <CeldaManzanas p={row.original} />,
    },
    {
      id: 'inventario',
      accessorFn: row => inventario(row).pct,
      header: 'Inventario',
      size: 280,
      sortDescFirst: true,
      cell: ({ row }) => <CeldaInventario p={row.original} />,
    },
    {
      id: 'acciones',
      header: () => <span className='sr-only'>Acciones</span>,
      size: 56,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => <MenuAcciones p={row.original} {...accionesProps} />,
    },
  ]

  return (
    <>
      {/* Móvil: tarjetas apiladas */}
      <ul className='space-y-3 md:hidden'>
        {proyectos.map(p => (
          <li key={p.id}>
            <div
              role={onView ? 'button' : undefined}
              tabIndex={onView ? 0 : undefined}
              onClick={onView ? () => onView(p) : undefined}
              onKeyDown={
                onView
                  ? e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onView(p)
                      }
                    }
                  : undefined
              }
              className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/60 dark:active:bg-slate-700/40'
            >
              <div className='flex items-start justify-between gap-2'>
                <CeldaProyecto p={p} />
                <MenuAcciones p={p} {...accionesProps} />
              </div>
              <div className='mt-3 flex flex-wrap items-center gap-2'>
                <CeldaEstado p={p} />
                <CeldaManzanas p={p} />
              </div>
              <div className='mt-3 border-t border-slate-100 pt-3 dark:border-slate-700/60'>
                <CeldaInventario p={p} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla */}
      <div className='hidden md:block'>
        <DataTable
          columns={columns}
          data={proyectos}
          pageSize={20}
          onRowClick={onView}
          variant='clean'
          headerGradient='from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800'
        />
      </div>
    </>
  )
}
