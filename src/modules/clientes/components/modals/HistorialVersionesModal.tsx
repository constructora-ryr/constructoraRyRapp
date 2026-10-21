/**
 * Modal: Historial de Versiones de Negociación
 * Muestra timeline con todos los cambios realizados
 * ✅ REFACTORIZADO: Separación completa de responsabilidades
 */

'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, History, X } from 'lucide-react'

import { Cargador } from '@/shared/components/carga'

import { useHistorialVersiones } from '../../hooks/useHistorialVersiones'

import { VersionCard } from './components/VersionCard'

interface HistorialVersionesModalProps {
  negociacionId: string
  isOpen: boolean
  onClose: () => void
}

export function HistorialVersionesModal({
  negociacionId,
  isOpen,
  onClose,
}: HistorialVersionesModalProps) {
  const { versiones, isLoading, totalVersiones } =
    useHistorialVersiones(negociacionId)
  const [versionExpandida, setVersionExpandida] = useState<string | null>(null)

  if (!isOpen) return null

  const toggleVersion = (versionId: string) => {
    setVersionExpandida(versionExpandida === versionId ? null : versionId)
  }

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className='flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
        >
          {/* Header - Tema Clientes (Cyan → Azul → Índigo) */}
          <div className='bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-4 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                  <History className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>
                    Historial de Versiones
                  </h2>
                  <p className='mt-0.5 text-sm text-cyan-100 dark:text-cyan-200'>
                    {totalVersiones}{' '}
                    {totalVersiones === 1 ? 'versión' : 'versiones'} registradas
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='rounded-lg p-2 transition-colors hover:bg-white/20'
              >
                <X className='h-5 w-5 text-white' />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto p-6'>
            {isLoading ? (
              <Cargador
                modulo='negociaciones'
                label='Cargando versiones'
                className='py-12'
              />
            ) : versiones.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <AlertCircle className='mb-3 h-12 w-12 text-gray-400' />
                <p className='text-gray-600 dark:text-gray-400'>
                  No hay versiones registradas para esta negociación
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {versiones.map((version, index) => (
                  <VersionCard
                    key={version.id}
                    version={version}
                    versionAnterior={versiones[index + 1] || null}
                    isLatest={index === 0}
                    isExpanded={versionExpandida === version.id}
                    onToggle={() => toggleVersion(version.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700'>
            <button
              onClick={onClose}
              className='rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
