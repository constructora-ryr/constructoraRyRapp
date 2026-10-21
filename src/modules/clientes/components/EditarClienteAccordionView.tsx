/**
 * EditarClienteAccordionView — Orquestador del wizard accordion de 3 pasos
 * para editar cliente. Componente presentacional puro.
 *
 * ✅ REGLA #-11: Edición en página propia, no en modal
 * ✅ Reutiliza PasoPersonal, PasoContacto, PasoNotas del wizard de creación
 */

'use client'

import { Edit3 } from 'lucide-react'

import Link from 'next/link'

import {
  AccordionWizardHero,
  AccordionWizardLayout,
  AccordionWizardNavigation,
  AccordionWizardSection,
  AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'
import { PantallaCarga } from '@/shared/components/carga'
import { ConfirmarCambiosModal } from '@/shared/components/modulos/ConfirmarCambiosModal'

import {
  PASOS_CLIENTE_EDICION,
  useEditarClienteAccordion,
} from '../hooks/useEditarClienteAccordion'

import { PasoContacto, PasoNotas, PasoPersonal } from './pasos-accordion'

interface EditarClienteAccordionViewProps {
  clienteId: string
  canEdit: boolean
}

export function EditarClienteAccordionView({
  clienteId,
  canEdit,
}: EditarClienteAccordionViewProps) {
  const {
    isLoading,
    isError,
    clienteNombre,
    pasos,
    pasoActual,
    getEstadoPaso,
    irSiguiente,
    irAtras,
    irAPaso,
    summaryPaso1,
    summaryPaso2,
    summaryPaso3,
    register,
    errors,
    setValue,
    watch,
    handleSubmit,
    isSubmitting,
    isValidating,
    showSuccess,
    mostrarConfirmacion,
    cambiosGenericos,
    categoriasConfig,
    confirmarActualizacion,
    cancelarConfirmacion,
    hayCambios,
    cambiosPorPaso,
  } = useEditarClienteAccordion(clienteId)

  if (!canEdit) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500 dark:text-gray-400'>
          No tienes permisos para editar clientes.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <PantallaCarga
        modulo='clientes'
        icon={Edit3}
        label='Cargando datos del cliente'
      />
    )
  }

  if (isError) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='space-y-3 text-center'>
          <p className='text-sm text-red-600 dark:text-red-400'>
            Error al cargar el cliente. Verifica que el cliente exista.
          </p>
          <Link
            href='/clientes'
            className='text-sm text-cyan-600 hover:underline'
          >
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  return (
    <AccordionWizardLayout
      moduleName='clientes'
      breadcrumbs={[
        { label: 'Clientes', href: '/clientes' },
        { label: clienteNombre || 'Cliente' },
        { label: 'Editar' },
      ]}
      isSubmitting={isSubmitting}
      submitLoadingLabel='Actualizando Cliente...'
    >
      {/* Hero Header */}
      <AccordionWizardHero
        icon={Edit3}
        title='Editar Cliente'
        subtitle={`Actualiza la información del cliente${clienteNombre ? ` "${clienteNombre}"` : ''}.`}
        moduleName='clientes'
        estimatedTime='~2 minutos'
        totalSteps={PASOS_CLIENTE_EDICION.length}
      />

      {/* ── Paso 1: Datos Personales ──────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(1)}
        stepNumber={1}
        title={pasos[0].title}
        description={pasos[0].description}
        icon={pasos[0].icon}
        fieldCount={{ required: 3, optional: 2 }}
        currentStep={pasoActual}
        totalSteps={PASOS_CLIENTE_EDICION.length}
        moduleName='clientes'
        summaryItems={summaryPaso1}
        onEdit={() => irAPaso(1)}
        changeCount={cambiosPorPaso.paso1}
      >
        <PasoPersonal
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />
        <AccordionWizardNavigation
          currentStep={1}
          totalSteps={PASOS_CLIENTE_EDICION.length}
          isFirst
          isLast={false}
          isValidating={pasoActual === 1 && isValidating}
          moduleName='clientes'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 2: Contacto y Ubicación ──────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(2)}
        stepNumber={2}
        title={pasos[1].title}
        description={pasos[1].description}
        icon={pasos[1].icon}
        fieldCount={{ required: 2, optional: 4 }}
        currentStep={pasoActual}
        totalSteps={PASOS_CLIENTE_EDICION.length}
        moduleName='clientes'
        summaryItems={summaryPaso2}
        onEdit={() => irAPaso(2)}
        changeCount={cambiosPorPaso.paso2}
      >
        <PasoContacto
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />
        <AccordionWizardNavigation
          currentStep={2}
          totalSteps={PASOS_CLIENTE_EDICION.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 2 && isValidating}
          moduleName='clientes'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 3: Notas ─────────────────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(3)}
        stepNumber={3}
        title={pasos[2].title}
        description={pasos[2].description}
        icon={pasos[2].icon}
        fieldCount={{ required: 0, optional: 1 }}
        currentStep={pasoActual}
        totalSteps={PASOS_CLIENTE_EDICION.length}
        moduleName='clientes'
        summaryItems={summaryPaso3}
        onEdit={() => irAPaso(3)}
        changeCount={cambiosPorPaso.paso3}
      >
        <PasoNotas register={register} />
        <AccordionWizardNavigation
          currentStep={3}
          totalSteps={PASOS_CLIENTE_EDICION.length}
          isFirst={false}
          isLast
          isSubmitting={isSubmitting}
          isValidating={isValidating}
          moduleName='clientes'
          submitLabel='Actualizar Cliente'
          disableSubmit={!hayCambios}
          disableSubmitMessage='Realiza cambios en el cliente para habilitar la actualización.'
          onBack={irAtras}
          onNext={irSiguiente}
          onSubmit={handleSubmit}
        />
      </AccordionWizardSection>

      {/* Modal de confirmación de cambios */}
      <ConfirmarCambiosModal
        isOpen={mostrarConfirmacion}
        onClose={cancelarConfirmacion}
        onConfirm={confirmarActualizacion}
        cambios={cambiosGenericos}
        categoriasConfig={categoriasConfig}
        moduleName='clientes'
        tituloEntidad={`Cliente${clienteNombre ? ` "${clienteNombre}"` : ''}`}
      />

      {/* Animación de éxito */}
      <AccordionWizardSuccess
        isVisible={showSuccess}
        moduleName='clientes'
        title='¡Cliente actualizado!'
        subtitle='Redirigiendo al listado de clientes...'
      />
    </AccordionWizardLayout>
  )
}
