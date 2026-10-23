/**
 * RestaurarProyectoModal - Modal de confirmación para restaurar proyectos archivados
 * ✅ Confirma antes de restaurar
 * ✅ Muestra información del proyecto archivado
 * ✅ Tema verde/esmeralda para acción de restauración
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArchiveRestore, X } from 'lucide-react'

import { formatDateForDisplay } from '@/lib/utils/date.utils'

interface RestaurarProyectoModalProps {
  isOpen: boolean
  nombreProyecto: string
  fechaArchivado?: string | null
  motivoArchivo?: string | null
  onConfirm: () => void
  onCancel: () => void
  restaurando?: boolean
}

export function RestaurarProyectoModal({
  isOpen,
  nombreProyecto,
  fechaArchivado,
  motivoArchivo,
  onConfirm,
  onCancel,
  restaurando = false,
}: RestaurarProyectoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
          />

          {/* Modal */}
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className='relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900'
            >
              {/* Header con gradiente verde */}
              <div className='relative h-32 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-6'>
                <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />

                <button
                  onClick={onCancel}
                  disabled={restaurando}
                  className='absolute right-4 top-4 rounded-lg border border-white/30 bg-white/20 p-2 text-white backdrop-blur-md transition-all hover:bg-white/30 disabled:opacity-50'
                >
                  <X className='h-4 w-4' />
                </button>

                <div className='relative z-10 flex items-start gap-3'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-md'>
                    <ArchiveRestore className='h-6 w-6 text-white' />
                  </div>
                  <div>
                    <h2 className='mb-1 text-xl font-bold text-white'>
                      Restaurar Proyecto
                    </h2>
                    <p className='text-sm text-green-100'>
                      El proyecto volverá a estar activo
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className='space-y-4 p-6'>
                {/* Proyecto a restaurar */}
                <div className='rounded-xl border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
                  <p className='mb-1 text-sm font-semibold text-green-700 dark:text-green-400'>
                    Proyecto:
                  </p>
                  <p className='text-base font-bold text-green-900 dark:text-green-300'>
                    {nombreProyecto}
                  </p>
                </div>

                {/* Información de archivado */}
                {(fechaArchivado || motivoArchivo) && (
                  <div className='space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
                    {fechaArchivado && (
                      <div>
                        <p className='mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400'>
                          Archivado el:
                        </p>
                        <p className='text-sm text-gray-900 dark:text-gray-100'>
                          {formatDateForDisplay(fechaArchivado)}
                        </p>
                      </div>
                    )}
                    {motivoArchivo && (
                      <div>
                        <p className='mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400'>
                          Motivo:
                        </p>
                        <p className='text-sm text-gray-900 dark:text-gray-100'>
                          {motivoArchivo}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Información importante */}
                <div className='flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
                  <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                  <div>
                    <p className='mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300'>
                      Al restaurar este proyecto:
                    </p>
                    <ul className='space-y-1 text-sm text-blue-700 dark:text-blue-400'>
                      <li>
                        • Volverá a aparecer en la lista de proyectos activos
                      </li>
                      <li>• Se podrá editar y gestionar normalmente</li>
                      <li>• Las estadísticas lo incluirán nuevamente</li>
                    </ul>
                  </div>
                </div>

                {/* Botones */}
                <div className='flex gap-3 pt-2'>
                  <button
                    type='button'
                    onClick={onCancel}
                    disabled={restaurando}
                    className='flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  >
                    Cancelar
                  </button>
                  <button
                    type='button'
                    onClick={onConfirm}
                    disabled={restaurando}
                    className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800'
                  >
                    {restaurando ? (
                      <>
                        <svg
                          className='h-4 w-4 animate-spin text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        Restaurando...
                      </>
                    ) : (
                      <>
                        <ArchiveRestore className='h-4 w-4' />
                        Restaurar Proyecto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
