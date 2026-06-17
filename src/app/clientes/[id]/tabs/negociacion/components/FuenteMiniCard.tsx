'use client'

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Pencil,
} from 'lucide-react'

import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import {
  esCreditoConstructora,
  esSubsidioCajaCompensacion,
  esSubsidioMiCasaYa,
} from '@/shared/constants/fuentes-pago.constants'
import { formatCurrency } from '@/shared/utils/format'

import { getFuenteColor } from '../hooks'

interface DocPendienteInfo {
  nombre: string
  obligatorio: boolean
}

interface DocsPendientesInfo {
  total: number
  obligatorios: number
  docs: DocPendienteInfo[]
}

interface FuenteMiniCardProps {
  fuente: FuentePago
  valorVivienda: number
  docsPendientes?: DocsPendientesInfo
  colorToken?: string
  cuotasExpandidas?: boolean
  onToggleCuotas?: () => void
  onEditarActa?: () => void
}

export function FuenteMiniCard({
  fuente,
  valorVivienda,
  docsPendientes,
  colorToken,
  cuotasExpandidas,
  onToggleCuotas,
  onEditarActa,
}: FuenteMiniCardProps) {
  const color = getFuenteColor(colorToken)
  const esCredito = esCreditoConstructora(fuente.tipo)
  const esSubsidioConActa =
    esSubsidioCajaCompensacion(fuente.tipo) || esSubsidioMiCasaYa(fuente.tipo)

  // Para crédito constructora: capital = capital_para_cierre, total = monto_aprobado
  const capital = fuente.capital_para_cierre ?? fuente.monto_aprobado
  const montoTotal = fuente.monto_aprobado
  const intereses =
    esCredito && fuente.capital_para_cierre != null
      ? montoTotal - fuente.capital_para_cierre
      : 0

  // % contra precio vivienda: siempre capital/valorVivienda (distribución del precio)
  const pct =
    valorVivienda > 0 ? ((capital / valorVivienda) * 100).toFixed(1) : '0'

  const recibido = fuente.monto_recibido ?? 0
  // Progreso: recibido vs total real a pagar en esta fuente
  const pctRecibido =
    montoTotal > 0 ? Math.min(100, (recibido / montoTotal) * 100) : 0
  const pendientes = docsPendientes?.total ?? 0
  const pendOblig = docsPendientes?.obligatorios ?? 0

  // Texto del alerta de documentos pendientes
  const alertaDocsTexto = (() => {
    if (pendientes === 0) return null
    if (pendOblig === 1) return '1 doc. obligatorio'
    if (pendOblig > 1) return `${pendOblig} docs. obligatorios`
    if (pendientes === 1) return '1 doc. pendiente'
    return `${pendientes} docs. pendientes`
  })()

  return (
    <div className='group relative overflow-hidden rounded-xl border border-gray-200/80 bg-white transition-shadow hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/60'>
      {/* Barra de color superior */}
      <div className={`h-1 ${color.barra}`} />

      <div className='p-3'>
        {/* ── Zona 1: Nombre + % — altura natural ~16px ── */}
        <div className='flex items-start justify-between gap-1'>
          <p className='min-w-0 truncate text-xs font-bold leading-tight text-gray-900 dark:text-white'>
            {fuente.tipo}
          </p>
          <span
            className={`flex-shrink-0 text-[10px] font-bold tabular-nums ${color.texto}`}
          >
            {pct}%
          </span>
        </div>

        {/* ── Zona 2: Entidad — SIEMPRE h-[18px] con o sin texto ── */}
        <p className='mt-0.5 flex h-[18px] items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500'>
          {fuente.entidad ? (
            <>
              <Building2 className='h-2.5 w-2.5 flex-shrink-0' />
              <span className='truncate'>{fuente.entidad}</span>
            </>
          ) : null}
        </p>

        {/* ── Zona 3: Monto principal — altura natural ~20px ── */}
        <p className='mt-1 text-sm font-bold tabular-nums leading-none text-gray-900 dark:text-white'>
          {formatCurrency(montoTotal)}
        </p>

        {/* ── Zona 4: Desglose intereses — SIEMPRE h-[18px] con o sin texto ── */}
        <p className='mt-0.5 flex h-[18px] items-center gap-1 text-[10px] tabular-nums'>
          {esCredito && intereses > 0 ? (
            <>
              <span className='text-gray-400 dark:text-gray-500'>
                Capital {formatCurrency(capital)}
              </span>
              <span className='text-gray-300 dark:text-gray-600'>·</span>
              <span className='text-violet-500 dark:text-violet-400'>
                +{formatCurrency(intereses)} int.
              </span>
            </>
          ) : null}
        </p>

        {/* ── Zona 5: Barra de progreso
            SIN mt-auto — siempre a la misma distancia del contenido superior.
            Como todas las zonas 1-4 tienen alturas fijas, esta barra queda
            en el mismo Y absoluto en todas las cards. ── */}
        <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700'>
          <div
            className={`h-full rounded-full ${color.barra} opacity-80 transition-all duration-500`}
            style={{ width: `${pctRecibido}%` }}
          />
        </div>

        {/* ── Zona 6: Abonado + alerta docs ── */}
        <div className='mt-1.5 flex items-center justify-between gap-1'>
          <span className='text-[10px] text-gray-400 dark:text-gray-500'>
            Abonado:{' '}
            <span className='font-medium tabular-nums text-gray-600 dark:text-gray-300'>
              {formatCurrency(recibido)}
            </span>
          </span>
          {alertaDocsTexto ? (
            <span className='flex items-center gap-0.5 text-[10px] font-medium text-amber-500 dark:text-amber-400'>
              <AlertCircle className='h-2.5 w-2.5 flex-shrink-0' />
              {alertaDocsTexto}
            </span>
          ) : docsPendientes !== undefined ? (
            <CheckCircle2 className='h-3 w-3 text-emerald-500 dark:text-emerald-400' />
          ) : null}
        </div>

        {/* ── Zona 7: Botón cuotas (crédito) | Editar acta (subsidio) | spacer ── */}
        {esCredito && onToggleCuotas ? (
          <button
            type='button'
            onClick={onToggleCuotas}
            className='mt-2 flex w-full items-center gap-1 border-t border-gray-100 pt-2 text-[10px] font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:border-gray-700/50 dark:text-indigo-400 dark:hover:text-indigo-300'
          >
            <DollarSign className='h-3 w-3' />
            Plan de cuotas
            <ChevronDown
              className={`ml-auto h-3 w-3 transition-transform duration-200 ${cuotasExpandidas ? 'rotate-180' : ''}`}
            />
          </button>
        ) : esSubsidioConActa && onEditarActa ? (
          <button
            type='button'
            onClick={onEditarActa}
            className='mt-2 flex w-full items-center gap-1 border-t border-gray-100 pt-2 text-[10px] font-semibold text-orange-500 transition-colors hover:text-orange-600 dark:border-gray-700/50 dark:text-orange-400 dark:hover:text-orange-300'
          >
            <Pencil className='h-3 w-3' />
            Editar N° Acta
          </button>
        ) : (
          <div aria-hidden className='mt-2 h-[37px]' />
        )}
      </div>
    </div>
  )
}
