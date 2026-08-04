/**
 * Paginacion compartida - componente global reutilizable
 * Incluye: selector de resultados por pagina, botones numerados, Anterior/Siguiente
 * Dark mode completo. Acento neutro (no hardcodea colores de modulo).
 */
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { FormSelect } from '@/shared/components/ui/form-select'

function getPaginationPages(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3)
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (items: number) => void
  itemsPerPageOptions?: number[]
  showAllOption?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50],
  showAllOption = false,
  className = '',
}: PaginationProps) {
  const effectiveTotalPages = Math.max(1, totalPages)
  const desde = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const hasta = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div
      className={`flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700 ${className}`}
    >
      {/* Izquierda: conteo + selector */}
      <div className='flex items-center gap-3'>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          <span className='font-semibold text-gray-700 dark:text-gray-300'>
            {desde}&ndash;{hasta}
          </span>
          {' de '}
          <span className='font-semibold text-gray-700 dark:text-gray-300'>
            {totalItems}
          </span>
        </p>

        {onItemsPerPageChange ? (
          <div className='flex items-center gap-1.5'>
            <span className='text-xs text-gray-400 dark:text-gray-500'>
              Ver
            </span>
            <FormSelect
              value={itemsPerPage}
              onChange={e => onItemsPerPageChange(Number(e.target.value))}
              className='rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
            >
              {itemsPerPageOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              {showAllOption ? <option value={totalItems}>Todos</option> : null}
            </FormSelect>
            <span className='text-xs text-gray-400 dark:text-gray-500'>
              por pagina
            </span>
          </div>
        ) : null}
      </div>

      {/* Derecha: botones de pagina (solo si hay mas de 1) */}
      {effectiveTotalPages > 1 ? (
        <div className='flex items-center gap-1'>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800'
          >
            <ChevronLeft className='h-3.5 w-3.5' />
            Anterior
          </button>

          {getPaginationPages(currentPage, effectiveTotalPages).map((p, i) =>
            p === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className='px-1 text-xs text-gray-400 dark:text-gray-600'
              >
                &hellip;
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`min-w-[32px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-gray-800 text-white shadow-sm dark:bg-gray-200 dark:text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === effectiveTotalPages}
            className='inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800'
          >
            Siguiente
            <ChevronRight className='h-3.5 w-3.5' />
          </button>
        </div>
      ) : null}
    </div>
  )
}
