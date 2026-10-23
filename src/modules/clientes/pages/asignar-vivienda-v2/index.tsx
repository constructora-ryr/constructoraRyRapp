'use client'

import { useMemo } from 'react'

import { KeyRound } from 'lucide-react'

import {
  AccordionWizardHero,
  AccordionWizardLayout,
  AccordionWizardNavigation,
  AccordionWizardSection,
  AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'

import {
  SeccionFuentesPago,
  SeccionRevision,
  SeccionViviendaValores,
} from './components'
import { PASOS_ASIGNACION, useAsignarViviendaV2 } from './hooks'

interface AsignarViviendaV2PageProps {
  clienteId: string
  clienteNombre?: string
  clienteSlug?: string
}

export function AsignarViviendaV2Page({
  clienteId,
  clienteNombre = 'Cliente',
  clienteSlug,
}: AsignarViviendaV2PageProps) {
  const {
    // Wizard
    pasoActual,
    getEstadoPaso,
    summaryPaso1,
    summaryPaso2,
    showSuccess,
    isValidating,
    pasos,
    irSiguiente,
    irAtras,
    irAPaso,
    // RHF
    register,
    errors,
    setValue,
    watch,
    // Proyecto/Vivienda
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaId,
    viviendaSeleccionada,
    cargandoProyectos,
    cargandoViviendas,
    setProyectoSeleccionado,
    setViviendaId,
    // Valores
    valorBase,
    gastosNotariales,
    recargoEsquinera,
    descuentoAplicado,
    valorTotal,
    // Fuentes
    cargandoTipos,
    tiposConCampos,
    fuentes,
    totalFuentes,
    diferencia,
    sumaCierra,
    erroresFuentes,
    mostrarErroresFuentes,
    handleFuenteEnabledChange,
    handleFuenteConfigChange,
    // Guardado
    handleSubmitFinal,
    creando,
    errorApi,
    clearErrorApi,
  } = useAsignarViviendaV2({ clienteId, clienteSlug })

  const proyectoNombre = useMemo(
    () => proyectos.find(p => p.id === proyectoSeleccionado)?.nombre ?? '',
    [proyectos, proyectoSeleccionado]
  )

  const aplicarDescuento = watch('aplicar_descuento') as boolean
  const tipoDescuento = (watch('tipo_descuento') as string) ?? ''
  const notas = (watch('notas') as string) ?? ''
  const valorEscrituraPublica =
    (watch('valor_escritura_publica') as number) ?? 0

  return (
    <AccordionWizardLayout
      moduleName='clientes'
      breadcrumbs={[
        { label: 'Clientes', href: '/clientes' },
        { label: clienteNombre, href: `/clientes/${clienteSlug ?? clienteId}` },
        { label: 'Asignar vivienda' },
      ]}
      isSubmitting={creando}
      submitLoadingLabel='Asignando vivienda…'
    >
      {/* Hero Header */}
      <AccordionWizardHero
        icon={KeyRound}
        title='Asignar vivienda'
        subtitle={`Elige la casa para ${clienteNombre}, define cómo la va a pagar y confirma la venta.`}
        moduleName='clientes'
        estimatedTime='~5 minutos'
        totalSteps={PASOS_ASIGNACION.length}
        currentStep={pasoActual}
      />

      {/* ── Paso 1: Vivienda & Valores ────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(1)}
        stepNumber={1}
        title={pasos[0].title}
        description={pasos[0].description}
        icon={pasos[0].icon}
        fieldCount={{ required: 3, optional: 2 }}
        currentStep={pasoActual}
        totalSteps={PASOS_ASIGNACION.length}
        moduleName='clientes'
        summaryItems={summaryPaso1}
        onEdit={() => irAPaso(1)}
      >
        <SeccionViviendaValores
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          proyectos={proyectos}
          viviendas={viviendas}
          proyectoSeleccionado={proyectoSeleccionado}
          viviendaId={viviendaId}
          viviendaSeleccionada={viviendaSeleccionada}
          cargandoProyectos={cargandoProyectos}
          cargandoViviendas={cargandoViviendas}
          setProyectoSeleccionado={setProyectoSeleccionado}
          setViviendaId={setViviendaId}
          valorBase={valorBase}
          gastosNotariales={gastosNotariales}
          recargoEsquinera={recargoEsquinera}
          descuentoAplicado={descuentoAplicado}
          valorTotal={valorTotal}
          onClearErrorApi={clearErrorApi}
        />
        <AccordionWizardNavigation
          currentStep={1}
          totalSteps={PASOS_ASIGNACION.length}
          isFirst
          isLast={false}
          isValidating={pasoActual === 1 && isValidating}
          moduleName='clientes'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 2: Fuentes de Pago ───────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(2)}
        stepNumber={2}
        title={pasos[1].title}
        description={pasos[1].description}
        icon={pasos[1].icon}
        fieldCount={{ required: 1, optional: 0 }}
        currentStep={pasoActual}
        totalSteps={PASOS_ASIGNACION.length}
        moduleName='clientes'
        summaryItems={summaryPaso2}
        onEdit={() => irAPaso(2)}
      >
        <SeccionFuentesPago
          valorTotal={valorTotal}
          cargandoTipos={cargandoTipos}
          tiposConCampos={tiposConCampos}
          fuentes={fuentes}
          totalFuentes={totalFuentes}
          diferencia={diferencia}
          sumaCierra={sumaCierra}
          erroresFuentes={erroresFuentes}
          mostrarErroresFuentes={mostrarErroresFuentes}
          handleFuenteEnabledChange={handleFuenteEnabledChange}
          handleFuenteConfigChange={handleFuenteConfigChange}
        />
        <AccordionWizardNavigation
          currentStep={2}
          totalSteps={PASOS_ASIGNACION.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 2 && isValidating}
          moduleName='clientes'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 3: Revisión & Confirmación ───────── */}
      <AccordionWizardSection
        status={getEstadoPaso(3)}
        stepNumber={3}
        title={pasos[2].title}
        description={pasos[2].description}
        icon={pasos[2].icon}
        currentStep={pasoActual}
        totalSteps={PASOS_ASIGNACION.length}
        moduleName='clientes'
        onEdit={() => irAPaso(3)}
      >
        <SeccionRevision
          clienteNombre={clienteNombre}
          proyectoNombre={proyectoNombre}
          viviendaSeleccionada={viviendaSeleccionada}
          valorBase={valorBase}
          gastosNotariales={gastosNotariales}
          recargoEsquinera={recargoEsquinera}
          descuentoAplicado={descuentoAplicado}
          valorTotal={valorTotal}
          valorEscrituraPublica={valorEscrituraPublica}
          aplicarDescuento={aplicarDescuento}
          tipoDescuento={tipoDescuento}
          notas={notas}
          fuentes={fuentes}
          tiposConCampos={tiposConCampos}
          errorApi={errorApi}
          onEditarSeccion1={() => irAPaso(1)}
          onEditarSeccion2={() => irAPaso(2)}
        />
        <AccordionWizardNavigation
          currentStep={3}
          totalSteps={PASOS_ASIGNACION.length}
          isFirst={false}
          isLast
          isSubmitting={creando}
          isValidating={isValidating}
          moduleName='clientes'
          submitLabel='Confirmar y asignar'
          onBack={irAtras}
          onNext={irSiguiente}
          onSubmit={handleSubmitFinal}
        />
      </AccordionWizardSection>

      {/* Success celebration */}
      <AccordionWizardSuccess
        isVisible={showSuccess}
        moduleName='clientes'
        title='¡Vivienda asignada!'
        subtitle='Abriendo el detalle del cliente…'
      />
    </AccordionWizardLayout>
  )
}
