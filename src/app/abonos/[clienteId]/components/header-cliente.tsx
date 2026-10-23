'use client'

/**
 * Encabezado del detalle de abonos: quién es el cliente, su vivienda y cómo
 * va el pago (cifras en vidrio + barra de avance). Violeta como el resto del
 * módulo; dorado con estrella cuando ya es propietario (saldo en cero).
 * Las cifras son dinero real de las fuentes: abonado + saldo = total.
 * Si el total no es el precio de la vivienda (intereses del crédito con la
 * constructora o excedente que se devuelve), la línea de la barra lo explica.
 */

import { motion } from 'framer-motion'
import {
  Building2,
  ChevronRight,
  ExternalLink,
  Home,
  Hourglass,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Star,
} from 'lucide-react'

import Link from 'next/link'

import { getShortId } from '@/lib/utils/slug.utils'
import { formatNombreCompleto, toTitleCase } from '@/lib/utils/string.utils'
import {
  avatarGradient,
  inicialesCliente,
} from '@/modules/abonos/components/lista/fuente-visual'
import { TEMA_ABONOS } from '@/modules/abonos/styles/tema-abonos'
import type { NegociacionConAbonos } from '@/modules/abonos/types'
import { formatCOP, HeroDato } from '@/shared/components/list-page'
import { cn } from '@/shared/utils/helpers'

export interface MetricasAbonos {
  valorVivienda: number
  totalComprometido: number
  interesesTotales: number
  totalAbonado: number
  totalRecibido: number
  saldoPendiente: number
  porcentajePagado: number
  porcentajeRecibido: number
}

interface HeaderClienteProps {
  negociacion: NegociacionConAbonos
  metricas: MetricasAbonos
  /** Lo que las fuentes cubren por encima del total a pagar */
  excedente?: number
  canVerCliente?: boolean
}

/** "14890678" → "14.890.678" (solo si es numérico) */
const formatDocumento = (n: string | null | undefined) =>
  n && /^\d+$/.test(n) ? Number(n).toLocaleString('es-CO') : (n ?? '')

export function HeaderCliente({
  negociacion,
  metricas,
  excedente = 0,
  canVerCliente = false,
}: HeaderClienteProps) {
  const { cliente, vivienda, proyecto } = negociacion
  const propietario =
    negociacion.estado === 'Completada' || metricas.saldoPendiente <= 0
  const nombre = formatNombreCompleto(`${cliente.nombres} ${cliente.apellidos}`)
  const codigoVivienda = `${vivienda.manzana?.nombre || ''}${vivienda.numero || ''}`
  const tieneIntereses = metricas.interesesTotales > 0

  const pct = Math.min(Math.max(metricas.porcentajeRecibido, 0), 100)
  // 100 % solo si de verdad no queda saldo
  const pctTexto = propietario ? 100 : Math.min(Math.floor(pct), 99)

  const titulo = canVerCliente ? (
    <Link
      href={`/clientes/${getShortId(cliente.id)}`}
      className='group inline-flex items-center gap-2'
      title='Abrir el detalle del cliente'
    >
      <h1 className='text-xl font-bold tracking-tight text-white transition-opacity group-hover:opacity-85 sm:text-2xl'>
        {nombre}
      </h1>
      <ExternalLink className='h-4 w-4 shrink-0 text-white/60 transition-colors group-hover:text-white' />
    </Link>
  ) : (
    <h1 className='text-xl font-bold tracking-tight text-white sm:text-2xl'>
      {nombre}
    </h1>
  )

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br shadow-lg',
        propietario
          ? cn(TEMA_ABONOS.degradadoPropietario, 'shadow-amber-900/15')
          : cn(TEMA_ABONOS.degradado, 'shadow-violet-900/15')
      )}
    >
      <span
        aria-hidden
        className='pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl'
      />
      <span
        aria-hidden
        className='pointer-events-none absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-white/10 blur-2xl'
      />

      <div className='relative px-5 pb-4 pt-5 sm:px-6'>
        {/* Ruta */}
        <nav
          aria-label='Ruta'
          className='mb-3 flex flex-wrap items-center gap-1 text-xs text-white/70'
        >
          <Link
            href='/'
            className='flex items-center gap-1 transition-colors hover:text-white'
          >
            <LayoutDashboard className='h-3 w-3' />
            Dashboard
          </Link>
          <ChevronRight className='h-3 w-3 text-white/40' />
          <Link href='/abonos' className='transition-colors hover:text-white'>
            Abonos
          </Link>
          <ChevronRight className='h-3 w-3 text-white/40' />
          <Link
            href='/abonos/registrar'
            className='transition-colors hover:text-white'
          >
            Registrar
          </Link>
          <ChevronRight className='h-3 w-3 text-white/40' />
          <span className='font-semibold text-white'>{nombre}</span>
        </nav>

        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          {/* Cliente */}
          <div className='flex min-w-0 items-center gap-3'>
            <span
              aria-hidden
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-extrabold text-white shadow-lg ring-2 ring-white/30',
                avatarGradient(cliente.id)
              )}
            >
              {inicialesCliente(cliente)}
            </span>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                {titulo}
                {propietario ? (
                  <span className='inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold text-white ring-1 ring-white/40'>
                    <Star className='h-3 w-3 fill-white' />
                    Propietario
                  </span>
                ) : null}
              </div>
              <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80'>
                <span className='tabular-nums'>
                  CC {formatDocumento(cliente.numero_documento)}
                </span>
                {codigoVivienda ? (
                  <span className='inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5 font-bold text-white ring-1 ring-white/30'>
                    <Home className='h-3 w-3' />
                    {codigoVivienda}
                  </span>
                ) : null}
                {proyecto?.nombre ? (
                  <span className='inline-flex items-center gap-1'>
                    <Building2 className='h-3 w-3' />
                    {toTitleCase(proyecto.nombre)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Cifras */}
          <div className='grid grid-cols-2 gap-2 sm:flex sm:flex-wrap'>
            <HeroDato
              icon={Receipt}
              label={tieneIntereses ? 'Total con intereses' : 'Total a pagar'}
              valor={formatCOP(metricas.totalComprometido)}
            />
            <HeroDato
              icon={PiggyBank}
              label='Abonado'
              valor={formatCOP(metricas.totalRecibido)}
            />
            <HeroDato
              icon={Hourglass}
              label='Saldo'
              valor={formatCOP(Math.max(0, metricas.saldoPendiente))}
            />
          </div>
        </div>

        {/* Avance */}
        <div className='mt-4'>
          <div className='mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-xs text-white/80'>
            <span>
              {tieneIntereses ? (
                <>
                  Vivienda {formatCOP(metricas.valorVivienda)} + intereses del
                  crédito con la constructora{' '}
                  {formatCOP(metricas.interesesTotales)}
                </>
              ) : excedente > 0 ? (
                <>
                  Vivienda {formatCOP(metricas.valorVivienda)} + excedente{' '}
                  {formatCOP(excedente)} que se devuelve al cliente
                </>
              ) : (
                'Avance del pago'
              )}
            </span>
            <span className='text-sm font-bold tabular-nums text-white'>
              {pctTexto}% pagado
            </span>
          </div>
          <div className='h-2.5 overflow-hidden rounded-full bg-white/20'>
            <motion.div
              className='h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]'
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
            />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
