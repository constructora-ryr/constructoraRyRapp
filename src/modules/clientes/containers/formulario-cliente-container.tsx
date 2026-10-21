/**
 * Container: FormularioClienteContainer
 *
 * Contenedor que orquesta el formulario de clientes.
 * Solo coordina componentes y hooks, sin lógica de negocio.
 *
 * Arquitectura:
 * - Hook: useFormularioClienteContainer (lógica de negocio)
 * - Container: Este archivo (orquestación)
 * - Componentes: FormularioCliente, modales (UI pura)
 */

'use client'

import { ModalConfirmacion } from '@/shared'
import { Cargador } from '@/shared/components/carga'

import { ConfirmarCambiosModal } from '../components/ConfirmarCambiosModal'
import { FormularioCliente } from '../components/formulario-cliente-modern'
import { useFormularioClienteContainer } from '../hooks/useFormularioClienteContainer'
import type { ClienteResumen } from '../types'

interface FormularioClienteContainerProps {
  clienteId?: string | null
  cliente?: ClienteResumen | null // ✅ Type-safe (como Proyectos usa Proyecto)
  isOpen?: boolean
  onClose?: () => void
}

/**
 * Container del formulario de clientes
 * Orquesta hooks y componentes sin lógica de negocio
 */
export function FormularioClienteContainer({
  clienteId,
  cliente,
  isOpen = false,
  onClose,
}: FormularioClienteContainerProps) {
  // ✅ Hook con toda la lógica de negocio
  const {
    clienteCompleto,
    formData,
    errors,
    isSubmitting,
    esEdicion,
    handleChange,
    handleSubmit,
    validarStep0,
    validarStep1,
    validarStep2,
    validarStep3,
    proyectos,
    viviendas,
    cargandoProyectos,
    cargandoViviendas,
    handleProyectoChange,
    handleViviendaChange,
    modalAbierto,
    mostrarConfirmacionCambios,
    mostrarDescarte,
    handleIntentarCerrar,
    setMostrarConfirmacionCambios,
    confirmarGuardarCambios,
    setMostrarDescarte,
    confirmarDescartarCambios,
    cambiosDetectados,
    hayCambios,
    isPending,
    cargandoCliente,
  } = useFormularioClienteContainer({ clienteId, cliente, isOpen, onClose })

  // ✅ Mostrar loading mientras carga datos en edición
  const mostrarLoading = esEdicion && cargandoCliente && isOpen

  // ✅ Solo renderizado de componentes
  return (
    <>
      {/* Loading Modal mientras carga datos de edición */}
      {mostrarLoading && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md'>
          <div className='relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900'>
            <div className='flex flex-col items-center gap-4'>
              <Cargador modulo='clientes' />
              <div className='text-center'>
                <p className='text-base font-semibold text-gray-900 dark:text-gray-100'>
                  Cargando datos del cliente...
                </p>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  Espera un momento
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario Principal - Solo mostrar cuando datos estén listos */}
      {!mostrarLoading && (
        <FormularioCliente
          isOpen={modalAbierto}
          onClose={handleIntentarCerrar}
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting || isPending}
          esEdicion={esEdicion}
          hayCambios={hayCambios}
          cargandoDatos={cargandoCliente}
          onSubmit={handleSubmit}
          onChange={handleChange}
          proyectos={proyectos}
          viviendas={viviendas}
          cargandoProyectos={cargandoProyectos}
          cargandoViviendas={cargandoViviendas}
          onProyectoChange={handleProyectoChange}
          onViviendaChange={handleViviendaChange}
          validarStep0={validarStep0}
          validarStep1={validarStep1}
          validarStep2={validarStep2}
          validarStep3={validarStep3}
        />
      )}

      {/* Modal 1: Confirmación de Cambios (Diff) */}
      <ConfirmarCambiosModal
        isOpen={mostrarConfirmacionCambios}
        onClose={() => setMostrarConfirmacionCambios(false)}
        onConfirm={confirmarGuardarCambios}
        cambios={cambiosDetectados}
        isLoading={isPending}
        titulo={
          clienteCompleto
            ? `${clienteCompleto.nombres} ${clienteCompleto.apellidos}`
            : 'Cliente'
        }
      />

      {/* Modal 2: Descarte de Cambios */}
      <ModalConfirmacion
        isOpen={mostrarDescarte}
        onClose={() => setMostrarDescarte(false)}
        onConfirm={confirmarDescartarCambios}
        title='⚠️ ¿Descartar cambios?'
        message={
          `Tienes ${cambiosDetectados.length} cambio${cambiosDetectados.length > 1 ? 's' : ''} sin guardar.\n\n` +
          'Si sales ahora, se perderán todas las modificaciones realizadas.\n\n' +
          '¿Quieres continuar editando o prefieres descartar los cambios?'
        }
        confirmText='Descartar Cambios'
        cancelText='Continuar Editando'
        variant='danger'
      />
    </>
  )
}
