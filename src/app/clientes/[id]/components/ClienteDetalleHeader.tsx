'use client'

/**
 * Encabezado del detalle de cliente (EncabezadoDetalle): avatar del estado,
 * nombre con su estado, documento copiable, vivienda y proyecto, cifras de
 * la negociación y acciones.
 */

import type { ReactNode } from 'react'

import { Building2, Copy, Home, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { formatearDocumentoCompleto } from '@/lib/utils/documento.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import type { Cliente, Negociacion } from '@/modules/clientes/types'
import {
  ChipDato,
  type CifraDetalle,
  EncabezadoDetalle,
  InsigniaEstado,
} from '@/shared/components/detalle/EncabezadoDetalle'
import { BotonIcono, formatCOP } from '@/shared/components/list-page'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { CLIENTE_ESTADO_BADGE } from '@/shared/config/estados.colors'
import { cn } from '@/shared/utils/helpers'

import { useResumenNegociacion } from '../tabs/general/hooks/useResumenNegociacion'

interface ClienteDetalleHeaderProps {
  cliente: Cliente
  /** Estado a mostrar (Activo con saldo 0 se muestra como Propietario) */
  estado: string
  /** Negociación vigente (activa o completada), si hay */
  negociacion: Negociacion | null
  /** Botones principales (asignar vivienda, reactivar, registrar abono…) */
  acciones?: ReactNode
  onEditar?: () => void
  onEliminar?: () => void
  /** Motivo por el que no se puede eliminar (deshabilita el botón) */
  motivoNoEliminar?: string | null
}

const iniciales = (c: Cliente) =>
  `${c.nombres?.trim()[0] ?? ''}${c.apellidos?.trim()[0] ?? ''}`.toUpperCase()

/** Cifras de la negociación (hook aparte: solo se calcula si hay negociación) */
function useCifrasNegociacion(negociacion: Negociacion): CifraDetalle[] {
  const {
    totalComprometido,
    valorVivienda,
    interesesTotales,
    saldo,
    pctPagado,
  } = useResumenNegociacion({ negociacion })
  const total = interesesTotales > 0 ? totalComprometido : valorVivienda
  return [
    { label: 'Valor total', valor: formatCOP(total) },
    saldo <= 0
      ? { label: 'Estado de pago', valor: 'Pagada', tono: 'ok' }
      : {
          label: `Saldo · ${Math.round(pctPagado)}% pagado`,
          valor: formatCOP(saldo),
          tono: 'pendiente',
        },
  ]
}

/** Puente: el hook solo se monta cuando hay negociación con valores */
function ConCifras({
  negociacion,
  children,
}: {
  negociacion: Negociacion
  children: (cifras: CifraDetalle[]) => ReactNode
}) {
  return <>{children(useCifrasNegociacion(negociacion))}</>
}

export function ClienteDetalleHeader({
  cliente,
  estado,
  negociacion,
  acciones,
  onEditar,
  onEliminar,
  motivoNoEliminar,
}: ClienteDetalleHeaderProps) {
  const nombre = formatNombreCompleto(cliente.nombre_completo)
  const cfg = CLIENTE_ESTADO_BADGE[estado] ?? CLIENTE_ESTADO_BADGE.Interesado
  const EstadoIcono = cfg.icon

  const vivienda = negociacion?.viviendas
  const codigoVivienda = vivienda
    ? `${vivienda.manzanas?.nombre ?? ''}${vivienda.numero ?? ''}`
    : ''
  const proyecto = vivienda?.manzanas?.proyectos?.nombre

  const copiarDocumento = async () => {
    try {
      await navigator.clipboard.writeText(cliente.numero_documento)
      toast.success('Documento copiado')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const encabezado = (cifras?: CifraDetalle[]) => (
    <EncabezadoDetalle
      modulo='/clientes'
      migas={[{ label: 'Clientes', href: '/clientes' }]}
      avatar={
        <span
          className={cn(
            'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-black text-white shadow-sm sm:h-16 sm:w-16 sm:text-xl',
            cfg.gradient
          )}
        >
          {iniciales(cliente)}
          <span className='absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700'>
            <EstadoIcono
              className={cn(
                'h-4 w-4',
                cfg.text,
                cfg.iconFilled && 'fill-current'
              )}
            />
          </span>
        </span>
      }
      titulo={nombre}
      insignia={
        <InsigniaEstado
          label={cfg.label}
          icon={EstadoIcono}
          clase={cfg.badge}
          iconoRelleno={cfg.iconFilled}
        />
      }
      datos={
        <>
          <ChipDato
            icon={Copy}
            onClick={copiarDocumento}
            title='Copiar número de documento'
          >
            {formatearDocumentoCompleto(
              cliente.tipo_documento,
              cliente.numero_documento
            )}
          </ChipDato>
          {codigoVivienda ? (
            <ChipDato icon={Home} destacado>
              {codigoVivienda}
            </ChipDato>
          ) : null}
          {proyecto ? <ChipDato icon={Building2}>{proyecto}</ChipDato> : null}
        </>
      }
      acciones={
        <>
          {acciones}
          {onEditar ? (
            <BotonIcono
              icon={Pencil}
              label='Editar cliente'
              onClick={onEditar}
            />
          ) : null}
          {onEliminar ? (
            <Tooltip
              content={motivoNoEliminar ?? 'Eliminar cliente'}
              side='bottom'
            >
              {/* span: los botones deshabilitados no disparan el tooltip */}
              <span className='inline-flex'>
                <BotonIcono
                  icon={Trash2}
                  label='Eliminar cliente'
                  onClick={onEliminar}
                  disabled={!!motivoNoEliminar}
                  peligro
                  sinTitle
                />
              </span>
            </Tooltip>
          ) : null}
        </>
      }
      cifras={cifras}
    />
  )

  const conValores =
    negociacion &&
    (negociacion.valor_total_pagar > 0 || negociacion.valor_total > 0)

  return conValores ? (
    <ConCifras negociacion={negociacion}>{encabezado}</ConCifras>
  ) : (
    encabezado()
  )
}
