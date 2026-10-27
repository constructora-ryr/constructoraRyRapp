/**
 * Negociación creada: la casa asignada y el total a pagar arriba; luego el
 * desglose del valor, las fuentes de pago y las notas.
 */

import {
  BadgePercent,
  Building2,
  CalendarDays,
  Calculator,
  FileText,
  Home,
  Tag,
} from 'lucide-react'

import { LABELS_TIPO_DESCUENTO } from '@/modules/clientes/constants/descuento.constants'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda, formatearValor } from './formatearValor'
import {
  Dato,
  Datos,
  type FuenteSnapshot,
  ListaFuentes,
  TextoLibre,
  textoVivienda,
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

  const casa =
    textoVivienda(meta.manzana_nombre, meta.vivienda_numero) ??
    (meta.vivienda_nombre ? String(meta.vivienda_nombre) : 'Vivienda asignada')

  const caracteristicas = [
    meta.vivienda_tipo_vivienda ? String(meta.vivienda_tipo_vivienda) : null,
    esquinera ? 'Esquinera' : null,
    m2(meta.vivienda_area_construida)
      ? `${m2(meta.vivienda_area_construida)} construidos`
      : null,
    m2(meta.vivienda_area_lote)
      ? `${m2(meta.vivienda_area_lote)} de lote`
      : null,
  ].filter(Boolean) as string[]

  const fecha = meta.negociacion_fecha ?? get('fecha_negociacion')
  const estado = get('estado')

  return (
    <div className='space-y-4'>
      {/* La casa asignada y el total */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 p-4 text-white shadow-lg shadow-purple-900/20 dark:from-fuchsia-700 dark:via-purple-800 dark:to-indigo-800'>
        <span className='pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl' />
        <p className='relative flex items-center gap-2 text-lg font-bold'>
          <Home className='h-5 w-5 flex-shrink-0' />
          {casa}
        </p>
        {meta.proyecto_nombre ? (
          <p className='relative mt-0.5 flex items-center gap-1.5 text-sm text-white/90'>
            <Building2 className='h-3.5 w-3.5' />
            {String(meta.proyecto_nombre)}
          </p>
        ) : null}
        {caracteristicas.length > 0 ? (
          <div className='relative mt-2 flex flex-wrap gap-1.5'>
            {caracteristicas.map(c => (
              <span
                key={c}
                className='rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium ring-1 ring-white/25'
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}

        <div className='relative mt-4 flex flex-wrap items-end justify-between gap-3'>
          <div>
            <p className='text-xs text-white/80'>Total a pagar</p>
            <p className='text-2xl font-extrabold tabular-nums'>
              {formatearMoneda(valorTotal)}
            </p>
          </div>
          {fecha || estado ? (
            <p className='flex items-center gap-1.5 text-xs text-white/85'>
              <CalendarDays className='h-3.5 w-3.5' />
              {fecha ? formatearValor(fecha) : null}
              {estado ? ` · ${String(estado)}` : null}
            </p>
          ) : null}
        </div>
      </div>

      <Datos titulo='Valor de la casa'>
        <Dato
          icon={Home}
          label='Valor de la casa'
          valor={valorBase || null}
          formato='moneda'
        />
        <Dato
          icon={FileText}
          label='Gastos notariales'
          valor={notariales || null}
          formato='moneda'
        />
        {esquinera && recargo > 0 ? (
          <Dato
            icon={Tag}
            label='Recargo esquinera'
            valor={recargo}
            formato='moneda'
          />
        ) : null}
        {descuento > 0 ? (
          <Dato
            icon={BadgePercent}
            label={`Descuento${
              tipoDescuento
                ? ` · ${LABELS_TIPO_DESCUENTO[tipoDescuento as keyof typeof LABELS_TIPO_DESCUENTO] ?? tipoDescuento}`
                : ''
            }`}
            valor={`− ${formatearMoneda(descuento)}`}
            tono='exito'
          />
        ) : null}
        <Dato
          icon={Calculator}
          label='Total a pagar'
          valor={valorTotal || null}
          formato='moneda'
          destacado
        />
      </Datos>

      <ListaFuentes titulo='Fuentes de pago' fuentes={fuentes} />

      <TextoLibre
        icon={BadgePercent}
        titulo='Motivo del descuento'
        texto={
          descuento > 0 && meta.negociacion_motivo_descuento
            ? String(meta.negociacion_motivo_descuento)
            : null
        }
      />
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
