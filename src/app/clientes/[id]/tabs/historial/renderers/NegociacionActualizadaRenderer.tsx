/**
 * NegociacionActualizadaRenderer
 *
 * Renderer específico para eventos `negociacion_actualizada`.
 * Maneja dos escenarios:
 *   1. Rebalanceo del plan financiero (RPC rebalancear_plan_financiero)
 *      → Muestra diff de fuentes de pago + motivo + notas
 *   2. Cambios de campos normales (descuento, tipo_descuento, motivo_descuento)
 *      → Muestra diff antes/después como CambioGenericoRenderer
 */

'use client'

import {
  ArrowRight,
  BadgePercent,
  Building2,
  CheckCircle2,
  DollarSign,
  FileText,
  Landmark,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  StickyNote,
} from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import {
  esCampoMoneda,
  formatearMoneda,
  formatearValor,
} from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

// ── Tipos internos para el rebalanceo ─────────────────────────────────────────

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

// ── Helper: badge de acción ────────────────────────────────────────────────────

function BadgeAccion({
  accion,
}: {
  accion: 'actualizada' | 'eliminada' | 'nueva'
}) {
  if (accion === 'actualizada') {
    return (
      <span className='inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'>
        <RefreshCw className='h-2.5 w-2.5' />
        Ajustada
      </span>
    )
  }
  if (accion === 'eliminada') {
    return (
      <span className='inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 dark:bg-red-900/30 dark:text-red-300'>
        <MinusCircle className='h-2.5 w-2.5' />
        Eliminada
      </span>
    )
  }
  return (
    <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 dark:bg-green-900/30 dark:text-green-300'>
      <PlusCircle className='h-2.5 w-2.5' />
      Nueva
    </span>
  )
}

// ── Renderer de rebalanceo ─────────────────────────────────────────────────────

function RebalanceoRenderer({
  motivo,
  notas,
  fuentesAnteriores,
  ajustadas,
  nuevas,
}: {
  motivo: string | null
  notas: string | null
  fuentesAnteriores: FuenteAnterior[]
  ajustadas: FuenteAjustada[]
  nuevas: FuenteNueva[]
}) {
  // Construir mapa de fuentes anteriores por id para lookup rápido
  const mapaAnteriores = new Map(fuentesAnteriores.map(f => [f.id, f]))

  // Fuentes sin cambios (no están en ajustadas ni eliminadas)
  const idsModificadas = new Set(ajustadas.map(a => a.id))
  const fuentesSinCambio = fuentesAnteriores.filter(
    f => !idsModificadas.has(f.id)
  )

  const totalCambios = ajustadas.length + nuevas.length

  return (
    <div className='space-y-3 px-4 py-3'>
      {/* Resumen */}
      <div className='flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-900/20'>
        <RefreshCw className='h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400' />
        <p className='text-xs font-semibold text-violet-900 dark:text-violet-200'>
          Cierre financiero ajustado ·{' '}
          <span className='font-bold'>
            {totalCambios} cambio{totalCambios !== 1 ? 's' : ''}
          </span>
        </p>
      </div>

      {/* Motivo */}
      {motivo ? (
        <div className='flex items-start gap-2.5 border-b border-gray-100 py-2 dark:border-gray-800'>
          <FileText className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
              Motivo del rebalanceo
            </p>
            <p className='mt-0.5 text-sm font-medium text-gray-900 dark:text-white'>
              {motivo}
            </p>
          </div>
        </div>
      ) : null}

      {/* Notas */}
      {notas ? (
        <div className='flex items-start gap-2.5 border-b border-gray-100 py-2 dark:border-gray-800'>
          <StickyNote className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
              Notas
            </p>
            <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
              {notas}
            </p>
          </div>
        </div>
      ) : null}

      {/* Cambios en fuentes existentes */}
      {ajustadas.length > 0 ? (
        <div className='space-y-2'>
          <p className='text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
            Fuentes modificadas
          </p>
          {ajustadas.map(ajuste => {
            const anterior = mapaAnteriores.get(ajuste.id)
            return (
              <div
                key={ajuste.id}
                className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'
              >
                {/* Header de la fuente */}
                <div className='flex items-center justify-between border-b border-gray-100 px-3 py-1.5 dark:border-gray-800'>
                  <div className='flex items-center gap-1.5'>
                    <DollarSign className='h-3.5 w-3.5 text-gray-400' />
                    <p className='text-[11px] font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300'>
                      {ajuste.tipo}
                    </p>
                  </div>
                  <BadgeAccion accion={ajuste.accion} />
                </div>

                {/* Diff de ENTIDAD — solo cuando cambió */}
                {ajuste.accion === 'actualizada' && ajuste.cambio_entidad ? (
                  <div className='border-b border-gray-100 dark:border-gray-800'>
                    <div className='flex items-center gap-1.5 border-b border-gray-50 px-3 py-1 dark:border-gray-800/60'>
                      <Landmark className='h-3 w-3 text-blue-400' />
                      <p className='text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400'>
                        Entidad cambiada
                      </p>
                    </div>
                    <div className='flex items-stretch'>
                      <div className='flex-1 bg-red-50 px-3 py-2 dark:bg-red-950/30'>
                        <p className='mb-0.5 text-[10px] font-semibold uppercase text-red-500'>
                          Antes
                        </p>
                        <p className='flex items-center gap-1 text-sm font-bold text-red-800 line-through dark:text-red-200'>
                          <Building2 className='h-3 w-3 shrink-0' />
                          {ajuste.entidad_anterior ?? anterior?.entidad ?? '—'}
                        </p>
                      </div>
                      <div className='flex items-center px-2'>
                        <ArrowRight className='h-3.5 w-3.5 text-gray-300 dark:text-gray-600' />
                      </div>
                      <div className='flex-1 bg-green-50 px-3 py-2 dark:bg-green-950/30'>
                        <p className='mb-0.5 text-[10px] font-semibold uppercase text-green-600'>
                          Después
                        </p>
                        <p className='flex items-center gap-1 text-sm font-bold text-green-800 dark:text-green-200'>
                          <Building2 className='h-3 w-3 shrink-0' />
                          {ajuste.entidad_nueva ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Diff de MONTO — solo cuando cambia el valor */}
                {ajuste.accion === 'actualizada' &&
                ajuste.monto_anterior !== undefined &&
                ajuste.monto_nuevo !== undefined &&
                ajuste.monto_anterior !== ajuste.monto_nuevo ? (
                  <div>
                    <div className='flex items-center gap-1.5 border-b border-gray-50 px-3 py-1 dark:border-gray-800/60'>
                      <DollarSign className='h-3 w-3 text-amber-400' />
                      <p className='text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400'>
                        Monto cambiado
                      </p>
                    </div>
                    <div className='flex items-stretch'>
                      <div className='flex-1 bg-red-50 px-3 py-2 dark:bg-red-950/30'>
                        <p className='mb-0.5 text-[10px] font-semibold uppercase text-red-500'>
                          Antes
                        </p>
                        <p className='text-sm font-bold text-red-800 line-through dark:text-red-200'>
                          {formatearMoneda(ajuste.monto_anterior)}
                        </p>
                      </div>
                      <div className='flex items-center px-2'>
                        <ArrowRight className='h-3.5 w-3.5 text-gray-300 dark:text-gray-600' />
                      </div>
                      <div className='flex-1 bg-green-50 px-3 py-2 dark:bg-green-950/30'>
                        <p className='mb-0.5 text-[10px] font-semibold uppercase text-green-600'>
                          Después
                        </p>
                        <p className='text-sm font-bold text-green-800 dark:text-green-200'>
                          {formatearMoneda(ajuste.monto_nuevo)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Caso ambiguo: mismos montos, sin campo cambio_entidad (registro histórico antiguo)
                    Puede ser un cambio de entidad que no quedó registrado en el audit. */}
                {ajuste.accion === 'actualizada' &&
                ajuste.cambio_entidad === undefined &&
                ajuste.monto_anterior !== undefined &&
                ajuste.monto_nuevo !== undefined &&
                ajuste.monto_anterior === ajuste.monto_nuevo ? (
                  <div className='px-3 py-2'>
                    <p className='flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500'>
                      <Landmark className='h-3 w-3 shrink-0 text-gray-300 dark:text-gray-600' />
                      Ajuste sin detalle completo (registro anterior a la v2 del
                      historial)
                    </p>
                  </div>
                ) : null}

                {/* Caso limpio: fuente marcada como ajustada pero $0 diff y sin cambio_entidad=true */}
                {ajuste.accion === 'actualizada' &&
                ajuste.cambio_entidad === false &&
                ajuste.monto_anterior !== undefined &&
                ajuste.monto_nuevo !== undefined &&
                ajuste.monto_anterior === ajuste.monto_nuevo ? (
                  <div className='px-3 py-2'>
                    <p className='text-xs text-gray-400 dark:text-gray-500'>
                      Sin cambios en monto ni entidad
                    </p>
                  </div>
                ) : null}

                {/* Fuente eliminada */}
                {ajuste.accion === 'eliminada' ? (
                  <div className='bg-red-50 px-3 py-2 dark:bg-red-950/30'>
                    <p className='text-xs text-red-600 dark:text-red-400'>
                      Fuente inactivada ·{' '}
                      <span className='font-semibold'>
                        {formatearMoneda(
                          ajuste.monto_anterior ?? anterior?.monto_aprobado ?? 0
                        )}
                      </span>{' '}
                      removidos del cierre financiero
                      {(ajuste.entidad_anterior ?? anterior?.entidad) ? (
                        <span className='ml-1 font-medium'>
                          · {ajuste.entidad_anterior ?? anterior?.entidad}
                        </span>
                      ) : null}
                    </p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}

      {/* Nuevas fuentes */}
      {nuevas.length > 0 ? (
        <div className='space-y-2'>
          <p className='text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
            Fuentes agregadas
          </p>
          {nuevas.map((nueva, i) => (
            <div
              key={i}
              className='overflow-hidden rounded-xl border border-green-100 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20'
            >
              <div className='flex items-center justify-between px-3 py-2'>
                <div className='flex items-center gap-1.5'>
                  <DollarSign className='h-3.5 w-3.5 text-green-600 dark:text-green-400' />
                  <p className='text-sm font-semibold text-green-900 dark:text-green-200'>
                    {nueva.tipo}
                  </p>
                  {nueva.entidad ? (
                    <span className='text-xs text-green-600 dark:text-green-400'>
                      · {nueva.entidad}
                    </span>
                  ) : null}
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-bold text-green-800 dark:text-green-300'>
                    {formatearMoneda(nueva.monto)}
                  </span>
                  <BadgeAccion accion='nueva' />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Fuentes sin cambio (informativo) */}
      {fuentesSinCambio.length > 0 ? (
        <div className='space-y-1.5'>
          <p className='text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
            Sin cambios
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {fuentesSinCambio.map(f => (
              <div
                key={f.id}
                className='flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 dark:border-gray-800 dark:bg-gray-900/30'
              >
                <CheckCircle2 className='h-3 w-3 text-gray-400' />
                <span className='text-[11px] font-medium text-gray-500 dark:text-gray-400'>
                  {f.tipo}
                </span>
                <span className='text-[11px] text-gray-400'>
                  {formatearMoneda(f.monto_aprobado)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ── Renderer de campo diff normal ─────────────────────────────────────────────

function CamposDiffRenderer({
  detalles,
}: {
  detalles: NonNullable<EventoHistorialHumanizado['detalles']>
}) {
  return (
    <div className='space-y-2 px-4 py-3'>
      <p className='text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400'>
        {detalles.length} campo{detalles.length > 1 ? 's' : ''} modificado
        {detalles.length > 1 ? 's' : ''}
      </p>
      {detalles.map(d => {
        const fmtAntes = esCampoMoneda(d.campo)
          ? formatearMoneda(d.valorAnterior)
          : formatearValor(d.valorAnterior)
        const fmtDespues = esCampoMoneda(d.campo)
          ? formatearMoneda(d.valorNuevo)
          : formatearValor(d.valorNuevo)

        return (
          <div
            key={d.campo}
            className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'
          >
            <div className='border-b border-gray-100 px-3 py-1.5 dark:border-gray-800'>
              <p className='text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                {d.etiqueta}
              </p>
            </div>
            <div className='flex items-stretch'>
              <div className='flex-1 bg-red-50 px-3 py-2.5 dark:bg-red-950/30'>
                <p className='mb-0.5 text-[10px] font-semibold uppercase text-red-500'>
                  Antes
                </p>
                <p className='text-sm font-bold text-red-800 line-through dark:text-red-200'>
                  {fmtAntes}
                </p>
              </div>
              <div className='flex items-center px-2'>
                <ArrowRight className='h-3.5 w-3.5 text-gray-300 dark:text-gray-600' />
              </div>
              <div className='flex-1 bg-green-50 px-3 py-2.5 dark:bg-green-950/30'>
                <p className='mb-0.5 text-[10px] font-semibold uppercase text-green-600'>
                  Después
                </p>
                <p className='text-sm font-bold text-green-800 dark:text-green-200'>
                  {fmtDespues}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Renderer especial para cambio de descuento ────────────────────────────────

function DescuentoCambioRenderer({
  datosNuevos,
  datosAnteriores,
}: {
  datosNuevos: Record<string, unknown>
  datosAnteriores: Record<string, unknown> | null
}) {
  const descAnterior = datosAnteriores?.descuento_aplicado as number | undefined
  const descNuevo = datosNuevos.descuento_aplicado as number | undefined
  const tipo = datosNuevos.tipo_descuento as string | undefined
  const motivo = datosNuevos.motivo_descuento as string | undefined

  const LABELS_TIPO: Record<string, string> = {
    comercial: 'Comercial',
    pronto_pago: 'Pronto pago',
    referido: 'Por referido',
    promocional: 'Promocional',
    forma_pago: 'Por forma de pago',
    otro: 'Otro',
  }

  return (
    <div className='space-y-3 px-4 py-3'>
      {/* Resumen */}
      <div className='flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-900/20'>
        <BadgePercent className='h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400' />
        <p className='text-xs font-semibold text-violet-900 dark:text-violet-200'>
          Descuento aplicado a la negociación
        </p>
      </div>

      {/* Monto de descuento */}
      {descNuevo !== undefined ? (
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          <div className='border-b border-gray-100 px-3 py-1.5 dark:border-gray-800'>
            <p className='text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Monto de descuento
            </p>
          </div>
          <div className='flex items-stretch'>
            <div className='flex-1 bg-red-50 px-3 py-2.5 dark:bg-red-950/30'>
              <p className='mb-0.5 text-[10px] font-semibold uppercase text-red-500'>
                Antes
              </p>
              <p className='text-sm font-bold text-red-800 line-through dark:text-red-200'>
                {descAnterior !== undefined && descAnterior > 0
                  ? formatearMoneda(descAnterior)
                  : 'Sin descuento'}
              </p>
            </div>
            <div className='flex items-center px-2'>
              <ArrowRight className='h-3.5 w-3.5 text-gray-300 dark:text-gray-600' />
            </div>
            <div className='flex-1 bg-violet-50 px-3 py-2.5 dark:bg-violet-950/30'>
              <p className='mb-0.5 text-[10px] font-semibold uppercase text-violet-600'>
                Después
              </p>
              <p className='text-sm font-bold text-violet-800 dark:text-violet-200'>
                {descNuevo > 0 ? formatearMoneda(descNuevo) : 'Sin descuento'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tipo de descuento */}
      {tipo ? (
        <div className='flex items-start gap-2.5 border-b border-gray-100 py-2 dark:border-gray-800'>
          <BadgePercent className='mt-0.5 h-4 w-4 shrink-0 text-violet-400' />
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
              Tipo de descuento
            </p>
            <p className='mt-0.5 text-sm font-medium text-gray-900 dark:text-white'>
              {LABELS_TIPO[tipo] ?? tipo}
            </p>
          </div>
        </div>
      ) : null}

      {/* Motivo */}
      {motivo ? (
        <div className='flex items-start gap-2.5 py-1'>
          <StickyNote className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
              Justificación
            </p>
            <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
              {motivo}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

export function NegociacionActualizadaRenderer({ evento }: Props) {
  const meta = (evento.metadata ?? {}) as Record<string, unknown>
  const datosNuevos = (evento.datosNuevos ?? {}) as Record<string, unknown>
  const datosAnteriores = (evento.datosAnteriores ?? null) as Record<
    string,
    unknown
  > | null

  // ── Caso 1: Rebalanceo del plan financiero ──────────────────────────────────
  if (meta.accion_tipo === 'rebalanceo_plan_financiero') {
    const motivo = (meta.motivo as string | null) ?? null
    const notas = (meta.notas as string | null) ?? null

    const fuentesAnteriores = Array.isArray(datosAnteriores?.fuentes)
      ? (datosAnteriores.fuentes as FuenteAnterior[])
      : []
    const ajustadas = Array.isArray(datosNuevos.ajustados)
      ? (datosNuevos.ajustados as FuenteAjustada[])
      : []
    const nuevas = Array.isArray(datosNuevos.nuevas)
      ? (datosNuevos.nuevas as FuenteNueva[])
      : []

    return (
      <RebalanceoRenderer
        motivo={motivo}
        notas={notas}
        fuentesAnteriores={fuentesAnteriores}
        ajustadas={ajustadas}
        nuevas={nuevas}
      />
    )
  }

  // ── Caso 2: Cambio de descuento ─────────────────────────────────────────────
  // Usar evento.detalles (campos que REALMENTE cambiaron) en lugar de
  // datosNuevos (fila completa), que siempre contiene descuento_aplicado.
  const esCambioDescuento = evento.detalles?.some(d => {
    if (d.campo === 'descuento_aplicado') {
      return Number(d.valorAnterior ?? 0) !== Number(d.valorNuevo ?? 0)
    }
    if (d.campo === 'tipo_descuento') {
      return (d.valorAnterior ?? null) !== (d.valorNuevo ?? null)
    }
    return false
  })
  if (esCambioDescuento) {
    return (
      <DescuentoCambioRenderer
        datosNuevos={datosNuevos}
        datosAnteriores={datosAnteriores}
      />
    )
  }

  // ── Caso 3: Diff de campos normales (cambios_especificos) ───────────────────
  if (evento.detalles && evento.detalles.length > 0) {
    return <CamposDiffRenderer detalles={evento.detalles} />
  }

  // ── Fallback ────────────────────────────────────────────────────────────────
  return (
    <p className='py-3 text-center text-sm text-gray-400 dark:text-gray-500'>
      No se registraron cambios específicos en este evento.
    </p>
  )
}
