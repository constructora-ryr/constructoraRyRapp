/**
 * Piezas de datos del detalle: grilla de campos principales, lista de
 * cambios (antes → después) y "Datos técnicos" plegado por defecto.
 * Los ids de usuario y categoría se muestran como nombres.
 */

'use client'

import type { ReactNode } from 'react'

import { ArrowDown, ArrowRight, ChevronDown, Wrench } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

import {
  CAMPOS_SIN_VALOR,
  DETALLE,
  REFERENCIAS,
  tamanoLegible,
} from '../../config/detalle'
import {
  CAMPOS_OCULTOS,
  formatearValor,
  nombreCampo,
} from '../../config/presentacion'
import type { CambioCampo } from '../../types'

export type NombreRef = (campo: string, valor: unknown) => string | null

export function valorLegible(
  campo: string,
  valor: unknown,
  nombreRef: NombreRef
): string {
  if (REFERENCIAS[campo]) {
    const nombre = nombreRef(campo, valor)
    if (nombre) return nombre
  }
  if (campo === 'tamano_bytes') return tamanoLegible(valor) ?? 'vacío'
  if (campo === 'estado' && typeof valor === 'string')
    return valor.charAt(0).toUpperCase() + valor.slice(1)
  return formatearValor(campo, valor)
}

export function TituloSeccion({ children }: { children: ReactNode }) {
  return (
    <h4 className='mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400'>
      {children}
    </h4>
  )
}

/** Campos principales del tipo de registro que tengan valor */
export function GrillaDatos({
  tabla,
  fila,
  nombreRef,
  tono = 'neutro',
  omitir = [],
}: {
  tabla: string
  fila: Record<string, unknown>
  nombreRef: NombreRef
  tono?: 'neutro' | 'eliminado'
  /** Campos que ya se ven en otra parte (p.ej. el título en el encabezado) */
  omitir?: string[]
}) {
  const campos = (DETALLE[tabla]?.principales ?? Object.keys(fila)).filter(
    c =>
      !CAMPOS_OCULTOS.has(c) &&
      !omitir.includes(c) &&
      fila[c] !== null &&
      fila[c] !== undefined &&
      fila[c] !== '' &&
      typeof fila[c] !== 'object'
  )
  if (!campos.length) return null
  return (
    <dl className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
      {campos.map(c => {
        const valor = valorLegible(c, fila[c], nombreRef)
        return (
          <div
            key={c}
            className={cn(
              'min-w-0 rounded-xl px-3 py-2',
              valor.length > 40 && 'sm:col-span-2',
              tono === 'eliminado'
                ? 'bg-red-50/70 dark:bg-red-500/10'
                : 'bg-slate-50 dark:bg-slate-800/60'
            )}
          >
            <dt className='text-[11px] font-medium text-slate-500 dark:text-slate-400'>
              {nombreCampo(c)}
            </dt>
            <dd className='break-words text-sm font-semibold text-slate-900 dark:text-white'>
              {valor}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

export function ListaCambios({
  cambios,
  nombreRef,
}: {
  cambios: [string, CambioCampo][]
  nombreRef: NombreRef
}) {
  return (
    <ul className='space-y-2'>
      {cambios.map(([campo, c]) => (
        <li
          key={campo}
          className='rounded-xl border border-slate-200 p-3 dark:border-slate-700'
        >
          <p className='mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300'>
            {nombreCampo(campo)}
          </p>
          <div className='grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr]'>
            <div className='rounded-lg bg-red-50 px-3 py-2 dark:bg-red-500/10'>
              <p className='text-[10px] font-semibold uppercase tracking-wide text-red-600/80 dark:text-red-300/80'>
                Antes
              </p>
              <p className='break-words text-sm font-medium text-red-900 dark:text-red-200'>
                {valorLegible(campo, c.antes, nombreRef)}
              </p>
            </div>
            <span className='flex justify-center text-slate-400'>
              <ArrowRight className='hidden h-4 w-4 sm:block' />
              <ArrowDown className='h-4 w-4 sm:hidden' />
            </span>
            <div className='rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10'>
              <p className='text-[10px] font-semibold uppercase tracking-wide text-emerald-700/80 dark:text-emerald-300/80'>
                Después
              </p>
              <p className='break-words text-sm font-semibold text-emerald-900 dark:text-emerald-200'>
                {valorLegible(campo, c.despues, nombreRef)}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Todo lo demás, en crudo y plegado (para soporte técnico) */
export function DatosTecnicos({ datos }: { datos: Record<string, unknown> }) {
  const filas = Object.entries(datos).filter(
    ([campo]) => !CAMPOS_SIN_VALOR.has(campo)
  )
  if (!filas.length) return null
  return (
    <details className='group rounded-xl border border-slate-200 dark:border-slate-700'>
      <summary className='flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 [&::-webkit-details-marker]:hidden'>
        <Wrench className='h-3.5 w-3.5' />
        Datos técnicos
        <span className='font-normal'>({filas.length})</span>
        <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
      </summary>
      <dl className='grid gap-x-4 gap-y-1.5 border-t border-slate-200 px-3 py-3 font-mono text-[11px] dark:border-slate-700 sm:grid-cols-[auto_1fr]'>
        {filas.map(([campo, valor]) => (
          <div key={campo} className='contents'>
            <dt className='text-slate-500'>{campo}</dt>
            <dd className='break-all text-slate-800 dark:text-slate-200'>
              {valor === null || valor === undefined
                ? '—'
                : typeof valor === 'object'
                  ? JSON.stringify(valor)
                  : String(valor)}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
