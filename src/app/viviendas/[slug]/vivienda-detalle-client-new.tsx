'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  DollarSign,
  Edit2,
  FileText,
  Home,
  Info,
  Trash2,
} from 'lucide-react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { InfoTab } from '@/modules/viviendas/components/detalle/tabs/InfoTab'
import { useViviendaQuery } from '@/modules/viviendas/hooks/useViviendaQuery'
import { Button } from '@/shared/components/ui/button'

const TabSpinner = () => (
  <div className='flex items-center justify-center py-12'>
    <div className='h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent' />
  </div>
)

const DocumentosTab = dynamic(
  () =>
    import('@/modules/viviendas/components/detalle/tabs/DocumentosTab').then(
      m => ({ default: m.DocumentosTab })
    ),
  { loading: TabSpinner }
)

const AbonosTab = dynamic(
  () =>
    import('@/modules/viviendas/components/detalle/tabs/AbonosTab').then(m => ({
      default: m.AbonosTab,
    })),
  { loading: TabSpinner }
)

import * as styles from './vivienda-detalle.styles'

interface ViviendaDetalleClientProps {
  viviendaId: string
}

type TabType = 'info' | 'documentos' | 'abonos'

const estadoBadgeConfig: Record<string, { dot: string; text: string }> = {
  Disponible: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  Asignada: { dot: 'bg-blue-500', text: 'text-blue-700' },
  Propietario: { dot: 'bg-violet-500', text: 'text-violet-700' },
  Entregada: { dot: 'bg-teal-500', text: 'text-teal-700' },
  Reservada: { dot: 'bg-amber-500', text: 'text-amber-700' },
}

export default function ViviendaDetalleClient({
  viviendaId,
}: ViviendaDetalleClientProps) {
  const router = useRouter()
  const { puede, esAdmin } = usePermisosQuery()
  const canEdit = esAdmin || puede('viviendas', 'editar')
  const canDelete = esAdmin || puede('viviendas', 'eliminar')
  const canViewAbonos = esAdmin || puede('abonos', 'ver')

  // React Query hook (igual que proyectos)
  const { vivienda, loading, error } = useViviendaQuery(viviendaId)

  // Estados para modales y tabs
  const [activeTab, setActiveTab] = useState<TabType>('info')

  // Manejo de error (igual que proyectos)
  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Building2 className='mx-auto mb-4 h-16 w-16 text-red-500' />
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Error al cargar vivienda
          </h2>
          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            {error.message || 'Ocurrió un error inesperado'}
          </p>
          <Button onClick={() => router.push('/viviendas')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver a viviendas
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar loader mientras carga (igual que proyectos)
  if (loading || !vivienda) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950/20'>
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
            <Building2
              className='mx-auto mb-4 h-16 w-16 text-orange-500'
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
            Cargando vivienda...
          </motion.p>

          <div className='mt-4 flex items-center justify-center gap-2'>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className='h-2 w-2 rounded-full bg-orange-500'
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

  const tabs = [
    { id: 'info' as const, label: 'Información', icon: Info, count: null },
    {
      id: 'documentos' as const,
      label: 'Documentos',
      icon: FileText,
      count: null,
    },
    ...(canViewAbonos
      ? [
          {
            id: 'abonos' as const,
            label: 'Abonos',
            icon: DollarSign,
            count: vivienda.cantidad_abonos || 0,
          },
        ]
      : []),
  ]

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key='content'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950/20'
      >
        <div className='mx-auto max-w-7xl space-y-4'>
          {/* Botón Volver */}
          <motion.div {...styles.animations.fadeInUp}>
            <Button
              variant='ghost'
              onClick={() =>
                window.history.length > 1
                  ? router.back()
                  : router.push('/viviendas')
              }
              className='group'
            >
              <ArrowLeft className='mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1' />
              Volver
            </Button>
          </motion.div>

          {/* Header Mejorado con Glassmorphism */}
          <motion.div
            {...styles.animations.fadeInUp}
            transition={{ delay: 0.1 }}
            className={styles.headerClasses.container}
          >
            {/* Patrón de fondo */}
            <div className={styles.headerClasses.backgroundPattern}>
              <div className='absolute left-10 top-10 h-32 w-32 animate-pulse rounded-full bg-white/10'></div>
              <div className='absolute bottom-10 right-10 h-24 w-24 animate-pulse rounded-full bg-white/10'></div>
            </div>

            {/* Breadcrumb */}
            <div className={styles.headerClasses.breadcrumb}>
              <Home className={styles.headerClasses.breadcrumbIcon} />
              <ChevronRight className={styles.headerClasses.breadcrumbIcon} />
              <span>Viviendas</span>
              <ChevronRight className={styles.headerClasses.breadcrumbIcon} />
              <span className={styles.headerClasses.breadcrumbCurrent}>
                Mz. {vivienda.manzanas?.nombre || '?'} Casa {vivienda.numero}
              </span>
            </div>

            {/* Contenido Principal */}
            <div className={styles.headerClasses.contentWrapper}>
              <div className={styles.headerClasses.leftSection}>
                <motion.div
                  className={styles.headerClasses.iconContainer}
                  {...styles.animations.hoverScale}
                >
                  <Home className={styles.headerClasses.icon} />
                </motion.div>

                <div className={styles.headerClasses.titleSection}>
                  <div className='flex items-center gap-3'>
                    <h1 className={styles.headerClasses.title}>
                      Mz. {vivienda.manzanas?.nombre || '?'} Casa{' '}
                      {vivienda.numero}
                    </h1>
                    {(() => {
                      const cfg =
                        estadoBadgeConfig[vivienda.estado] ??
                        estadoBadgeConfig.Disponible
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm ${cfg.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                          />
                          {vivienda.estado}
                        </span>
                      )
                    })()}
                  </div>
                  <div className={styles.headerClasses.location}>
                    <Building2 className={styles.headerClasses.locationIcon} />
                    <span>
                      {vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              {(canEdit || canDelete) && (
                <div className={styles.headerClasses.actionsContainer}>
                  {canEdit ? (
                    <button
                      className={styles.headerClasses.actionButton}
                      onClick={() =>
                        router.push(window.location.pathname + '/editar')
                      }
                      title='Editar vivienda'
                    >
                      <Edit2 className='h-4 w-4' />
                    </button>
                  ) : null}
                  {canDelete ? (
                    <button className={styles.headerClasses.deleteButton}>
                      <Trash2 className='h-4 w-4' />
                    </button>
                  ) : null}
                </div>
              )}
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
              aria-label='Secciones de la vivienda'
              className={styles.tabsClasses.nav}
            >
              {tabs.map(tab => (
                <motion.button
                  key={tab.id}
                  role='tab'
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.tabsClasses.tab} ${
                    activeTab === tab.id
                      ? styles.tabsClasses.tabActive
                      : styles.tabsClasses.tabInactive
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.tabsClasses.tabContent}>
                    <tab.icon className={styles.tabsClasses.tabIcon} />
                    <span>{tab.label}</span>
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

          {/* Contenido de Tabs */}
          <div
            role='tabpanel'
            id={`panel-${activeTab}`}
            aria-labelledby={activeTab}
          >
            {activeTab === 'info' && (
              <InfoTab
                vivienda={vivienda}
                onAsignarCliente={() => {
                  /* TODO */
                }}
              />
            )}
            {activeTab === 'documentos' && (
              <DocumentosTab viviendaId={vivienda.id} />
            )}
            {activeTab === 'abonos' && (
              <AbonosTab
                vivienda={vivienda}
                onRegistrarAbono={() => {
                  // Navega al módulo de abonos del cliente
                  if (vivienda.clientes?.id) {
                    router.push(`/abonos/${vivienda.clientes.id}`)
                  }
                }}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
