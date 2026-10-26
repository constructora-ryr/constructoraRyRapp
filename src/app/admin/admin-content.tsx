'use client'

/**
 * ============================================
 * COMPONENTE: Contenido del Panel de Administración
 * ============================================
 */

import { motion } from 'framer-motion'
import { ArrowRight, DollarSign, Layers, Settings, Shield } from 'lucide-react'

import Link from 'next/link'

import { TarjetaInactividad } from '@/modules/configuracion/components/TarjetaInactividad'

interface AdminContentProps {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  isAdmin: boolean
}

export default function AdminContent({
  canView,
  canCreate: _canCreate,
  canEdit: _canEdit,
  canDelete: _canDelete,
  isAdmin,
}: AdminContentProps) {
  // Solo admins pueden ver esta página
  if (!canView || !isAdmin) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Acceso Denegado
          </h2>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            No tienes permisos para acceder a este módulo
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 p-4 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/30'>
      <div className='container mx-auto px-4 py-4'>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          <div className='mb-4 inline-flex rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-3 shadow-lg'>
            <Shield className='h-10 w-10 text-white' />
          </div>
          <h1 className='mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent'>
            Panel de Administración
          </h1>
          <p className='mx-auto mb-6 max-w-2xl text-base text-gray-600 dark:text-gray-300'>
            Control total del sistema y configuraciones avanzadas
          </p>

          {/* Cards de Módulos */}
          <div className='mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {/* Hub de Fuentes de Pago */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link href='/admin/fuentes-pago-hub' className='group block'>
                <div className='flex h-full flex-col rounded-xl border border-blue-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-2xl dark:border-blue-800 dark:bg-gray-800/80'>
                  <div className='mb-4 flex items-center gap-4'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-600 shadow-lg'>
                      <Layers className='h-8 w-8 text-white' />
                    </div>
                    <div className='flex-1 text-left'>
                      <h3 className='text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                        Fuentes de Pago
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Hub del módulo
                      </p>
                    </div>
                  </div>
                  <p className='mb-4 min-h-[60px] flex-grow text-sm text-gray-600 dark:text-gray-300'>
                    Centro de control para tipos de fuentes, requisitos
                    documentales y configuración completa del sistema de
                    negociaciones.
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                      🎯 4 Submódulos
                    </span>
                    <ArrowRight className='h-5 w-5 text-blue-600 transition-transform group-hover:translate-x-1 dark:text-blue-400' />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Recargos */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link
                href='/administracion/configuracion'
                className='group block'
              >
                <div className='flex h-full flex-col rounded-xl border border-indigo-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-2xl dark:border-indigo-800 dark:bg-gray-800/80'>
                  <div className='mb-4 flex items-center gap-4'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg'>
                      <DollarSign className='h-8 w-8 text-white' />
                    </div>
                    <div className='flex-1 text-left'>
                      <h3 className='text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400'>
                        Recargos
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Gastos y valores
                      </p>
                    </div>
                  </div>
                  <p className='mb-4 min-h-[60px] flex-grow text-sm text-gray-600 dark:text-gray-300'>
                    Configura escrituración, registro y otros gastos adicionales
                    que se aplican en las negociaciones del sistema.
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'>
                      ⚙️ Configuración
                    </span>
                    <ArrowRight className='h-5 w-5 text-indigo-600 transition-transform group-hover:translate-x-1 dark:text-indigo-400' />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Categorías de Sistema */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link href='/admin/categorias-sistema' className='group block'>
                <div className='flex h-full flex-col rounded-xl border border-purple-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-2xl dark:border-purple-800 dark:bg-gray-800/80'>
                  <div className='mb-4 flex items-center gap-4'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg'>
                      <Settings className='h-8 w-8 text-white' />
                    </div>
                    <div className='flex-1 text-left'>
                      <h3 className='text-lg font-bold text-gray-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400'>
                        Categorías de Sistema
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Documentos de módulos
                      </p>
                    </div>
                  </div>
                  <p className='mb-4 min-h-[60px] flex-grow text-sm text-gray-600 dark:text-gray-300'>
                    Verifica y crea las categorías críticas para Proyectos,
                    Clientes y Viviendas.
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                      🛡️ Protegido
                    </span>
                    <ArrowRight className='h-5 w-5 text-purple-600 transition-transform group-hover:translate-x-1 dark:text-purple-400' />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Seguridad de sesión */}
          <div className='mt-6'>
            <TarjetaInactividad />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
