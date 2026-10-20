/**
 * Skeleton para Clientes — imita la vista de tabla real
 */

'use client'

import { motion } from 'framer-motion'

const COLS = [
  { w: '30%' }, // Nombre + avatar
  { w: '15%' }, // Documento
  { w: '20%' }, // Vivienda asignada
  { w: '12%' }, // Estado
  { w: '12%' }, // Negociación
  { w: '11%' }, // Acciones
]

export function ClientesSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
    >
      {/* Cabecera de columnas */}
      <div className='flex items-center gap-3 border-b border-gray-200/60 bg-gray-50/80 px-4 py-3 dark:border-gray-700/60 dark:bg-gray-900/40'>
        {COLS.map((col, i) => (
          <div
            key={i}
            className='h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700'
            style={{ width: col.w }}
          />
        ))}
      </div>

      {/* Filas */}
      <div className='divide-y divide-gray-100 dark:divide-gray-700/50'>
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className='flex items-center gap-3 px-4 py-3'>
            {/* Nombre — avatar + texto */}
            <div className='flex items-center gap-2.5' style={{ width: '30%' }}>
              <div className='h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
              <div className='flex-1 space-y-1.5'>
                <div
                  className='h-3.5 animate-pulse rounded bg-gray-200 dark:bg-gray-700'
                  style={{ width: `${60 + ((row * 13) % 30)}%` }}
                />
                <div className='h-2.5 w-2/5 animate-pulse rounded bg-gray-100 dark:bg-gray-800' />
              </div>
            </div>
            {/* Documento */}
            <div style={{ width: '15%' }}>
              <div
                className='h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-800'
                style={{ width: '70%' }}
              />
            </div>
            {/* Vivienda */}
            <div style={{ width: '20%' }}>
              <div
                className='h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-800'
                style={{ width: `${50 + ((row * 7) % 35)}%` }}
              />
            </div>
            {/* Estado badge */}
            <div style={{ width: '12%' }}>
              <div className='h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
            </div>
            {/* Negociación */}
            <div style={{ width: '12%' }}>
              <div className='h-3 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800' />
            </div>
            {/* Acciones */}
            <div className='flex gap-1.5' style={{ width: '11%' }}>
              <div className='h-7 w-7 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
              <div className='h-7 w-7 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
