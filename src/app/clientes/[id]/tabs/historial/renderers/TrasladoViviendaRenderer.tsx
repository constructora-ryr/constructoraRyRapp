/**
 * Traslado de vivienda: origen → destino, cambio de valor, descuento,
 * abonos trasladados, fuentes de pago del destino, motivo y autorización.
 */

import {
  ArrowDown,
  ArrowRight,
  BadgePercent,
  FileText,
  Repeat2,
  UserCheck,
} from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { cn } from '@/shared/utils/helpers'

import { formatearMoneda } from './formatearValor'
import {
  Aviso,
  Dato,
  Datos,
  FilaCambio,
  type FuenteSnapshot,
  ListaFuentes,
  textoVivienda,
} from './piezas'

function TarjetaVivienda({
  titulo,
  vivienda,
  proyecto,
  destino = false,
}: {
  titulo: string
  vivienda: string | null
  proyecto: unknown
  destino?: boolean
}) {
  return (
    <div
      className={cn(
        'flex-1 rounded-xl border px-3 py-2.5',
        destino
          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10'
          : 'border-rose-200 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/10'
      )}
    >
      <p
        className={cn(
          'text-[11px] font-bold uppercase tracking-widest',
          destino
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-rose-700 dark:text-rose-400'
        )}
      >
        {titulo}
      </p>
      <p className='mt-0.5 text-sm font-bold text-slate-900 dark:text-white'>
        {vivienda ?? 'Sin datos'}
      </p>
      {proyecto ? (
        <p className='text-xs text-slate-500 dark:text-slate-400'>
          {String(proyecto)}
        </p>
      ) : null}
    </div>
  )
}

export function TrasladoViviendaRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const meta = (evento.metadata ?? {}) as Record<string, unknown>
  const valorAnterior = meta.valor_anterior as number | undefined
  const valorNuevo = meta.valor_nuevo as number | undefined
  const descuento = Number(meta.descuento_aplicado ?? 0)
  const abonos = Number(meta.abonos_trasladados ?? 0)
  const montoAbonos = Number(meta.monto_abonos_trasladados ?? 0)
  const fuentes = (meta.fuentes_pago_destino ?? []) as FuenteSnapshot[]

  return (
    <div className='space-y-4'>
      {/* Origen → destino (apilado en móvil) */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-stretch'>
        <TarjetaVivienda
          titulo='Vivienda origen'
          vivienda={textoVivienda(
            meta.vivienda_origen_manzana,
            meta.vivienda_origen_numero
          )}
          proyecto={meta.vivienda_origen_proyecto}
        />
        <div className='flex items-center justify-center text-orange-500'>
          <ArrowDown className='h-5 w-5 sm:hidden' />
          <ArrowRight className='hidden h-5 w-5 sm:block' />
        </div>
        <TarjetaVivienda
          titulo='Vivienda destino'
          vivienda={textoVivienda(
            meta.vivienda_destino_manzana,
            meta.vivienda_destino_numero
          )}
          proyecto={meta.vivienda_destino_proyecto}
          destino
        />
      </div>

      {valorAnterior !== undefined || valorNuevo !== undefined ? (
        <FilaCambio
          etiqueta='Valor de la negociación'
          antes={
            valorAnterior !== undefined ? formatearMoneda(valorAnterior) : '—'
          }
          ahora={valorNuevo !== undefined ? formatearMoneda(valorNuevo) : '—'}
        />
      ) : null}

      {descuento > 0 ? (
        <Datos titulo='Descuento aplicado' tono='aviso'>
          <Dato
            icon={BadgePercent}
            label={meta.tipo_descuento ? String(meta.tipo_descuento) : 'Monto'}
            valor={formatearMoneda(descuento)}
            destacado
          />
          <Dato icon={FileText} label='Motivo' valor={meta.motivo_descuento} />
        </Datos>
      ) : null}

      {abonos > 0 ? (
        <Aviso
          icon={Repeat2}
          tono='info'
          etiqueta='Abonos trasladados'
          texto={`${abonos} ${abonos === 1 ? 'abono' : 'abonos'}${
            montoAbonos > 0 ? ` por ${formatearMoneda(montoAbonos)}` : ''
          }`}
        />
      ) : null}

      <ListaFuentes
        titulo='Fuentes de pago · vivienda destino'
        fuentes={fuentes}
      />

      {meta.motivo || meta.autorizado_por ? (
        <Datos titulo='Autorización'>
          <Dato
            icon={FileText}
            label='Motivo del traslado'
            valor={meta.motivo}
          />
          <Dato
            icon={UserCheck}
            label='Autorizado por'
            valor={meta.autorizado_por}
          />
        </Datos>
      ) : null}
    </div>
  )
}
