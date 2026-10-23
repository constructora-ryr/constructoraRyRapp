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
import { Plus, Users } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { construirURLCliente, getShortId } from '@/lib/utils/slug.utils'
import { ModalConfirmacion } from '@/shared'
import {
  EstadoFiltroCards,
  ListPageHeader,
  ListSearchToolbar,
  type EstadoFiltroOpcion,
} from '@/shared/components/list-page'
import { NoResults } from '@/shared/components/ui/NoResults'
import { CLIENTE_ESTADO_BADGE } from '@/shared/config/estados.colors'

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
    modalEliminar,
    clienteEliminar,
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
      router.push(`/clientes/${getShortId(cliente.id)}/editar`)
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

  const propietarios =
    (estadisticas as Record<string, number>).propietarios ?? 0

  // Las tarjetas de conteo son también el filtro de estado
  const conEstilo = (estado: string) => {
    const cfg = CLIENTE_ESTADO_BADGE[estado]
    return {
      icon: cfg.icon,
      gradient: cfg.gradient,
      text: cfg.text,
      selected: cfg.selected,
      iconFilled: cfg.iconFilled,
    }
  }

  // Las tarjetas de conteo son también el filtro de estado
  const opcionesEstado: EstadoFiltroOpcion<EstadoCliente | 'Todos'>[] = [
    {
      value: 'Todos',
      label: 'Todos',
      count: estadisticas.total,
      icon: Users,
      gradient: 'from-cyan-500 to-blue-600',
      text: 'text-cyan-700 dark:text-cyan-400',
      selected:
        'border-cyan-400 bg-cyan-50/80 ring-2 ring-cyan-400/40 dark:border-cyan-500/60 dark:bg-cyan-500/10',
    },
    {
      value: 'Activo',
      label: 'Activos',
      count: estadisticas.activos,
      ...conEstilo('Activo'),
    },
    {
      value: 'Interesado',
      label: 'Interesados',
      count: estadisticas.interesados,
      ...conEstilo('Interesado'),
    },
    {
      value: 'Propietario',
      label: 'Propietarios',
      count: propietarios,
      ...conEstilo('Propietario'),
    },
    {
      value: 'Inactivo',
      label: 'Inactivos',
      count: estadisticas.inactivos,
      ...conEstilo('Inactivo'),
    },
    {
      value: 'Renunció',
      label: 'Renunciaron',
      count: estadisticas.renunciaron,
      ...conEstilo('Renunció'),
    },
  ]

  const hayFiltros = busqueda.trim().length > 0 || estadoFiltro !== 'Todos'
  const limpiarFiltros = () => {
    setBusqueda('')
    setEstadoFiltro('Todos')
  }
  const resultado =
    totalFiltrados === estadisticas.total
      ? `${estadisticas.total} cliente${estadisticas.total !== 1 ? 's' : ''}`
      : `${totalFiltrados} de ${estadisticas.total} clientes`

  return (
    <div className={clientesListaStyles.container.page}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={clientesListaStyles.container.content}
      >
        <ListPageHeader
          icon={Users}
          heroGradient='from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800'
          title='Clientes'
          subtitle='Compradores, interesados y propietarios'
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Clientes' },
          ]}
          actions={
            canCreate ? (
              <button
                type='button'
                onClick={handleNuevoCliente}
                className='inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl'
              >
                <Plus className='h-4 w-4' />
                Nuevo cliente
              </button>
            ) : undefined
          }
        />

        <EstadoFiltroCards
          ariaLabel='Filtrar clientes por estado'
          total={estadisticas.total}
          opciones={opcionesEstado}
          seleccionado={estadoFiltro}
          onSeleccionar={setEstadoFiltro}
        />

        <ListSearchToolbar
          value={busqueda}
          onChange={setBusqueda}
          placeholder='Buscar por nombre, cédula o teléfono…'
          resultado={resultado}
          onLimpiar={hayFiltros ? limpiarFiltros : undefined}
        />

        {isLoading ? (
          <ClientesSkeleton />
        ) : clientesFiltrados.length === 0 ? (
          busqueda || estadoFiltro !== 'Todos' ? (
            <NoResults
              moduleName='clientes'
              onLimpiarFiltros={limpiarFiltros}
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
