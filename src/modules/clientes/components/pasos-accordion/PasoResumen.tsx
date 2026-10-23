/**
 * PasoResumen — último paso al crear: todo lo ingresado por secciones, con
 * "Editar" para volver a cada una antes de crear el cliente.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import type { LucideIcon } from 'lucide-react'
import { Heart, MapPin, NotebookPen, Pencil, User } from 'lucide-react'

import { viviendasService } from '@/modules/viviendas/services/viviendas.service'

import { edad } from '../../utils/fecha-nacimiento'
import {
  REGLAS_DOCUMENTO,
  type TipoDocumentoColombia,
} from '../../utils/validacion-documentos-colombia'

import type { ClienteAccordionFormValues } from './cliente-accordion-form.types'

function Seccion({
  titulo,
  icon: Icon,
  datos,
  onEditar,
}: {
  titulo: string
  icon: LucideIcon
  datos: [string, string | undefined][]
  onEditar: () => void
}) {
  return (
    <section className='rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900'>
      <header className='mb-2 flex items-center justify-between gap-2'>
        <h3 className='flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white'>
          <span className='flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm'>
            <Icon className='h-3.5 w-3.5' />
          </span>
          {titulo}
        </h3>
        <button
          type='button'
          onClick={onEditar}
          className='inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-500/10'
        >
          <Pencil className='h-3 w-3' />
          Editar
        </button>
      </header>
      <dl className='grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2'>
        {datos.map(([etiqueta, valor]) => (
          <div key={etiqueta} className='min-w-0'>
            <dt className='text-[11px] text-gray-500 dark:text-gray-400'>
              {etiqueta}
            </dt>
            <dd className='break-words text-sm font-medium text-gray-900 dark:text-white'>
              {valor || '—'}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function PasoResumen({
  datos,
  onEditar,
}: {
  datos: Partial<ClienteAccordionFormValues>
  onEditar: (paso: number) => void
}) {
  const proyectoId = datos.proyecto_interes_id || ''
  const { data: proyectos = [] } = useQuery({
    queryKey: ['viviendas', 'proyectos'],
    queryFn: () => viviendasService.obtenerProyectos(),
    staleTime: 5 * 60 * 1000,
  })
  const { data: viviendas = [] } = useQuery({
    queryKey: ['viviendas', 'disponibles-proyecto', proyectoId],
    queryFn: () =>
      viviendasService.obtenerViviendasDisponiblesPorProyecto(proyectoId),
    enabled: !!proyectoId,
    staleTime: 60 * 1000,
  })
  const proyecto = proyectos.find(p => p.id === proyectoId)?.nombre
  const casa = viviendas.find(v => v.id === datos.vivienda_interes_id)
  const tipo =
    REGLAS_DOCUMENTO[datos.tipo_documento as TipoDocumentoColombia]?.label
  const anos = edad(datos.fecha_nacimiento ?? '')

  return (
    <div className='space-y-3'>
      <Seccion
        titulo='Datos personales'
        icon={User}
        onEditar={() => onEditar(1)}
        datos={[
          ['Nombre', `${datos.nombres ?? ''} ${datos.apellidos ?? ''}`.trim()],
          ['Documento', `${tipo ?? ''} ${datos.numero_documento ?? ''}`.trim()],
          [
            'Nacimiento',
            datos.fecha_nacimiento
              ? `${new Date(`${datos.fecha_nacimiento}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}${anos !== null ? ` (${anos} años)` : ''}`
              : undefined,
          ],
          ['Estado civil', datos.estado_civil],
        ]}
      />
      <Seccion
        titulo='Contacto y ubicación'
        icon={MapPin}
        onEditar={() => onEditar(2)}
        datos={[
          ['Teléfono', datos.telefono],
          ['Correo', datos.email],
          ['Otro teléfono', datos.telefono_alternativo],
          [
            'Ciudad',
            [datos.ciudad, datos.departamento].filter(Boolean).join(', '),
          ],
          ['Dirección', datos.direccion],
        ]}
      />
      <Seccion
        titulo='Interés'
        icon={Heart}
        onEditar={() => onEditar(3)}
        datos={[
          ['Proyecto', proyecto ?? 'Sin interés definido'],
          [
            'Casa',
            casa
              ? `Manzana ${casa.manzanas?.nombre ?? '?'} · Casa ${casa.numero}`
              : undefined,
          ],
          ['Qué busca', datos.notas_interes],
        ]}
      />
      <Seccion
        titulo='Notas'
        icon={NotebookPen}
        onEditar={() => onEditar(4)}
        datos={[['Notas', datos.notas]]}
      />
    </div>
  )
}
