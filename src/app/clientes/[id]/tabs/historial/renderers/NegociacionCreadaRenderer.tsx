/**
 * Negociación creada: vivienda asignada, condiciones económicas, fuentes
 * de pago configuradas, estado inicial y notas.
 */

import {
  BadgePercent,
  Building2,
  CalendarDays,
  FileText,
  FolderOpen,
  Handshake,
  Home,
  Layers,
  Maximize2,
  Ruler,
  Tag,
} from 'lucide-react'

import { LABELS_TIPO_DESCUENTO } from '@/modules/clientes/constants/descuento.constants'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda } from './formatearValor'
import {
  Banner,
  Dato,
  Datos,
  type FuenteSnapshot,
  ListaFuentes,
  TextoLibre,
} from './piezas'

const m2 = (v: unknown) => (v ? `${v} m²` : null)

export function NegociacionCreadaRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = (evento.metadata ?? {}) as Record<string, unknown>

  const fuentes = Array.isArray(meta.fuentes_pago)
    ? (meta.fuentes_pago as FuenteSnapshot[])
    : []

  const esquinera = meta.vivienda_es_esquinera as boolean | undefined
  const recargo = Number(meta.vivienda_recargo_esquinera ?? 0)
  const valorBase = Number(meta.vivienda_valor_base ?? 0)
  const notariales = Number(meta.vivienda_gastos_notariales ?? 0)
  const descuento = Number(
    meta.negociacion_descuento_aplicado ?? get('descuento_aplicado') ?? 0
  )
  const tipoDescuento = String(meta.negociacion_tipo_descuento ?? '')

  // valor_total lo calcula un trigger; los registros viejos guardaban solo
  // base - descuento, así que se recalcula desde las partes cuando se puede
  const recalculado =
    valorBase + notariales + (esquinera ? recargo : 0) - descuento
  const valorTotal =
    recalculado > 0
      ? recalculado
      : Number(meta.negociacion_valor_total ?? get('valor_total') ?? 0)

  const tieneVivienda = Boolean(
    meta.proyecto_nombre ?? meta.manzana_nombre ?? meta.vivienda_numero
  )

  return (
    <div className='space-y-4'>
      <Banner
        tono='info'
        etiqueta='Valor total a pagar'
        valor={formatearMoneda(valorTotal)}
        nota={
          descuento > 0
            ? `Con descuento de ${formatearMoneda(descuento)}`
            : undefined
        }
      />

      <Datos titulo='Vivienda asignada' tono='exito'>
        {tieneVivienda ? (
          <>
            <Dato
              icon={FolderOpen}
              label='Proyecto'
              valor={meta.proyecto_nombre}
            />
            <Dato icon={Layers} label='Manzana' valor={meta.manzana_nombre} />
            <Dato
              icon={Home}
              label='Casa'
              valor={
                meta.vivienda_numero
                  ? `#${meta.vivienda_numero}${esquinera ? ' · Esquinera' : ''}`
                  : null
              }
              destacado
            />
            <Dato
              icon={Tag}
              label='Tipo de vivienda'
              valor={meta.vivienda_tipo_vivienda}
            />
            <Dato
              icon={Ruler}
              label='Área construida'
              valor={m2(meta.vivienda_area_construida)}
            />
            <Dato
              icon={Maximize2}
              label='Área del lote'
              valor={m2(meta.vivienda_area_lote)}
            />
          </>
        ) : (
          // Registros viejos sin la vivienda detallada
          <Dato
            icon={Building2}
            label='Vivienda'
            valor={
              meta.vivienda_nombre ?? meta.vivienda_numero ?? get('vivienda_id')
            }
            destacado
          />
        )}
      </Datos>

      <Datos titulo='Condiciones económicas'>
        <Dato
          icon={Home}
          label='Valor base de la vivienda'
          valor={valorBase || null}
          formato='moneda'
        />
        <Dato
          icon={FileText}
          label='Gastos notariales'
          valor={notariales || null}
          formato='moneda'
        />
        {esquinera !== undefined ? (
          <Dato
            icon={Tag}
            label='Recargo esquinera'
            valor={
              esquinera
                ? recargo > 0
                  ? `Sí · ${formatearMoneda(recargo)}`
                  : 'Sí'
                : 'No'
            }
          />
        ) : null}
        <Dato
          icon={BadgePercent}
          label='Descuento aplicado'
          valor={descuento > 0 ? formatearMoneda(descuento) : 'No'}
        />
        {descuento > 0 ? (
          <>
            <Dato
              icon={BadgePercent}
              label='Tipo de descuento'
              valor={
                LABELS_TIPO_DESCUENTO[
                  tipoDescuento as keyof typeof LABELS_TIPO_DESCUENTO
                ] ??
                (tipoDescuento || null)
              }
            />
            <Dato
              icon={FileText}
              label='Motivo del descuento'
              valor={meta.negociacion_motivo_descuento}
            />
          </>
        ) : null}
      </Datos>

      <ListaFuentes titulo='Fuentes de pago' fuentes={fuentes} />

      <Datos titulo='Estado y fecha'>
        <Dato icon={Handshake} label='Estado inicial' valor={get('estado')} />
        <Dato
          icon={CalendarDays}
          label='Fecha de negociación'
          valor={meta.negociacion_fecha ?? get('fecha_negociacion')}
        />
      </Datos>

      <TextoLibre
        icon={FileText}
        titulo='Notas'
        texto={
          (meta.negociacion_notas ?? get('notas'))
            ? String(meta.negociacion_notas ?? get('notas'))
            : null
        }
      />
    </div>
  )
}
