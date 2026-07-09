/**
 * ViviendasTabla - Vista de tabla para viviendas
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ Usa DataTable genérico
 * ✅ Columnas específicas de Viviendas
 * ✅ Diseño compacto y alineado
 * ✅ Colores naranja/ámbar del módulo
 */

'use client'

import { type ColumnDef } from '@tanstack/react-table'
import {
  Building2,
  CheckCircle2,
  Clock,
  Edit2,
  Home,
  Trash2,
} from 'lucide-react'

import { toTitleCase } from '@/lib/utils/string.utils'
import { DataTable } from '@/shared/components/table/DataTable'
import { cn } from '@/shared/utils/helpers'

import { ESTADO_LABELS } from '../constants'
import type { Vivienda } from '../types'

import { viviendasTablaStyles as styles } from './ViviendasTabla.styles'

interface ViviendasTablaProps {
  viviendas: Vivienda[]
  onView?: (vivienda: Vivienda) => void
  onEdit?: (vivienda: Vivienda) => void
  onDelete?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ViviendasTabla({
  viviendas,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ViviendasTablaProps) {
  const columns: ColumnDef<Vivienda>[] = [
    // Identificador Completo (Manzana + Número) - COMPACTO
    {
      id: 'identificador',
      header: 'Vivienda',
      size: 130,
      accessorFn: row => `${row.manzanas?.nombre || ''} ${row.numero}`,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const manzanaA = rowA.original.manzanas?.nombre || ''
        const manzanaB = rowB.original.manzanas?.nombre || ''
        const numeroA = rowA.original.numero
        const numeroB = rowB.original.numero

        // Ordenar primero por manzana, luego por número
        if (manzanaA !== manzanaB) {
          return manzanaA.localeCompare(manzanaB)
        }

        // ✅ Ordenamiento numérico correcto (convierte string a número)
        const numA = parseInt(numeroA, 10) || 0
        const numB = parseInt(numeroB, 10) || 0
        return numA - numB
      },
      cell: ({ row }) => {
        const identificador = `Mz. ${row.original.manzanas?.nombre || 'N/A'} Casa ${row.original.numero}`
        return (
          <div className={styles.numero.container}>
            <div className={styles.iconContainer}>
              <Home className={styles.iconSvg} />
            </div>
            <span className={styles.numero.text}>{identificador}</span>
          </div>
        )
      },
    },

    // Proyecto (solo nombre) - COMPACTO
    {
      id: 'proyecto',
      header: 'Proyecto',
      size: 140,
      accessorFn: row => row.manzanas?.proyectos?.nombre || '',
      cell: ({ row }) => {
        const nombreProyecto =
          toTitleCase(row.original.manzanas?.proyectos?.nombre) ||
          'Sin proyecto'
        return (
          <div className='flex items-center gap-1.5'>
            <Building2 className='h-3 w-3 flex-shrink-0 text-orange-600 dark:text-orange-400' />
            <span className={styles.proyecto.nombre} title={nombreProyecto}>
              {nombreProyecto}
            </span>
          </div>
        )
      },
    },

    // Nomenclatura - MÁS COMPACTO
    {
      accessorKey: 'nomenclatura',
      header: 'Nomenclatura',
      size: 110,
      cell: ({ row }) => (
        <div className={styles.cell.center}>
          <span
            className={styles.cell.textCompact}
            title={toTitleCase(row.original.nomenclatura) || 'N/A'}
          >
            {toTitleCase(row.original.nomenclatura) || 'N/A'}
          </span>
        </div>
      ),
    },

    // Matrícula Inmobiliaria - MÁS COMPACTO
    {
      accessorKey: 'matricula_inmobiliaria',
      header: 'Matrícula',
      size: 100,
      cell: ({ row }) => (
        <div className={styles.cell.center}>
          <span
            className={styles.cell.textCompact}
            title={row.original.matricula_inmobiliaria || 'N/A'}
          >
            {row.original.matricula_inmobiliaria || 'N/A'}
          </span>
        </div>
      ),
    },

    // Tipo de Vivienda - REDUCIDO
    {
      accessorKey: 'tipo_vivienda',
      header: 'Tipo',
      size: 80,
      cell: ({ row }) => (
        <div className={styles.cell.center}>
          <span className={styles.cell.textCompact}>
            {toTitleCase(row.original.tipo_vivienda) || 'N/A'}
          </span>
        </div>
      ),
    },

    // Estado - COMPACTO
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 110,
      cell: ({ row }) => {
        const estado = row.original.estado
        const esDisponible = estado === 'Disponible'
        const esAsignada = estado === 'Asignada'
        const esEntregada = estado === 'Entregada'
        const esPropietario = estado === 'Propietario'

        return (
          <div className={styles.cell.center}>
            <div
              className={cn(
                styles.badge.base,
                esDisponible && styles.badge.disponible,
                esAsignada && styles.badge.asignada,
                esEntregada && styles.badge.entregada,
                esPropietario && styles.badge.propietario,
                !esDisponible &&
                  !esAsignada &&
                  !esEntregada &&
                  !esPropietario &&
                  styles.badge.default
              )}
            >
              {esDisponible ? (
                <CheckCircle2 className='h-3 w-3 flex-shrink-0' />
              ) : esAsignada ? (
                <Clock className='h-3 w-3 flex-shrink-0' />
              ) : esEntregada || esPropietario ? (
                <CheckCircle2 className='h-3 w-3 flex-shrink-0' />
              ) : null}
              <span>
                {ESTADO_LABELS[estado as keyof typeof ESTADO_LABELS] ?? estado}
              </span>
            </div>
          </div>
        )
      },
    },

    // Valor (valor total / saldo pendiente según estado)
    {
      id: 'saldo',
      header: 'Valor',
      size: 155,
      accessorFn: row => row.saldo_pendiente || 0,
      enableSorting: true,
      cell: ({ row }) => {
        const estaAsignada =
          row.original.estado === 'Asignada' ||
          row.original.estado === 'Entregada' ||
          row.original.estado === 'Propietario'
        if (!estaAsignada) {
          return (
            <div className={styles.cell.center}>
              <div className='flex flex-col items-center gap-0.5 py-0.5'>
                <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                  }).format(row.original.valor_total || 0)}
                </span>
                <span className='text-[10px] text-gray-400 dark:text-gray-500'>
                  Valor total
                </span>
              </div>
            </div>
          )
        }
        const valorTotal = row.original.valor_total || 0
        const valorRef = row.original.valor_negociado || valorTotal
        const saldo = row.original.saldo_pendiente || 0
        const pagadoCompleto = saldo === 0 && valorRef > 0
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
              className={`text-xs font-bold leading-tight ${
                pagadoCompleto
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              {pagadoCompleto ? '✓ Pagado' : fmt(saldo)}
            </span>
            <span className='text-[10px] leading-none text-gray-400 dark:text-gray-500'>
              de {fmt(valorRef)}
            </span>
          </div>
        )
      },
    },

    // Progreso (anillo circular)
    {
      id: 'progreso',
      header: 'Progreso',
      size: 72,
      accessorFn: row => row.porcentaje_pagado || 0,
      enableSorting: true,
      sortingFn: (rowA, rowB) =>
        (rowA.original.porcentaje_pagado || 0) -
        (rowB.original.porcentaje_pagado || 0),
      cell: ({ row }) => {
        const estaAsignada =
          row.original.estado === 'Asignada' ||
          row.original.estado === 'Entregada' ||
          row.original.estado === 'Propietario'
        if (!estaAsignada) {
          return (
            <div className={styles.cell.center}>
              <span className='text-xs text-gray-400 dark:text-gray-500'>
                —
              </span>
            </div>
          )
        }
        const porcentaje = Math.min(row.original.porcentaje_pagado || 0, 100)
        const pagadoCompleto = porcentaje >= 100
        if (pagadoCompleto) {
          return (
            <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
              ✓ 100%
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
      },
    },

    // Acciones - COMPACTO
    {
      id: 'acciones',
      header: 'Acciones',
      size: 72,
      enableSorting: false,
      cell: ({ row }) => (
        <div className={styles.actions.container}>
          {canEdit && onEdit && (
            <button
              onClick={e => {
                e.stopPropagation()
                onEdit(row.original)
              }}
              className={cn(
                styles.actions.button.base,
                styles.actions.button.edit
              )}
              title='Editar'
            >
              <Edit2 className={styles.actions.icon} />
            </button>
          )}
          {canDelete && onDelete && row.original.estado === 'Disponible' && (
            <button
              onClick={e => {
                e.stopPropagation()
                onDelete(row.original.id)
              }}
              className={cn(
                styles.actions.button.base,
                styles.actions.button.delete
              )}
              title='Eliminar'
            >
              <Trash2 className={styles.actions.icon} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className='viviendas-tabla-wrapper w-full'>
      <style jsx>{`
        .viviendas-tabla-wrapper :global(thead) {
          background: linear-gradient(
            135deg,
            #ea580c 0%,
            #d97706 50%,
            #ca8a04 100%
          ) !important;
        }
        .viviendas-tabla-wrapper :global(thead th) {
          color: white !important;
          font-weight: 600 !important;
        }
        .viviendas-tabla-wrapper :global(thead button) {
          color: white !important;
        }
        .viviendas-tabla-wrapper :global(thead .opacity-40) {
          opacity: 0.6 !important;
        }
        .viviendas-tabla-wrapper :global(tbody tr:hover) {
          background: linear-gradient(
            90deg,
            rgba(234, 88, 12, 0.05) 0%,
            rgba(217, 119, 6, 0.05) 50%,
            rgba(202, 138, 4, 0.05) 100%
          ) !important;
        }
        .viviendas-tabla-wrapper :global(tbody tr) {
          transition: all 0.2s ease;
        }
      `}</style>
      <DataTable
        columns={columns}
        data={viviendas}
        gradientColor='orange'
        pageSize={20}
        initialSorting={[
          {
            id: 'identificador',
            desc: false,
          },
        ]}
        onRowClick={onView}
      />
    </div>
  )
}
