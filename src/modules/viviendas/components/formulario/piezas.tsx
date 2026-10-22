/**
 * Piezas comunes de los pasos del formulario de vivienda (crear y editar):
 * mensaje de error de campo y etiqueta.
 */

'use client'

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

export function ErrorCampo({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null
  return (
    <motion.p
      role='alert'
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className='mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400'
    >
      <AlertCircle className='h-3.5 w-3.5 flex-shrink-0' />
      {mensaje}
    </motion.p>
  )
}

export function EtiquetaCampo({
  htmlFor,
  children,
  requerido = true,
  extra,
}: {
  htmlFor?: string
  children: ReactNode
  requerido?: boolean
  /** Contenido a la derecha de la etiqueta (contador, estado…) */
  extra?: ReactNode
}) {
  return (
    <div className='mb-1.5 flex items-center justify-between gap-2'>
      <label
        htmlFor={htmlFor}
        className='text-xs font-semibold text-gray-700 dark:text-gray-300'
      >
        {children}
        {requerido ? <span className='ml-0.5 text-red-500'>*</span> : null}
      </label>
      {extra}
    </div>
  )
}
