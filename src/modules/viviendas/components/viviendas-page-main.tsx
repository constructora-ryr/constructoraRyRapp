'use client'

import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { construirURLVivienda } from '@/lib/utils/slug.utils'
import { Modal } from '@/shared/components/ui/Modal'
import { NoResults } from '@/shared/components/ui/NoResults'

import { useViviendasList } from '../hooks/useViviendasList'
import { viviendasStyles as styles } from '../styles/viviendas.styles'
import type { Vivienda } from '../types'

// EditarViviendaModal deprecated — edición en página propia /viviendas/[slug]/editar
import { ViviendasEmpty } from './viviendas-empty'
import { ViviendasHeader } from './viviendas-header'
import { ViviendasSkeleton } from './viviendas-skeleton'
import { ViviendasStats } from './viviendas-stats'
import { ViviendasFiltrosPremium } from './ViviendasFiltrosPremium'
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
    const url = construirURLVivienda(
      { id: vivienda.id, numero: vivienda.numero },
      vivienda.manzanas?.nombre || undefined,
      vivienda.manzanas?.proyectos?.nombre || undefined
    )
    router.push(`${url}/editar`)
  }

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
        {/* Header - Navegación a vista dedicada */}
        <ViviendasHeader
          totalViviendas={estadisticas.total}
          canCreate={canCreate}
        />

        {/* Estadísticas */}
        <ViviendasStats
          total={estadisticas.total}
          disponibles={estadisticas.disponibles}
          asignadas={estadisticas.asignadas}
          entregadas={estadisticas.entregadas}
          propietario={estadisticas.propietario}
          valorTotal={estadisticas.valorTotal}
        />

        {/* Filtros Premium */}
        <ViviendasFiltrosPremium
          filtros={filtros}
          onActualizarFiltros={actualizarFiltros}
          onLimpiarFiltros={limpiarFiltros}
          totalResultados={totalFiltradas}
          proyectos={proyectos}
        />

        {/* Contenido Principal */}
        {cargando ? (
          <ViviendasSkeleton />
        ) : estadisticas.total === 0 ? (
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
