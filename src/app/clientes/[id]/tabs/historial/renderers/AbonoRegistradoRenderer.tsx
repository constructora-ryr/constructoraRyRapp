/**
 * AbonoRegistradoRenderer / AbonoAnuladoRenderer
 * Muestra los datos completos del abono: monto, recibo, fuente, progreso,
 * vivienda, comprobante y notas. Para anulaciones muestra el motivo.
 */

'use client'

import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CreditCard,
  ExternalLink,
  FileText,
  FolderOpen,
  Hash,
  Home,
  Layers,
  Receipt,
  UserX,
  XCircle,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda, formatearValor } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

interface CampoProps {
  icono: React.ReactNode
  label: string
  valor: unknown
  formato?: 'moneda' | 'normal'
  negrita?: boolean
  colorValor?: string
}

function Campo({
  icono,
  label,
  valor,
  formato = 'normal',
  negrita = false,
  colorValor,
}: CampoProps) {
  const texto =
    formato === 'moneda' ? formatearMoneda(valor) : formatearValor(valor)
  if (texto === '—') return null
  return (
    <div className='flex items-start gap-2.5 border-b border-gray-100 py-2 last:border-0 dark:border-gray-800'>
      <div className='mt-0.5 shrink-0 text-gray-400 dark:text-gray-500'>
        {icono}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm ${negrita ? 'font-bold' : 'font-medium'} ${colorValor ?? 'text-gray-900 dark:text-white'}`}
        >
          {texto}
        </p>
      </div>
    </div>
  )
}

export function AbonoRegistradoRenderer({ evento }: Props) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = (evento.metadata ?? {}) as Record<string, unknown>

  const esAnulacion = evento.tipo === 'abono_anulado'

  // ── Datos principales ──────────────────────────────────────────────────────
  const monto = Number(meta.abono_monto ?? get('monto') ?? 0)
  const numeroRecibo = meta.abono_numero_recibo ?? get('numero_recibo')
  const metodoPago = String(meta.abono_metodo_pago ?? get('metodo_pago') ?? '—')
  const fechaAbono = String(meta.abono_fecha_abono ?? get('fecha_abono') ?? '')
  const referencia = meta.abono_numero_referencia ?? get('numero_referencia')
  const notas = String(meta.abono_notas ?? get('notas') ?? '')
  const moraIncluida = Number(meta.abono_mora_incluida ?? 0)
  const comprobanteUrl = String(
    meta.abono_comprobante_url ?? get('comprobante_url') ?? ''
  )

  // ── Fuente de pago ─────────────────────────────────────────────────────────
  const fuenteTipo = String(meta.fuente_tipo ?? get('tipo') ?? '—')

  // ── Vivienda ───────────────────────────────────────────────────────────────
  const proyectoNombre = meta.proyecto_nombre as string | undefined
  const manzanaNombre = meta.manzana_nombre as string | undefined
  const viviendaNumero = meta.vivienda_numero as string | undefined
  const tieneVivienda = Boolean(
    proyectoNombre ?? manzanaNombre ?? viviendaNumero
  )

  // ── Anulación ──────────────────────────────────────────────────────────────
  const motivoCategoria = String(
    meta.motivo_categoria ?? get('motivo_categoria') ?? ''
  )
  const motivoDetalle = String(
    meta.motivo_detalle ?? get('motivo_detalle') ?? ''
  )
  const anuladoPor = String(
    meta.anulado_por_nombre ?? get('anulado_por_nombre') ?? ''
  )
  const fechaAnulacion = String(
    meta.fecha_anulacion ?? get('fecha_anulacion') ?? ''
  )

  // ── Helpers de formato ─────────────────────────────────────────────────────
  const formatFecha = (iso: string) => {
    if (!iso) return '—'
    try {
      return formatDateCompact(iso)
    } catch {
      return iso
    }
  }

  return (
    <div className='space-y-3'>
      {/* Banner — recibo + monto */}
      <div
        className={`overflow-hidden rounded-xl shadow-lg ${esAnulacion ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/20' : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/20'}`}
      >
        <div className='flex items-start justify-between px-4 py-3'>
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-widest ${esAnulacion ? 'text-red-100' : 'text-green-100'}`}
            >
              {esAnulacion ? 'Abono anulado' : 'Monto del abono'}
            </p>
            <p className='mt-0.5 text-2xl font-black text-white'>
              {formatearMoneda(monto)}
            </p>
            {moraIncluida > 0 ? (
              <p className='mt-0.5 text-xs text-white/70'>
                Incluye mora: {formatearMoneda(moraIncluida)}
              </p>
            ) : null}
          </div>
          {numeroRecibo ? (
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${esAnulacion ? 'bg-red-400/30 text-red-100' : 'bg-green-400/30 text-green-100'}`}
            >
              <Receipt className='h-3.5 w-3.5' />
              {formatearNumeroRecibo(
                typeof numeroRecibo === 'number'
                  ? numeroRecibo
                  : String(numeroRecibo)
              )}
            </div>
          ) : null}
        </div>
        {/* Barra de progreso dentro de la fuente (solo si hay datos) */}
        {!esAnulacion && false ? null : null}
      </div>

      {/* Vivienda / Proyecto */}
      {tieneVivienda ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Vivienda
          </p>
          <div className='overflow-hidden rounded-xl border border-green-100 bg-green-50 dark:border-green-900/40 dark:bg-green-950/30'>
            {proyectoNombre ? (
              <div className='flex items-center gap-2.5 border-b border-green-100 px-3 py-2 dark:border-green-900/40'>
                <FolderOpen className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-green-600/70 dark:text-green-400/70'>
                    Proyecto
                  </p>
                  <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
                    {proyectoNombre}
                  </p>
                </div>
              </div>
            ) : null}
            {manzanaNombre ? (
              <div className='flex items-center gap-2.5 border-b border-green-100 px-3 py-2 dark:border-green-900/40'>
                <Layers className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-green-600/70 dark:text-green-400/70'>
                    Manzana
                  </p>
                  <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
                    {manzanaNombre}
                  </p>
                </div>
              </div>
            ) : null}
            {viviendaNumero ? (
              <div className='flex items-center gap-2.5 px-3 py-2'>
                <Home className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-green-600/70 dark:text-green-400/70'>
                    Casa
                  </p>
                  <p className='text-sm font-bold text-green-900 dark:text-green-100'>
                    #{viviendaNumero}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Fuente de pago + saldo antes/después — eliminado, fuente ahora en Detalles del pago */}

      {/* Datos del pago */}
      <section>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
          Detalles del pago
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          <Campo
            icono={<CreditCard className='h-4 w-4' />}
            label='Método de pago'
            valor={metodoPago}
          />
          {fuenteTipo !== '—' ? (
            <Campo
              icono={<Banknote className='h-4 w-4' />}
              label='Fuente de pago'
              valor={fuenteTipo}
            />
          ) : null}
          <Campo
            icono={<CalendarDays className='h-4 w-4' />}
            label='Fecha del abono'
            valor={formatFecha(fechaAbono)}
          />
          <Campo
            icono={<Hash className='h-4 w-4' />}
            label='Número de transferencia'
            valor={referencia}
          />
        </div>
      </section>

      {/* Motivo de anulación (solo si es abono_anulado y tiene datos) */}
      {esAnulacion && (motivoCategoria || motivoDetalle || anuladoPor) ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400'>
            Motivo de anulación
          </p>
          <div className='overflow-hidden rounded-xl border border-red-100 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30'>
            {motivoCategoria ? (
              <div className='flex items-start gap-2.5 border-b border-red-100 px-3 py-2 dark:border-red-900/40'>
                <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400' />
                <div>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-red-600/70 dark:text-red-400/70'>
                    Motivo
                  </p>
                  <p className='text-sm font-semibold text-red-900 dark:text-red-100'>
                    {motivoCategoria}
                  </p>
                </div>
              </div>
            ) : null}
            {motivoDetalle ? (
              <div className='flex items-start gap-2.5 border-b border-red-100 px-3 py-2 dark:border-red-900/40'>
                <XCircle className='mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400' />
                <div>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-red-600/70 dark:text-red-400/70'>
                    Detalle
                  </p>
                  <p className='text-sm text-red-900 dark:text-red-100'>
                    {motivoDetalle}
                  </p>
                </div>
              </div>
            ) : null}
            {anuladoPor ? (
              <div className='flex items-start gap-2.5 border-b border-red-100 px-3 py-2 dark:border-red-900/40'>
                <UserX className='mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400' />
                <div>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-red-600/70 dark:text-red-400/70'>
                    Anulado por
                  </p>
                  <p className='text-sm font-medium text-red-900 dark:text-red-100'>
                    {anuladoPor}
                  </p>
                </div>
              </div>
            ) : null}
            {fechaAnulacion ? (
              <div className='flex items-start gap-2.5 px-3 py-2'>
                <CalendarDays className='mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400' />
                <div>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-red-600/70 dark:text-red-400/70'>
                    Fecha de anulación
                  </p>
                  <p className='text-sm font-medium text-red-900 dark:text-red-100'>
                    {formatFecha(fechaAnulacion)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Observaciones */}
      {notas ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Observaciones
          </p>
          <div className='flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <FileText className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <p className='text-sm text-gray-700 dark:text-gray-300'>{notas}</p>
          </div>
        </section>
      ) : null}

      {/* Comprobante */}
      {comprobanteUrl ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Comprobante
          </p>
          <a
            href={`/api/abonos/comprobante?path=${encodeURIComponent(comprobanteUrl)}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/40'
          >
            <FileText className='h-4 w-4 shrink-0' />
            <span className='flex-1 truncate'>Ver comprobante de pago</span>
            <ExternalLink className='h-3.5 w-3.5 shrink-0' />
          </a>
        </section>
      ) : null}
    </div>
  )
}
