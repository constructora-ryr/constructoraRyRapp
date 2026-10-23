/**
 * Piezas de los pasos del formulario de cliente: grupo de opciones tipo
 * chip, indicador de documento repetido y etiqueta de campo opcional.
 */

'use client'

import { CheckCircle2, ExternalLink, Loader2, XCircle } from 'lucide-react'

import Link from 'next/link'

import { getShortId } from '@/lib/utils/slug.utils'
import { cn } from '@/shared/utils/helpers'

import type { EstadoDocumento } from '../../hooks/useVerificacionDocumento'

export function TituloGrupo({
  children,
  requerido = false,
  ayuda,
}: {
  children: string
  requerido?: boolean
  ayuda?: string
}) {
  return (
    <div className='mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2'>
      <p className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
        {children}
        {requerido ? <span className='ml-0.5 text-red-400'>*</span> : null}
        {!requerido ? (
          <span className='ml-1.5 font-normal text-gray-400'>(opcional)</span>
        ) : null}
      </p>
      {ayuda ? <p className='text-[11px] text-gray-400'>{ayuda}</p> : null}
    </div>
  )
}

/** Opciones como chips; `permitirVacio`: tocar la elegida la quita */
export function OpcionesChip({
  opciones,
  valor,
  onCambiar,
  permitirVacio = false,
  etiqueta,
}: {
  opciones: { valor: string; label: string; detalle?: string }[]
  valor: string
  onCambiar: (valor: string) => void
  permitirVacio?: boolean
  etiqueta: string
}) {
  return (
    <div
      role='radiogroup'
      aria-label={etiqueta}
      className='flex flex-wrap gap-2'
    >
      {opciones.map(o => {
        const activa = o.valor === valor
        return (
          <button
            key={o.valor}
            type='button'
            role='radio'
            aria-checked={activa}
            title={o.detalle}
            onClick={() => onCambiar(activa && permitirVacio ? '' : o.valor)}
            className={cn(
              'rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
              activa
                ? 'border-transparent bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-cyan-700'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function IndicadorDocumento({ estado }: { estado: EstadoDocumento }) {
  switch (estado.estado) {
    case 'verificando':
      return (
        <span className='flex items-center gap-1 text-xs text-gray-500'>
          <Loader2 className='h-3.5 w-3.5 animate-spin' />
          Verificando…
        </span>
      )
    case 'libre':
      return (
        <span className='flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
          <CheckCircle2 className='h-3.5 w-3.5' />
          Documento disponible
        </span>
      )
    case 'duplicado':
      return (
        <span className='flex flex-wrap items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400'>
          <XCircle className='h-3.5 w-3.5' />
          Ya registrado: {estado.nombre}
          <Link
            href={`/clientes/${getShortId(estado.id)}`}
            target='_blank'
            className='inline-flex items-center gap-0.5 underline underline-offset-2'
          >
            ver
            <ExternalLink className='h-3 w-3' />
          </Link>
        </span>
      )
    default:
      return null
  }
}
