/**
 * DataTable - Componente de tabla genérico y reutilizable
 * ✅ Basado en TanStack Table v8
 * ✅ Ordenamiento por columnas
 * ✅ Paginación
 * ✅ Diseño premium con glassmorphism
 * ✅ Dark mode completo
 * ✅ Responsive
 */

'use client'

import { useState } from 'react'

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  gradientColor?: 'orange' | 'green' | 'cyan' | 'pink' | 'blue' | 'purple'
  pageSize?: number
  showPagination?: boolean
  initialSorting?: SortingState
  onRowClick?: (row: TData) => void
}

const gradientClasses = {
  orange: {
    header: 'from-orange-600 via-amber-600 to-yellow-600',
    border: 'border-orange-400/50',
    hover: 'hover:bg-orange-50/80 dark:hover:bg-orange-900/20',
    shadow: 'shadow-orange-500/10',
  },
  green: {
    header: 'from-green-600 via-emerald-600 to-teal-600',
    border: 'border-green-400/50',
    hover: 'hover:bg-green-50/80 dark:hover:bg-green-900/20',
    shadow: 'shadow-green-500/10',
  },
  cyan: {
    header: 'from-cyan-600 via-blue-600 to-indigo-600',
    border: 'border-cyan-400/50',
    hover: 'hover:bg-cyan-50/80 dark:hover:bg-cyan-900/20',
    shadow: 'shadow-cyan-500/10',
  },
  pink: {
    header: 'from-pink-600 via-purple-600 to-indigo-600',
    border: 'border-pink-400/50',
    hover: 'hover:bg-pink-50/80 dark:hover:bg-pink-900/20',
    shadow: 'shadow-pink-500/10',
  },
  blue: {
    header: 'from-blue-600 via-indigo-600 to-purple-600',
    border: 'border-blue-400/50',
    hover: 'hover:bg-blue-50/80 dark:hover:bg-blue-900/20',
    shadow: 'shadow-blue-500/10',
  },
  purple: {
    header: 'from-purple-600 via-indigo-600 to-pink-600',
    border: 'border-purple-400/50',
    hover: 'hover:bg-purple-50/80 dark:hover:bg-purple-900/20',
    shadow: 'shadow-purple-500/10',
  },
}

export function DataTable<TData>({
  columns,
  data,
  gradientColor = 'orange',
  pageSize = 20,
  showPagination = true,
  initialSorting = [],
  onRowClick,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize })

  const theme = gradientClasses[gradientColor]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  })

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-200/50 bg-white shadow-2xl dark:border-gray-700/50 dark:bg-gray-800',
        theme.shadow
      )}
    >
      {/* Tabla */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          {/* Header con gradiente premium */}
          <thead
            className={cn(
              'border-b-2 bg-gradient-to-r',
              theme.header,
              theme.border
            )}
          >
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white',
                      header.column.getCanSort() &&
                        'cursor-pointer select-none transition-all hover:bg-white/10'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    <div className='flex items-center justify-center gap-2'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {/* Indicador de ordenamiento */}
                      {header.column.getCanSort() && (
                        <span>
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className='h-4 w-4' />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronsUpDown className='h-4 w-4 opacity-40' />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Body con hover effects premium */}
          <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  className={cn(
                    'transition-all duration-200',
                    theme.hover,
                    onRowClick && 'cursor-pointer',
                    idx % 2 === 0
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-gray-50/30 dark:bg-gray-800/30'
                  )}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className='px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300'
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400'
                >
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación moderna y compacta - Mostrar siempre */}
      {showPagination && (
        <div className='flex items-center justify-between border-t border-gray-200/50 bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 px-4 py-2.5 backdrop-blur-xl dark:border-gray-700/50 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-gray-800/95'>
          {/* Contador compacto + Selector de items por página */}
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 dark:border-gray-600 dark:bg-gray-700/50'>
              <span className='text-xs font-semibold text-gray-900 dark:text-gray-100'>
                {data.length > 0
                  ? table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                    1
                  : 0}
                -
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  data.length
                )}
              </span>
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                de
              </span>
              <span className='text-xs font-semibold text-gray-900 dark:text-gray-100'>
                {data.length}
              </span>
            </div>

            {/* Selector de items por página */}
            <div className='flex items-center gap-1.5'>
              <span className='text-xs text-gray-600 dark:text-gray-400'>
                Mostrar:
              </span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
                className='cursor-pointer rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-900 transition-all hover:border-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-gray-500 dark:focus:border-orange-400'
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                {data.length > 100 && (
                  <option value={data.length}>Todos ({data.length})</option>
                )}
              </select>
            </div>
          </div>

          {/* Controles de navegación modernos */}
          <div className='flex items-center gap-1.5'>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className='group relative rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:from-gray-600 dark:hover:to-gray-700 dark:disabled:hover:bg-gray-700'
            >
              <span className='flex items-center gap-1'>
                <svg
                  className='h-3.5 w-3.5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
                Anterior
              </span>
            </button>

            <div className='flex items-center gap-1 rounded-full border border-gray-300 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 px-3 py-1 shadow-inner dark:border-gray-600 dark:from-gray-700 dark:via-gray-700/50 dark:to-gray-700'>
              <span className='text-xs font-bold text-gray-900 dark:text-gray-100'>
                {table.getState().pagination.pageIndex + 1}
              </span>
              <span className='text-xs text-gray-400 dark:text-gray-500'>
                /
              </span>
              <span className='text-xs font-semibold text-gray-600 dark:text-gray-400'>
                {table.getPageCount()}
              </span>
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className='group relative rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:from-gray-600 dark:hover:to-gray-700 dark:disabled:hover:bg-gray-700'
            >
              <span className='flex items-center gap-1'>
                Siguiente
                <svg
                  className='h-3.5 w-3.5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
