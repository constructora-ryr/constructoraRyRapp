'use client'

/**
 * Encabezado del detalle de vivienda: banner con el degradado de Viviendas,
 * código de la casa con su estado (mismos colores que el listado), proyecto,
 * cliente, cifras de valor y saldo, y la acción de editar.
 */

import { motion } from 'framer-motion'
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  CornerDownRight,
  Home,
  LayoutDashboard,
  Pencil,
  User,
  Wallet,
} from 'lucide-react'

import Link from 'next/link'

import { getShortId } from '@/lib/utils/slug.utils'
import type { Vivienda } from '@/modules/viviendas/types'
import { formatCurrency } from '@/modules/viviendas/utils'
import { DatoHero } from '@/shared/components/detalle/DatoHero'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { VIVIENDA_ESTADO_BADGE } from '@/shared/config/estados.colors'
import { cn } from '@/shared/utils/helpers'

const chip =
  'inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white ring-1 ring-white/25'

export function ViviendaDetalleHeader({
  vivienda,
  onEditar,
}: {
  vivienda: Vivienda
  onEditar?: () => void
}) {
  const cfg =
    VIVIENDA_ESTADO_BADGE[vivienda.estado] ?? VIVIENDA_ESTADO_BADGE.Disponible
  const EstadoIcono = cfg.icon
  const manzana = vivienda.manzanas?.nombre ?? '?'
  const titulo = `Manzana ${manzana} · Casa ${vivienda.numero}`
  const cliente = vivienda.clientes
  const total = vivienda.valor_negociado ?? vivienda.valor_total
  const saldo = vivienda.saldo_pendiente ?? total

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 px-5 py-5 shadow-lg shadow-orange-900/10 sm:px-6'
    >
      <span
        aria-hidden
        className='pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl'
      />
      <span
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_left,black,transparent_60%)]'
      />

      <div className='relative'>
        <nav
          aria-label='Ruta'
          className='mb-3 flex min-w-0 items-center gap-1 text-xs text-white/75'
        >
          <Link
            href='/'
            className='flex items-center gap-1 transition-colors hover:text-white'
          >
            <LayoutDashboard className='h-3 w-3' />
            Dashboard
          </Link>
          <ChevronRight className='h-3 w-3 text-white/40' />
          <Link
            href='/viviendas'
            className='transition-colors hover:text-white'
          >
            Viviendas
          </Link>
          <ChevronRight className='h-3 w-3 text-white/40' />
          <span
            className='min-w-0 truncate font-semibold text-white'
            aria-current='page'
          >
            {titulo}
          </span>
        </nav>

        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex min-w-0 items-center gap-4'>
            <span
              className={cn(
                'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-black text-white shadow-lg ring-4 ring-white/30 sm:h-16 sm:w-16 sm:text-xl',
                cfg.gradient
              )}
            >
              {manzana}
              {vivienda.numero}
              <span className='absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md'>
                <EstadoIcono className={cn('h-4 w-4', cfg.text)} />
              </span>
            </span>

            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl'>
                  {titulo}
                </h1>
                <span className='inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white ring-1 ring-white/30'>
                  <EstadoIcono className='h-3.5 w-3.5' />
                  {cfg.label}
                </span>
              </div>

              <div className='mt-1.5 flex flex-wrap items-center gap-2'>
                <span className={chip}>
                  <Building2 className='h-3.5 w-3.5' />
                  {vivienda.manzanas?.proyectos?.nombre ?? 'Sin proyecto'}
                </span>
                {vivienda.es_esquinera ? (
                  <span className={chip}>
                    <CornerDownRight className='h-3.5 w-3.5' />
                    Esquinera
                  </span>
                ) : null}
                {cliente ? (
                  <Link
                    href={`/clientes/${getShortId(cliente.id)}`}
                    className={cn(chip, 'transition-colors hover:bg-white/25')}
                  >
                    <User className='h-3.5 w-3.5' />
                    <span className='max-w-[14rem] truncate font-semibold'>
                      {cliente.nombre_completo}
                    </span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <DatoHero
              icon={Home}
              label={
                vivienda.valor_negociado ? 'Precio pactado' : 'Valor total'
              }
              valor={formatCurrency(total)}
            />
            {vivienda.negociacion_id ? (
              saldo <= 0 ? (
                <DatoHero
                  icon={CheckCircle2}
                  label='Estado de pago'
                  valor='Pagada ✓'
                />
              ) : (
                <DatoHero
                  icon={Wallet}
                  label={`Saldo · ${vivienda.porcentaje_pagado ?? 0}% pagado`}
                  valor={formatCurrency(saldo)}
                />
              )
            ) : null}
            {onEditar ? (
              <Tooltip content='Editar vivienda' side='bottom'>
                <button
                  type='button'
                  onClick={onEditar}
                  aria-label='Editar vivienda'
                  className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25'
                >
                  <Pencil className='h-4 w-4' />
                </button>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
