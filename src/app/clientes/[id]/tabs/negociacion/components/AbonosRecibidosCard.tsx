'use client'

/**
 * Abonos recibidos de la negociación. Cada fila usa el color de su fuente
 * y al hacer clic abre el visor de abonos (comprobante + detalle) sin salir
 * del cliente.
 */

import { useState } from 'react'

import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Calendar,
  ChevronRight,
  CreditCard,
  RefreshCw,
  Shield,
  Wallet,
} from 'lucide-react'

import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { getShortId } from '@/lib/utils/slug.utils'
import { AbonoDetalleModal } from '@/modules/abonos/components/abono-detalle-modal/AbonoDetalleModal'
import type { AbonoParaDetalle } from '@/modules/abonos/components/abono-detalle-modal/useAbonoDetalle'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import { formatCOP } from '@/shared/components/list-page'
import { getFuenteColorClasses } from '@/shared/constants/fuentes-pago.constants'
import { cn } from '@/shared/utils/helpers'

export interface AbonoNegociacion {
  id: string
  numero_recibo?: string | number | null
  fuente_pago_id?: string | null
  monto: number
  fecha_abono: string
  fecha_creacion?: string | null
  metodo_pago?: string | null
  numero_referencia?: string | null
  notas?: string | null
  comprobante_url?: string | null
  estado?: string | null
}

interface AbonosRecibidosCardProps {
  abonos: AbonoNegociacion[]
  isLoading: boolean
  totalAbonado: number
  fuentes: { id: string; tipo: string; entidad?: string | null }[]
  tiposFuentes: { nombre: string; color?: string | null }[]
  /** Hay descuadre: el registro de abonos está bloqueado */
  bloqueado: boolean
  canVerAbonos: boolean
  /** Contexto para el visor de abonos */
  contexto: {
    cliente: {
      id: string
      nombres: string
      apellidos: string
      numero_documento: string
    }
    negociacion: { id: string; estado: string }
    vivienda: { id: string; numero: string; manzana: string }
    proyecto: { id: string; nombre: string }
    financiero: {
      valorTotal: number
      totalAbonado: number
      saldoPendiente: number
    }
  }
}

export function AbonosRecibidosCard({
  abonos,
  isLoading,
  totalAbonado,
  fuentes,
  tiposFuentes,
  bloqueado,
  canVerAbonos,
  contexto,
}: AbonosRecibidosCardProps) {
  const [abierto, setAbierto] = useState<AbonoParaDetalle | null>(null)
  const fuenteMap = new Map(fuentes.map(f => [f.id, f]))
  const colorDe = (tipo?: string) =>
    getFuenteColorClasses(tiposFuentes.find(t => t.nombre === tipo)?.color)

  const aDetalle = (a: AbonoNegociacion): AbonoParaDetalle => {
    const f = a.fuente_pago_id ? fuenteMap.get(a.fuente_pago_id) : undefined
    return {
      id: a.id,
      numero_recibo: String(a.numero_recibo ?? ''),
      monto: Number(a.monto),
      fecha_abono: a.fecha_abono,
      metodo_pago: a.metodo_pago ?? '',
      numero_referencia: a.numero_referencia ?? null,
      comprobante_url: a.comprobante_url ?? null,
      notas: a.notas ?? null,
      fecha_creacion: a.fecha_creacion ?? a.fecha_abono,
      estado: a.estado === 'Anulado' ? 'Anulado' : 'Activo',
      negociacion: {
        id: contexto.negociacion.id,
        estado: contexto.negociacion
          .estado as AbonoParaDetalle['negociacion']['estado'],
      },
      cliente: contexto.cliente,
      vivienda: {
        id: contexto.vivienda.id,
        numero: contexto.vivienda.numero,
        manzana: { identificador: contexto.vivienda.manzana },
      },
      proyecto: contexto.proyecto,
      fuente_pago: {
        id: f?.id ?? a.fuente_pago_id ?? '',
        tipo: f?.tipo ?? 'Sin fuente',
        entidad: f?.entidad ?? null,
      },
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.08 }}
      className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
    >
      {/* Encabezado */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/60'>
        <div className='flex items-center gap-3'>
          <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm'>
            <CreditCard className='h-4 w-4' />
          </span>
          <div>
            <h3 className='flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white'>
              Abonos recibidos
              {isLoading && (
                <RefreshCw className='h-3.5 w-3.5 animate-spin text-slate-300' />
              )}
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Total{' '}
              <span className='font-bold tabular-nums text-emerald-700 dark:text-emerald-400'>
                {formatCOP(totalAbonado)}
              </span>
            </p>
          </div>
        </div>
        {canVerAbonos && (
          <Link
            href={`/abonos/${getShortId(contexto.cliente.id)}`}
            className='inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-800/50 dark:bg-violet-900/20 dark:text-violet-300 sm:h-9'
          >
            Ir a abonos
            <ArrowUpRight className='h-4 w-4' />
          </Link>
        )}
      </div>

      {bloqueado && (
        <div className='flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300'>
          <Shield className='h-4 w-4 shrink-0' />
          Registro de abonos bloqueado hasta corregir el descuadre financiero
        </div>
      )}

      <div className='p-4'>
        {isLoading && abonos.length === 0 ? (
          <div className='space-y-2'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/40'
              />
            ))}
          </div>
        ) : abonos.length === 0 ? (
          <div className='flex flex-col items-center py-8 text-center'>
            <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md shadow-violet-500/20'>
              <Wallet className='h-6 w-6' />
            </span>
            <p className='mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200'>
              Aún no se han registrado abonos
            </p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Los pagos aparecerán aquí a medida que se registren.
            </p>
          </div>
        ) : (
          <ul className='space-y-2'>
            {abonos.map(a => {
              const f = a.fuente_pago_id
                ? fuenteMap.get(a.fuente_pago_id)
                : undefined
              const color = colorDe(f?.tipo)
              return (
                <li key={a.id}>
                  <button
                    type='button'
                    onClick={() => setAbierto(aDetalle(a))}
                    className='group flex w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/40 dark:hover:border-violet-500/40'
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                        color.icon
                      )}
                    >
                      <Wallet className='h-5 w-5' />
                    </span>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-base font-black tabular-nums text-emerald-700 dark:text-emerald-400'>
                          {formatCOP(Number(a.monto))}
                        </span>
                        {a.numero_recibo ? (
                          <span className='rounded-md bg-violet-50 px-1.5 py-px font-mono text-[11px] font-bold text-violet-700 ring-1 ring-inset ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300'>
                            {formatearNumeroRecibo(a.numero_recibo)}
                          </span>
                        ) : null}
                      </div>
                      <p className='mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400'>
                        <span className='inline-flex items-center gap-1'>
                          <Calendar className='h-3 w-3' />
                          {formatDateCompact(a.fecha_abono)}
                        </span>
                        {f && (
                          <span className={cn('font-semibold', color.texto)}>
                            {f.tipo}
                            {f.entidad ? ` · ${f.entidad}` : ''}
                          </span>
                        )}
                        {a.metodo_pago && <span>{a.metodo_pago}</span>}
                      </p>
                    </div>
                    <ChevronRight className='h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500 dark:text-slate-600' />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <AbonoDetalleModal
        abono={abierto}
        isOpen={!!abierto}
        onClose={() => setAbierto(null)}
        canVerCliente={false}
        negociacionFinancials={contexto.financiero}
      />
    </motion.section>
  )
}
