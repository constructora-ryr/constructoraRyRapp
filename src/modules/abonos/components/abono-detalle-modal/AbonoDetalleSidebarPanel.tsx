'use client'

import {
  Ban,
  Building2,
  Calendar,
  ChevronRight,
  Copy,
  Hash,
  Home,
  Receipt,
  StickyNote,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import Link from 'next/link'

import { formatDateCompact, formatDateForDisplay } from '@/lib/utils/date.utils'
import { getShortId } from '@/lib/utils/slug.utils'
import { formatNombreCompleto, toTitleCase } from '@/lib/utils/string.utils'
import { formatCOP } from '@/shared/components/list-page'
import { ABONO_ESTADO_BADGE } from '@/shared/config/estados.colors'
import { cn } from '@/shared/utils/helpers'

import { formatearNumeroRecibo } from '../../utils/formato-recibo'
import {
  avatarGradient,
  fuenteVisual,
  inicialesCliente,
  metodoVisual,
} from '../lista/fuente-visual'

import { abonoDetalleStyles as s } from './AbonoDetalleModal.styles'
import { type AbonoParaDetalle } from './useAbonoDetalle'

interface AbonoDetalleSidebarPanelProps {
  abono: AbonoParaDetalle
  estaAnulado: boolean
  esRenuncia: boolean
  canVerCliente?: boolean
  negociacionFinancials?: {
    valorTotal: number
    totalAbonado: number
    saldoPendiente: number
  } | null
}

/** "14890678" → "14.890.678" (solo si es numérico) */
const formatDocumento = (n: string) =>
  /^\d+$/.test(n) ? Number(n).toLocaleString('es-CO') : n

function Fila({
  icon: Icon,
  iconCls,
  label,
  children,
  accion,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconCls: string
  label: string
  children: React.ReactNode
  accion?: React.ReactNode
}) {
  return (
    <div className={s.sidebar.row}>
      <span className={cn(s.sidebar.rowIcon, iconCls)}>
        <Icon className='h-4 w-4' />
      </span>
      <div className='min-w-0'>
        <p className={s.sidebar.rowLabel}>{label}</p>
        <div className={s.sidebar.rowValue}>{children}</div>
      </div>
      {accion}
    </div>
  )
}

function AvanceNegociacion({
  valorTotal,
  totalAbonado,
  saldoPendiente,
}: {
  valorTotal: number
  totalAbonado: number
  saldoPendiente: number
}) {
  if (valorTotal <= 0) return null
  const pagado = saldoPendiente <= 0
  const pct = pagado
    ? 100
    : Math.min(Math.floor((totalAbonado / valorTotal) * 100), 99)
  return (
    <div className={s.sidebar.card}>
      <p className={s.sidebar.sectionTitle}>
        <TrendingUp className='h-3 w-3' />
        Avance de la negociación
      </p>
      <div className='flex items-baseline justify-between gap-2'>
        <span
          className={cn(
            'text-2xl font-black tabular-nums',
            pagado
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-violet-600 dark:text-violet-400'
          )}
        >
          {pct}%
        </span>
        <span className='text-xs text-slate-500 dark:text-slate-400'>
          {formatCOP(totalAbonado)}{' '}
          <span className='text-slate-400 dark:text-slate-500'>
            de {formatCOP(valorTotal)}
          </span>
        </span>
      </div>
      <div className='mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60'>
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-700',
            pagado
              ? 'from-amber-400 to-orange-500'
              : 'from-violet-500 via-purple-500 to-fuchsia-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className='mt-2 text-xs font-medium'>
        {pagado ? (
          <span className='text-amber-600 dark:text-amber-400'>
            ★ Vivienda saldada
          </span>
        ) : (
          <span className='text-slate-600 dark:text-slate-300'>
            Faltan{' '}
            <span className='font-bold tabular-nums text-amber-600 dark:text-amber-400'>
              {formatCOP(saldoPendiente)}
            </span>
          </span>
        )}
      </p>
    </div>
  )
}

export function AbonoDetalleSidebarPanel({
  abono,
  estaAnulado,
  esRenuncia,
  canVerCliente = false,
  negociacionFinancials,
}: AbonoDetalleSidebarPanelProps) {
  const fuente = fuenteVisual(abono.fuente_pago.tipo)
  const FuenteIcono = fuente.icon
  const metodo = metodoVisual(abono.metodo_pago ?? '')
  const MetodoIcono = metodo.icon
  const estado =
    ABONO_ESTADO_BADGE[
      estaAnulado ? 'Anulado' : esRenuncia ? 'Renuncia' : 'Activo'
    ]
  const EstadoIcono = estado.icon

  const nombre = formatNombreCompleto(
    `${abono.cliente.nombres} ${abono.cliente.apellidos}`
  )
  const codigoVivienda = `${abono.vivienda.manzana.identificador ?? ''}${abono.vivienda.numero ?? ''}`

  const copiarReferencia = async () => {
    if (!abono.numero_referencia) return
    try {
      await navigator.clipboard.writeText(abono.numero_referencia)
      toast.success('Referencia copiada')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const tarjetaCliente = (
    <>
      <p className={s.sidebar.sectionTitle}>Cliente</p>
      <div className='flex items-center gap-3'>
        <span
          aria-hidden
          className={cn(s.sidebar.avatar, avatarGradient(abono.cliente.id))}
        >
          {inicialesCliente(abono.cliente)}
        </span>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-slate-900 group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-300'>
            {nombre}
          </p>
          <p className={s.sidebar.rowValueSub}>
            CC {formatDocumento(abono.cliente.numero_documento)}
          </p>
        </div>
        {canVerCliente && (
          <ChevronRight className='h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500' />
        )}
      </div>
    </>
  )

  return (
    <div className={s.sidebar.container}>
      {/* Anulación: lo primero que hay que ver */}
      {estaAnulado ? (
        <div className='rounded-2xl border border-rose-200 bg-rose-50 p-3.5 dark:border-rose-800/50 dark:bg-rose-950/30'>
          <p className='mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400'>
            <Ban className='h-3 w-3' />
            Abono anulado
          </p>
          {abono.motivo_categoria ? (
            <p className='text-sm font-semibold text-rose-900 dark:text-rose-200'>
              {abono.motivo_categoria}
            </p>
          ) : null}
          {abono.motivo_detalle ? (
            <p className='mt-1 text-xs italic text-rose-800 dark:text-rose-300'>
              “{abono.motivo_detalle}”
            </p>
          ) : null}
          {abono.anulado_por_nombre || abono.fecha_anulacion ? (
            <p className='mt-2 text-[11px] text-rose-700/80 dark:text-rose-300/80'>
              {abono.anulado_por_nombre
                ? `Por ${abono.anulado_por_nombre}`
                : ''}
              {abono.anulado_por_nombre && abono.fecha_anulacion ? ' · ' : ''}
              {abono.fecha_anulacion
                ? formatDateCompact(abono.fecha_anulacion)
                : ''}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Monto con el color de la fuente */}
      <div
        className={cn(
          s.sidebar.hero,
          estaAnulado ? 'from-slate-500 to-slate-700' : fuente.gradient
        )}
      >
        <span
          aria-hidden
          className='pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl'
        />
        <FuenteIcono
          aria-hidden
          className='pointer-events-none absolute -bottom-3 -right-2 h-20 w-20 text-white/10'
        />
        <div className='relative'>
          <div className='flex items-center justify-between gap-2'>
            <span className={s.sidebar.heroChip}>
              <Receipt className='h-3 w-3' />
              {formatearNumeroRecibo(abono.numero_recibo)}
            </span>
            <span className='inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-slate-700'>
              <EstadoIcono className='h-3 w-3' />
              {estado.label}
            </span>
          </div>
          <p
            className={cn(
              s.sidebar.heroMonto,
              'mt-3',
              estaAnulado && 'line-through decoration-2 opacity-80'
            )}
          >
            {formatCOP(Number(abono.monto))}
          </p>
          <p className='mt-1 flex items-center gap-1.5 text-sm font-semibold text-white/90'>
            <FuenteIcono className='h-4 w-4' />
            {abono.fuente_pago.tipo}
          </p>
          {abono.fuente_pago.entidad && (
            <p className='text-xs text-white/75'>{abono.fuente_pago.entidad}</p>
          )}
        </div>
      </div>

      {/* Datos del pago */}
      <div className={cn(s.sidebar.card, 'py-1.5')}>
        <Fila
          icon={Calendar}
          iconCls='bg-violet-50 text-violet-600 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20'
          label='Fecha de pago'
        >
          {formatDateForDisplay(abono.fecha_abono)}
        </Fila>
        <div className={s.sidebar.divider} />
        <Fila icon={MetodoIcono} iconCls={metodo.cls} label='Método de pago'>
          {abono.metodo_pago || '—'}
        </Fila>
        {abono.numero_referencia ? (
          <>
            <div className={s.sidebar.divider} />
            <Fila
              icon={Hash}
              iconCls='bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20'
              label={
                abono.metodo_pago === 'Cheque'
                  ? 'Número de cheque'
                  : 'Número de referencia'
              }
              accion={
                <button
                  type='button'
                  onClick={copiarReferencia}
                  aria-label='Copiar referencia'
                  title='Copiar'
                  className={s.sidebar.copyBtn}
                >
                  <Copy className='h-3.5 w-3.5' />
                </button>
              }
            >
              <span className='block truncate font-mono'>
                {abono.numero_referencia}
              </span>
            </Fila>
          </>
        ) : null}
      </div>

      {/* Avance de la negociación */}
      {negociacionFinancials ? (
        <AvanceNegociacion {...negociacionFinancials} />
      ) : null}

      {/* Cliente */}
      {canVerCliente ? (
        <Link
          href={`/clientes/${getShortId(abono.cliente.id)}`}
          className={s.sidebar.cardLink}
        >
          {tarjetaCliente}
        </Link>
      ) : (
        <div className={s.sidebar.card}>{tarjetaCliente}</div>
      )}

      {/* Vivienda */}
      <div className={s.sidebar.card}>
        <p className={s.sidebar.sectionTitle}>Vivienda</p>
        <div className='flex items-center gap-3'>
          <span className={s.sidebar.chipVivienda}>
            <Home className='h-3.5 w-3.5' />
            {codigoVivienda || '—'}
          </span>
          <span className='flex min-w-0 items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
            <Building2 className='h-3.5 w-3.5 flex-shrink-0 text-green-600 dark:text-green-400' />
            <span className='truncate'>
              {toTitleCase(abono.proyecto.nombre)}
            </span>
          </span>
        </div>
      </div>

      {/* Notas */}
      {abono.notas ? (
        <div className='rounded-2xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-700/50 dark:bg-amber-950/30'>
          <p className='mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400'>
            <StickyNote className='h-3 w-3' />
            Observaciones
          </p>
          <p className='break-words text-xs leading-relaxed text-amber-900 dark:text-amber-200'>
            {abono.notas}
          </p>
        </div>
      ) : null}

      {/* Trazabilidad */}
      <p className={s.sidebar.footer}>
        <UserCheck className='h-3.5 w-3.5 flex-shrink-0' />
        <span>
          Registrado
          {abono.registrado_por_nombre ? (
            <>
              {' por '}
              <span className='font-semibold text-slate-500 dark:text-slate-400'>
                {abono.registrado_por_nombre}
              </span>
            </>
          ) : null}
          {' · '}
          {formatDateCompact(abono.fecha_creacion)}
        </span>
      </p>
    </div>
  )
}
