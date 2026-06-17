/**
 * Hook genérico de paginación reutilizable
 * ✅ Lógica compartida entre módulos
 * ✅ Type-safe con genéricos
 * ✅ Manejo automático de edge cases
 */

import { useCallback, useMemo, useState } from 'react'

export interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  autoScrollOnChange?: boolean
}

export interface PaginationResult<T> {
  // Datos paginados
  items: T[]
  // Estado
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  // Controles
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  previousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  // Helpers
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
}

/**
 * Hook genérico de paginación
 * @param data - Array de datos a paginar
 * @param options - Configuración de paginación
 */
export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): PaginationResult<T> {
  const {
    initialPage = 1,
    initialPageSize = 20,
    autoScrollOnChange = true,
  } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  // Calcular paginación (memoizado)
  const pagination = useMemo(() => {
    const totalItems = data.length
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    // Validar página actual (no exceder totalPages)
    const validPage = Math.min(Math.max(1, currentPage), totalPages)

    const startIndex = (validPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalItems)
    const items = data.slice(startIndex, endIndex)

    return {
      items,
      totalPages,
      validPage,
      startIndex,
      endIndex,
      totalItems,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1,
    }
  }, [data, currentPage, pageSize])

  // Scroll automático al cambiar página
  const scrollToTop = useCallback(() => {
    if (autoScrollOnChange) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [autoScrollOnChange])

  // Cambiar página (con validación)
  const setPage = useCallback(
    (page: number) => {
      const newPage = Math.min(Math.max(1, page), pagination.totalPages)
      setCurrentPage(newPage)
      scrollToTop()
    },
    [pagination.totalPages, scrollToTop]
  )

  // Cambiar tamaño de página
  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size)
      setCurrentPage(1) // Reset a primera página
      scrollToTop()
    },
    [scrollToTop]
  )

  // Navegación rápida
  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      setPage(pagination.validPage + 1)
    }
  }, [pagination.hasNextPage, pagination.validPage, setPage])

  const previousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      setPage(pagination.validPage - 1)
    }
  }, [pagination.hasPreviousPage, pagination.validPage, setPage])

  const goToFirstPage = useCallback(() => setPage(1), [setPage])

  const goToLastPage = useCallback(
    () => setPage(pagination.totalPages),
    [pagination.totalPages, setPage]
  )

  return {
    items: pagination.items,
    currentPage: pagination.validPage,
    totalPages: pagination.totalPages,
    pageSize,
    totalItems: pagination.totalItems,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
    startIndex: pagination.startIndex,
    endIndex: pagination.endIndex,
  }
}
