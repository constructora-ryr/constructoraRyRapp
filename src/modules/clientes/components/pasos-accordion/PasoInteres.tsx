/**
 * PasoInteres — Paso 3 (solo al crear, opcional): proyecto y casa que le
 * interesan al cliente. Se guarda como un interés en su detalle (pestaña
 * Intereses).
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import type {
  FieldErrors,
  Path,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { viviendasService } from '@/modules/viviendas/services/viviendas.service'
import {
  AccordionWizardSelect,
  AccordionWizardTextarea,
} from '@/shared/components/accordion-wizard'

import type { ClienteAccordionFormValues } from './cliente-accordion-form.types'
import { OpcionesChip, TituloGrupo } from './piezas'

interface PasoInteresProps<T extends ClienteAccordionFormValues> {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  watch: UseFormWatch<T>
  setValue: UseFormSetValue<T>
}

export function PasoInteres<T extends ClienteAccordionFormValues>({
  register,
  errors,
  watch,
  setValue,
}: PasoInteresProps<T>) {
  const campo = (c: keyof ClienteAccordionFormValues) => c as Path<T>
  const proyectoId = (watch(campo('proyecto_interes_id')) as string) || ''
  const notas = (watch(campo('notas_interes')) as string) || ''

  const { data: proyectos = [] } = useQuery({
    queryKey: ['viviendas', 'proyectos'],
    queryFn: () => viviendasService.obtenerProyectos(),
    staleTime: 5 * 60 * 1000,
  })
  const { data: viviendas = [], isLoading: cargandoViviendas } = useQuery({
    queryKey: ['viviendas', 'disponibles-proyecto', proyectoId],
    queryFn: () =>
      viviendasService.obtenerViviendasDisponiblesPorProyecto(proyectoId),
    enabled: !!proyectoId,
    staleTime: 60 * 1000,
  })

  const elegirProyecto = (id: string) => {
    setValue(campo('proyecto_interes_id'), id as PathValue<T, Path<T>>, {
      shouldDirty: true,
    })
    setValue(campo('vivienda_interes_id'), '' as PathValue<T, Path<T>>)
  }

  return (
    <div className='space-y-5'>
      <div>
        <TituloGrupo ayuda='Toca de nuevo para quitarlo'>
          Proyecto que le interesa
        </TituloGrupo>
        {proyectos.length ? (
          <OpcionesChip
            etiqueta='Proyecto de interés'
            opciones={proyectos.map(p => ({ valor: p.id, label: p.nombre }))}
            valor={proyectoId}
            onCambiar={elegirProyecto}
            permitirVacio
          />
        ) : (
          <p className='text-sm text-gray-500'>No hay proyectos activos.</p>
        )}
      </div>

      {proyectoId ? (
        <AccordionWizardSelect
          {...register(campo('vivienda_interes_id'))}
          label={
            cargandoViviendas
              ? 'Cargando casas disponibles…'
              : `Casa de interés (opcional) · ${viviendas.length} disponibles`
          }
          moduleName='clientes'
          error={errors.vivienda_interes_id?.message as string}
        >
          <option value=''>Aún no tiene una casa definida</option>
          {viviendas.map(v => (
            <option key={v.id} value={v.id}>
              Manzana {v.manzanas?.nombre ?? '?'} · Casa {v.numero}
            </option>
          ))}
        </AccordionWizardSelect>
      ) : null}

      <div>
        <AccordionWizardTextarea
          {...register(campo('notas_interes'))}
          label='Qué busca el cliente (opcional)'
          maxLength={500}
          moduleName='clientes'
          error={errors.notas_interes?.message as string}
        />
        <p className='mt-1 text-right text-[11px] text-gray-400'>
          {notas.length}/500
        </p>
      </div>
    </div>
  )
}
