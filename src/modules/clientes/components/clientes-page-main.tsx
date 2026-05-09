/**
 * Componente principal del mÃ³dulo de Clientes
 * Orquesta la lÃ³gica con el hook y presenta los componentes
 *
 * âœ… PROTEGIDO POR MIDDLEWARE
 * - Recibe permisos como props desde Server Component
 * - No necesita validar autenticaciÃ³n (ya validada)
 * - Solo maneja UI y lÃ³gica de negocio
 *
 * âœ… MIGRADO A REACT QUERY
 * - Usa useClientesList() para gestiÃ³n de estado
 * - Cache automÃ¡tico y refetch inteligente
 * - Eliminado Zustand store (deprecado)
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { motion } from 'framer-motion'

import { useRouter } from 'next/navigation'

import { construirURLCliente } from '@/lib/utils/slug.utils'
import { ModalConfirmacion } from '@/shared'
import { NoResults } from '@/shared/components/ui/NoResults'

import {
  ClientesHeader,
  EstadisticasClientes,
  FiltrosClientes,
} from '../components'
import { FormularioClienteContainer } from '../containers/formulario-cliente-container'
import { useClientesList } from '../hooks'
import { clientesListaStyles } from '../styles/clientes-lista.styles'
import type { ClienteResumen, EstadoCliente } from '../types'

import { ClientesEmpty } from './clientes-empty'
import { ClientesSkeleton } from './clientes-skeleton'
import { ClientesVistaTabla } from './ClientesVistaTabla'
import { MensajeEliminarCliente } from './MensajeEliminarCliente'

interface ClientesPageMainProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

export function ClientesPageMain({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView: _canView = true,
  isAdmin: _isAdmin = false,
}: ClientesPageMainProps = {}) {
  const router = useRouter()

  const {
    clientesFiltrados,
    isLoading,
    isFetching,
    estadisticas,
    modalCrear,
    modalEditar,
    modalEliminar,
    clienteEditar,
    clienteEliminar,
    abrirModalCrear: _abrirModalCrear,
    abrirModalEditar: _abrirModalEditar,
    cerrarModal,
    abrirModalEliminar,
    confirmarEliminar,
    cancelarEliminar,
    filtros: _filtros,
    actualizarFiltros,
    totalFiltrados,
  } = useClientesList()

  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCliente | 'Todos'>(
    'Todos'
  )

  useEffect(() => {
    actualizarFiltros({
      busqueda,
      estado: estadoFiltro === 'Todos' ? [] : [estadoFiltro],
    })
  }, [busqueda, estadoFiltro, actualizarFiltros])

  const handleNuevoCliente = useCallback(() => {
    router.push('/clientes/nuevo')
  }, [router])

  const handleVerCliente = useCallback(
    (cliente: ClienteResumen) => {
      const url = construirURLCliente({
        id: cliente.id,
        nombre_completo: cliente.nombre_completo,
      })
      router.push(url)
    },
    [router]
  )

  const handleEditarCliente = useCallback(
    (cliente: ClienteResumen) => {
      router.push(`/clientes/${cliente.id}/editar`)
    },
    [router]
  )

  const _handleEliminarCliente = useCallback(
    (cliente: ClienteResumen) => {
      abrirModalEliminar(cliente.id)
    },
    [abrirModalEliminar]
  )

  const _handleIniciarAsignacion = useCallback(
    (cliente: ClienteResumen) => {
      const url = construirURLCliente({
        id: cliente.id,
        nombre_completo: cliente.nombre_completo,
      })
      router.push(`${url}?action=crear-negociacion`)
    },
    [router]
  )

  return (
    <div className={clientesListaStyles.container.page}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={clientesListaStyles.container.content}
      >
        <ClientesHeader
          onNuevoCliente={canCreate ? handleNuevoCliente : undefined}
          totalClientes={estadisticas.total}
        />

        <EstadisticasClientes
          total={estadisticas.total}
          interesados={estadisticas.interesados}
          activos={estadisticas.activos}
          inactivos={estadisticas.inactivos}
          renunciaron={estadisticas.renunciaron}
          propietarios={
            (estadisticas as Record<string, number>).propietarios ?? 0
          }
        />

        <FiltrosClientes
          busqueda={busqueda}
          estadoSeleccionado={estadoFiltro}
          onBusquedaChange={setBusqueda}
          onEstadoChange={setEstadoFiltro}
          totalResultados={totalFiltrados}
          totalClientes={estadisticas.total}
        />

        {isLoading ? (
          <ClientesSkeleton />
        ) : clientesFiltrados.length === 0 ? (
          busqueda || estadoFiltro !== 'Todos' ? (
            <NoResults
              moduleName='clientes'
              onLimpiarFiltros={() => {
                setBusqueda('')
                setEstadoFiltro('Todos')
              }}
              mensaje='No hay clientes que coincidan con los filtros aplicados'
            />
          ) : (
            <ClientesEmpty
              onNuevoCliente={canCreate ? handleNuevoCliente : undefined}
            />
          )
        ) : (
          <ClientesVistaTabla
            clientes={clientesFiltrados}
            isLoading={isLoading}
            isFetching={isFetching}
            canEdit={canEdit}
            canDelete={canDelete}
            onVer={handleVerCliente}
            onEditar={handleEditarCliente}
            onEliminar={abrirModalEliminar}
          />
        )}
      </motion.div>

      {modalCrear || modalEditar ? (
        <FormularioClienteContainer
          clienteId={clienteEditar?.id || null}
          cliente={clienteEditar}
          isOpen={modalCrear || modalEditar}
          onClose={cerrarModal}
        />
      ) : null}

      <ModalConfirmacion
        isOpen={modalEliminar}
        onClose={cancelarEliminar}
        onConfirm={confirmarEliminar}
        title='Eliminar Cliente'
        message={
          clienteEliminar ? (
            <MensajeEliminarCliente
              clienteId={clienteEliminar}
              clientes={clientesFiltrados}
            />
          ) : (
            ''
          )
        }
        confirmText='Eliminar Cliente'
        cancelText='Cancelar'
        variant='danger'
      />
    </div>
  )
}
