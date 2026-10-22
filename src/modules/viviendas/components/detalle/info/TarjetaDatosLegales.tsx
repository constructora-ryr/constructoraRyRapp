/**
 * Datos legales y físicos: matrícula (copiable), nomenclatura, áreas, tipo
 * de lote y fechas relevantes.
 */

'use client'

import { Scale } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { Vivienda } from '@/modules/viviendas/types'

import { Dato, TarjetaDetalle } from '../piezas'

const m2 = (v?: number | null) => (v ? `${Number(v)} m²` : '')

export function TarjetaDatosLegales({ vivienda }: { vivienda: Vivienda }) {
  return (
    <TarjetaDetalle
      titulo='Datos legales'
      icon={Scale}
      degradado='from-slate-500 to-slate-700'
    >
      <div className='grid grid-cols-2 gap-2'>
        <Dato
          etiqueta='Matrícula'
          valor={vivienda.matricula_inmobiliaria ?? ''}
          copiable
        />
        <Dato etiqueta='Tipo de lote' valor={vivienda.tipo_vivienda ?? ''} />
        <Dato
          etiqueta='Nomenclatura'
          valor={vivienda.nomenclatura ?? ''}
          className='col-span-2'
        />
        <Dato etiqueta='Área del lote' valor={m2(vivienda.area_lote)} />
        <Dato etiqueta='Área construida' valor={m2(vivienda.area_construida)} />
        {vivienda.fecha_creacion ? (
          <Dato
            etiqueta='Registrada'
            valor={formatDateCompact(String(vivienda.fecha_creacion))}
          />
        ) : null}
        {vivienda.fecha_entrega ? (
          <Dato
            etiqueta='Escriturada'
            valor={formatDateCompact(vivienda.fecha_entrega)}
          />
        ) : null}
      </div>
    </TarjetaDetalle>
  )
}
