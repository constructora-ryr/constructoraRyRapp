/**
 * Devoluciones de dinero al cliente:
 * - renuncia_devolucion_procesada: cierre de una renuncia (con vivienda y
 *   enlace al expediente).
 * - excedente_devolucion_procesada: devolución de un pago de más.
 */

import {
  ArrowDownToLine,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Home,
  Receipt,
  UserCheck,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda } from './formatearValor'
import {
  Aviso,
  Banner,
  Dato,
  Datos,
  EnlaceExpediente,
  fechaCorta,
  TextoLibre,
  textoVivienda,
} from './piezas'

const texto = (v: unknown) => String(v ?? '').trim() || null

export function DevolucionRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const meta = (evento.metadata ?? {}) as Record<string, unknown>
  const esRenuncia = evento.tipo === 'renuncia_devolucion_procesada'
  const monto = Number(meta.monto_devuelto ?? 0)
  const vivienda = textoVivienda(meta.manzana_nombre, meta.vivienda_numero)
  const proyecto = texto(meta.proyecto_nombre)

  return (
    <div className='space-y-4'>
      <Aviso
        icon={CheckCircle2}
        tono={esRenuncia ? 'exito' : 'aviso'}
        etiqueta={esRenuncia ? 'Renuncia cerrada' : 'Excedente devuelto'}
        texto={
          esRenuncia
            ? 'Devolución procesada'
            : 'Devolución registrada al cliente'
        }
      />

      {monto > 0 ? (
        <Banner
          tono={esRenuncia ? 'exito' : 'aviso'}
          etiqueta='Monto devuelto'
          valor={formatearMoneda(monto)}
        />
      ) : null}

      {esRenuncia && (vivienda || proyecto) ? (
        <Datos titulo='Vivienda de la renuncia'>
          <Dato icon={Home} label='Vivienda' valor={vivienda} />
          <Dato icon={Building2} label='Proyecto' valor={proyecto} />
        </Datos>
      ) : null}

      <Datos titulo='Detalle de la devolución'>
        <Dato
          icon={ArrowDownToLine}
          label='Método'
          valor={texto(meta.metodo_devolucion)}
        />
        <Dato
          icon={Receipt}
          label='N.º comprobante'
          valor={texto(meta.numero_comprobante)}
          copiable
        />
        <Dato
          icon={Calendar}
          label='Fecha de devolución'
          valor={
            texto(meta.fecha_devolucion)
              ? fechaCorta(meta.fecha_devolucion, formatDateCompact)
              : null
          }
        />
        <Dato
          icon={UserCheck}
          label={esRenuncia ? 'Procesado por' : 'Registrado por'}
          valor={texto(meta.procesado_por)}
        />
      </Datos>

      <TextoLibre
        icon={ClipboardList}
        titulo={esRenuncia ? 'Notas de cierre' : 'Observaciones'}
        texto={texto(meta.notas_cierre)}
      />

      {esRenuncia ? (
        <EnlaceExpediente
          consecutivo={meta.consecutivo}
          nota='El expediente tiene el comprobante de devolución y el detalle completo del cierre.'
        />
      ) : null}
    </div>
  )
}
