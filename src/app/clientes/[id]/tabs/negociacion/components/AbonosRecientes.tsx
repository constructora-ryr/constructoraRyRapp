'use client'

import { ArrowUpRight, Calendar, CreditCard, Tag, Wallet } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { getShortId } from '@/lib/utils/slug.utils'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import { formatCurrency } from '@/shared/utils/format'

interface Abono {
  id: string
  numero_recibo?: string | number | null
  negociacion_id?: string
  fuente_pago_id?: string
  monto: number
  fecha_abono: string
  metodo_pago?: string | null
  numero_referencia?: string | null
  notas?: string | null
  comprobante_url?: string | null
}

interface FuenteInfo {
  id: string
  tipo: string
  entidad?: string | null
}

interface AbonosRecientesProps {
  abonos: Abono[]
  totalAbonado: number
  negociacionId: string
  clienteId: string
  fuentesPago?: FuenteInfo[]
  isLoading?: boolean
}

// ─── Componente principal ──────────────────────────────────────────────────

export function AbonosRecientes({
  abonos,
  totalAbonado,
  negociacionId: _negociacionId,
  clienteId,
  fuentesPago = [],
  isLoading,
}: AbonosRecientesProps) {
  const router = useRouter()
  const fuenteMap = new Map(fuentesPago.map(f => [f.id, f]))

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className='h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/40'
          />
        ))}
      </div>
    )
  }

  if (abonos.length === 0) {
    return (
      <div className='flex flex-col items-center space-y-2 py-8 text-center'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700/50'>
          <CreditCard className='h-5 w-5 text-gray-400 dark:text-gray-500' />
        </div>
        <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
          Aún no se han registrado abonos
        </p>
        <p className='text-xs text-gray-400 dark:text-gray-500'>
          Los pagos aparecerán aquí a medida que se registren.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-1.5'>
      {abonos.map(abono => {
        const fuente = abono.fuente_pago_id
          ? (fuenteMap.get(abono.fuente_pago_id) ?? null)
          : null
        const fuenteLabel = fuente
          ? fuente.entidad
            ? `${fuente.tipo} · ${fuente.entidad}`
            : fuente.tipo
          : null

        return (
          <button
            key={abono.id}
            type='button'
            onClick={() => router.push(`/abonos/${getShortId(clienteId)}`)}
            className='group flex w-full items-center gap-3 rounded-lg border border-gray-200/80 bg-white px-3 py-2.5 text-left transition-colors hover:border-cyan-200 hover:bg-cyan-50/40 dark:border-gray-700/50 dark:bg-gray-800/60 dark:hover:border-cyan-800/50 dark:hover:bg-cyan-900/10'
          >
            {/* Icono */}
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-cyan-100 dark:bg-blue-900/30 dark:group-hover:bg-cyan-900/40'>
              <Wallet className='h-4 w-4 text-blue-600 group-hover:text-cyan-600 dark:text-blue-400 dark:group-hover:text-cyan-400' />
            </div>

            {/* Info */}
            <div className='min-w-0 flex-1 space-y-0.5'>
              {/* Monto + consecutivo */}
              <div className='flex items-center gap-2'>
                <span className='text-xs font-medium text-gray-400 dark:text-gray-500'>
                  Monto:
                </span>
                <span className='text-sm font-bold tabular-nums text-gray-900 dark:text-white'>
                  {formatCurrency(abono.monto)}
                </span>
                {abono.numero_recibo ? (
                  <span className='inline-flex items-center rounded-md border border-cyan-200 bg-cyan-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-700 dark:border-cyan-800/60 dark:bg-cyan-900/30 dark:text-cyan-400'>
                    {formatearNumeroRecibo(abono.numero_recibo)}
                  </span>
                ) : null}
              </div>

              {/* Fecha + método + fuente */}
              <div className='flex flex-wrap items-center gap-x-3 gap-y-0.5'>
                <div className='flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400'>
                  <Calendar className='h-3 w-3 flex-shrink-0' />
                  <span className='text-gray-400 dark:text-gray-500'>
                    Fecha:
                  </span>
                  <span>{formatDateCompact(abono.fecha_abono)}</span>
                </div>

                {abono.metodo_pago ? (
                  <div className='flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400'>
                    <span className='text-gray-400 dark:text-gray-500'>
                      Vía:
                    </span>
                    <span>{abono.metodo_pago}</span>
                  </div>
                ) : null}

                {fuenteLabel ? (
                  <div className='flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400'>
                    <Tag className='h-3 w-3 flex-shrink-0' />
                    <span className='truncate font-medium text-gray-700 dark:text-gray-300'>
                      {fuenteLabel}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Flecha — aparece en hover */}
            <ArrowUpRight className='h-4 w-4 flex-shrink-0 text-gray-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-500 dark:text-gray-600 dark:group-hover:text-cyan-400' />
          </button>
        )
      })}

      {/* Footer: resumen */}
      <div className='mt-3 rounded-lg border border-gray-200/60 bg-gray-50 px-3 py-2.5 dark:border-gray-700/40 dark:bg-gray-800/40'>
        <p className='text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
          Total abonado
        </p>
        <p className='text-sm font-bold tabular-nums text-gray-900 dark:text-white'>
          {formatCurrency(totalAbonado)}
        </p>
      </div>
    </div>
  )
}
