/**
 * PasoResumenNuevo — Paso 5: todo lo ingresado, por secciones, con un botón
 * para volver a editar cada una, y el desglose del valor.
 */

'use client'

import type { ReactNode } from 'react'

import type { LucideIcon } from 'lucide-react'
import { Compass, DollarSign, MapPin, Pencil, Scale } from 'lucide-react'

import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'
import type { ResumenFinanciero } from '../types'

import { ResumenValores } from './formulario/ResumenValores'

interface Dato {
  etiqueta: string
  valor: string
}

function Seccion({
  titulo,
  icon: Icon,
  datos = [],
  columnas = 3,
  insignia,
  onEditar,
  children,
}: {
  titulo: string
  icon: LucideIcon
  datos?: Dato[]
  columnas?: 2 | 3
  insignia?: string
  onEditar: () => void
  children?: ReactNode
}) {
  return (
    <section className='rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900'>
      <header className='mb-2 flex items-center justify-between gap-2'>
        <h3 className='flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white'>
          <span className='flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm'>
            <Icon className='h-3.5 w-3.5' />
          </span>
          {titulo}
          {insignia ? (
            <span className='rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'>
              {insignia}
            </span>
          ) : null}
        </h3>
        <button
          type='button'
          onClick={onEditar}
          className='inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/40'
        >
          <Pencil className='h-3 w-3' />
          Editar
        </button>
      </header>
      {datos.length ? (
        <dl
          className={
            columnas === 3
              ? 'grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3'
              : 'grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2'
          }
        >
          {datos.map(d => (
            <div key={d.etiqueta}>
              <dt className='text-[11px] text-gray-500 dark:text-gray-400'>
                {d.etiqueta}
              </dt>
              <dd className='break-words text-sm font-medium text-gray-900 dark:text-white'>
                {d.valor || '—'}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children}
    </section>
  )
}

export function PasoResumenNuevo({
  formData,
  proyectoNombre,
  manzanaNombre,
  resumenFinanciero,
  onEditar,
}: {
  formData: Partial<ViviendaSchemaType>
  proyectoNombre: string | null
  manzanaNombre: string | null
  resumenFinanciero: ResumenFinanciero
  onEditar: (paso: number) => void
}) {
  const m2 = (v: unknown) => (v ? `${v} m²` : '')

  return (
    <div className='space-y-3'>
      <Seccion
        titulo='Ubicación'
        icon={MapPin}
        onEditar={() => onEditar(1)}
        datos={[
          { etiqueta: 'Proyecto', valor: proyectoNombre ?? '' },
          {
            etiqueta: 'Manzana',
            valor: manzanaNombre ? `Mz. ${manzanaNombre}` : '',
          },
          {
            etiqueta: 'Casa',
            valor: formData.numero ? `#${formData.numero}` : '',
          },
        ]}
      />
      <Seccion
        titulo='Linderos'
        icon={Compass}
        columnas={2}
        onEditar={() => onEditar(2)}
        datos={[
          {
            etiqueta: 'Norte',
            valor: formData.lindero_norte ?? '',
          },
          { etiqueta: 'Sur', valor: formData.lindero_sur ?? '' },
          {
            etiqueta: 'Oriente',
            valor: formData.lindero_oriente ?? '',
          },
          {
            etiqueta: 'Occidente',
            valor: formData.lindero_occidente ?? '',
          },
        ]}
      />
      <Seccion
        titulo='Información legal'
        icon={Scale}
        onEditar={() => onEditar(3)}
        datos={[
          {
            etiqueta: 'Matrícula',
            valor: formData.matricula_inmobiliaria ?? '',
          },
          { etiqueta: 'Nomenclatura', valor: formData.nomenclatura ?? '' },
          { etiqueta: 'Tipo de lote', valor: formData.tipo_vivienda ?? '' },
          { etiqueta: 'Área del lote', valor: m2(formData.area_lote) },
          { etiqueta: 'Área construida', valor: m2(formData.area_construida) },
        ]}
      />
      <Seccion
        titulo='Valor de la vivienda'
        icon={DollarSign}
        insignia={formData.es_esquinera ? 'Esquinera' : undefined}
        onEditar={() => onEditar(4)}
      >
        <ResumenValores resumen={resumenFinanciero} />
      </Seccion>
    </div>
  )
}
