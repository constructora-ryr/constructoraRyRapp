/**
 * PasoContacto — Paso 2: cómo contactar al cliente y dónde vive.
 * La regla "al menos teléfono o correo" se ve arriba y cambia a verde al
 * cumplirse. Departamento → ciudad en cascada (datos locales).
 * Se usa en crear y en editar.
 */

'use client'

import { useEffect, useMemo } from 'react'

import { CheckCircle2, Info, Mail, MapPin, Phone } from 'lucide-react'
import type {
  FieldErrors,
  Path,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import {
  AccordionWizardField,
  AccordionWizardSelect,
} from '@/shared/components/accordion-wizard'
import {
  getCiudadesPorDepartamento,
  getDepartamentos,
} from '@/shared/data/colombia-locations'
import { cn } from '@/shared/utils/helpers'

import type { ClienteAccordionFormValues } from './cliente-accordion-form.types'

interface PasoContactoProps<T extends ClienteAccordionFormValues> {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  watch: UseFormWatch<T>
  setValue: UseFormSetValue<T>
}

function Bloque({
  icon: Icon,
  titulo,
  children,
}: {
  icon: typeof Phone
  titulo: string
  children: React.ReactNode
}) {
  return (
    <section className='space-y-3'>
      <h4 className='flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
        <Icon className='h-3.5 w-3.5' />
        {titulo}
      </h4>
      {children}
    </section>
  )
}

export function PasoContacto<T extends ClienteAccordionFormValues>({
  register,
  errors,
  watch,
  setValue,
}: PasoContactoProps<T>) {
  const campo = (c: keyof ClienteAccordionFormValues) => c as Path<T>
  const telefono = ((watch(campo('telefono')) as string) || '').trim()
  const email = ((watch(campo('email')) as string) || '').trim()
  const departamento = (watch(campo('departamento')) as string) || ''
  const ciudad = (watch(campo('ciudad')) as string) || ''
  const tieneContacto = !!telefono || !!email

  const departamentos = useMemo(() => getDepartamentos(), [])
  const ciudades = useMemo(
    () => (departamento ? getCiudadesPorDepartamento(departamento) : []),
    [departamento]
  )

  // Si la ciudad no pertenece al nuevo departamento, se limpia
  useEffect(() => {
    if (ciudad && departamento && !ciudades.includes(ciudad))
      setValue(campo('ciudad'), '' as PathValue<T, Path<T>>)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departamento])

  return (
    <div className='space-y-6'>
      <Bloque icon={Phone} titulo='Medios de contacto'>
        <p
          className={cn(
            'flex items-start gap-2 rounded-xl px-3 py-2 text-xs transition-colors',
            tieneContacto
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
          )}
        >
          {tieneContacto ? (
            <CheckCircle2 className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
          ) : (
            <Info className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
          )}
          {tieneContacto
            ? 'Listo: el cliente tiene al menos un medio de contacto.'
            : 'Obligatorio: escribe al menos un teléfono o un correo (pueden ser los dos).'}
        </p>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <AccordionWizardField
            {...register(campo('telefono'))}
            label='Teléfono celular'
            type='tel'
            inputMode='tel'
            autoComplete='off'
            moduleName='clientes'
            error={errors.telefono?.message as string}
          />
          <AccordionWizardField
            {...register(campo('email'))}
            label='Correo electrónico'
            type='email'
            inputMode='email'
            autoComplete='off'
            moduleName='clientes'
            error={errors.email?.message as string}
          />
        </div>
        <AccordionWizardField
          {...register(campo('telefono_alternativo'))}
          label='Otro teléfono (opcional)'
          type='tel'
          inputMode='tel'
          autoComplete='off'
          moduleName='clientes'
          error={errors.telefono_alternativo?.message as string}
        />
      </Bloque>

      <Bloque icon={MapPin} titulo='Dónde vive'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <AccordionWizardSelect
            {...register(campo('departamento'))}
            label='Departamento'
            required
            moduleName='clientes'
            error={errors.departamento?.message as string}
          >
            {departamentos.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </AccordionWizardSelect>
          <AccordionWizardSelect
            {...register(campo('ciudad'))}
            label={
              departamento ? 'Ciudad / municipio' : 'Primero el departamento'
            }
            required
            disabled={!departamento}
            moduleName='clientes'
            error={errors.ciudad?.message as string}
          >
            {ciudades.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </AccordionWizardSelect>
        </div>
        <AccordionWizardField
          {...register(campo('direccion'))}
          label='Dirección (opcional)'
          autoComplete='off'
          moduleName='clientes'
          error={errors.direccion?.message as string}
        />
      </Bloque>

      <p className='flex items-center gap-1.5 text-[11px] text-gray-400'>
        <Mail className='h-3 w-3' />
        Los correos no llevan tildes ni ñ (ej: londono@gmail.com).
      </p>
    </div>
  )
}
