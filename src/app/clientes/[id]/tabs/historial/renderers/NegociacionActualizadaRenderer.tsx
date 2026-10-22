/**
 * Negociación actualizada. Tres casos:
 * 1. Rebalanceo del plan financiero: fuentes ajustadas, eliminadas, nuevas
 *    y sin cambio, con motivo y notas.
 * 2. Cambio de descuento: monto antes → ahora, tipo y justificación.
 * 3. Cualquier otro cambio: lista antes → ahora.
 */

import type { ReactNode } from 'react'

import {
  BadgePercent,
  CheckCircle2,
  DollarSign,
  FileText,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  StickyNote,
} from 'lucide-react'

import { LABELS_TIPO_DESCUENTO } from '@/modules/clientes/constants/descuento.constants'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { cn } from '@/shared/utils/helpers'

import { formatearMoneda } from './formatearValor'
import {
  Banner,
  Dato,
  Datos,
  FilaCambio,
  ListaCambios,
  Seccion,
  TextoLibre,
} from './piezas'

interface FuenteAnterior {
  id: string
  tipo: string
  monto_aprobado: number
  entidad?: string | null
}

interface FuenteAjustada {
  id: string
  tipo: string
  accion: 'actualizada' | 'eliminada'
  monto_anterior?: number
  monto_nuevo?: number
  entidad_anterior?: string | null
  entidad_nueva?: string | null
  cambio_entidad?: boolean
}

interface FuenteNueva {
  tipo: string
  monto: number
  entidad?: string | null
}

const lista = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

const INSIGNIA = {
  actualizada: {
    icon: RefreshCw,
    texto: 'Ajustada',
    clase:
      'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  },
  eliminada: {
    icon: MinusCircle,
    texto: 'Eliminada',
    clase: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
  nueva: {
    icon: PlusCircle,
    texto: 'Nueva',
    clase:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
}

/** Tarjeta de una fuente con su insignia (ajustada / eliminada / nueva) */
function TarjetaFuente({
  tipo,
  accion,
  extra,
  children,
}: {
  tipo: string
  accion: keyof typeof INSIGNIA
  extra?: ReactNode
  children?: ReactNode
}) {
  const insignia = INSIGNIA[accion]
  const Icono = insignia.icon
  return (
    <div className='space-y-2 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-700/60 dark:bg-slate-800/60'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white'>
          <DollarSign className='h-4 w-4 text-slate-400' />
          {tipo}
          {extra}
        </p>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
            insignia.clase
          )}
        >
          <Icono className='h-3 w-3' />
          {insignia.texto}
        </span>
      </div>
      {children}
    </div>
  )
}

function Rebalanceo({ evento }: { evento: EventoHistorialHumanizado }) {
  const meta = (evento.metadata ?? {}) as Record<string, unknown>
  const nuevos = (evento.datosNuevos ?? {}) as Record<string, unknown>
  const anteriores = lista<FuenteAnterior>(
    (evento.datosAnteriores as Record<string, unknown> | null)?.fuentes
  )
  const ajustadas = lista<FuenteAjustada>(nuevos.ajustados)
  const agregadas = lista<FuenteNueva>(nuevos.nuevas)

  const porId = new Map(anteriores.map(f => [f.id, f]))
  const modificadas = new Set(ajustadas.map(a => a.id))
  const sinCambio = anteriores.filter(f => !modificadas.has(f.id))
  const cambios = ajustadas.length + agregadas.length

  return (
    <div className='space-y-4'>
      <Banner
        compacto
        tono='info'
        etiqueta='Cierre financiero ajustado'
        valor={`${cambios} ${cambios === 1 ? 'cambio' : 'cambios'} en las fuentes de pago`}
        chip={
          <>
            <RefreshCw className='h-3.5 w-3.5' />
            Rebalanceo
          </>
        }
      />

      <TextoLibre
        icon={FileText}
        titulo='Motivo del ajuste'
        texto={meta.motivo as string | null}
      />
      <TextoLibre
        icon={StickyNote}
        titulo='Notas'
        texto={meta.notas as string | null}
      />

      {ajustadas.length > 0 ? (
        <Seccion titulo='Fuentes modificadas' sinCaja>
          <div className='space-y-2'>
            {ajustadas.map(a => {
              const anterior = porId.get(a.id)
              const cambioMonto =
                a.monto_anterior !== undefined &&
                a.monto_nuevo !== undefined &&
                a.monto_anterior !== a.monto_nuevo

              if (a.accion === 'eliminada') {
                const entidad = a.entidad_anterior ?? anterior?.entidad
                return (
                  <TarjetaFuente key={a.id} tipo={a.tipo} accion='eliminada'>
                    <p className='text-xs text-rose-700 dark:text-rose-300'>
                      Se quitaron{' '}
                      <strong>
                        {formatearMoneda(
                          a.monto_anterior ?? anterior?.monto_aprobado ?? 0
                        )}
                      </strong>{' '}
                      del cierre financiero{entidad ? ` · ${entidad}` : ''}
                    </p>
                  </TarjetaFuente>
                )
              }

              return (
                <TarjetaFuente key={a.id} tipo={a.tipo} accion='actualizada'>
                  {a.cambio_entidad ? (
                    <FilaCambio
                      etiqueta='Entidad'
                      antes={a.entidad_anterior ?? anterior?.entidad ?? '—'}
                      ahora={a.entidad_nueva ?? '—'}
                    />
                  ) : null}
                  {cambioMonto ? (
                    <FilaCambio
                      etiqueta='Monto'
                      antes={formatearMoneda(a.monto_anterior)}
                      ahora={formatearMoneda(a.monto_nuevo)}
                    />
                  ) : null}
                  {!a.cambio_entidad && !cambioMonto ? (
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      {a.cambio_entidad === undefined
                        ? 'Ajuste sin detalle (registro anterior a la versión actual del historial)'
                        : 'Sin cambios en monto ni entidad'}
                    </p>
                  ) : null}
                </TarjetaFuente>
              )
            })}
          </div>
        </Seccion>
      ) : null}

      {agregadas.length > 0 ? (
        <Seccion titulo='Fuentes agregadas' sinCaja>
          <div className='space-y-2'>
            {agregadas.map((f, i) => (
              <TarjetaFuente
                key={i}
                tipo={f.tipo}
                accion='nueva'
                extra={
                  <span className='font-normal text-slate-500 dark:text-slate-400'>
                    {f.entidad ? `· ${f.entidad} ` : ''}·{' '}
                    <strong className='text-emerald-700 dark:text-emerald-400'>
                      {formatearMoneda(f.monto)}
                    </strong>
                  </span>
                }
              />
            ))}
          </div>
        </Seccion>
      ) : null}

      {sinCambio.length > 0 ? (
        <Seccion titulo='Sin cambios' sinCaja>
          <div className='flex flex-wrap gap-1.5'>
            {sinCambio.map(f => (
              <span
                key={f.id}
                className='inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-700/60 dark:text-slate-300'
              >
                <CheckCircle2 className='h-3 w-3 text-slate-400' />
                {f.tipo} · {formatearMoneda(f.monto_aprobado)}
              </span>
            ))}
          </div>
        </Seccion>
      ) : null}
    </div>
  )
}

function CambioDescuento({ evento }: { evento: EventoHistorialHumanizado }) {
  const nuevos = (evento.datosNuevos ?? {}) as Record<string, unknown>
  const anteriores = (evento.datosAnteriores ?? {}) as Record<string, unknown>
  const antes = Number(anteriores.descuento_aplicado ?? 0)
  const ahora = nuevos.descuento_aplicado as number | undefined
  const tipo = nuevos.tipo_descuento as string | undefined
  const textoDescuento = (v: number) =>
    v > 0 ? formatearMoneda(v) : 'Sin descuento'

  return (
    <div className='space-y-4'>
      <Banner
        compacto
        tono='info'
        etiqueta='Descuento'
        valor='Se cambió el descuento de la negociación'
        chip={
          <>
            <BadgePercent className='h-3.5 w-3.5' />
            Descuento
          </>
        }
      />
      {ahora !== undefined ? (
        <FilaCambio
          etiqueta='Monto del descuento'
          antes={textoDescuento(antes)}
          ahora={textoDescuento(ahora)}
        />
      ) : null}
      {tipo ? (
        <Datos titulo='Tipo'>
          <Dato
            icon={BadgePercent}
            label='Tipo de descuento'
            valor={
              LABELS_TIPO_DESCUENTO[
                tipo as keyof typeof LABELS_TIPO_DESCUENTO
              ] ?? tipo
            }
          />
        </Datos>
      ) : null}
      <TextoLibre
        icon={StickyNote}
        titulo='Justificación'
        texto={nuevos.motivo_descuento as string | undefined}
      />
    </div>
  )
}

/** Solo cuenta como cambio de descuento si el monto o el tipo cambiaron */
function esCambioDescuento(evento: EventoHistorialHumanizado) {
  return (evento.detalles ?? []).some(d =>
    d.campo === 'descuento_aplicado'
      ? Number(d.valorAnterior ?? 0) !== Number(d.valorNuevo ?? 0)
      : d.campo === 'tipo_descuento' &&
        (d.valorAnterior ?? null) !== (d.valorNuevo ?? null)
  )
}

export function NegociacionActualizadaRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  if (evento.metadata?.accion_tipo === 'rebalanceo_plan_financiero')
    return <Rebalanceo evento={evento} />
  if (esCambioDescuento(evento)) return <CambioDescuento evento={evento} />
  return <ListaCambios detalles={evento.detalles ?? []} />
}
