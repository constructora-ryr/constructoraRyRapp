'use client'

import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

import type { Proyecto } from '@/modules/proyectos/types'

interface ManzanasTabProps {
  proyecto: Proyecto
}

export function ManzanasTab({ proyecto }: ManzanasTabProps) {
  const numManzanas = proyecto.manzanas.length
  const gridCols =
    numManzanas === 1
      ? 'grid-cols-1'
      : numManzanas === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : numManzanas === 3
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <motion.div
      key='manzanas'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-4'
    >
      <div className={`grid gap-4 ${gridCols}`}>
        {proyecto.manzanas.map((manzana, index) => {
          const creadas = manzana.viviendasCreadas ?? 0
          const disponibles = manzana.viviendasDisponibles ?? 0
          const asignadas = manzana.viviendasAsignadas ?? 0
          const vendidas = manzana.viviendasVendidas ?? 0
          const progreso =
            creadas > 0 ? Math.round((vendidas / creadas) * 100) : 0

          return (
            <motion.div
              key={manzana.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800'
            >
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2'>
                    <Home className='h-4 w-4 text-white' />
                  </div>
                  <h3 className='font-semibold text-gray-900 dark:text-white'>
                    {manzana.nombre}
                  </h3>
                </div>
              </div>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Creadas
                  </span>
                  <span className='font-medium text-gray-900 dark:text-white'>
                    {creadas}
                    {manzana.totalViviendas > 0 &&
                      creadas !== manzana.totalViviendas && (
                        <span className='ml-1 text-xs text-gray-400'>
                          / {manzana.totalViviendas} planeadas
                        </span>
                      )}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Disponibles
                  </span>
                  <span className='font-medium text-blue-600 dark:text-blue-400'>
                    {disponibles}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Asignadas
                  </span>
                  <span className='font-medium text-amber-600 dark:text-amber-400'>
                    {asignadas}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Vendidas
                  </span>
                  <span className='font-medium text-green-600 dark:text-green-400'>
                    {vendidas}
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className='mt-3'>
                <div className='mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400'>
                  <span>Progreso vendidas</span>
                  <span>{progreso}%</span>
                </div>
                <div className='h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className='h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300'
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
