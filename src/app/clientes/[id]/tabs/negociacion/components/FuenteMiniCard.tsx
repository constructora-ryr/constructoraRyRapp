'use client'

/**
 * Tarjeta de una fuente de pago en el Plan de Pagos. El color y el ícono
 * salen de la configuración (tipos_fuentes_pago.color / icono), así que
 * respetan lo que defina el administrador.
 */

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Pencil,
  type LucideIcon,
} from 'lucide-react'

import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { formatCOP } from '@/shared/components/list-page'
import { iconoFuente } from '@/shared/constants/fuente-iconos'
import {
  esCreditoConstructora,
  esCreditoHipotecario,
  esSubsidioCajaCompensacion,
  esSubsidioMiCasaYa,
  getFuenteColorClasses,
} from '@/shared/constants/fuentes-pago.constants'
import { cn } from '@/shared/utils/helpers'

const MESES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

function formatFechaActa(fecha: string): string {
  const [year, month, day] = fecha.split('-').map(Number)
  return `${day} ${MESES[month - 1]} ${year}`
}

interface DocsPendientesInfo {
  total: number
  obligatorios: number
  docs: { nombre: string; obligatorio: boolean }[]
}

interface FuenteMiniCardProps {
  fuente: FuentePago
  valorVivienda: number
  docsPendientes?: DocsPendientesInfo
  /** tipos_fuentes_pago.color */
  colorToken?: string
  /** tipos_fuentes_pago.icono */
  iconoNombre?: string
  cuotasExpandidas?: boolean
  onToggleCuotas?: () => void
  onEditarActa?: () => void
  onEditarReferencia?: () => void
}

export function FuenteMiniCard({
  fuente,
  valorVivienda,
  docsPendientes,
  colorToken,
  iconoNombre,
  cuotasExpandidas,
  onToggleCuotas,
  onEditarActa,
  onEditarReferencia,
}: FuenteMiniCardProps) {
  const color = getFuenteColorClasses(colorToken)
  const Icono = iconoFuente(iconoNombre)
  const esCredito = esCreditoConstructora(fuente.tipo)
  const esHipotecario = esCreditoHipotecario(fuente.tipo)
  const esSubsidioConActa =
    esSubsidioCajaCompensacion(fuente.tipo) || esSubsidioMiCasaYa(fuente.tipo)

  // Crédito constructora: capital = capital_para_cierre, total = monto_aprobado
  const capital = fuente.capital_para_cierre ?? fuente.monto_aprobado
  const montoTotal = fuente.monto_aprobado
  const intereses =
    esCredito && fuente.capital_para_cierre != null
      ? montoTotal - fuente.capital_para_cierre
      : 0

  // % del precio de la vivienda que cubre esta fuente
  const pct = valorVivienda > 0 ? (capital / valorVivienda) * 100 : 0

  const recibido = fuente.monto_recibido ?? 0
  const pctRecibido =
    montoTotal > 0 ? Math.min(100, (recibido / montoTotal) * 100) : 0
  const completa = pctRecibido >= 100
  const pendientes = docsPendientes?.total ?? 0
  const pendOblig = docsPendientes?.obligatorios ?? 0

  const alertaDocs =
    pendientes === 0
      ? null
      : pendOblig === 1
        ? '1 doc. obligatorio'
        : pendOblig > 1
          ? `${pendOblig} docs. obligatorios`
          : pendientes === 1
            ? '1 doc. pendiente'
            : `${pendientes} docs. pendientes`

  const detalle =
    esCredito && intereses > 0
      ? `Capital ${formatCOP(capital)} · +${formatCOP(intereses)} intereses`
      : esSubsidioConActa && fuente.numero_referencia
        ? `Acta No. ${fuente.numero_referencia}${fuente.fecha_acta ? ` · ${formatFechaActa(fuente.fecha_acta)}` : ''}`
        : esHipotecario && fuente.numero_referencia
          ? `Ref. ${fuente.numero_referencia}`
          : null

  const accion: {
    icon: LucideIcon
    label: string
    onClick: () => void
    desplegable?: boolean
  } | null =
    esCredito && onToggleCuotas
      ? {
          icon: DollarSign,
          label: 'Plan de cuotas',
          onClick: onToggleCuotas,
          desplegable: true,
        }
      : esSubsidioConActa && onEditarActa
        ? { icon: Pencil, label: 'Editar N° de acta', onClick: onEditarActa }
        : esHipotecario && onEditarReferencia
          ? {
              icon: Pencil,
              label: 'Editar referencia',
              onClick: onEditarReferencia,
            }
          : null
  const AccionIcono = accion?.icon

  return (
    <div className='flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60'>
      {/* Tipo + % del precio */}
      <div className='flex items-start gap-3'>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
            color.icon
          )}
        >
          <Icono className='h-5 w-5' />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='break-words text-sm font-bold leading-tight text-slate-900 dark:text-white'>
            {fuente.tipo}
          </p>
          {fuente.entidad && (
            <p className='mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
              <Building2 className='h-3 w-3 shrink-0' />
              <span className='truncate'>{fuente.entidad}</span>
            </p>
          )}
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums',
            color.badge
          )}
          title='Parte del precio de la vivienda que cubre esta fuente'
        >
          {pct.toFixed(1)}%
        </span>
      </div>

      {/* Monto */}
      <p className='mt-3 text-xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white'>
        {formatCOP(montoTotal)}
      </p>
      {detalle && (
        <p
          className='truncate text-xs text-slate-500 dark:text-slate-400'
          title={detalle}
        >
          {detalle}
        </p>
      )}

      {/* Recibido */}
      <div className='mt-3'>
        <div className='h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60'>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              color.barra
            )}
            style={{ width: `${pctRecibido}%` }}
          />
        </div>
        <div className='mt-1.5 flex flex-wrap items-center justify-between gap-1 text-xs'>
          <span className='text-slate-500 dark:text-slate-400'>
            Recibido{' '}
            <span className='font-semibold tabular-nums text-slate-700 dark:text-slate-200'>
              {formatCOP(recibido)}
            </span>
          </span>
          {completa ? (
            <span className='inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400'>
              <CheckCircle2 className='h-3.5 w-3.5' />
              Completa
            </span>
          ) : (
            <span
              className={cn(
                'font-semibold tabular-nums',
                recibido > 0
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-slate-400'
              )}
            >
              {Math.round(pctRecibido)}%
            </span>
          )}
        </div>
      </div>

      {/* Documentos */}
      {alertaDocs ? (
        <p className='mt-2 inline-flex items-center gap-1 self-start rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300'>
          <AlertCircle className='h-3 w-3' />
          {alertaDocs}
        </p>
      ) : docsPendientes !== undefined ? (
        <p className='mt-2 inline-flex items-center gap-1 self-start text-[11px] font-medium text-emerald-700 dark:text-emerald-400'>
          <CheckCircle2 className='h-3 w-3' />
          Documentos al día
        </p>
      ) : null}

      {/* Acción (al fondo: las tarjetas de una fila quedan alineadas) */}
      <div className='flex-1' />
      {accion && AccionIcono && (
        <button
          type='button'
          onClick={accion.onClick}
          className={cn(
            'mt-3 flex h-10 w-full items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/40 sm:h-9',
            color.texto
          )}
        >
          <AccionIcono className='h-3.5 w-3.5' />
          {accion.label}
          {accion.desplegable && (
            <ChevronDown
              className={cn(
                'ml-auto h-4 w-4 transition-transform duration-200',
                cuotasExpandidas && 'rotate-180'
              )}
            />
          )}
        </button>
      )}
    </div>
  )
}
