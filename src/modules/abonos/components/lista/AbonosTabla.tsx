/**
 * AbonosTabla - Vista de tabla para el listado global de abonos
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ DataTable variant='clean' con encabezado en degradado del módulo (fijo)
 * ✅ Colores de estado desde @/shared/config/estados.colors y de fuente
 *    desde el esquema del modal de registro (mismo color en toda la app)
 *
 * Columnas: Recibo · Fecha (pago + registro) · Cliente · Vivienda (con
 * proyecto) · Fuente (con entidad) · Método · Monto (con estado) · Acciones
 *
 * En móvil (< md) la misma información se muestra como tarjetas apiladas.
 */

'use client'

import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import {
  Ban,
  Building2,
  CalendarDays,
  Home,
  MoreHorizontal,
  Pencil,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatNombreCompleto, toTitleCase } from '@/lib/utils/string.utils'
import {
  estadoVisibleAbono,
  type AbonoConInfo,
  type EstadisticasAbonos,
} from '@/modules/abonos/hooks/useAbonosList'
import { TEMA_ABONOS } from '@/modules/abonos/styles/tema-abonos'
import type { MetodoPago } from '@/modules/abonos/types'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import { formatCOP } from '@/shared/components/list-page'
import { DataTable } from '@/shared/components/table/DataTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { ABONO_ESTADO_BADGE } from '@/shared/config/estados.colors'
import { cn } from '@/shared/utils/helpers'

import {
  avatarGradient,
  fuenteVisual,
  inicialesCliente,
  metodoVisual,
} from './fuente-visual'

interface AbonosTablaProps {
  abonos: AbonoConInfo[]
  canEdit: boolean
  canAnular: boolean
  onAbonoClick: (abono: AbonoConInfo) => void
  onEditar: (abono: AbonoParaEditar) => void
  onAnular: (abono: AbonoConInfo) => void
  /** Totales por mes para los separadores (de todo lo filtrado, no solo la página) */
  porMes: EstadisticasAbonos['porMes']
}

// ── Estilos del módulo ───────────────────────────────────────────────────────
const styles = {
  recibo:
    'inline-flex items-center rounded-lg bg-violet-50 px-2 py-0.5 font-mono text-xs font-bold text-violet-700 ring-1 ring-inset ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  principal:
    'block truncate text-sm font-semibold text-slate-900 dark:text-white',
  secundario:
    'block truncate text-xs tabular-nums text-slate-500 dark:text-slate-400',
  tile: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
  badge:
    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
  chipVivienda:
    'inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20',
  avatar:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold tracking-wide text-white shadow-sm',
  metodo:
    'inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset',
  vacio: 'text-xs text-slate-300 dark:text-slate-600',
  accionesTrigger:
    'rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:data-[state=open]:bg-slate-700',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** "14890678" → "14.890.678" (solo si es numérico) */
const formatDocumento = (n: string | null | undefined) =>
  n && /^\d+$/.test(n) ? Number(n).toLocaleString('es-CO') : (n ?? '')

/** "RYR-2026-015" → 2026015 para ordenar por número */
const numeroRecibo = (r: string) => Number(r.replace(/\D/g, '')) || 0

const codigoVivienda = (a: AbonoConInfo) =>
  `${a.vivienda.manzana.identificador ?? ''}${a.vivienda.numero ?? ''}`

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

/** '2026-05' → 'Mayo 2026' */
function nombreMes(clave: string) {
  const [anio, mes] = clave.split('-')
  return `${MESES[Number(mes) - 1] ?? mes} ${anio}`
}

const claveMes = (a: AbonoConInfo) => a.fecha_abono.substring(0, 7)

function SeparadorMes({
  clave,
  porMes,
}: {
  clave: string
  porMes: EstadisticasAbonos['porMes']
}) {
  const g = porMes[clave]
  return (
    <div className='flex items-center gap-2 bg-gradient-to-r from-violet-50 via-fuchsia-50/60 to-transparent px-4 py-1.5 text-xs dark:from-violet-500/10 dark:via-fuchsia-500/5'>
      <CalendarDays className='h-3.5 w-3.5 text-violet-500 dark:text-violet-400' />
      <span className='font-bold text-violet-700 dark:text-violet-300'>
        {nombreMes(clave)}
      </span>
      {g && (
        <span className='text-slate-500 dark:text-slate-400'>
          · {g.recibos} recibo{g.recibos !== 1 ? 's' : ''} ·{' '}
          <span className='font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'>
            {formatCOP(g.monto)}
          </span>
        </span>
      )}
    </div>
  )
}

export function aEditable(a: AbonoConInfo): AbonoParaEditar {
  return {
    id: a.id,
    negociacion_id: a.negociacion_id,
    fuente_pago_id: a.fuente_pago_id,
    fuente_tipo: a.fuente_pago.tipo,
    monto: a.monto,
    fecha_abono: a.fecha_abono,
    metodo_pago: (a.metodo_pago ?? null) as MetodoPago | null,
    numero_referencia: a.numero_referencia ?? null,
    notas: a.notas ?? null,
    comprobante_url: a.comprobante_url ?? null,
  }
}

// ── Celdas (compartidas por la tabla y las tarjetas móviles) ─────────────────
function CeldaRecibo({ a }: { a: AbonoConInfo }) {
  return (
    <span className={styles.recibo}>
      {formatearNumeroRecibo(a.numero_recibo)}
    </span>
  )
}

function CeldaFecha({ a }: { a: AbonoConInfo }) {
  return (
    <span className='min-w-0'>
      <span className='block whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200'>
        {formatDateCompact(a.fecha_abono)}
      </span>
      <span
        className='block whitespace-nowrap text-[11px] text-slate-400 dark:text-slate-500'
        title={
          a.registrado_por_nombre ? `Por ${a.registrado_por_nombre}` : undefined
        }
      >
        Reg. {formatDateCompact(a.fecha_creacion)}
      </span>
    </span>
  )
}

function CeldaCliente({ a }: { a: AbonoConInfo }) {
  const nombre = formatNombreCompleto(
    `${a.cliente.nombres} ${a.cliente.apellidos}`
  )
  const anulado = a.estado === 'Anulado'
  return (
    <span className='flex min-w-0 items-center gap-3'>
      <span
        aria-hidden
        className={cn(
          styles.avatar,
          avatarGradient(a.cliente.id),
          anulado && 'opacity-40 grayscale'
        )}
      >
        {inicialesCliente(a.cliente)}
      </span>
      <span className='min-w-0'>
        <span
          className={cn(
            styles.principal,
            anulado && 'text-slate-400 line-through dark:text-slate-500'
          )}
          title={nombre}
        >
          {nombre}
        </span>
        <span className={styles.secundario}>
          CC {formatDocumento(a.cliente.numero_documento)}
        </span>
      </span>
    </span>
  )
}

function CeldaVivienda({ a }: { a: AbonoConInfo }) {
  const codigo = codigoVivienda(a)
  return (
    <span className='flex min-w-0 flex-col items-start gap-1'>
      {codigo ? (
        <span className={styles.chipVivienda}>
          <Home className='h-3.5 w-3.5' />
          {codigo}
        </span>
      ) : (
        <span className={styles.vacio}>—</span>
      )}
      {a.proyecto.nombre && (
        <span className='flex max-w-full items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400'>
          <Building2 className='h-3 w-3 shrink-0 text-green-600 dark:text-green-400' />
          <span className='truncate'>{toTitleCase(a.proyecto.nombre)}</span>
        </span>
      )}
    </span>
  )
}

function CeldaFuente({ a }: { a: AbonoConInfo }) {
  const v = fuenteVisual(a.fuente_pago.tipo)
  const Icono = v.icon
  return (
    <span className='flex min-w-0 items-center gap-2.5'>
      <span aria-hidden className={cn(styles.tile, v.gradient)}>
        <Icono className='h-4 w-4' />
      </span>
      <span className='min-w-0'>
        <span className='block truncate text-sm font-medium text-slate-800 dark:text-slate-200'>
          {a.fuente_pago.tipo}
        </span>
        {a.fuente_pago.entidad && (
          <span className={cn('block truncate text-xs font-medium', v.text)}>
            {a.fuente_pago.entidad}
          </span>
        )}
      </span>
    </span>
  )
}

function CeldaMetodo({ a }: { a: AbonoConInfo }) {
  if (!a.metodo_pago) return <span className={styles.vacio}>—</span>
  const { icon: Icono, cls } = metodoVisual(a.metodo_pago)
  return (
    <Tooltip content={a.metodo_pago} delayDuration={100}>
      <span aria-label={a.metodo_pago} className={cn(styles.metodo, cls)}>
        <Icono className='h-4 w-4' />
      </span>
    </Tooltip>
  )
}

function CeldaMonto({ a }: { a: AbonoConInfo }) {
  const estado = estadoVisibleAbono(a)
  const cfg = ABONO_ESTADO_BADGE[estado]
  const Icono = cfg.icon
  return (
    <span className='flex flex-col items-end gap-1'>
      <span
        className={cn(
          'whitespace-nowrap text-sm font-bold tabular-nums',
          estado === 'Activo' && 'text-emerald-600 dark:text-emerald-400',
          estado === 'Anulado' &&
            'text-slate-400 line-through dark:text-slate-500',
          estado === 'Renuncia' && 'text-slate-500 dark:text-slate-400'
        )}
      >
        {formatCOP(Number(a.monto))}
      </span>
      {estado !== 'Activo' && (
        <span className={cn(styles.badge, cfg.badge)}>
          <Icono className='h-3 w-3' />
          {cfg.label}
        </span>
      )}
    </span>
  )
}

interface MenuAccionesProps {
  a: AbonoConInfo
  canEdit: boolean
  canAnular: boolean
  onEditar: (abono: AbonoParaEditar) => void
  onAnular: (abono: AbonoConInfo) => void
}

function MenuAcciones({
  a,
  canEdit,
  canAnular,
  onEditar,
  onAnular,
}: MenuAccionesProps) {
  const puedeEditar = canEdit && a.estado !== 'Anulado'
  const puedeAnular =
    canAnular && a.estado !== 'Anulado' && a.negociacion.estado === 'Activa'

  // El detalle se abre con clic en la fila: el menú es solo para acciones
  if (!puedeEditar && !puedeAnular) return null

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
            aria-label={`Acciones para el recibo ${a.numero_recibo}`}
            className={styles.accionesTrigger}
          >
            <MoreHorizontal className='h-4 w-4' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44'>
          {puedeEditar && (
            <DropdownMenuItem onClick={() => onEditar(aEditable(a))}>
              <Pencil className='mr-2 h-4 w-4' />
              Editar
            </DropdownMenuItem>
          )}
          {puedeAnular && (
            <>
              {puedeEditar && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => onAnular(a)}
                className='text-red-600 focus:text-red-700 dark:text-red-400'
              >
                <Ban className='mr-2 h-4 w-4' />
                Anular
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Por fecha de pago: así se ven los separadores por mes
const ORDEN_INICIAL: SortingState = [{ id: 'fecha', desc: true }]

// ── Componente ───────────────────────────────────────────────────────────────
export function AbonosTabla({
  abonos,
  canEdit,
  canAnular,
  onAbonoClick,
  onEditar,
  onAnular,
  porMes,
}: AbonosTablaProps) {
  const accionesProps = { canEdit, canAnular, onEditar, onAnular }

  const columns: ColumnDef<AbonoConInfo>[] = [
    {
      id: 'recibo',
      header: 'Recibo',
      size: 130,
      accessorFn: row => numeroRecibo(row.numero_recibo),
      sortDescFirst: true,
      cell: ({ row }) => <CeldaRecibo a={row.original} />,
    },
    {
      id: 'fecha',
      header: 'Fecha',
      size: 120,
      accessorFn: row => row.fecha_abono,
      sortDescFirst: true,
      cell: ({ row }) => <CeldaFecha a={row.original} />,
    },
    {
      id: 'cliente',
      header: 'Cliente',
      size: 240,
      accessorFn: row => `${row.cliente.nombres} ${row.cliente.apellidos}`,
      cell: ({ row }) => <CeldaCliente a={row.original} />,
    },
    {
      id: 'vivienda',
      header: 'Vivienda',
      size: 160,
      accessorFn: row => codigoVivienda(row),
      sortingFn: (a, b) =>
        codigoVivienda(a.original).localeCompare(
          codigoVivienda(b.original),
          undefined,
          { numeric: true }
        ),
      cell: ({ row }) => <CeldaVivienda a={row.original} />,
    },
    {
      id: 'fuente',
      header: 'Fuente',
      size: 220,
      accessorFn: row => row.fuente_pago.tipo,
      cell: ({ row }) => <CeldaFuente a={row.original} />,
    },
    {
      id: 'metodo',
      header: 'Método',
      size: 80,
      meta: { align: 'center' },
      accessorFn: row => row.metodo_pago ?? '',
      cell: ({ row }) => <CeldaMetodo a={row.original} />,
    },
    {
      id: 'monto',
      header: 'Monto',
      size: 150,
      accessorFn: row => Number(row.monto),
      sortDescFirst: true,
      meta: { align: 'right' },
      cell: ({ row }) => <CeldaMonto a={row.original} />,
    },
    {
      id: 'acciones',
      header: () => <span className='sr-only'>Acciones</span>,
      size: 56,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => <MenuAcciones a={row.original} {...accionesProps} />,
    },
  ]

  // Móvil: misma vista que la tabla por defecto (fecha de pago, agrupado por mes)
  const abonosMovil = [...abonos].sort(
    (x, y) =>
      y.fecha_abono.localeCompare(x.fecha_abono) ||
      numeroRecibo(y.numero_recibo) - numeroRecibo(x.numero_recibo)
  )

  return (
    <>
      {/* Móvil: tarjetas apiladas */}
      <ul className='space-y-3 md:hidden'>
        {abonosMovil.map((a, idx) => (
          <li key={a.id}>
            {(idx === 0 || claveMes(abonosMovil[idx - 1]) !== claveMes(a)) && (
              <div className='mb-2 overflow-hidden rounded-xl'>
                <SeparadorMes clave={claveMes(a)} porMes={porMes} />
              </div>
            )}
            <div
              role='button'
              tabIndex={0}
              onClick={() => onAbonoClick(a)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onAbonoClick(a)
                }
              }}
              className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/60 dark:active:bg-slate-700/40'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <CeldaRecibo a={a} />
                  <span className='text-xs text-slate-500 dark:text-slate-400'>
                    {formatDateCompact(a.fecha_abono)}
                  </span>
                </div>
                <MenuAcciones a={a} {...accionesProps} />
              </div>
              <div className='mt-3 flex items-start justify-between gap-3'>
                <CeldaCliente a={a} />
                <CeldaMonto a={a} />
              </div>
              <div className='mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-slate-100 pt-3 dark:border-slate-700/60'>
                <CeldaFuente a={a} />
                <CeldaVivienda a={a} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla */}
      <div className='hidden md:block'>
        <DataTable
          columns={columns}
          data={abonos}
          initialSorting={ORDEN_INICIAL}
          onRowClick={onAbonoClick}
          variant='clean'
          headerGradient={TEMA_ABONOS.degradado}
          rowGroups={{
            columnas: ['fecha'],
            clave: claveMes,
            render: clave => <SeparadorMes clave={clave} porMes={porMes} />,
          }}
        />
      </div>
    </>
  )
}
