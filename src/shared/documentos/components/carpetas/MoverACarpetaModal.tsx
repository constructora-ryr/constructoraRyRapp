/**
 * MoverACarpetaModal — Modal para mover un documento a una carpeta.
 * Permite navegar entre carpetas y subcarpetas (drill-down) antes de
 * confirmar el destino con el botón "Mover aquí".
 */
'use client'

import { useEffect, useState } from 'react'

import { ChevronRight, Folder, FolderRoot, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { ModuleName } from '@/shared/config/module-themes'
import {
  useBreadcrumbsQuery,
  useCarpetasQuery,
} from '@/shared/documentos/hooks/useCarpetasQuery'
import type { TipoEntidad } from '@/shared/documentos/types/entidad.types'

interface MoverACarpetaModalProps {
  isOpen: boolean
  onClose: () => void
  onMover: (carpetaId: string | null) => void
  entidadId: string
  tipoEntidad: TipoEntidad
  moduleName?: ModuleName
  carpetaActualId?: string | null
  cargando?: boolean
}

export function MoverACarpetaModal({
  isOpen,
  onClose,
  onMover,
  entidadId,
  tipoEntidad,
  moduleName: _moduleName = 'proyectos',
  carpetaActualId,
  cargando = false,
}: MoverACarpetaModalProps) {
  // Carpeta que se está explorando dentro del modal (null = raíz)
  const [navegandoId, setNavegandoId] = useState<string | null>(null)

  // Reiniciar navegación cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) setNavegandoId(null)
  }, [isOpen])

  const { carpetas } = useCarpetasQuery(entidadId, tipoEntidad, navegandoId)
  const { breadcrumbs } = useBreadcrumbsQuery(navegandoId)

  if (!isOpen) return null

  const esUbicacionActual = navegandoId === (carpetaActualId ?? null)

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative flex max-h-[80vh] w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Mover a carpeta
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Breadcrumb de navegación */}
        <div className='flex items-center gap-1 overflow-x-auto whitespace-nowrap border-b border-gray-100 px-5 py-2.5 text-xs dark:border-gray-700/60'>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1
            return (
              <span
                key={crumb.id ?? 'root'}
                className='flex items-center gap-1'
              >
                {i > 0 ? (
                  <ChevronRight className='h-3 w-3 flex-shrink-0 text-gray-300 dark:text-gray-600' />
                ) : null}
                {isLast ? (
                  <span className='font-medium text-gray-700 dark:text-gray-200'>
                    {crumb.nombre}
                  </span>
                ) : (
                  <button
                    type='button'
                    onClick={() => setNavegandoId(crumb.id)}
                    className='text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400'
                  >
                    {crumb.nombre}
                  </button>
                )}
              </span>
            )
          })}
        </div>

        {/* Lista de subcarpetas del nivel actual */}
        <div className='min-h-[120px] flex-1 overflow-y-auto px-3 py-2'>
          {carpetas.length === 0 ? (
            <p className='px-3 py-6 text-center text-sm text-gray-400 dark:text-gray-500'>
              Sin subcarpetas en esta ubicación
            </p>
          ) : (
            carpetas.map(carpeta => (
              <button
                key={carpeta.id}
                type='button'
                onClick={() => setNavegandoId(carpeta.id)}
                className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <Folder className='h-5 w-5 flex-shrink-0 text-amber-500 dark:text-amber-400' />
                <span className='min-w-0 flex-1 truncate font-medium text-gray-700 dark:text-gray-300'>
                  {carpeta.nombre}
                </span>
                {carpeta.id === carpetaActualId ? (
                  <span className='flex-shrink-0 text-xs text-gray-400'>
                    Ubicación actual
                  </span>
                ) : null}
                <ChevronRight className='h-3.5 w-3.5 flex-shrink-0 text-gray-400' />
              </button>
            ))
          )}
        </div>

        {/* Footer: confirmar mover a la ubicación que se está explorando */}
        <div className='flex items-center justify-between gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={() => onMover(navegandoId)}
            disabled={esUbicacionActual || cargando}
            className='flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {navegandoId === null ? (
              <FolderRoot className='h-4 w-4' />
            ) : (
              <Folder className='h-4 w-4' />
            )}
            {esUbicacionActual ? 'Ubicación actual' : 'Mover aquí'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
