/**
 * NuevaViviendaAccordionView — wizard de 5 pasos para crear una vivienda.
 * Solo presentación: la lógica vive en useNuevaViviendaAccordion.
 */

'use client'

import type { ReactNode } from 'react'

import { HousePlus } from 'lucide-react'

import {
  AccordionWizardHero,
  AccordionWizardLayout,
  AccordionWizardNavigation,
  AccordionWizardSection,
  AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'

import {
  PASOS_VIVIENDA,
  useNuevaViviendaAccordion,
} from '../hooks/useNuevaViviendaAccordion'

import { PasoFinancieroNuevo } from './paso-financiero-nuevo'
import { PasoLegalNuevo } from './paso-legal-nuevo'
import { PasoLinderosNuevo } from './paso-linderos-nuevo'
import { PasoResumenNuevo } from './paso-resumen-nuevo'
import { PasoUbicacionNuevo } from './paso-ubicacion-nuevo'

const TOTAL = PASOS_VIVIENDA.length

/** Campos obligatorios y opcionales que se muestran en cada paso */
const CAMPOS: Record<number, { required: number; optional: number }> = {
  1: { required: 3, optional: 0 },
  2: { required: 4, optional: 0 },
  3: { required: 5, optional: 0 },
  4: { required: 1, optional: 1 },
}

export function NuevaViviendaAccordionView() {
  const v = useNuevaViviendaAccordion()
  const form = { register: v.register, errors: v.errors }

  const seccion = (paso: number, contenido: ReactNode) => {
    const info = PASOS_VIVIENDA[paso - 1]
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
        moduleName='viviendas'
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
          moduleName='viviendas'
          submitLabel={ultimo ? 'Crear vivienda' : undefined}
          onBack={v.irAtras}
          onNext={v.irSiguiente}
          onSubmit={ultimo ? v.handleSubmit : undefined}
        />
      </AccordionWizardSection>
    )
  }

  return (
    <AccordionWizardLayout
      moduleName='viviendas'
      breadcrumbs={[
        { label: 'Viviendas', href: '/viviendas' },
        { label: 'Nueva vivienda' },
      ]}
      isSubmitting={v.isSubmitting}
      submitLoadingLabel='Creando vivienda…'
    >
      <AccordionWizardHero
        icon={HousePlus}
        title='Nueva vivienda'
        subtitle='Registra una casa de un proyecto: ubicación, linderos, datos legales y valor.'
        moduleName='viviendas'
        estimatedTime='~3 minutos'
        totalSteps={TOTAL}
        currentStep={v.pasoActual}
      />

      {seccion(
        1,
        <PasoUbicacionNuevo {...form} setValue={v.setValue} watch={v.watch} />
      )}
      {seccion(2, <PasoLinderosNuevo {...form} />)}
      {seccion(3, <PasoLegalNuevo {...form} watch={v.watch} />)}
      {seccion(
        4,
        <PasoFinancieroNuevo
          {...form}
          watch={v.watch}
          setValue={v.setValue}
          resumenFinanciero={v.resumenFinanciero}
          configuracionRecargos={v.configuracionRecargos}
          errorConfiguracion={v.errorConfiguracion}
        />
      )}
      {seccion(
        5,
        <PasoResumenNuevo
          formData={v.formData}
          proyectoNombre={v.nombres.proyecto}
          manzanaNombre={v.nombres.manzana}
          resumenFinanciero={v.resumenFinanciero}
          onEditar={v.irAPaso}
        />
      )}

      <AccordionWizardSuccess
        isVisible={v.showSuccess}
        moduleName='viviendas'
        title='¡Vivienda creada!'
        subtitle='Volviendo al listado de viviendas…'
      />
    </AccordionWizardLayout>
  )
}
