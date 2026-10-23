/**
 * PasoNotas — Notas internas sobre el cliente (opcional), con contador.
 * Se usa en crear y en editar.
 */

'use client'

import type { Path, UseFormRegister, UseFormWatch } from 'react-hook-form'

import { AccordionWizardTextarea } from '@/shared/components/accordion-wizard'

import type { ClienteAccordionFormValues } from './cliente-accordion-form.types'

export function PasoNotas<T extends ClienteAccordionFormValues>({
  register,
  watch,
}: {
  register: UseFormRegister<T>
  watch: UseFormWatch<T>
}) {
  const campo = 'notas' as Path<T>
  const notas = (watch(campo) as string) || ''

  return (
    <div>
      <AccordionWizardTextarea
        {...register(campo)}
        label='Notas sobre el cliente (opcional)'
        rows={4}
        maxLength={500}
        moduleName='clientes'
      />
      <p className='mt-1 text-right text-[11px] text-gray-400'>
        {notas.length}/500
      </p>
    </div>
  )
}
