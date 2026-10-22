/**
 * EditarViviendaAccordionView — Presentational component for editing a vivienda
 * using the Accordion Wizard pattern (página propia, no modal).
 *
 * ✅ 4 pasos (Ubicación read-only, Linderos, Legal, Financiero)
 * ✅ ConfirmarCambiosModal + ImpactoFinancieroModal inline
 * ✅ AccordionWizardSuccess antes de navigation
 * ✅ Lógica separada en useEditarViviendaAccordion
 */

'use client'

import { Compass, DollarSign, Edit3, FileText, Home } from 'lucide-react'

import Link from 'next/link'

import {
  AccordionWizardHero,
  AccordionWizardLayout,
  AccordionWizardNavigation,
  AccordionWizardSection,
  AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'
import { ConfirmarCambiosModal } from '@/shared/components/modulos/ConfirmarCambiosModal'
import { SectionLoadingSpinner } from '@/shared/components/ui'

import {
  PASOS_VIVIENDA_EDICION,
  useEditarViviendaAccordion,
} from '../hooks/useEditarViviendaAccordion'

import { ImpactoFinancieroModal } from './ImpactoFinancieroModal'
import { PasoFinancieroNuevo } from './paso-financiero-nuevo'
import { PasoLegalNuevo } from './paso-legal-nuevo'
import { PasoLinderosNuevo } from './paso-linderos-nuevo'
import { PasoUbicacionNuevo } from './paso-ubicacion-nuevo'

const categoriasConfig = {
  linderos: {
    titulo: 'Linderos',
    icono: Compass,
  },
  legal: {
    titulo: 'Información Legal',
    icono: FileText,
  },
  financiero: {
    titulo: 'Información Financiera',
    icono: DollarSign,
  },
}

interface EditarViviendaAccordionViewProps {
  viviendaId: string
  canEdit: boolean
}

export function EditarViviendaAccordionView({
  viviendaId,
  canEdit,
}: EditarViviendaAccordionViewProps) {
  const {
    vivienda,
    cargandoVivienda,
    errorVivienda,
    viviendaNombre,
    pasos,
    pasoActual,
    getEstadoPaso,
    progress: _progress,
    irSiguiente,
    irAtras,
    irAPaso,
    summaryPaso1,
    summaryPaso2,
    summaryPaso3,
    summaryPaso4,
    register,
    errors,
    setValue,
    watch,
    resumenFinanciero,
    gastosNotariales: _gastosNotariales,
    configuracionRecargos,
    financieroBloqueado,
    isValidating,
    isSubmitting,
    showSuccess,
    hayCambios,
    cambiosDetectados,
    cambiosPorPaso,
    mostrarModalConfirmacion,
    setMostrarModalConfirmacion,
    mostrarModalImpacto,
    setMostrarModalImpacto,
    estadoModal,
    setEstadoModal,
    impactoFinanciero,
    sincronizandoNegociacion,
    esViviendaAsignada,
    esViviendaEntregada,
    mostrarConfirmacion,
    confirmarYGuardar,
  } = useEditarViviendaAccordion({ viviendaId })

  if (!canEdit) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500 dark:text-gray-400'>
          No tienes permisos para editar viviendas.
        </p>
      </div>
    )
  }

  if (cargandoVivienda) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <SectionLoadingSpinner
          label='Cargando datos de la vivienda...'
          moduleName='viviendas'
          icon={Home}
        />
      </div>
    )
  }

  if (errorVivienda || !vivienda) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='space-y-3 text-center'>
          <p className='text-sm text-red-600 dark:text-red-400'>
            Error al cargar la vivienda. Verifica que exista.
          </p>
          <Link
            href='/viviendas'
            className='text-sm text-orange-600 hover:underline'
          >
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  return (
    <AccordionWizardLayout
      moduleName='viviendas'
      breadcrumbs={[
        { label: 'Viviendas', href: '/viviendas' },
        { label: viviendaNombre ?? 'Vivienda' },
        { label: 'Editar' },
      ]}
      isSubmitting={isSubmitting}
      submitLoadingLabel='Actualizando Vivienda...'
    >
      {/* Hero Header */}
      <AccordionWizardHero
        icon={Edit3}
        title='Editar Vivienda'
        subtitle={`Actualiza los datos de ${viviendaNombre ? `"${viviendaNombre}"` : 'la vivienda'}.${esViviendaAsignada ? ' Esta vivienda tiene un cliente asignado.' : ''}${esViviendaEntregada ? ' Vivienda entregada: los campos financieros están bloqueados.' : ''}`}
        moduleName='viviendas'
        estimatedTime='~3 minutos'
        totalSteps={PASOS_VIVIENDA_EDICION.length}
      />

      {/* Paso 1: Ubicación (read-only) */}
      <AccordionWizardSection
        status={getEstadoPaso(1)}
        stepNumber={1}
        title={pasos[0].title}
        description={pasos[0].description}
        icon={pasos[0].icon}
        fieldCount={{ required: 0, optional: 0 }}
        currentStep={pasoActual}
        totalSteps={PASOS_VIVIENDA_EDICION.length}
        moduleName='viviendas'
        summaryItems={summaryPaso1}
        onEdit={() => irAPaso(1)}
      >
        <PasoUbicacionNuevo
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          mode='edit'
          viviendaActual={vivienda}
        />
        <AccordionWizardNavigation
          currentStep={1}
          totalSteps={PASOS_VIVIENDA_EDICION.length}
          isFirst
          isLast={false}
          isValidating={pasoActual === 1 && isValidating}
          moduleName='viviendas'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* Paso 2: Linderos */}
      <AccordionWizardSection
        status={getEstadoPaso(2)}
        stepNumber={2}
        title={pasos[1].title}
        description={pasos[1].description}
        icon={pasos[1].icon}
        fieldCount={{ required: 4, optional: 0 }}
        currentStep={pasoActual}
        totalSteps={PASOS_VIVIENDA_EDICION.length}
        moduleName='viviendas'
        summaryItems={summaryPaso2}
        onEdit={() => irAPaso(2)}
        changeCount={cambiosPorPaso.paso2}
      >
        <PasoLinderosNuevo register={register} errors={errors} />
        <AccordionWizardNavigation
          currentStep={2}
          totalSteps={PASOS_VIVIENDA_EDICION.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 2 && isValidating}
          moduleName='viviendas'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* Paso 3: Información Legal */}
      <AccordionWizardSection
        status={getEstadoPaso(3)}
        stepNumber={3}
        title={pasos[2].title}
        description={pasos[2].description}
        icon={pasos[2].icon}
        fieldCount={{ required: 5, optional: 0 }}
        currentStep={pasoActual}
        totalSteps={PASOS_VIVIENDA_EDICION.length}
        moduleName='viviendas'
        summaryItems={summaryPaso3}
        onEdit={() => irAPaso(3)}
        changeCount={cambiosPorPaso.paso3}
      >
        <PasoLegalNuevo
          register={register}
          errors={errors}
          watch={watch}
          viviendaId={vivienda.id}
        />
        <AccordionWizardNavigation
          currentStep={3}
          totalSteps={PASOS_VIVIENDA_EDICION.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 3 && isValidating}
          moduleName='viviendas'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* Paso 4: Información Financiera (último paso) */}
      <AccordionWizardSection
        status={getEstadoPaso(4)}
        stepNumber={4}
        title={pasos[3].title}
        description={pasos[3].description}
        icon={pasos[3].icon}
        fieldCount={{ required: 1, optional: 1 }}
        currentStep={pasoActual}
        totalSteps={PASOS_VIVIENDA_EDICION.length}
        moduleName='viviendas'
        summaryItems={summaryPaso4}
        onEdit={() => irAPaso(4)}
        changeCount={cambiosPorPaso.paso4}
      >
        <PasoFinancieroNuevo
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          resumenFinanciero={resumenFinanciero}
          configuracionRecargos={configuracionRecargos}
          bloqueado={financieroBloqueado}
          estadoVivienda={vivienda.estado}
        />
        <AccordionWizardNavigation
          currentStep={4}
          totalSteps={PASOS_VIVIENDA_EDICION.length}
          isFirst={false}
          isLast
          isSubmitting={isSubmitting}
          isValidating={pasoActual === 4 && isValidating}
          moduleName='viviendas'
          submitLabel='Guardar Cambios'
          disableSubmit={!hayCambios}
          disableSubmitMessage='Realiza cambios en la vivienda para habilitar la actualización.'
          onBack={irAtras}
          onNext={irSiguiente}
          onSubmit={mostrarConfirmacion}
        />
      </AccordionWizardSection>

      {/* Modal de confirmación (sin impacto financiero) */}
      <ConfirmarCambiosModal
        isOpen={mostrarModalConfirmacion && !mostrarModalImpacto}
        onClose={() => {
          if (estadoModal === 'idle' || estadoModal === 'error') {
            setMostrarModalConfirmacion(false)
            setEstadoModal('idle')
          }
        }}
        onConfirm={() => confirmarYGuardar(false)}
        cambios={cambiosDetectados}
        categoriasConfig={categoriasConfig}
        moduleName='viviendas'
        tituloEntidad={viviendaNombre ?? 'Vivienda'}
        estado={estadoModal}
        mensajeLoading='Actualizando vivienda...'
        mensajeExito='¡Vivienda actualizada!'
        subtituloExito='Redirigiendo a la vivienda...'
        onRetry={() => confirmarYGuardar(false)}
      />

      {/* Modal de impacto financiero (vivienda asignada con cambio de valor) */}
      {mostrarModalImpacto && impactoFinanciero ? (
        <ImpactoFinancieroModal
          isOpen={mostrarModalImpacto}
          impacto={impactoFinanciero}
          onClose={() => {
            if (estadoModal === 'idle' || estadoModal === 'error') {
              setMostrarModalImpacto(false)
              setEstadoModal('idle')
            }
          }}
          onConfirmarSinSync={() => confirmarYGuardar(false)}
          onConfirmarConSync={() => confirmarYGuardar(true)}
          isLoading={estadoModal === 'loading'}
          estado={estadoModal}
          sincronizando={sincronizandoNegociacion}
        />
      ) : null}

      {/* Animación de éxito */}
      <AccordionWizardSuccess
        isVisible={showSuccess}
        moduleName='viviendas'
        title='¡Vivienda actualizada!'
        subtitle='Redirigiendo a la vivienda...'
      />
    </AccordionWizardLayout>
  )
}
