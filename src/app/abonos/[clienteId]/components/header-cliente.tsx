'use client'

/**
 * Encabezado del detalle de abonos (EncabezadoDetalle): quién es el cliente,
 * su vivienda y cómo va el pago (cifras + barra de avance). Línea violeta
 * como el resto del módulo; dorada y con estrella cuando ya es propietario.
 * Las cifras son dinero real de las fuentes: abonado + saldo = total.
 * Si el total no es el precio de la vivienda (intereses del crédito con la
 * constructora o excedente que se devuelve), la línea de la barra lo explica.
 */

import { Building2, ExternalLink, Home, Star } from 'lucide-react'

import Link from 'next/link'

import { getShortId } from '@/lib/utils/slug.utils'
import { formatNombreCompleto, toTitleCase } from '@/lib/utils/string.utils'
import {
  avatarGradient,
  inicialesCliente,
} from '@/modules/abonos/components/lista/fuente-visual'
import { TEMA_ABONOS } from '@/modules/abonos/styles/tema-abonos'
import type { NegociacionConAbonos } from '@/modules/abonos/types'
import {
  ChipDato,
  EncabezadoDetalle,
  InsigniaEstado,
} from '@/shared/components/detalle/EncabezadoDetalle'
import { formatCOP } from '@/shared/components/list-page'
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

const BADGE_PROPIETARIO =
  'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30'

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
  const saldo = Math.max(0, metricas.saldoPendiente)

  const pct = Math.min(Math.max(metricas.porcentajeRecibido, 0), 100)
  // 100 % solo si de verdad no queda saldo
  const pctTexto = propietario ? 100 : Math.min(Math.floor(pct), 99)

  const titulo = canVerCliente ? (
    <Link
      href={`/clientes/${getShortId(cliente.id)}`}
      className='group inline-flex items-center gap-2'
      title='Abrir el detalle del cliente'
    >
      <h1 className='text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-slate-600 dark:text-white dark:group-hover:text-slate-300 sm:text-2xl'>
        {nombre}
      </h1>
      <ExternalLink className='h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-slate-600' />
    </Link>
  ) : (
    nombre
  )

  return (
    <EncabezadoDetalle
      acento={
        propietario ? TEMA_ABONOS.degradadoPropietario : TEMA_ABONOS.degradado
      }
      migas={[
        { label: 'Abonos', href: '/abonos' },
        { label: 'Registrar', href: '/abonos/registrar' },
      ]}
      avatar={
        <span
          aria-hidden
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-extrabold text-white shadow-sm',
            avatarGradient(cliente.id)
          )}
        >
          {inicialesCliente(cliente)}
        </span>
      }
      titulo={titulo}
      insignia={
        propietario ? (
          <InsigniaEstado
            label='Propietario'
            icon={Star}
            clase={BADGE_PROPIETARIO}
            iconoRelleno
          />
        ) : undefined
      }
      datos={
        <>
          <ChipDato>CC {formatDocumento(cliente.numero_documento)}</ChipDato>
          {codigoVivienda ? (
            <ChipDato icon={Home} destacado>
              {codigoVivienda}
            </ChipDato>
          ) : null}
          {proyecto?.nombre ? (
            <ChipDato icon={Building2}>{toTitleCase(proyecto.nombre)}</ChipDato>
          ) : null}
        </>
      }
      cifras={[
        {
          label: tieneIntereses ? 'Total con intereses' : 'Total a pagar',
          valor: formatCOP(metricas.totalComprometido),
        },
        {
          label: 'Abonado',
          valor: formatCOP(metricas.totalRecibido),
          tono: 'ok',
        },
        {
          label: 'Saldo',
          valor: formatCOP(saldo),
          tono: saldo > 0 ? 'pendiente' : 'ok',
        },
      ]}
      avance={{
        porcentaje: pct,
        texto: `${pctTexto}% pagado`,
        detalle: tieneIntereses ? (
          <>
            Vivienda {formatCOP(metricas.valorVivienda)} + intereses del crédito
            con la constructora {formatCOP(metricas.interesesTotales)}
          </>
        ) : excedente > 0 ? (
          <>
            Vivienda {formatCOP(metricas.valorVivienda)} + excedente{' '}
            {formatCOP(excedente)} que se devuelve al cliente
          </>
        ) : undefined,
      }}
    />
  )
}
