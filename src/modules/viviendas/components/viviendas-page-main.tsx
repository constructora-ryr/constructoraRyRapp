'use client'

import { motion } from 'framer-motion'
import { Home, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { construirURLVivienda, getShortId } from '@/lib/utils/slug.utils'
import {
  EstadoFiltroCards,
  ListPageHeader,
  ListSearchToolbar,
  type EstadoFiltroOpcion,
} from '@/shared/components/list-page'
import {
  FilterDropdown,
  type FilterOption,
} from '@/shared/components/ui/filter-dropdown'
import { Modal } from '@/shared/components/ui/Modal'
import { NoResults } from '@/shared/components/ui/NoResults'
import { VIVIENDA_ESTADO_BADGE } from '@/shared/config/estados.colors'

import { useViviendasList } from '../hooks/useViviendasList'
import { viviendasStyles as styles } from '../styles/viviendas.styles'
import type { Vivienda } from '../types'

// EditarViviendaModal deprecated — edición en página propia /viviendas/[slug]/editar
import { ViviendasEmpty } from './viviendas-empty'
import { ViviendasSkeleton } from './viviendas-skeleton'
import { ViviendasTabla } from './ViviendasTabla'

/**
 * Permisos del usuario (pasados desde Server Component)
 */
interface _PermisosUsuario {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canView: boolean
  isAdmin: boolean
}

interface ViviendasPageMainProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

/**
 * Página principal de viviendas
 * Orquesta todos los componentes hijos
 * Lógica delegada a useViviendasList
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Recibe permisos como props desde Server Component
 * - No necesita validar autenticación (ya validada)
 * - Solo maneja UI y lógica de negocio
 */
export function ViviendasPageMain({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView: _canView = true,
  isAdmin: _isAdmin = false,
}: ViviendasPageMainProps = {}) {
  const router = useRouter()
  const {
    viviendasFiltradas, // Para tabla (todas filtradas)
    cargando,
    modalEliminar,
    viviendaEliminar,
    abrirModalEliminar,
    confirmarEliminar,
    cancelarEliminar,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    refrescar: _refrescar,
    estadisticas,
    totalFiltradas,
    proyectos,
  } = useViviendasList()

  // Hook para preferencia de vista eliminado: solo vista tabla

  const handleVerDetalle = (vivienda: Vivienda) => {
    // Validar que tenemos id y numero
    if (!vivienda?.id || !vivienda?.numero) {
      toast.error('Error: Datos de vivienda incompletos')
      return
    }

    // Construir URL amigable con slug
    const url = construirURLVivienda(
      {
        id: vivienda.id,
        numero: vivienda.numero,
      },
      vivienda.manzanas?.nombre || undefined,
      vivienda.manzanas?.proyectos?.nombre || undefined
    )
    router.push(url as string)
  }

  // ============================================
  // HANDLER: EDITAR VIVIENDA — navega a página propia
  // ============================================
  const handleEditarVivienda = (vivienda: Vivienda) => {
    router.push(`/viviendas/${getShortId(vivienda.id)}/editar`)
  }

  // ── Tarjetas de conteo = filtro de estado ────────────────────────────────
  const conEstilo = (estado: string) => {
    const cfg = VIVIENDA_ESTADO_BADGE[estado]
    return {
      icon: cfg.icon,
      gradient: cfg.gradient,
      text: cfg.text,
      selected: cfg.selected,
    }
  }
  const opcionesEstado: EstadoFiltroOpcion<string>[] = [
    {
      value: 'Todos',
      label: 'Todas',
      count: estadisticas.total,
      icon: Home,
      gradient: 'from-orange-500 to-amber-600',
      text: 'text-orange-700 dark:text-orange-400',
      selected:
        'border-orange-400 bg-orange-50/80 ring-2 ring-orange-400/40 dark:border-orange-500/60 dark:bg-orange-500/10',
    },
    {
      value: 'Disponible',
      label: 'Disponibles',
      count: estadisticas.disponibles,
      ...conEstilo('Disponible'),
    },
    {
      value: 'Asignada',
      label: 'Asignadas',
      count: estadisticas.asignadas,
      ...conEstilo('Asignada'),
    },
    {
      value: 'Entregada',
      label: 'Escrituradas',
      count: estadisticas.entregadas,
      ...conEstilo('Entregada'),
    },
    {
      value: 'Propietario',
      label: 'Saldadas',
      count: estadisticas.propietario,
      ...conEstilo('Propietario'),
    },
  ]

  const proyectoOptions: FilterOption[] = [
    { value: '', label: 'Todos los proyectos' },
    ...proyectos.map(p => ({ value: p.id, label: p.nombre })),
  ]

  const hayFiltros = !!(filtros.search || filtros.proyecto_id || filtros.estado)
  const resultado =
    totalFiltradas === estadisticas.total
      ? `${estadisticas.total} vivienda${estadisticas.total !== 1 ? 's' : ''}`
      : `${totalFiltradas} de ${estadisticas.total} viviendas`

  // Buscar en viviendasFiltradas para que funcione en ambas vistas
  const viviendaEliminando = viviendasFiltradas?.find(
    v => v.id === viviendaEliminar
  )

  return (
    <div className={styles.container.page}>
      {/* Animación simplificada para navegación instantánea */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={styles.container.content}
      >
        <ListPageHeader
          icon={Home}
          heroGradient='from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-amber-800'
          title='Viviendas'
          subtitle='Inventario de casas y estado de cada unidad'
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Viviendas' },
          ]}
          actions={
            canCreate ? (
              <button
                type='button'
                onClick={() => router.push('/viviendas/nueva')}
                className='inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-orange-700 shadow-lg shadow-orange-900/20 transition-all hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-xl'
              >
                <Plus className='h-4 w-4' />
                Nueva vivienda
              </button>
            ) : undefined
          }
        />

        <EstadoFiltroCards
          ariaLabel='Filtrar viviendas por estado'
          opciones={opcionesEstado}
          seleccionado={filtros.estado || 'Todos'}
          onSeleccionar={v =>
            actualizarFiltros({ estado: v === 'Todos' ? '' : v })
          }
          total={estadisticas.total}
        />

        <ListSearchToolbar
          value={filtros.search}
          onChange={v => actualizarFiltros({ search: v })}
          placeholder='Buscar por casa (A1), cliente, matrícula o dirección…'
          resultado={resultado}
          onLimpiar={hayFiltros ? limpiarFiltros : undefined}
        >
          {proyectos.length > 1 && (
            <FilterDropdown
              value={filtros.proyecto_id}
              placeholder='Todos los proyectos'
              options={proyectoOptions}
              onChange={v => actualizarFiltros({ proyecto_id: v })}
            />
          )}
        </ListSearchToolbar>

        {/* Contenido Principal */}
        {cargando ? (
          <ViviendasSkeleton />
        ) : viviendasFiltradas.length === 0 ? (
          filtros.search ||
          filtros.estado ||
          filtros.proyecto_id ||
          filtros.manzana_id ? (
            <NoResults
              moduleName='viviendas'
              onLimpiarFiltros={limpiarFiltros}
              mensaje='No se encontraron viviendas con los filtros aplicados'
            />
          ) : (
            <ViviendasEmpty onCrear={() => router.push('/viviendas/nueva')} />
          )
        ) : (
          <ViviendasTabla
            viviendas={viviendasFiltradas}
            onView={handleVerDetalle}
            onEdit={canEdit ? handleEditarVivienda : undefined}
            onDelete={abrirModalEliminar}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )}
      </motion.div>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={modalEliminar}
        onClose={cancelarEliminar}
        title='Eliminar Vivienda'
        description='Esta acción no se puede deshacer'
        size='sm'
      >
        <div className='space-y-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            ¿Estás seguro de que deseas eliminar la vivienda{' '}
            <span className='font-semibold text-gray-900 dark:text-gray-100'>
              &quot;#{viviendaEliminando?.numero}&quot;
            </span>
            ?
          </p>

          {viviendaEliminando?.matricula_inmobiliaria && (
            <div className={styles.deleteModal.warning}>
              <p className={styles.deleteModal.warningText}>
                ⚠️ Matrícula:{' '}
                <strong>{viviendaEliminando.matricula_inmobiliaria}</strong>
              </p>
            </div>
          )}

          <div className={styles.deleteModal.actions}>
            <button
              type='button'
              onClick={cancelarEliminar}
              disabled={cargando}
              className={styles.deleteModal.cancelButton}
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={confirmarEliminar}
              disabled={cargando}
              className={styles.deleteModal.deleteButton}
            >
              {cargando ? 'Eliminando...' : 'Eliminar Vivienda'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
