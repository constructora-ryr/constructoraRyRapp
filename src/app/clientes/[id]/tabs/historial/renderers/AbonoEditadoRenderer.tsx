/**
 * Abono editado: recibo y vivienda, cambios campo a campo y el motivo.
 */

import { PenLine } from 'lucide-react'

import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { Banner, ListaCambios, TextoLibre } from './piezas'

const ETIQUETAS: Record<string, string> = {
  monto: 'Monto del abono',
  fecha_abono: 'Fecha del abono',
  metodo_pago: 'Método de pago',
  numero_referencia: 'Número de referencia',
  notas: 'Notas',
  comprobante_url: 'Comprobante',
}

export function AbonoEditadoRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const meta = (evento.metadata ?? {}) as Record<string, unknown>
  const detalles = evento.detalles ?? []
  const recibo = meta.abono_numero_recibo
    ? formatearNumeroRecibo(Number(meta.abono_numero_recibo))
    : null
  const ubicacion = [
    meta.manzana_nombre ? `Mza. ${meta.manzana_nombre}` : null,
    meta.vivienda_numero ? `Casa ${meta.vivienda_numero}` : null,
    meta.proyecto_nombre ?? null,
  ]
    .filter(Boolean)
    .join(' · ')
  const camposEditados = meta.campos_editados as string[] | undefined

  return (
    <div className='space-y-4'>
      <Banner
        compacto
        tono='aviso'
        etiqueta='Abono editado'
        valor={recibo ? `Recibo ${recibo}` : 'Abono'}
        nota={ubicacion || undefined}
      />

      {detalles.length === 0 && camposEditados?.length ? (
        // Eventos antiguos: solo se guardó el nombre de los campos
        <div className='flex flex-wrap items-center gap-1.5'>
          <span className='text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>
            Campos editados:
          </span>
          {camposEditados.map(c => (
            <span
              key={c}
              className='rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
            >
              {ETIQUETAS[c] ?? c}
            </span>
          ))}
        </div>
      ) : (
        <ListaCambios detalles={detalles} etiquetas={ETIQUETAS} />
      )}

      <TextoLibre
        icon={PenLine}
        titulo='Motivo de la edición'
        texto={meta.motivo_edicion ? String(meta.motivo_edicion) : null}
      />
    </div>
  )
}
