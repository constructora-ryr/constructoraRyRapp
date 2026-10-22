'use client'

/**
 * Orquestador del detalle de cliente.
 * - Datos y pestaña activa: useClienteDetalle
 * - Permisos: useClienteDetallePermisos
 * - Encabezado, pestañas y estados de carga: componentes en ./components
 * - Pestañas pesadas con carga diferida; las visitadas quedan montadas
 */

import { useCallback, useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import {
  FileText,
  Heart,
  History,
  Home,
  Lock,
  RefreshCw,
  User,
} from 'lucide-react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import { getShortId } from '@/lib/utils/slug.utils'
import {
  ModalRegistrarInteres,
  ReactivarClienteModal,
} from '@/modules/clientes/components/modals'
import {
  useAsignacionVivienda,
  useClienteDetalle,
} from '@/modules/clientes/hooks'
import { useEliminarClienteMutation } from '@/modules/clientes/hooks/useClientesQuery'
import { useReactivarCliente } from '@/modules/clientes/hooks/useReactivarCliente'
import type { Cliente } from '@/modules/clientes/types'
import {
  DetalleTabs,
  type TabDetalle,
} from '@/shared/components/detalle/DetalleTabs'
import { useModal } from '@/shared/components/modals'
import { Tooltip } from '@/shared/components/ui'
import { DocumentosListaEsqueleto } from '@/shared/documentos/components/lista/DocumentosListaEsqueleto'

import {
  ClienteDetalleCargando,
  ClienteNoEncontrado,
} from './components/ClienteDetalleEstados'
import { ClienteDetalleHeader } from './components/ClienteDetalleHeader'
import {
  HistorialEsqueleto,
  InteresesEsqueleto,
  NegociacionEsqueleto,
} from './components/TabsEsqueletos'
import { useAccionCrearNegociacion } from './hooks/useAccionCrearNegociacion'
import { useClienteDetallePermisos } from './hooks/useClienteDetallePermisos'
import { GeneralTab } from './tabs/general-tab'

// Tabs pesados — se cargan solo cuando el usuario los abre
const InteresesTab = dynamic(
  () => import('./tabs/intereses-tab').then(m => ({ default: m.InteresesTab })),
  {
    loading: () => <InteresesEsqueleto />,
  }
)
const NegociacionTab = dynamic(
  () =>
    import('./tabs/negociacion-tab').then(m => ({ default: m.NegociacionTab })),
  {
    loading: () => <NegociacionEsqueleto />,
  }
)
const DocumentosTab = dynamic(
  () =>
    import('./tabs/documentos-tab').then(m => ({ default: m.DocumentosTab })),
  {
    loading: () => <DocumentosListaEsqueleto moduleName='clientes' />,
  }
)
const HistorialTab = dynamic(
  () => import('./tabs/historial-tab').then(m => ({ default: m.HistorialTab })),
  {
    loading: () => <HistorialEsqueleto />,
  }
)

type TabId =
  | 'general'
  | 'intereses'
  | 'negociacion'
  | 'documentos'
  | 'historial'

const btnHero =
  'inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:bg-blue-50 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60'

/** Negociación vigente: activa/suspendida primero, si no la completada */
function negociacionVigente(c: Cliente) {
  return (
    c.negociaciones?.find(
      n => n.estado === 'Activa' || n.estado === 'Suspendida'
    ) ??
    c.negociaciones?.find(n => n.estado === 'Completada') ??
    null
  )
}

/** Por qué no se puede eliminar (mismas reglas que la lista de clientes) */
function motivoNoEliminar(c: Cliente): string | null {
  if ((c.estadisticas?.negociaciones_activas ?? 0) > 0)
    return 'No se puede eliminar: tiene una negociación activa'
  if (c.estado === 'Propietario')
    return 'No se puede eliminar: el cliente es propietario'
  if (c.estado === 'En Proceso de Renuncia')
    return 'No se puede eliminar: tiene una renuncia en proceso'
  return null
}

interface ClienteDetalleClientProps {
  clienteId: string // UUID del cliente (resuelto en el Server Component)
}

export default function ClienteDetalleClient({
  clienteId,
}: ClienteDetalleClientProps) {
  const router = useRouter()
  const { confirm } = useModal()
  const permisos = useClienteDetallePermisos()
  const eliminarMutation = useEliminarClienteMutation()

  const {
    clienteUUID,
    cliente,
    loading,
    activeTab,
    modalInteresAbierto,
    tieneCedula,
    totalDocumentos,
    cambiarTab,
    abrirModalInteres,
    cerrarModalInteres,
    recargarCliente,
  } = useClienteDetalle({ clienteId })

  // Mount-once: mantiene tabs visitados en el DOM (ocultos con `hidden`) para evitar re-fetches
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(['general'])
  )
  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(activeTab)) return prev
      const next = new Set(prev)
      next.add(activeTab)
      return next
    })
  }, [activeTab])

  const irADocumentos = useCallback(
    () => cambiarTab('documentos'),
    [cambiarTab]
  )

  // ── Reactivar cliente que renunció ──
  const {
    modalReactivarAbierto,
    verificandoRenuncia,
    handleReactivarCliente,
    handleConfirmarReactivacion,
    cerrarModalReactivar,
  } = useReactivarCliente({
    clienteUUID,
    onReactivado: recargarCliente,
  })

  // ── Asignación de vivienda (validación centralizada) ──
  const {
    tieneCedula: tieneCedulaAsignacion,
    puedeAsignar,
    cargando: cargandoAsignacion,
    handleIniciarAsignacion,
    mensajeValidacion,
  } = useAsignacionVivienda({
    clienteId: clienteUUID || '',
    clienteNombre: cliente?.nombre_completo || '',
    clienteSlug: clienteUUID ? getShortId(clienteUUID) : '',
  })

  useAccionCrearNegociacion({
    listo: !!cliente && !!clienteUUID,
    tieneCedula: tieneCedulaAsignacion,
    iniciarAsignacion: handleIniciarAsignacion,
    irADocumentos,
  })

  if (!clienteUUID || loading) return <ClienteDetalleCargando />
  if (!cliente) return <ClienteNoEncontrado />

  // Activo con negociación completada o saldo 0 se muestra como Propietario
  const esPropietario =
    cliente.estado === 'Propietario' ||
    !!cliente.negociaciones?.find(
      n => n.estado === 'Completada' || n.saldo_pendiente <= 0
    )
  const estadoDisplay = esPropietario ? 'Propietario' : cliente.estado
  const negociacion = negociacionVigente(cliente)

  const handleEliminar = async () => {
    const confirmado = await confirm({
      title: 'Eliminar cliente',
      message: `¿Seguro que quieres eliminar a ${cliente.nombre_completo}? Esta acción no se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    })
    if (!confirmado) return
    try {
      await eliminarMutation.mutateAsync(cliente.id)
      router.push('/clientes')
    } catch {
      // El toast de error lo muestra la mutación
    }
  }

  const puedeAsignarVivienda =
    permisos.canAsignarVivienda &&
    cliente.estado === 'Interesado' &&
    !cliente.negociaciones?.some(n => n.estado !== 'Cerrada por Renuncia')

  const acciones = (
    <>
      {puedeAsignarVivienda && (
        <Tooltip content={mensajeValidacion} side='bottom'>
          <span className='inline-flex'>
            <button
              type='button'
              onClick={handleIniciarAsignacion}
              disabled={!puedeAsignar || cargandoAsignacion}
              className={btnHero}
            >
              {puedeAsignar && !cargandoAsignacion ? (
                <Home className='h-4 w-4' />
              ) : (
                <Lock className='h-4 w-4' />
              )}
              Asignar vivienda
            </button>
          </span>
        </Tooltip>
      )}

      {cliente.estado === 'Renunció' && (
        <button
          type='button'
          onClick={handleReactivarCliente}
          disabled={verificandoRenuncia}
          className={btnHero}
        >
          <RefreshCw
            className={`h-4 w-4 ${verificandoRenuncia ? 'animate-spin' : ''}`}
          />
          {verificandoRenuncia ? 'Verificando…' : 'Reactivar cliente'}
        </button>
      )}
    </>
  )

  const tabs: TabDetalle<TabId>[] = [
    { id: 'general' as const, label: 'Información general', icon: User },
    {
      id: 'intereses' as const,
      label: 'Intereses',
      icon: Heart,
      count: cliente.intereses?.length ?? 0,
    },
    ...(permisos.canVerNegociacion
      ? [
          {
            id: 'negociacion' as const,
            label: 'Negociación',
            icon: Home,
            count:
              cliente.negociaciones?.filter(
                n =>
                  n.estado !== 'Cerrada por Renuncia' &&
                  n.estado !== 'Cerrada por Traslado'
              ).length ?? 0,
          },
        ]
      : []),
    ...(permisos.canVerDocumentos
      ? [
          {
            id: 'documentos' as const,
            label: 'Documentos',
            icon: FileText,
            count: totalDocumentos,
            alerta: tieneCedula ? null : 'Falta la cédula del cliente',
          },
        ]
      : []),
    ...(permisos.canVerHistorial
      ? [{ id: 'historial' as const, label: 'Historial', icon: History }]
      : []),
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/60 to-blue-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className='mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:py-8'
      >
        <ClienteDetalleHeader
          cliente={cliente}
          estado={estadoDisplay}
          negociacion={negociacion}
          acciones={acciones}
          onEditar={
            permisos.canEdit
              ? () => router.push(`/clientes/${getShortId(clienteId)}/editar`)
              : undefined
          }
          onEliminar={permisos.canDelete ? handleEliminar : undefined}
          motivoNoEliminar={motivoNoEliminar(cliente)}
        />

        <DetalleTabs
          tema='clientes'
          etiqueta='Secciones del cliente'
          tabs={tabs}
          activa={activeTab as TabId}
          onCambiar={cambiarTab}
        />

        <div>
          {/* General — siempre montado (import estático) */}
          <div
            role='tabpanel'
            id='panel-general'
            className={activeTab !== 'general' ? 'hidden' : ''}
          >
            <GeneralTab
              cliente={cliente}
              negociacion={negociacion}
              canMostrarBannerDocumentos={
                permisos.canVerDocumentos && permisos.canSubirDocumentos
              }
              onIrADocumentos={irADocumentos}
            />
          </div>

          {(activeTab === 'intereses' || visitedTabs.has('intereses')) && (
            <div
              role='tabpanel'
              id='panel-intereses'
              className={activeTab !== 'intereses' ? 'hidden' : ''}
            >
              <InteresesTab
                cliente={cliente}
                onRegistrarInteres={abrirModalInteres}
                onVerNegociacion={
                  permisos.canVerNegociacion
                    ? () => cambiarTab('negociacion')
                    : undefined
                }
              />
            </div>
          )}

          {(activeTab === 'negociacion' || visitedTabs.has('negociacion')) && (
            <div
              role='tabpanel'
              id='panel-negociacion'
              className={activeTab !== 'negociacion' ? 'hidden' : ''}
            >
              <NegociacionTab
                cliente={cliente}
                onIrADocumentos={irADocumentos}
              />
            </div>
          )}

          {(activeTab === 'documentos' || visitedTabs.has('documentos')) && (
            <div
              role='tabpanel'
              id='panel-documentos'
              className={activeTab !== 'documentos' ? 'hidden' : ''}
            >
              <DocumentosTab cliente={cliente} />
            </div>
          )}

          {(activeTab === 'historial' || visitedTabs.has('historial')) && (
            <div
              role='tabpanel'
              id='panel-historial'
              className={activeTab !== 'historial' ? 'hidden' : ''}
            >
              <HistorialTab
                clienteId={clienteUUID}
                clienteNombre={`${cliente.nombres} ${cliente.apellidos}`}
                onIrATab={cambiarTab}
              />
            </div>
          )}
        </div>
      </motion.div>

      <ModalRegistrarInteres
        isOpen={modalInteresAbierto}
        onClose={cerrarModalInteres}
        clienteId={clienteUUID}
        onSuccess={() => {
          cerrarModalInteres()
          recargarCliente()
        }}
      />

      <ReactivarClienteModal
        isOpen={modalReactivarAbierto}
        nombreCliente={cliente.nombre_completo || ''}
        onClose={cerrarModalReactivar}
        onConfirm={handleConfirmarReactivacion}
      />
    </div>
  )
}
