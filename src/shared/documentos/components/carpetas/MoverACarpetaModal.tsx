/**
 * MoverACarpetaModal — Modal para mover un documento a una carpeta.
 * Muestra las carpetas disponibles + opción "Mover a raíz".
 */
'use client'

import { ArrowRight, Folder, FolderRoot, X } from 'lucide-react'

import type { ModuleName } from '@/shared/config/module-themes'
import { useTodasLasCarpetasQuery } from '@/shared/documentos/hooks/useCarpetasQuery'
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
  // Obtener TODAS las carpetas de la entidad (cualquier nivel de anidación)
  const { carpetas } = useTodasLasCarpetasQuery(entidadId, tipoEntidad)

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800'>
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

        {/* Lista de carpetas */}
        <div className='max-h-64 overflow-y-auto px-3 py-3'>
          {/* Opción: Mover a raíz */}
          <button
            type='button'
            onClick={() => onMover(null)}
            disabled={carpetaActualId === null || cargando}
            className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700'
          >
            <FolderRoot className='h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400' />
            <span className='font-medium text-gray-700 dark:text-gray-300'>
              Raíz (sin carpeta)
            </span>
            {carpetaActualId === null ? (
              <span className='ml-auto text-xs text-gray-400'>
                Ubicación actual
              </span>
            ) : null}
          </button>

          {/* Separador */}
          {carpetas.length > 0 ? (
            <div className='my-2 border-t border-gray-200 dark:border-gray-700' />
          ) : null}

          {/* Carpetas */}
          {carpetas.map(carpeta => (
            <button
              key={carpeta.id}
              type='button'
              onClick={() => onMover(carpeta.id)}
              disabled={carpeta.id === carpetaActualId || cargando}
              className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700'
            >
              <Folder className='h-5 w-5 flex-shrink-0 text-amber-500 dark:text-amber-400' />
              <div className='min-w-0 flex-1'>
                <span className='font-medium text-gray-700 dark:text-gray-300'>
                  {carpeta.nombre}
                </span>
                {carpeta.ruta !== carpeta.nombre ? (
                  <span className='block truncate text-xs text-gray-400'>
                    {carpeta.ruta}
                  </span>
                ) : null}
              </div>
              {carpeta.id === carpetaActualId ? (
                <span className='text-xs text-gray-400'>Actual</span>
              ) : (
                <ArrowRight className='h-3.5 w-3.5 text-gray-400' />
              )}
            </button>
          ))}

          {carpetas.length === 0 ? (
            <p className='px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
              No hay carpetas creadas. Crea una desde la vista de documentos.
            </p>
          ) : null}
        </div>

        {/* Footer */}
        <div className='flex justify-end border-t border-gray-200 px-5 py-3 dark:border-gray-700'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
