/**
 * NuevoClienteAccordionView — wizard de 5 pasos para crear un cliente.
 * Solo presentación: la lógica vive en useNuevoClienteAccordion.
 */

'use client'

import type { ReactNode } from 'react'

import { UserRoundPlus } from 'lucide-react'

import {
  AccordionWizardHero,
  AccordionWizardLayout,
  AccordionWizardNavigation,
  AccordionWizardSection,
  AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'

import {
  PASOS_CLIENTE,
  useNuevoClienteAccordion,
} from '../hooks/useNuevoClienteAccordion'

import {
  PasoContacto,
  PasoInteres,
  PasoNotas,
  PasoPersonal,
} from './pasos-accordion'
import { PasoResumen } from './pasos-accordion/PasoResumen'

const TOTAL = PASOS_CLIENTE.length

/** Obligatorios y opcionales de cada paso (el contacto cuenta como uno) */
const CAMPOS: Record<number, { required: number; optional: number }> = {
  1: { required: 4, optional: 2 },
  2: { required: 3, optional: 2 },
  3: { required: 0, optional: 3 },
  4: { required: 0, optional: 1 },
}

export function NuevoClienteAccordionView({
  canCreate,
}: {
  canCreate: boolean
}) {
  const v = useNuevoClienteAccordion()

  if (!canCreate) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500 dark:text-gray-400'>
          No tienes permisos para crear clientes.
        </p>
      </div>
    )
  }

  const form = {
    register: v.register,
    errors: v.errors,
    watch: v.watch,
    setValue: v.setValue,
  }

  const seccion = (paso: number, contenido: ReactNode) => {
    const info = PASOS_CLIENTE[paso - 1]
    const ultimo = paso === TOTAL
    return (
      <AccordionWizardSection
        key={paso}
        status={v.getEstadoPaso(paso)}
        stepNumber={paso}
        title={info.title}
        description={info.description}
        icon={info.icon}
        fieldCount={CAMPOS[paso]}
        currentStep={v.pasoActual}
        totalSteps={TOTAL}
        moduleName='clientes'
        summaryItems={v.resumenes[paso] ?? []}
        onEdit={() => v.irAPaso(paso)}
      >
        {contenido}
        <AccordionWizardNavigation
          currentStep={paso}
          totalSteps={TOTAL}
          isFirst={paso === 1}
          isLast={ultimo}
          isSubmitting={ultimo && v.isSubmitting}
          isValidating={v.pasoActual === paso && v.isValidating}
          moduleName='clientes'
          submitLabel={ultimo ? 'Crear cliente' : undefined}
          onBack={v.irAtras}
          onNext={v.irSiguiente}
          onSubmit={ultimo ? v.handleSubmit : undefined}
        />
      </AccordionWizardSection>
    )
  }

  return (
    <AccordionWizardLayout
      moduleName='clientes'
      breadcrumbs={[
        { label: 'Clientes', href: '/clientes' },
        { label: 'Nuevo cliente' },
      ]}
      isSubmitting={v.isSubmitting}
      submitLoadingLabel='Creando cliente…'
    >
      <AccordionWizardHero
        icon={UserRoundPlus}
        title='Nuevo cliente'
        subtitle='Registra a una persona interesada en comprar: sus datos, cómo contactarla y qué le interesa.'
        moduleName='clientes'
        estimatedTime='~2 minutos'
        totalSteps={TOTAL}
        currentStep={v.pasoActual}
      />

      {seccion(1, <PasoPersonal {...form} />)}
      {seccion(2, <PasoContacto {...form} />)}
      {seccion(3, <PasoInteres {...form} />)}
      {seccion(4, <PasoNotas register={v.register} watch={v.watch} />)}
      {seccion(5, <PasoResumen datos={v.formData} onEditar={v.irAPaso} />)}

      <AccordionWizardSuccess
        isVisible={v.showSuccess}
        moduleName='clientes'
        title='¡Cliente creado!'
        subtitle='Volviendo al listado de clientes…'
      />
    </AccordionWizardLayout>
  )
}
