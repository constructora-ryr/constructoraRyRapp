/**
 * Franja con el cliente de la negociación vigente y accesos a su detalle y
 * a sus abonos.
 */

'use client'

import { ArrowUpRight, Mail, Phone, User, Wallet } from 'lucide-react'

import Link from 'next/link'

import { getShortId } from '@/lib/utils/slug.utils'
import type { Vivienda } from '@/modules/viviendas/types'
import { cn } from '@/shared/utils/helpers'

type ClienteVivienda = NonNullable<Vivienda['clientes']>

const enlace =
  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors'

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()

export function TarjetaCliente({
  cliente,
  puedeVerAbonos,
  className,
}: {
  cliente: ClienteVivienda
  puedeVerAbonos: boolean
  className?: string
}) {
  const id = getShortId(cliente.id)

  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between sm:px-5',
        className
      )}
    >
      <div className='flex min-w-0 items-center gap-3'>
        <span className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-md'>
          {iniciales(cliente.nombre_completo)}
        </span>
        <div className='min-w-0'>
          <p className='flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400'>
            <User className='h-3 w-3' />
            Cliente
          </p>
          <Link
            href={`/clientes/${id}`}
            className='block truncate text-base font-bold text-slate-900 hover:text-cyan-700 dark:text-white dark:hover:text-cyan-300'
          >
            {cliente.nombre_completo}
          </Link>
          <div className='mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400'>
            {cliente.telefono ? (
              <span className='inline-flex items-center gap-1'>
                <Phone className='h-3 w-3' />
                {cliente.telefono}
              </span>
            ) : null}
            {cliente.email ? (
              <span className='inline-flex min-w-0 items-center gap-1'>
                <Mail className='h-3 w-3 flex-shrink-0' />
                <span className='truncate'>{cliente.email}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className='flex flex-shrink-0 flex-wrap gap-2'>
        <Link
          href={`/clientes/${id}`}
          className={`${enlace} bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300`}
        >
          Ver cliente
          <ArrowUpRight className='h-3.5 w-3.5' />
        </Link>
        {puedeVerAbonos ? (
          <Link
            href={`/abonos/${id}`}
            className={`${enlace} bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300`}
          >
            <Wallet className='h-3.5 w-3.5' />
            Ver abonos
          </Link>
        ) : null}
      </div>
    </section>
  )
}
