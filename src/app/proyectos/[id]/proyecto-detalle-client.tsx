'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Edit2,
  FileText,
  Home,
  Info,
  MapPin,
  Trash2,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { construirURLProyecto } from '@/lib/utils/slug.utils'
import { useProyectoQuery, useProyectosQuery } from '@/modules/proyectos/hooks'
import { formatearEstadoProyecto } from '@/modules/proyectos/utils/estado.utils'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { Button } from '@/shared/components/ui/button'
import { Modal } from '@/shared/components/ui/Modal'
import { usePestanaUrl } from '@/shared/hooks/usePestanaUrl'

import * as styles from './proyecto-detalle.styles'
import { DocumentosTab, GeneralTab } from './tabs'

interface ProyectoDetalleClientProps {
  proyectoId: string
}

const PESTANAS = ['info', 'documentos', 'manzanas'] as const

const estadoColors = {
  en_planificacion:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
  en_construccion:
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-700',
  completado:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700',
  pausado:
    'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
}

export default function ProyectoDetalleClient({
  proyectoId,
}: ProyectoDetalleClientProps) {
  const router = useRouter()
  const { puede, esAdmin } = usePermisosQuery()
  const canEdit = esAdmin || puede('proyectos', 'editar')
  const canDelete = esAdmin || puede('proyectos', 'eliminar')

  // ✅ REACT QUERY: Hook de detalle con cache (reemplaza useEffect + service)
  const { proyecto, cargando: loading, error } = useProyectoQuery(proyectoId)
  const { eliminarProyecto } = useProyectosQuery()

  // Estados para modales
  // Pestaña en la URL (?tab=manzanas): sobrevive a recargar
  const [activeTab, setActiveTab] = usePestanaUrl(PESTANAS, 'info')
  const [modalEliminar, setModalEliminar] = useState(false)

  const handleEdit = () => {
    if (!proyecto) return
    const url = construirURLProyecto({
      id: proyecto.id,
      nombre: proyecto.nombre,
    })
    router.push(`${url}/editar`)
  }

  const handleEliminar = () => {
    setModalEliminar(true)
  }

  const confirmarEliminar = async () => {
    try {
      await eliminarProyecto(proyectoId)
      setModalEliminar(false)
      router.push('/proyectos')
    } catch {
      // Error ya manejado por React Query con toast
      setModalEliminar(false)
    }
  }

  // Manejo de error
  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Building2 className='mx-auto mb-4 h-16 w-16 text-red-500' />
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Error al cargar proyecto
          </h2>
          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            {error.message || 'Ocurrió un error inesperado'}
          </p>
          <Button onClick={() => router.push('/proyectos')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver a proyectos
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar loader mientras carga
  if (loading || !proyecto) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20'>
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
              className='mx-auto mb-4 h-16 w-16 text-green-500'
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
            Cargando proyecto...
          </motion.p>

          <div className='mt-4 flex items-center justify-center gap-2'>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className='h-2 w-2 rounded-full bg-green-500'
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
  ]

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key='content'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20'
      >
        <div className='mx-auto max-w-7xl space-y-4'>
          {/* Botón Volver */}
          <motion.div {...styles.animations.fadeInUp}>
            <Button
              variant='ghost'
              onClick={() =>
                window.history.length > 1
                  ? router.back()
                  : router.push('/proyectos')
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
              <span>Proyectos</span>
              <ChevronRight className={styles.headerClasses.breadcrumbIcon} />
              <span className={styles.headerClasses.breadcrumbCurrent}>
                {proyecto.nombre}
              </span>
            </div>

            {/* Contenido Principal */}
            <div className={styles.headerClasses.contentWrapper}>
              <div className={styles.headerClasses.leftSection}>
                <motion.div
                  className={styles.headerClasses.iconContainer}
                  {...styles.animations.hoverScale}
                >
                  <Building2 className={styles.headerClasses.icon} />
                </motion.div>

                <div className={styles.headerClasses.titleSection}>
                  <div className='flex items-center gap-3'>
                    <h1 className={styles.headerClasses.title}>
                      {proyecto.nombre}
                    </h1>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        estadoColors[
                          proyecto.estado as keyof typeof estadoColors
                        ] || estadoColors.pausado
                      }`}
                    >
                      {formatearEstadoProyecto(proyecto.estado)}
                    </span>
                  </div>
                  <div className={styles.headerClasses.location}>
                    <MapPin className={styles.headerClasses.locationIcon} />
                    <span>{proyecto.ubicacion}</span>
                  </div>
                </div>
              </div>

              {/* Acciones — solo si tiene permiso */}
              {(canEdit || canDelete) && (
                <div className={styles.headerClasses.actionsContainer}>
                  {canEdit && (
                    <button
                      className={styles.headerClasses.actionButton}
                      onClick={handleEdit}
                    >
                      <Edit2 className='h-4 w-4' />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className={styles.headerClasses.deleteButton}
                      onClick={handleEliminar}
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Tabs Mejorados - MOVIDOS ARRIBA (antes de stats) */}
          <motion.div
            {...styles.animations.fadeInUp}
            transition={{ delay: 0.2 }}
            className={styles.tabsClasses.container}
          >
            <nav
              role='tablist'
              aria-label='Secciones del proyecto'
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
                    {tab.count !== null && (
                      <span className={styles.tabsClasses.tabBadge}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Contenido de Tabs - Componentes Modulares */}
          <div
            role='tabpanel'
            id={`panel-${activeTab}`}
            aria-labelledby={activeTab}
          >
            {activeTab === 'info' && <GeneralTab proyecto={proyecto} />}

            {activeTab === 'documentos' && (
              <DocumentosTab proyecto={proyecto} />
            )}
          </div>
        </div>

        {/* Modal de Confirmación de Eliminación */}
        <Modal
          isOpen={modalEliminar}
          onClose={() => setModalEliminar(false)}
          title='Eliminar Proyecto'
          icon={<Trash2 className='h-6 w-6' />}
          gradientColor='orange'
        >
          <div className='space-y-4'>
            <div className='rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30'>
              <div className='flex items-start gap-3'>
                <Trash2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400' />
                <div className='space-y-1'>
                  <p className='text-sm font-semibold text-red-900 dark:text-red-100'>
                    ⚠️ Esta acción no se puede deshacer
                  </p>
                  <p className='text-xs text-red-700 dark:text-red-300'>
                    Se eliminará el proyecto{' '}
                    <strong>&ldquo;{proyecto.nombre}&rdquo;</strong> y toda su
                    información asociada (manzanas, documentos, etc.).
                  </p>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setModalEliminar(false)}
                className='border-gray-300 dark:border-gray-600'
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarEliminar}
                className='bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Eliminar Proyecto
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </AnimatePresence>
  )
}
