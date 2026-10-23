/**
 * PasoPersonal — Paso 1: nombres (con mayúscula inicial automática), tipo de
 * documento en chips, número con verificación de duplicado mientras se
 * escribe, fecha de nacimiento con la edad calculada y estado civil.
 * Se usa en crear y en editar.
 */

'use client'

import { useCallback, type KeyboardEvent } from 'react'

import { Cake } from 'lucide-react'
import type {
  FieldErrors,
  Path,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { AccordionWizardField } from '@/shared/components/accordion-wizard'

import { useVerificacionDocumento } from '../../hooks/useVerificacionDocumento'
import { ESTADOS_CIVILES } from '../../types'
import { capitalizarNombre } from '../../utils/capitalizar-nombre'
import { EDAD_MINIMA, edad } from '../../utils/fecha-nacimiento'
import {
  REGLAS_DOCUMENTO,
  type TipoDocumentoColombia,
} from '../../utils/validacion-documentos-colombia'

import type { ClienteAccordionFormValues } from './cliente-accordion-form.types'
import { IndicadorDocumento, OpcionesChip, TituloGrupo } from './piezas'

const TIPOS_DOCUMENTO = [
  { valor: 'CC', label: 'Cédula', detalle: 'Cédula de Ciudadanía' },
  {
    valor: 'CE',
    label: 'Cédula extranjería',
    detalle: 'Cédula de Extranjería',
  },
  { valor: 'PP', label: 'Pasaporte', detalle: 'Pasaporte' },
  { valor: 'PEP', label: 'PEP', detalle: 'Permiso Especial de Permanencia' },
  {
    valor: 'NIT',
    label: 'NIT',
    detalle: 'Número de Identificación Tributaria',
  },
  { valor: 'TI', label: 'Tarjeta identidad', detalle: 'Tarjeta de Identidad' },
]

const OPCIONES_ESTADO_CIVIL = Object.values(ESTADOS_CIVILES).map(v => ({
  valor: v,
  label: v,
}))

/** Fecha máxima del calendario: hoy hace 18 años (yyyy-mm-dd) */
function fechaMaxima() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - EDAD_MINIMA)
  return d.toISOString().slice(0, 10)
}

interface PasoPersonalProps<T extends ClienteAccordionFormValues> {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  watch: UseFormWatch<T>
  setValue: UseFormSetValue<T>
  /** Al editar: el propio cliente no cuenta como documento repetido */
  clienteId?: string
}

export function PasoPersonal<T extends ClienteAccordionFormValues>({
  register,
  errors,
  watch,
  setValue,
  clienteId,
}: PasoPersonalProps<T>) {
  const campo = (c: keyof ClienteAccordionFormValues) => c as Path<T>
  const poner = useCallback(
    (c: keyof ClienteAccordionFormValues, v: string, validar = true) =>
      setValue(c as Path<T>, v as PathValue<T, Path<T>>, {
        shouldValidate: validar,
        shouldDirty: true,
      }),
    [setValue]
  )

  const tipo = (watch(campo('tipo_documento')) as string) || 'CC'
  const numero = watch(campo('numero_documento')) as string | undefined
  const fecha = (watch(campo('fecha_nacimiento')) as string) || ''
  const estadoCivil = (watch(campo('estado_civil')) as string) || ''
  const reglas =
    REGLAS_DOCUMENTO[tipo as TipoDocumentoColombia] ?? REGLAS_DOCUMENTO.CC
  const documento = useVerificacionDocumento(tipo, numero, clienteId)
  const anos = edad(fecha)

  // Al cambiar el tipo (solo cuando lo cambia el usuario, no al cargar un
  // cliente para editar), el número anterior ya no aplica
  const cambiarTipo = (nuevo: string) => {
    if (nuevo === tipo) return
    poner('tipo_documento', nuevo)
    poner('numero_documento', '', false)
  }

  const filtrarTeclas = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.key.length !== 1) return
    const permitido = reglas.soloDigitos
      ? /^\d$/
      : tipo === 'NIT'
        ? /^[\d-]$/
        : /^[a-zA-Z0-9]$/
    if (!permitido.test(e.key)) e.preventDefault()
  }

  const nombre = (c: 'nombres' | 'apellidos') =>
    register(campo(c), {
      onBlur: e => poner(c, capitalizarNombre(e.target.value)),
    })

  return (
    <div className='space-y-5'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <AccordionWizardField
          {...nombre('nombres')}
          label='Nombres'
          required
          autoComplete='off'
          moduleName='clientes'
          error={errors.nombres?.message as string}
        />
        <AccordionWizardField
          {...nombre('apellidos')}
          label='Apellidos'
          required
          autoComplete='off'
          moduleName='clientes'
          error={errors.apellidos?.message as string}
        />
      </div>

      <div>
        <TituloGrupo requerido>Tipo de documento</TituloGrupo>
        <OpcionesChip
          etiqueta='Tipo de documento'
          opciones={TIPOS_DOCUMENTO}
          valor={tipo}
          onCambiar={cambiarTipo}
        />
      </div>

      <div>
        <AccordionWizardField
          {...register(campo('numero_documento'), {
            setValueAs: (v: string) =>
              tipo === 'PP' ? String(v ?? '').toUpperCase() : v,
          })}
          label={`Número de ${reglas.label.toLowerCase()}`}
          required
          autoComplete='off'
          moduleName='clientes'
          inputMode={reglas.inputMode}
          maxLength={reglas.maxLength}
          onKeyDown={filtrarTeclas}
          error={errors.numero_documento?.message as string}
        />
        <div className='mt-1.5 flex flex-wrap items-center justify-between gap-2'>
          <p className='text-[11px] text-gray-400'>{reglas.descripcion}</p>
          <IndicadorDocumento estado={documento} />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-start'>
        <AccordionWizardField
          {...register(campo('fecha_nacimiento'))}
          label='Fecha de nacimiento'
          type='date'
          max={fechaMaxima()}
          moduleName='clientes'
          error={errors.fecha_nacimiento?.message as string}
        />
        {anos !== null ? (
          <span className='inline-flex h-[52px] items-center gap-2 rounded-xl bg-cyan-50 px-4 text-sm font-semibold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300'>
            <Cake className='h-4 w-4' />
            {anos} años
          </span>
        ) : null}
      </div>

      <div>
        <TituloGrupo ayuda='Toca de nuevo para quitarlo'>
          Estado civil
        </TituloGrupo>
        <OpcionesChip
          etiqueta='Estado civil'
          opciones={OPCIONES_ESTADO_CIVIL}
          valor={estadoCivil}
          onCambiar={v => poner('estado_civil', v)}
          permitirVacio
        />
      </div>
    </div>
  )
}
