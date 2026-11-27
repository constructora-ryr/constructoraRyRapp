'use client'

/**
 * Encabezado del detalle de vivienda (EncabezadoDetalle): código de la casa
 * con su estado (mismos colores que el listado), proyecto, cliente, cifras
 * de valor y saldo, y la acción de editar.
 */

import { Building2, CornerDownRight, Pencil, User } from 'lucide-react'

import { getShortId } from '@/lib/utils/slug.utils'
import type { Vivienda } from '@/modules/viviendas/types'
import { formatCurrency } from '@/modules/viviendas/utils'
import {
  ChipDato,
  type CifraDetalle,
  EncabezadoDetalle,
  InsigniaEstado,
} from '@/shared/components/detalle/EncabezadoDetalle'
import { BotonIcono } from '@/shared/components/list-page'
import { VIVIENDA_ESTADO_BADGE } from '@/shared/config/estados.colors'
import { cn } from '@/shared/utils/helpers'

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
  const cliente = vivienda.clientes
  const total = vivienda.valor_negociado ?? vivienda.valor_total
  const saldo = vivienda.saldo_pendiente ?? total

  const cifras: CifraDetalle[] = [
    {
      label: vivienda.valor_negociado ? 'Precio pactado' : 'Valor total',
      valor: formatCurrency(total),
    },
    ...(vivienda.negociacion_id
      ? [
          saldo <= 0
            ? ({
                label: 'Estado de pago',
                valor: 'Pagada',
                tono: 'ok',
              } as const)
            : ({
                label: `Saldo · ${vivienda.porcentaje_pagado ?? 0}% pagado`,
                valor: formatCurrency(saldo),
                tono: 'pendiente',
              } as const),
        ]
      : []),
  ]

  return (
    <EncabezadoDetalle
      modulo='/viviendas'
      migas={[{ label: 'Viviendas', href: '/viviendas' }]}
      avatar={
        <span
          className={cn(
            'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-black text-white shadow-sm sm:h-16 sm:w-16 sm:text-xl',
            cfg.gradient
          )}
        >
          {manzana}
          {vivienda.numero}
          <span className='absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700'>
            <EstadoIcono className={cn('h-4 w-4', cfg.text)} />
          </span>
        </span>
      }
      titulo={`Manzana ${manzana} · Casa ${vivienda.numero}`}
      insignia={
        <InsigniaEstado
          label={cfg.label}
          icon={EstadoIcono}
          clase={cfg.badge}
        />
      }
      datos={
        <>
          <ChipDato icon={Building2}>
            {vivienda.manzanas?.proyectos?.nombre ?? 'Sin proyecto'}
          </ChipDato>
          {vivienda.es_esquinera ? (
            <ChipDato icon={CornerDownRight}>Esquinera</ChipDato>
          ) : null}
          {cliente ? (
            <ChipDato
              icon={User}
              href={`/clientes/${getShortId(cliente.id)}`}
              title='Abrir el detalle del cliente'
            >
              {cliente.nombre_completo}
            </ChipDato>
          ) : null}
        </>
      }
      acciones={
        onEditar ? (
          <BotonIcono
            icon={Pencil}
            label='Editar vivienda'
            onClick={onEditar}
          />
        ) : undefined
      }
      cifras={cifras}
    />
  )
}
