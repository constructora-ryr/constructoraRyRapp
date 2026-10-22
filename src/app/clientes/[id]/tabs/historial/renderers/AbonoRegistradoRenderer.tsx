/**
 * Abono registrado / anulado: monto, recibo, vivienda, datos del pago,
 * motivo de anulación, observaciones y comprobante.
 */

import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CreditCard,
  FileText,
  Hash,
  Receipt,
  UserX,
  XCircle,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda } from './formatearValor'
import {
  Banner,
  Dato,
  Datos,
  fechaCorta,
  TextoLibre,
  textoVivienda,
} from './piezas'
import { VistaArchivo } from './piezas-archivo'

export function AbonoRegistradoRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = (evento.metadata ?? {}) as Record<string, unknown>
  const esAnulacion = evento.tipo === 'abono_anulado'

  const monto = Number(meta.abono_monto ?? get('monto') ?? 0)
  const recibo = meta.abono_numero_recibo ?? get('numero_recibo')
  const mora = Number(meta.abono_mora_incluida ?? 0)
  const comprobante = String(
    meta.abono_comprobante_url ?? get('comprobante_url') ?? ''
  )
  const fuente = meta.fuente_tipo ?? get('tipo')

  // "Las Américas 2 · Mza. A · Casa 2" en una línea dentro del banner
  const vivienda = [
    meta.proyecto_nombre,
    textoVivienda(meta.manzana_nombre, meta.vivienda_numero),
  ]
    .filter(Boolean)
    .join(' · ')

  const anulacion = {
    motivo: meta.motivo_categoria ?? get('motivo_categoria'),
    detalle: meta.motivo_detalle ?? get('motivo_detalle'),
    por: meta.anulado_por_nombre ?? get('anulado_por_nombre'),
    fecha: meta.fecha_anulacion ?? get('fecha_anulacion'),
  }

  return (
    <div className='space-y-4'>
      <Banner
        tono={esAnulacion ? 'peligro' : 'exito'}
        etiqueta={esAnulacion ? 'Abono anulado' : 'Monto del abono'}
        valor={formatearMoneda(monto)}
        nota={
          [vivienda, mora > 0 ? `Incluye mora: ${formatearMoneda(mora)}` : null]
            .filter(Boolean)
            .join(' · ') || undefined
        }
        chip={
          recibo ? (
            <>
              <Receipt className='h-3.5 w-3.5' />
              {formatearNumeroRecibo(
                typeof recibo === 'number' ? recibo : String(recibo)
              )}
            </>
          ) : undefined
        }
      />

      <Datos titulo='Detalles del pago'>
        <Dato
          icon={CreditCard}
          label='Método de pago'
          valor={meta.abono_metodo_pago ?? get('metodo_pago')}
        />
        <Dato icon={Banknote} label='Fuente de pago' valor={fuente} />
        <Dato
          icon={CalendarDays}
          label='Fecha del abono'
          valor={fechaCorta(
            meta.abono_fecha_abono ?? get('fecha_abono'),
            formatDateCompact
          )}
        />
        <Dato
          icon={Hash}
          label='Número de transferencia'
          valor={meta.abono_numero_referencia ?? get('numero_referencia')}
          copiable
        />
      </Datos>

      {esAnulacion &&
      (anulacion.motivo || anulacion.detalle || anulacion.por) ? (
        <Datos titulo='Motivo de anulación' tono='peligro'>
          <Dato icon={AlertTriangle} label='Motivo' valor={anulacion.motivo} />
          <Dato icon={XCircle} label='Detalle' valor={anulacion.detalle} />
          <Dato icon={UserX} label='Anulado por' valor={anulacion.por} />
          <Dato
            icon={CalendarDays}
            label='Fecha de anulación'
            valor={
              anulacion.fecha
                ? fechaCorta(anulacion.fecha, formatDateCompact)
                : null
            }
          />
        </Datos>
      ) : null}

      <TextoLibre
        icon={FileText}
        titulo='Observaciones'
        texto={String(meta.abono_notas ?? get('notas') ?? '')}
      />

      {comprobante ? (
        <VistaArchivo
          titulo='Comprobante de pago'
          url={`/api/abonos/comprobante?path=${encodeURIComponent(comprobante)}`}
          nombre={comprobante}
        />
      ) : null}
    </div>
  )
}
