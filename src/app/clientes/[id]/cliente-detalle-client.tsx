'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL (REFACTORIZADO)
 * Cliente Detalle Client - Usa useClienteDetalle hook
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - TODA la lógica consolidada en useClienteDetalle hook
 * - Este componente SOLO orquesta la UI
 */

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Edit2,
  FileText,
  Heart,
  History,
  Home,
  Lock,
  RefreshCw,
  Trash2,
  User,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { getShortId } from '@/lib/utils/slug.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import {
  ModalRegistrarInteres,
  ReactivarClienteModal,
} from '@/modules/clientes/components/modals'
import {
  useAsignacionVivienda,
  useClienteDetalle,
} from '@/modules/clientes/hooks'
import { useReactivarCliente } from '@/modules/clientes/hooks/useReactivarCliente'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { useModal } from '@/shared/components/modals'
import { SectionLoadingSpinner, Tooltip } from '@/shared/components/ui'

import * as styles from './cliente-detalle.styles'
import { EstadoBadge } from './components/EstadoBadge'
import { GeneralTab } from './tabs/general-tab'

// Tabs pesados — se cargan solo cuando el usuario los abre
const InteresesTab = dynamic(
  () => import('./tabs/intereses-tab').then(m => ({ default: m.InteresesTab })),
  {
    loading: () => (
      <SectionLoadingSpinner
        label='Cargando intereses...'
        moduleName='clientes'
        icon={Heart}
      />
    ),
  }
)
const NegociacionTab = dynamic(
  () =>
    import('./tabs/negociacion-tab').then(m => ({ default: m.NegociacionTab })),
  {
    loading: () => (
      <SectionLoadingSpinner
        label='Cargando negociación...'
        moduleName='negociaciones'
        icon={FileText}
      />
    ),
  }
)
const DocumentosTab = dynamic(
  () =>
    import('./tabs/documentos-tab').then(m => ({ default: m.DocumentosTab })),
  {
    loading: () => (
      <SectionLoadingSpinner
        label='Cargando documentos...'
        moduleName='clientes'
        icon={FileText}
      />
    ),
  }
)
const HistorialTab = dynamic(
  () => import('./tabs/historial-tab').then(m => ({ default: m.HistorialTab })),
  {
    loading: () => (
      <SectionLoadingSpinner
        label='Cargando historial...'
        moduleName='clientes'
        icon={History}
      />
    ),
  }
)

interface ClienteDetalleClientProps {
  clienteId: string // UUID del cliente (resuelto en el Server Component)
}

// Badge de estado
export default function ClienteDetalleClient({
  clienteId,
}: ClienteDetalleClientProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const { confirm } = useModal()
  const { puede, esAdmin } = usePermisosQuery()
  const canEdit = esAdmin || puede('clientes', 'editar')
  const canDelete = esAdmin || puede('clientes', 'eliminar')
  const canVerHistorial = esAdmin || puede('clientes', 'ver_historial')
  const canAsignarVivienda = esAdmin || puede('negociaciones', 'asignar')
  const canVerDocumentos = esAdmin || puede('documentos', 'ver')
  const canSubirDocumentos = esAdmin || puede('documentos', 'subir')

  // ✅ Hook consolidado con TODA la lógica
  const {
    clienteUUID,
    cliente,
    loading,
    error: _error,
    activeTab,
    modalInteresAbierto,
    tieneCedula,
    cargandoValidacion: _cargandoValidacion,
    totalDocumentos,
    modalSubirAbierto: _modalSubirAbierto,
    cambiarTab,
    abrirModalInteres,
    cerrarModalInteres,
    cerrarModalSubir: _cerrarModalSubir,
    recargarCliente,
    irATabDocumentos: _irATabDocumentos,
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

  const handleEditar = () => {
    router.push(`/clientes/${getShortId(clienteId)}/editar`)
  }

  const handleEliminar = async () => {
    const confirmado = await confirm({
      title: 'Eliminar cliente',
      message: `¿Estás seguro de eliminar al cliente ${cliente?.nombre_completo}? Esta acción no se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    })
    if (confirmado) {
      router.push('/clientes')
    }
  }

  const handleRegistrarInteres = () => {
    abrirModalInteres()
  }

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

  // ✅ Hook de asignación de vivienda con validación centralizada
  const clienteSlug = clienteUUID ? getShortId(clienteUUID) : ''

  const {
    tieneCedula: tieneCedulaAsignacion,
    puedeAsignar,
    cargando: cargandoAsignacion,
    handleIniciarAsignacion,
    mensajeValidacion,
  } = useAsignacionVivienda({
    clienteId: clienteUUID || '',
    clienteNombre: cliente?.nombre_completo || '',
    clienteSlug: clienteSlug || '',
  })

  // ✅ Detectar query param "action=crear-negociacion" y usar hook de asignación
  useEffect(() => {
    if (!cliente || !clienteUUID) return

    const params = new URLSearchParams(window.location.search)
    const action = params.get('action')

    if (action === 'crear-negociacion') {
      // Limpiar query param primero
      window.history.replaceState({}, '', window.location.pathname)

      // Verificar si tiene documento
      if (!tieneCedulaAsignacion) {
        // Cambiar a tab documentos
        cambiarTab('documentos')
      } else {
        // Tiene documento, proceder con asignación
        handleIniciarAsignacion()
      }
    }
  }, [
    cliente,
    clienteUUID,
    tieneCedulaAsignacion,
    handleIniciarAsignacion,
    cambiarTab,
  ])

  const handleInteresRegistrado = async () => {
    cerrarModalInteres()
    // ✅ React Query refetch automático
    recargarCliente()
  }

  // Mostrar loading mientras se resuelve el slug O mientras se carga el cliente
  if (!clienteUUID || loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/20'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <User
              className='mx-auto mb-4 h-16 w-16 text-cyan-500'
              strokeWidth={2}
            />
          </motion.div>

          <motion.p
            className='text-lg font-medium text-gray-700 dark:text-gray-300'
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Cargando cliente...
          </motion.p>

          <div className='mt-4 flex items-center justify-center gap-2'>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className='h-2 w-2 rounded-full bg-cyan-500'
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Si ya resolvimos el UUID y terminó de cargar pero no hay cliente, entonces no existe
  if (!cliente) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/20'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='text-center'
        >
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800'>
            <User className='h-10 w-10 text-gray-400' />
          </div>
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Cliente no encontrado
          </h2>
          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            El cliente que buscas no existe o fue eliminado.
          </p>
          <button
            onClick={() => router.push('/clientes')}
            className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-700 hover:to-blue-700'
          >
            <ArrowLeft className='h-4 w-4' />
            Volver a clientes
          </button>
        </motion.div>
      </div>
    )
  }

  // Checks DB estado OR completed/zeroed negotiation (covers stale data where DB wasn't updated)
  const negCompletada = cliente.negociaciones?.find(
    n => n.estado === 'Completada' || n.saldo_pendiente <= 0
  )
  const esPropietario = cliente.estado === 'Propietario' || !!negCompletada
  const estadoDisplay = esPropietario ? 'Propietario' : cliente.estado

  const tabs = [
    {
      id: 'general' as const,
      label: 'Información General',
      icon: User,
      count: null,
      badge: null,
      visible: true,
    },
    {
      id: 'intereses' as const,
      label: 'Intereses',
      icon: Heart,
      count: cliente.intereses?.length || 0,
      badge: null,
      visible: true,
    },
    {
      id: 'negociacion' as const,
      label: 'Negociación',
      icon: Home,
      count: (
        cliente.negociaciones?.filter(
          n =>
            n.estado !== 'Cerrada por Renuncia' &&
            n.estado !== 'Cerrada por Traslado'
        ) || []
      ).length,
      badge: null,
      visible: esAdmin || puede('negociaciones', 'ver'),
    },
    {
      id: 'documentos' as const,
      label: 'Documentos',
      icon: FileText,
      count: totalDocumentos,
      badge: !tieneCedula
        ? { text: '⚠️ Requerido', color: 'orange', pulse: true }
        : null,
      visible: esAdmin || puede('documentos', 'ver'),
    },
    {
      id: 'historial' as const,
      label: 'Historial',
      icon: History,
      count: null,
      badge: null,
      visible: canVerHistorial,
    },
  ].filter(tab => tab.visible)

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key='content'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/20'
      >
        <div className='mx-auto max-w-7xl space-y-4'>
          {/* Header Mejorado con Glassmorphism */}
          <motion.div
            {...styles.animations.fadeInUp}
            transition={{ delay: 0.1 }}
            className={styles.headerClasses.container}
            style={{
              background: esPropietario
                ? resolvedTheme === 'dark'
                  ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%)'
                  : 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)'
                : 'linear-gradient(135deg, #0891b2 0%, #2563eb 50%, #1e40af 100%)',
            }}
          >
            {/* Patrón de fondo */}
            <div className={styles.headerClasses.backgroundPattern}>
              <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
            </div>

            {/* Breadcrumb — navegación semántica con Link funcional */}
            <nav
              aria-label='Navegación de migas de pan'
              className={styles.headerClasses.breadcrumb}
            >
              <User className={styles.headerClasses.breadcrumbIcon} />
              <ChevronRight className={styles.headerClasses.breadcrumbIcon} />
              <Link
                href='/clientes'
                className='transition-colors hover:text-white'
              >
                Clientes
              </Link>
              <ChevronRight className={styles.headerClasses.breadcrumbIcon} />
              <span
                className={styles.headerClasses.breadcrumbCurrent}
                aria-current='page'
              >
                {formatNombreCompleto(cliente.nombre_completo)}
              </span>
            </nav>

            {/* Contenido Principal */}
            <div className={styles.headerClasses.contentWrapper}>
              <div className={styles.headerClasses.leftSection}>
                <motion.div
                  className={styles.headerClasses.iconContainer}
                  {...styles.animations.hoverScale}
                >
                  <User className={styles.headerClasses.icon} />
                </motion.div>

                <div className={styles.headerClasses.titleSection}>
                  {/* Nombre + Estado (lo más importante primero) */}
                  <div className='flex flex-wrap items-center gap-3'>
                    <h1 className={styles.headerClasses.title}>
                      {formatNombreCompleto(cliente.nombre_completo)}
                    </h1>
                    <EstadoBadge estado={estadoDisplay} />
                  </div>

                  {/* Documento pegado al nombre (sin ícono, compacto) */}
                  <p className='mb-2 mt-0.5 text-sm font-medium text-white/80 dark:text-white/70'>
                    {cliente.tipo_documento} {cliente.numero_documento}
                  </p>

                  {/* Chip compacto de vivienda asignada — usa negociación ACTIVA o COMPLETADA */}
                  {(esPropietario || cliente.estado === 'Activo') &&
                    (() => {
                      const neg = cliente.negociaciones?.find(
                        n => n.estado === 'Activa' || n.estado === 'Completada'
                      )
                      if (!neg) return null
                      const proyecto =
                        neg?.viviendas?.manzanas?.proyectos?.nombre ||
                        'Sin proyecto'
                      const manzana = neg?.viviendas?.manzanas?.nombre || 'N/A'
                      const numero = neg?.viviendas?.numero || 'N/A'

                      return (
                        <div className='mt-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-white/95 backdrop-blur-md'>
                          <Home className='h-3.5 w-3.5 flex-shrink-0 text-emerald-300' />
                          <span className='text-xs font-semibold'>
                            Mza. {manzana} · Casa {numero}
                          </span>
                          <span className='h-3 w-px bg-white/30' />
                          <Building2 className='h-3.5 w-3.5 flex-shrink-0 text-blue-300' />
                          <span className='text-xs text-white/80'>
                            {proyecto}
                          </span>
                        </div>
                      )
                    })()}
                </div>
              </div>

              {/* Acciones */}
              <div className={styles.headerClasses.actionsContainer}>
                {/* ✅ Botón Asignar Vivienda (solo visible para Interesados sin negociación activa y con permiso) */}
                {canAsignarVivienda &&
                  cliente.estado === 'Interesado' &&
                  !cliente.negociaciones?.filter(
                    n => n.estado !== 'Cerrada por Renuncia'
                  )?.length && (
                    <Tooltip content={mensajeValidacion} side='bottom'>
                      <motion.button
                        onClick={handleIniciarAsignacion}
                        disabled={!puedeAsignar || cargandoAsignacion}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                          puedeAsignar && !cargandoAsignacion
                            ? 'border border-white/30 bg-white/20 text-white backdrop-blur-md hover:bg-white/30 hover:shadow-lg hover:shadow-white/20'
                            : 'cursor-not-allowed border border-gray-400/30 bg-gray-400/20 text-gray-300 opacity-60'
                        }`}
                        whileHover={
                          puedeAsignar && !cargandoAsignacion
                            ? { scale: 1.05 }
                            : {}
                        }
                        whileTap={
                          puedeAsignar && !cargandoAsignacion
                            ? { scale: 0.95 }
                            : {}
                        }
                      >
                        {puedeAsignar && !cargandoAsignacion ? (
                          <Home className='h-4 w-4' />
                        ) : (
                          <Lock className='h-4 w-4' />
                        )}
                        <span className='hidden sm:inline'>
                          Asignar Vivienda
                        </span>
                        <span className='sm:hidden'>Asignar</span>
                      </motion.button>
                    </Tooltip>
                  )}

                {/* ✅ Botón Reactivar Cliente (solo visible para clientes que renunciaron) */}
                {cliente.estado === 'Renunció' && (
                  <motion.button
                    onClick={handleReactivarCliente}
                    disabled={verificandoRenuncia}
                    className='inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/30 hover:shadow-lg disabled:cursor-wait disabled:opacity-60'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${verificandoRenuncia ? 'animate-spin' : ''}`}
                    />
                    <span className='hidden sm:inline'>
                      {verificandoRenuncia
                        ? 'Verificando...'
                        : 'Reactivar Cliente'}
                    </span>
                    <span className='sm:hidden'>
                      {verificandoRenuncia ? '...' : 'Reactivar'}
                    </span>
                  </motion.button>
                )}

                {canEdit ? (
                  <button
                    className={styles.headerClasses.actionButton}
                    onClick={handleEditar}
                  >
                    <Edit2 className='h-4 w-4' />
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    className={styles.headerClasses.deleteButton}
                    onClick={handleEliminar}
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>

          {/* Tabs Mejorados */}
          <motion.div
            {...styles.animations.fadeInUp}
            transition={{ delay: 0.2 }}
            className={styles.tabsClasses.container}
          >
            <nav
              role='tablist'
              aria-label='Secciones del cliente'
              className={`scrollbar-hide overflow-x-auto pb-1 ${styles.tabsClasses.nav}`}
            >
              {tabs.map(tab => (
                <motion.button
                  key={tab.id}
                  role='tab'
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  data-tab={tab.id}
                  onClick={() => cambiarTab(tab.id)}
                  className={`flex-shrink-0 ${styles.tabsClasses.tab} ${
                    activeTab === tab.id
                      ? styles.tabsClasses.tabActive
                      : styles.tabsClasses.tabInactive
                  } relative`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.tabsClasses.tabContent}>
                    <tab.icon className={styles.tabsClasses.tabIcon} />
                    <span className='whitespace-nowrap'>{tab.label}</span>
                    {tab.count !== null && tab.count > 0 && (
                      <span className={styles.tabsClasses.tabBadge}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </nav>
          </motion.div>

          <div>
            {/* General — siempre montado (import estático) */}
            <div
              role='tabpanel'
              id='panel-general'
              className={activeTab !== 'general' ? 'hidden' : ''}
            >
              <GeneralTab
                cliente={cliente}
                canMostrarBannerDocumentos={
                  canVerDocumentos && canSubirDocumentos
                }
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
                  onRegistrarInteres={handleRegistrarInteres}
                />
              </div>
            )}

            {(activeTab === 'negociacion' ||
              visitedTabs.has('negociacion')) && (
              <div
                role='tabpanel'
                id='panel-negociacion'
                className={activeTab !== 'negociacion' ? 'hidden' : ''}
              >
                <NegociacionTab
                  cliente={cliente}
                  onIrADocumentos={() => cambiarTab('documentos')}
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
                  clienteId={clienteUUID || ''}
                  clienteNombre={`${cliente.nombres} ${cliente.apellidos}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Registrar Interés */}
        <ModalRegistrarInteres
          isOpen={modalInteresAbierto}
          onClose={cerrarModalInteres}
          clienteId={clienteUUID}
          onSuccess={handleInteresRegistrado}
        />

        {/* Modal Reactivar Cliente */}
        <ReactivarClienteModal
          isOpen={modalReactivarAbierto}
          nombreCliente={cliente?.nombre_completo || ''}
          onClose={cerrarModalReactivar}
          onConfirm={handleConfirmarReactivacion}
        />
      </motion.div>
    </AnimatePresence>
  )
}
