'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Archive, Building2, CheckCircle2, HardHat, Plus } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { construirURLProyecto } from '@/lib/utils/slug.utils'
import {
  EstadoFiltroCards,
  ListPageHeader,
  ListSearchToolbar,
  type EstadoFiltroOpcion,
} from '@/shared/components/list-page'
import { Modal } from '@/shared/components/ui/Modal'
import { NoResults } from '@/shared/components/ui/NoResults'

import {
  useEstadisticasProyectosQuery,
  useProyectosFiltradosQuery,
  useProyectosQuery,
} from '../hooks'
import { proyectosPageStyles as styles } from '../styles/proyectos-page.styles'
import type { Proyecto } from '../types'

import { ArchivarProyectoModal } from './modals/archivar-proyecto-modal'
import { RestaurarProyectoModal } from './modals/restaurar-proyecto-modal'
import { ProyectosEmpty } from './proyectos-empty'
import { ProyectosSkeleton } from './proyectos-skeleton'
import { ProyectosTabla } from './proyectos-tabla'

/**
 * Permisos del usuario (pasados desde Server Component)
 */
interface ProyectosPageProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

/**
 * Página principal de proyectos
 * Orquesta todos los componentes hijos
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Recibe permisos como props desde Server Component
 * - No necesita validar autenticación (ya validada)
 * - Solo maneja UI y lógica de negocio
 */
export function ProyectosPage({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView: _canView = true,
  isAdmin: _isAdmin = false,
}: ProyectosPageProps = {}) {
  // ✅ Debug logs comentados (funcionalidad verificada)
  // console.log('🏗️ [PROYECTOS MAIN] Client Component montado con permisos:', {
  //   canCreate,
  //   canEdit,
  //   canDelete,
  //   canView,
  //   isAdmin,
  // })

  const [modalEliminar, setModalEliminar] = useState(false)
  const [proyectoEliminar, setProyectoEliminar] = useState<string | null>(null)
  const [modalArchivar, setModalArchivar] = useState(false)
  const [proyectoArchivar, setProyectoArchivar] = useState<Proyecto | null>(
    null
  )
  const [modalRestaurar, setModalRestaurar] = useState(false)
  const [proyectoRestaurar, setProyectoRestaurar] = useState<Proyecto | null>(
    null
  )

  const router = useRouter()

  // ✅ REACT QUERY: Hooks con cache inteligente
  const {
    proyectos: todosLosProyectos,
    eliminarProyecto,
    archivarProyecto,
    restaurarProyecto,
    cargando,
    eliminando,
    archivando,
    restaurando,
  } = useProyectosQuery()
  const {
    proyectos: proyectosFiltrados,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
  } = useProyectosFiltradosQuery()
  const estadisticas = useEstadisticasProyectosQuery()

  // ── Tarjetas de conteo = filtro de estado ────────────────────────────────
  // "Archivados" muestra SOLO los archivados (verArchivados trae todos)
  const seleccion = filtros.verArchivados
    ? 'archivados'
    : (filtros.estado ?? 'Todos')
  const proyectos =
    seleccion === 'archivados'
      ? proyectosFiltrados.filter(p => p.archivado)
      : proyectosFiltrados
  const totalArchivados = todosLosProyectos.filter(p => p.archivado).length

  const opcionesEstado: EstadoFiltroOpcion<string>[] = [
    {
      value: 'Todos',
      label: 'Todos',
      count: estadisticas.total,
      icon: Building2,
      gradient: 'from-green-500 to-emerald-600',
      text: 'text-green-700 dark:text-green-400',
      selected:
        'border-green-400 bg-green-50/80 ring-2 ring-green-400/40 dark:border-green-500/60 dark:bg-green-500/10',
    },
    {
      value: 'en_proceso',
      label: 'En ejecución',
      count: estadisticas.enProceso,
      icon: HardHat,
      gradient: 'from-blue-500 to-indigo-600',
      text: 'text-blue-600 dark:text-blue-400',
      selected:
        'border-blue-400 bg-blue-50/80 ring-2 ring-blue-400/40 dark:border-blue-500/60 dark:bg-blue-500/10',
    },
    {
      value: 'completado',
      label: 'Completados',
      count: estadisticas.completados,
      icon: CheckCircle2,
      gradient: 'from-violet-500 to-purple-600',
      text: 'text-violet-600 dark:text-violet-400',
      selected:
        'border-violet-400 bg-violet-50/80 ring-2 ring-violet-400/40 dark:border-violet-500/60 dark:bg-violet-500/10',
    },
    {
      value: 'archivados',
      label: 'Archivados',
      count: totalArchivados,
      icon: Archive,
      gradient: 'from-slate-500 to-slate-700',
      text: 'text-slate-600 dark:text-slate-300',
      selected:
        'border-slate-400 bg-slate-100/80 ring-2 ring-slate-400/40 dark:border-slate-500/60 dark:bg-slate-500/10',
    },
  ]

  const seleccionarEstado = (v: string) => {
    if (v === 'archivados') {
      actualizarFiltros({ verArchivados: true, estado: undefined })
    } else {
      actualizarFiltros({
        verArchivados: false,
        estado: v === 'Todos' ? undefined : (v as Proyecto['estado']),
      })
    }
  }

  // Detectar si hay filtros activos
  const hayFiltrosActivos = Boolean(
    filtros.busqueda || filtros.estado || filtros.verArchivados
  )
  const resultado =
    proyectos.length === 1 ? '1 proyecto' : `${proyectos.length} proyectos`

  // Proyecto que se va a eliminar (lookup por ID)
  const proyectoEliminando = proyectos.find(p => p.id === proyectoEliminar)

  const handleAbrirModal = () => {
    router.push('/proyectos/nuevo')
  }

  const handleEditarProyecto = (proyecto: Proyecto) => {
    router.push(
      `${construirURLProyecto({ id: proyecto.id, nombre: proyecto.nombre })}/editar`
    )
  }

  const handleEliminarProyecto = async (id: string) => {
    setProyectoEliminar(id)
    setModalEliminar(true)
  }

  const confirmarEliminar = async () => {
    if (!proyectoEliminar) return

    try {
      await eliminarProyecto(proyectoEliminar)
      setModalEliminar(false)
      setProyectoEliminar(null)
    } catch {
      // Error ya manejado por React Query con toast
    }
  }

  const handleArchivarProyecto = async (id: string) => {
    const proyecto = proyectos.find(p => p.id === id)
    if (proyecto) {
      setProyectoArchivar(proyecto)
      setModalArchivar(true)
    }
  }

  const confirmarArchivar = async (motivo?: string) => {
    if (!proyectoArchivar) return

    try {
      await archivarProyecto(proyectoArchivar.id, motivo)
      setModalArchivar(false)
      setProyectoArchivar(null)
    } catch {
      // Error ya manejado por React Query con toast
    }
  }

  const handleRestaurarProyecto = async (id: string) => {
    const proyecto = proyectos.find(p => p.id === id)
    if (proyecto) {
      setProyectoRestaurar(proyecto)
      setModalRestaurar(true)
    }
  }

  const confirmarRestaurar = async () => {
    if (!proyectoRestaurar) return

    try {
      await restaurarProyecto(proyectoRestaurar.id)
      setModalRestaurar(false)
      setProyectoRestaurar(null)
    } catch {
      // Error ya manejado por React Query con toast
    }
  }

  return (
    <div className={styles.container.page}>
      {/* Animación simplificada para navegación instantánea */}
      <motion.div
        {...styles.animations.container}
        className={styles.container.content}
      >
        <ListPageHeader
          icon={Building2}
          heroGradient='from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800'
          title='Proyectos'
          subtitle='Desarrollos inmobiliarios y obras en ejecución'
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Proyectos' },
          ]}
          actions={
            canCreate ? (
              <button
                type='button'
                onClick={handleAbrirModal}
                className='inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-green-700 shadow-lg shadow-green-900/20 transition-all hover:-translate-y-0.5 hover:bg-green-50 hover:shadow-xl'
              >
                <Plus className='h-4 w-4' />
                Nuevo proyecto
              </button>
            ) : undefined
          }
        />

        <EstadoFiltroCards
          ariaLabel='Filtrar proyectos por estado'
          opciones={opcionesEstado}
          seleccionado={seleccion}
          onSeleccionar={seleccionarEstado}
        />

        <ListSearchToolbar
          value={filtros.busqueda || ''}
          onChange={v => actualizarFiltros({ busqueda: v })}
          placeholder='Buscar por nombre o ubicación…'
          resultado={resultado}
          onLimpiar={hayFiltrosActivos ? limpiarFiltros : undefined}
        />

        {/* Contenido Principal */}
        {cargando ? (
          <ProyectosSkeleton />
        ) : proyectos.length === 0 ? (
          // Si hay filtros activos pero no hay resultados → NoResults
          // Si NO hay filtros y no hay proyectos → Empty
          hayFiltrosActivos ? (
            <NoResults
              moduleName='proyectos'
              onLimpiarFiltros={limpiarFiltros}
              mensaje={
                filtros.busqueda && filtros.estado
                  ? 'No se encontraron proyectos que coincidan con tu búsqueda y el estado seleccionado'
                  : filtros.busqueda
                    ? 'No se encontraron proyectos que coincidan con tu búsqueda'
                    : filtros.estado
                      ? 'No hay proyectos con el estado seleccionado'
                      : undefined
              }
            />
          ) : (
            <ProyectosEmpty
              onCrear={canCreate ? handleAbrirModal : undefined}
            />
          )
        ) : (
          <ProyectosTabla
            proyectos={proyectos}
            onView={proyecto =>
              router.push(
                construirURLProyecto({
                  id: proyecto.id,
                  nombre: proyecto.nombre,
                })
              )
            }
            onEdit={canEdit ? handleEditarProyecto : undefined}
            onDelete={canDelete ? handleEliminarProyecto : undefined}
            onArchive={canEdit ? handleArchivarProyecto : undefined}
            onRestore={canEdit ? handleRestaurarProyecto : undefined}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )}
      </motion.div>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={modalEliminar}
        onClose={() => {
          setModalEliminar(false)
          setProyectoEliminar(null)
        }}
        title='Eliminar Proyecto'
        description='Esta acción no se puede deshacer'
        size='sm'
        gradientColor='orange'
        compact={true}
      >
        <div className='space-y-3'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            ¿Estas seguro de eliminar{' '}
            <span className='font-semibold text-gray-900 dark:text-gray-100'>
              &quot;{proyectoEliminando?.nombre}&quot;
            </span>
            ?
          </p>
          {proyectoEliminando && proyectoEliminando.manzanas.length > 0 && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-2.5 dark:border-red-800 dark:bg-red-900/20'>
              <p className='text-xs text-red-800 dark:text-red-300'>
                ⚠️ Incluye{' '}
                <strong>{proyectoEliminando.manzanas.length} manzana(s)</strong>
              </p>
            </div>
          )}
          <div className='flex justify-end gap-2 pt-2'>
            <button
              type='button'
              onClick={() => {
                setModalEliminar(false)
                setProyectoEliminar(null)
              }}
              disabled={eliminando}
              className='rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={confirmarEliminar}
              disabled={eliminando}
              className='flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {eliminando && (
                <svg
                  className='h-4 w-4 animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
              )}
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Archivar Proyecto */}
      <ArchivarProyectoModal
        isOpen={modalArchivar}
        nombreProyecto={proyectoArchivar?.nombre || ''}
        onConfirm={confirmarArchivar}
        onCancel={() => {
          setModalArchivar(false)
          setProyectoArchivar(null)
        }}
        archivando={archivando}
      />

      {/* Modal Restaurar Proyecto */}
      <RestaurarProyectoModal
        isOpen={modalRestaurar}
        nombreProyecto={proyectoRestaurar?.nombre || ''}
        fechaArchivado={proyectoRestaurar?.fechaArchivado}
        motivoArchivo={proyectoRestaurar?.motivoArchivo}
        onConfirm={confirmarRestaurar}
        onCancel={() => {
          setModalRestaurar(false)
          setProyectoRestaurar(null)
        }}
        restaurando={restaurando}
      />
    </div>
  )
}
