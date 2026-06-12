/**
 * ClientesTabla - Vista de tabla para clientes
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ Usa DataTable genérico
 * ✅ Columnas específicas de Clientes
 * ✅ Diseño compacto y alineado
 * ✅ Colores purple/violet del módulo
 */

'use client'

import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import {
  Building2,
  Edit2,
  Heart,
  Star,
  Trash2,
  User,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react'

import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { DataTable } from '@/shared/components/table/DataTable'
import { cn } from '@/shared/utils/helpers'

import type { ClienteResumen } from '../types'

interface ClientesTablaProps {
  clientes: ClienteResumen[]
  onView?: (cliente: ClienteResumen) => void
  onEdit?: (cliente: ClienteResumen) => void
  onDelete?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
  initialSorting?: SortingState
}

// Estilos compactos del módulo
const styles = {
  // Container para células con icono
  iconCell: {
    container: 'flex items-center gap-1.5',
    icon: 'w-3 h-3 flex-shrink-0',
    text: 'text-xs font-medium text-gray-700 dark:text-gray-300 truncate',
  },

  // Badges de estado
  badge: {
    base: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold whitespace-nowrap border',
    interesado:
      'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400',
    activo:
      'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400',
    renuncio:
      'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400',
    inactivo:
      'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400',
    propietario:
      'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
  },

  // Badge de origen (cyan/blue del módulo)
  origenBadge:
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold',

  // Células genéricas
  cell: {
    center: 'flex items-center justify-center',
    textCompact:
      'text-xs font-medium text-gray-700 dark:text-gray-300 truncate',
  },

  // Acciones (cyan/blue del módulo)
  actions: {
    container: 'flex items-center justify-center gap-1',
    button: 'p-1.5 rounded-lg transition-all',
    view: 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30',
    edit: 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    delete:
      'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30',
  },
}

export function ClientesTabla({
  clientes,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  initialSorting,
}: ClientesTablaProps) {
  const columns: ColumnDef<ClienteResumen>[] = [
    // 1. CLIENTE (nombre formateado con Title Case - SIN TRUNCAR)
    {
      accessorKey: 'nombre_completo',
      header: 'Cliente',
      size: 260,
      cell: ({ row }) => {
        const nombreCompleto = formatNombreCompleto(
          row.original.nombre_completo
        )
        const estado = row.original.estado
        const isActivo = estado === 'Activo'
        const isRenuncio = estado === 'Renunció'
        const isPropietario =
          estado === 'Propietario' ||
          (estado === 'Activo' &&
            (row.original.vivienda?.saldo_pendiente ?? 1) === 0)

        return (
          <div className={styles.iconCell.container}>
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                isPropietario
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                  : isActivo
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : isRenuncio
                      ? 'bg-gradient-to-br from-red-500 to-rose-600'
                      : 'bg-gradient-to-br from-cyan-500 to-blue-600'
              }`}
            >
              {isPropietario ? (
                <Star className='h-3.5 w-3.5 fill-white text-white' />
              ) : isActivo ? (
                <UserCheck className='h-3.5 w-3.5 text-white' />
              ) : isRenuncio ? (
                <UserX className='h-3.5 w-3.5 text-white' />
              ) : (
                <User className='h-3.5 w-3.5 text-white' />
              )}
            </div>
            <span
              className='text-xs font-bold text-gray-900 dark:text-white'
              title={nombreCompleto}
            >
              {nombreCompleto}
            </span>
          </div>
        )
      },
    },

    // 2. DOCUMENTO (CC 12345678)
    {
      accessorKey: 'numero_documento',
      header: 'Documento',
      size: 110,
      cell: ({ row }) => (
        <span className='font-mono text-xs text-gray-600 dark:text-gray-400'>
          CC {row.original.numero_documento}
        </span>
      ),
    },

    // 4. ESTADO (badge con colores)
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 120,
      cell: ({ row }) => {
        const estado = row.original.estado
        const pagadoCompleto =
          estado === 'Propietario' ||
          (estado === 'Activo' &&
            (row.original.vivienda?.saldo_pendiente ?? 1) === 0)
        const isInteresado = estado === 'Interesado'
        const isActivo = estado === 'Activo' && !pagadoCompleto
        const isRenuncio = estado === 'Renunció'
        const isInactivo = estado === 'Inactivo'

        const Icon = pagadoCompleto
          ? Star
          : isInteresado
            ? Heart
            : isActivo
              ? UserCheck
              : isRenuncio || isInactivo
                ? UserX
                : Users

        return (
          <div className={styles.cell.center}>
            <div
              className={cn(
                styles.badge.base,
                pagadoCompleto && styles.badge.propietario,
                isInteresado && styles.badge.interesado,
                isActivo && styles.badge.activo,
                isRenuncio && styles.badge.renuncio,
                isInactivo && styles.badge.inactivo
              )}
            >
              <Icon
                className={`h-3 w-3 flex-shrink-0 ${pagadoCompleto ? 'fill-amber-500 dark:fill-amber-400' : ''}`}
              />
              <span>{pagadoCompleto ? 'Propietario' : estado}</span>
            </div>
          </div>
        )
      },
    },

    // 5. PROYECTO (nowrap — sin salto de línea, sin puntos suspensivos)
    {
      id: 'proyecto',
      header: 'Proyecto',
      size: 160,
      cell: ({ row }) => {
        const cliente = row.original
        const proyecto =
          cliente.estado === 'Activo' || cliente.estado === 'Propietario'
            ? cliente.vivienda?.nombre_proyecto
            : cliente.estado === 'Interesado'
              ? cliente.interes?.nombre_proyecto
              : null

        return (
          <div className={styles.cell.center}>
            {proyecto ? (
              <div className='flex max-w-full items-center gap-1.5 overflow-hidden'>
                <Building2 className='h-3.5 w-3.5 flex-shrink-0 text-green-600 dark:text-green-400' />
                <span
                  className='overflow-hidden whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white'
                  title={proyecto}
                >
                  {proyecto}
                </span>
              </div>
            ) : (
              <span className='text-xs text-gray-400 dark:text-gray-500'>
                —
              </span>
            )}
          </div>
        )
      },
    },

    // 6. VIVIENDA (formato compacto con badge de estado - SORTABLE)
    {
      id: 'vivienda',
      header: 'Vivienda',
      size: 100,
      enableSorting: true,
      // AccessorFn para que TanStack Table reconozca el valor
      accessorFn: row => {
        if (
          (row.estado === 'Activo' || row.estado === 'Propietario') &&
          row.vivienda
        ) {
          const manzana = row.vivienda.nombre_manzana || ''
          const numero = row.vivienda.numero_vivienda || ''
          return `${manzana}${numero}`
        } else if (row.estado === 'Interesado' && row.interes) {
          const manzana = row.interes.nombre_manzana || ''
          const numero = row.interes.numero_vivienda || ''
          return `${manzana}${numero}`
        }
        return ''
      },
      sortingFn: (rowA, rowB) => {
        const clienteA = rowA.original
        const clienteB = rowB.original

        // Obtener identificador de vivienda (manzana + numero)
        const getViviendaId = (cliente: ClienteResumen) => {
          if (
            (cliente.estado === 'Activo' || cliente.estado === 'Propietario') &&
            cliente.vivienda
          ) {
            const manzana = cliente.vivienda.nombre_manzana || ''
            const numero = cliente.vivienda.numero_vivienda || ''
            return `${manzana}${numero}`
          } else if (cliente.estado === 'Interesado' && cliente.interes) {
            const manzana = cliente.interes.nombre_manzana || ''
            const numero = cliente.interes.numero_vivienda || ''
            return `${manzana}${numero}`
          }
          return ''
        }

        const viviendaA = getViviendaId(clienteA)
        const viviendaB = getViviendaId(clienteB)

        // Si alguno está vacío, ponerlo al final
        if (!viviendaA && viviendaB) return 1
        if (viviendaA && !viviendaB) return -1
        if (!viviendaA && !viviendaB) return 0

        // Ordenar alfabéticamente (A1, A2, A3, B1, B2...)
        return viviendaA.localeCompare(viviendaB, undefined, { numeric: true })
      },
      cell: ({ row }) => {
        const cliente = row.original
        let viviendaCompacta = null
        let esInteres = false
        const esPropietarioVivienda =
          cliente.estado === 'Propietario' ||
          (cliente.estado === 'Activo' &&
            (cliente.vivienda?.saldo_pendiente ?? 1) === 0)

        if (
          (cliente.estado === 'Activo' || cliente.estado === 'Propietario') &&
          cliente.vivienda
        ) {
          const manzana = cliente.vivienda.nombre_manzana || ''
          const numero = cliente.vivienda.numero_vivienda || ''
          viviendaCompacta = `${manzana}${numero}`
          esInteres = false
        } else if (cliente.estado === 'Interesado' && cliente.interes) {
          const manzana = cliente.interes.nombre_manzana || ''
          const numero = cliente.interes.numero_vivienda || ''
          viviendaCompacta = `${manzana}${numero}`
          esInteres = true
        }

        return viviendaCompacta ? (
          <div className='flex h-full items-center justify-center'>
            {esInteres ? (
              <span className='inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-100 px-2.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300'>
                <Heart className='h-3.5 w-3.5' />
                {viviendaCompacta}
              </span>
            ) : esPropietarioVivienda ? (
              // Badge dorado para PROPIETARIO
              <span className='inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 shadow-sm dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-300'>
                <Star className='h-3.5 w-3.5 fill-amber-500 dark:fill-amber-400' />
                {viviendaCompacta}
              </span>
            ) : (
              // Badge verde con checkmark para ACTIVO
              <span className='inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-100 px-2.5 py-1.5 text-xs font-bold text-green-700 shadow-sm dark:border-green-800 dark:bg-green-950/30 dark:text-green-300'>
                <UserCheck className='h-3.5 w-3.5' />
                {viviendaCompacta}
              </span>
            )}
          </div>
        ) : (
          <div className={styles.cell.center}>
            <span className='text-xs text-gray-400 dark:text-gray-500'>—</span>
          </div>
        )
      },
    },

    // 7a. SALDO (texto: pendiente / total)
    {
      id: 'saldo',
      header: 'Saldo',
      size: 155,
      cell: ({ row }) => {
        const cliente = row.original
        if (
          (cliente.estado === 'Activo' || cliente.estado === 'Propietario') &&
          cliente.vivienda
        ) {
          const valorTotal =
            cliente.vivienda.valor_total_pagar ||
            cliente.vivienda.valor_total ||
            0
          const saldo = cliente.vivienda.saldo_pendiente || 0
          const pagadoCompleto = saldo === 0 && valorTotal > 0
          const fmt = (v: number) =>
            new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
              .format(v)
              .replace(/\s/g, '')
          return (
            <div className='flex flex-col items-center gap-0.5 py-0.5'>
              <span
                className={`font-mono text-xs font-bold leading-tight ${
                  pagadoCompleto
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400'
                }`}
              >
                {pagadoCompleto ? '✓ Pagado' : fmt(saldo)}
              </span>
              <span className='font-mono text-[10px] leading-none text-gray-400 dark:text-gray-500'>
                de {fmt(valorTotal)}
              </span>
            </div>
          )
        }
        return (
          <div className={styles.cell.center}>
            <span className='text-xs text-gray-400 dark:text-gray-500'>—</span>
          </div>
        )
      },
    },

    // 7b. PROGRESO (anillo circular SVG)
    {
      id: 'progreso',
      header: 'Progreso',
      size: 72,
      cell: ({ row }) => {
        const cliente = row.original
        if (
          (cliente.estado === 'Activo' || cliente.estado === 'Propietario') &&
          cliente.vivienda
        ) {
          const valorTotal =
            cliente.vivienda.valor_total_pagar ||
            cliente.vivienda.valor_total ||
            0
          const totalAbonado = cliente.vivienda.total_abonado || 0
          const saldo = cliente.vivienda.saldo_pendiente || 0
          const pagadoCompleto = saldo === 0 && valorTotal > 0
          const porcentaje = pagadoCompleto
            ? 100
            : valorTotal > 0
              ? Math.min(Math.round((totalAbonado / valorTotal) * 100), 100)
              : 0
          if (pagadoCompleto) {
            return (
              <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
                ✓ Pagado
              </span>
            )
          }
          const barColor = porcentaje >= 50 ? 'bg-blue-500' : 'bg-amber-500'
          const textColor =
            porcentaje >= 50
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-amber-600 dark:text-amber-400'
          return (
            <div className='w-full min-w-[80px] px-1'>
              <span className={`text-xs font-semibold ${textColor}`}>
                {porcentaje}%
              </span>
              <div className='mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
          )
        }
        return (
          <div className={styles.cell.center}>
            <span className='text-xs text-gray-400 dark:text-gray-500'>—</span>
          </div>
        )
      },
    },

    // 8. ACCIONES (botones contextuales)
    {
      id: 'acciones',
      header: 'Acciones',
      size: 80,
      cell: ({ row }) => (
        <div className={styles.actions.container}>
          {canEdit && onEdit && (
            <button
              onClick={e => {
                e.stopPropagation()
                onEdit(row.original)
              }}
              className={cn(styles.actions.button, styles.actions.edit)}
              title='Editar'
            >
              <Edit2 className='h-3.5 w-3.5' />
            </button>
          )}
          {canDelete &&
            onDelete &&
            row.original.estadisticas.negociaciones_activas === 0 &&
            row.original.estado !== 'Propietario' &&
            row.original.estado !== 'En Proceso de Renuncia' && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onDelete(row.original.id)
                }}
                className={cn(styles.actions.button, styles.actions.delete)}
                title='Eliminar'
              >
                <Trash2 className='h-3.5 w-3.5' />
              </button>
            )}
        </div>
      ),
    },
  ]

  return (
    <div className='clientes-tabla-wrapper w-full'>
      <style jsx>{`
        .clientes-tabla-wrapper :global(thead) {
          background: linear-gradient(
            135deg,
            #0891b2 0%,
            #6366f1 50%,
            #8b5cf6 100%
          ) !important;
        }
        .clientes-tabla-wrapper :global(thead th) {
          color: white !important;
          font-weight: 600 !important;
        }
        .clientes-tabla-wrapper :global(thead button) {
          color: white !important;
        }
        .clientes-tabla-wrapper :global(thead .opacity-40) {
          opacity: 0.6 !important;
        }
        .clientes-tabla-wrapper :global(tbody tr:hover) {
          background: linear-gradient(
            90deg,
            rgba(8, 145, 178, 0.05) 0%,
            rgba(99, 102, 241, 0.05) 50%,
            rgba(139, 92, 246, 0.05) 100%
          ) !important;
        }
        .clientes-tabla-wrapper :global(tbody tr) {
          transition: all 0.2s ease;
        }
      `}</style>
      <DataTable
        columns={columns}
        data={clientes}
        initialSorting={initialSorting}
        onRowClick={onView}
      />
    </div>
  )
}
