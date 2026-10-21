'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import type { ClienteResumen } from '../types'

import { ClientesTabla } from './ClientesTabla'

interface ClientesVistaTablaProps {
  clientes: ClienteResumen[]
  isLoading: boolean
  isFetching: boolean
  canEdit: boolean
  canDelete: boolean
  onVer: (cliente: ClienteResumen) => void
  onEditar: (cliente: ClienteResumen) => void
  onEliminar: (clienteId: string) => void
}

export function ClientesVistaTabla({
  clientes,
  isLoading,
  isFetching,
  canEdit,
  canDelete,
  onVer,
  onEditar,
  onEliminar,
}: ClientesVistaTablaProps) {
  if (isLoading && clientes.length === 0) {
    return (
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
        <div className='h-10 animate-pulse bg-slate-50 dark:bg-slate-800' />
        <div className='space-y-3 p-4'>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-16 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700'
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='relative'>
      {isFetching && clientes.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='absolute -top-10 left-0 right-0 z-10 flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50/80 py-2 backdrop-blur-xl dark:border-cyan-800 dark:bg-cyan-950/20'
        >
          <Loader2 className='h-4 w-4 animate-spin text-cyan-600' />
          <span className='text-xs font-medium text-cyan-700 dark:text-cyan-400'>
            Actualizando datos...
          </span>
        </motion.div>
      ) : null}

      <ClientesTabla
        clientes={clientes}
        onView={onVer}
        onEdit={canEdit ? onEditar : undefined}
        onDelete={canDelete ? onEliminar : undefined}
        canEdit={canEdit}
        canDelete={canDelete}
        initialSorting={[{ id: 'vivienda', desc: false }]}
      />
    </div>
  )
}
