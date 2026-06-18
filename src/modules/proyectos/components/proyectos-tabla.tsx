/**
 * ProyectosTabla - Vista de tabla para proyectos
 * ✅ Usa DataTable genérico
 * ✅ Columnas específicas de proyectos
 * ✅ Diseño compacto y alineado
 */

'use client'

import { type ColumnDef } from '@tanstack/react-table'
import {
  Archive,
  ArchiveRestore,
  Boxes,
  Building2,
  CheckCircle2,
  Clock,
  Edit2,
  MapPin,
  Trash2,
} from 'lucide-react'

import { toTitleCase } from '@/lib/utils/string.utils'
import { DataTable } from '@/shared/components/table/DataTable'
import { cn } from '@/shared/utils/helpers'

import { useProyectoTabla } from '../hooks/useProyectoTabla'
import type { Proyecto } from '../types'
import { formatearEstadoProyecto } from '../utils/estado.utils'

import { proyectosTablaStyles as styles } from './proyectos-tabla.styles'

interface ProyectosTablaProps {
  proyectos: Proyecto[]
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
  onView?: (proyecto: Proyecto) => void
  onArchive?: (id: string) => void
  onRestore?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ProyectosTabla({
  proyectos,
  onEdit,
  onDelete,
  onView,
  onArchive,
  onRestore,
  canEdit,
  canDelete,
}: ProyectosTablaProps) {
  // Componente interno para estadísticas de viviendas (usa hook)
  function ViviendaEstadisticas({ proyecto }: { proyecto: Proyecto }) {
    const stats = useProyectoTabla(proyecto)

    return (
      <div className={styles.viviendas.container}>
        <div className={styles.progressBar.container}>
          <span className={styles.progressBar.label}>
            {stats.totalVendidas + stats.totalAsignadas}/{stats.totalViviendas}
          </span>
          <div className={styles.progressBar.track}>
            <div
              className={styles.progressBar.fillVendidas}
              style={{ width: `${stats.porcentajeVendidas}%` }}
            />
            <div
              className={styles.progressBar.fillAsignadas}
              style={{
                left: `${stats.porcentajeVendidas}%`,
                width: `${stats.porcentajeAsignadas}%`,
              }}
            />
          </div>
        </div>
        <div className={styles.viviendas.legend}>
          <span className={styles.viviendas.legendVendidas}>
            • {stats.totalVendidas} vend.
          </span>
          <span className={styles.viviendas.legendAsignadas}>
            • {stats.totalAsignadas} asig.
          </span>
          <span className={styles.viviendas.legendDisponibles}>
            • {stats.totalDisponibles} disp.
          </span>
        </div>
      </div>
    )
  }

  const columns: ColumnDef<Proyecto>[] = [
    {
      accessorKey: 'nombre',
      header: () => <div className={styles.header.wrapper}>Proyecto</div>,
      size: 220,
      cell: ({ row }) => (
        <div className={styles.nombre.container}>
          <div className={styles.iconContainer}>
            <Building2 className={styles.iconSvg} />
          </div>
          <span className={styles.nombre.text}>
            {toTitleCase(row.original.nombre)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'ubicacion',
      header: () => <div className={styles.header.wrapper}>Ubicación</div>,
      size: 180,
      cell: ({ row }) => (
        <div className={styles.ubicacion.container}>
          <MapPin className={styles.ubicacion.icon} />
          <span className={styles.ubicacion.text}>
            {toTitleCase(row.original.ubicacion)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'estado',
      header: () => <div className={styles.header.wrapper}>Estado</div>,
      size: 140,
      cell: ({ row }) => {
        const estado = row.original.estado
        const archivado = row.original.archivado
        const esEnProceso =
          estado === 'en_proceso' || estado === 'en_construccion'
        const esCompletado = estado === 'completado'

        if (archivado) {
          return (
            <div className={styles.cell.center}>
              <div className={cn(styles.badge.base, styles.badge.archivado)}>
                <Archive className='h-3 w-3 flex-shrink-0' />
                <span>Archivado</span>
              </div>
            </div>
          )
        }

        return (
          <div className={styles.cell.center}>
            <div
              className={cn(
                styles.badge.base,
                esCompletado && styles.badge.completado,
                esEnProceso && styles.badge.enProceso,
                !esEnProceso && !esCompletado && styles.badge.default
              )}
            >
              {esCompletado ? (
                <CheckCircle2 className='h-3 w-3 flex-shrink-0' />
              ) : esEnProceso ? (
                <Clock className='h-3 w-3 flex-shrink-0' />
              ) : null}
              <span>{formatearEstadoProyecto(estado)}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'manzanas',
      header: () => <div className={styles.header.wrapper}>Manzanas</div>,
      size: 90,
      cell: ({ row }) => (
        <div className={styles.cell.center}>
          <div className={styles.manzanasBadge}>
            <Boxes className={styles.manzanasIcon} />
            <span className={styles.manzanasCount}>
              {row.original.manzanas.length}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'viviendas_resumen',
      header: () => <div className={styles.header.wrapper}>Viviendas</div>,
      size: 200,
      cell: ({ row }) => <ViviendaEstadisticas proyecto={row.original} />,
    },
    {
      id: 'acciones',
      header: () => <div className={styles.header.wrapper}>Acciones</div>,
      size: 120,
      cell: ({ row }) => (
        <div className={styles.actions.container}>
          {canEdit && onEdit && !row.original.archivado && (
            <button
              onClick={e => {
                e.stopPropagation()
                onEdit(row.original)
              }}
              className={cn(
                styles.actions.button.base,
                styles.actions.button.edit
              )}
              title='Editar proyecto'
            >
              <Edit2 className={styles.actions.icon} />
            </button>
          )}
          {row.original.archivado
            ? canEdit &&
              onRestore && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onRestore(row.original.id)
                  }}
                  className={cn(
                    styles.actions.button.base,
                    'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                  )}
                  title='Restaurar proyecto'
                >
                  <ArchiveRestore className={styles.actions.icon} />
                </button>
              )
            : canEdit &&
              onArchive && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onArchive(row.original.id)
                  }}
                  className={cn(
                    styles.actions.button.base,
                    'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
                  )}
                  title='Archivar proyecto'
                >
                  <Archive className={styles.actions.icon} />
                </button>
              )}
          {canDelete && onDelete && (
            <button
              onClick={e => {
                if (row.original.manzanas.length > 0) return
                e.stopPropagation()
                onDelete(row.original.id)
              }}
              disabled={row.original.manzanas.length > 0}
              className={cn(
                styles.actions.button.base,
                row.original.manzanas.length > 0
                  ? 'cursor-not-allowed opacity-30'
                  : styles.actions.button.delete
              )}
              title={
                row.original.manzanas.length > 0
                  ? 'No se puede eliminar: el proyecto tiene manzanas'
                  : 'Eliminar proyecto'
              }
            >
              <Trash2 className={styles.actions.icon} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={proyectos}
      gradientColor='green'
      pageSize={20}
      showPagination={true}
      onRowClick={onView}
    />
  )
}
