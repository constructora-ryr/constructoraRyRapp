/**
 * Renuncia creada / aprobada / rechazada: estado, vivienda, motivo,
 * devolución, retención y enlace al expediente. Lee de metadata (CREATE)
 * y de los cambios (UPDATE).
 */

import { AlertTriangle, DollarSign, FileText, ShieldAlert } from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda } from './formatearValor'
import {
  Banner,
  Dato,
  Datos,
  EnlaceExpediente,
  TextoLibre,
  textoVivienda,
  type Tono,
} from './piezas'

const TONO_ESTADO: Record<string, Tono> = {
  pendiente: 'aviso',
  aprobada: 'exito',
  cerrada: 'exito',
  rechazada: 'peligro',
}

const texto = (v: unknown) => String(v ?? '').trim() || null

export function RenunciaRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = (evento.metadata ?? {}) as Record<string, unknown>

  const estado = String(
    get('estado') ?? meta.estado_renuncia ?? meta.estado ?? 'Pendiente'
  )
  const montoDevolucion =
    get('monto_devolucion') ??
    get('monto_a_devolver') ??
    meta.monto_a_devolver ??
    null
  const retencion = Number(get('retencion_monto') ?? meta.retencion_monto ?? 0)
  const vivienda = textoVivienda(
    get('manzana_nombre') ?? meta.manzana_nombre,
    get('vivienda_numero') ?? meta.vivienda_numero
  )
  const proyecto = texto(
    get('proyecto_nombre') ?? meta.proyecto_nombre ?? meta.proyecto
  )

  return (
    <div className='space-y-4'>
      <Banner
        compacto
        tono={TONO_ESTADO[estado.toLowerCase()] ?? 'aviso'}
        etiqueta='Estado de la renuncia'
        valor={<span className='capitalize'>{estado}</span>}
        nota={[proyecto, vivienda].filter(Boolean).join(' · ') || undefined}
        chip={
          <>
            <AlertTriangle className='h-3.5 w-3.5' />
            Renuncia
          </>
        }
      />

      <TextoLibre
        icon={FileText}
        titulo='Motivo de la renuncia'
        texto={texto(get('motivo') ?? get('motivo_renuncia') ?? meta.motivo)}
      />

      {meta.requiere_devolucion === false ? (
        <TextoLibre
          icon={DollarSign}
          titulo='Devolución'
          texto='Sin devolución: lo abonado es igual a la retención.'
        />
      ) : montoDevolucion ? (
        <Datos titulo='Devolución'>
          <Dato
            icon={DollarSign}
            label='Monto a devolver'
            valor={montoDevolucion}
            formato='moneda'
            destacado
          />
        </Datos>
      ) : null}

      {retencion > 0 ? (
        <Datos titulo='Retención aplicada' tono='peligro'>
          <Dato
            icon={ShieldAlert}
            label='Monto retenido'
            valor={formatearMoneda(retencion)}
            destacado
          />
          <Dato
            icon={FileText}
            label='Motivo'
            valor={texto(get('retencion_motivo') ?? meta.retencion_motivo)}
          />
        </Datos>
      ) : null}

      <EnlaceExpediente
        consecutivo={meta.consecutivo}
        nota='El expediente tiene el detalle completo, los documentos y la devolución.'
      />
    </div>
  )
}
