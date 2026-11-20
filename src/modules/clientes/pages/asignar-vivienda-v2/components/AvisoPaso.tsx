'use client'

import { useEffect, useRef } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

/**
 * Por qué no se puede avanzar de paso. Va justo encima del botón que se
 * acaba de pulsar, y se desplaza a la vista si quedó fuera de pantalla.
 */
export function AvisoPaso({
  mensajes,
  titulo = 'Aún no puedes continuar',
}: {
  mensajes: string[]
  titulo?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const clave = mensajes.join('|')

  useEffect(() => {
    if (clave)
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [clave])

  if (mensajes.length === 0) return null

  return (
    <motion.div
      ref={ref}
      role='alert'
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className='mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10'
    >
      <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400' />
      <div className='min-w-0 text-sm'>
        <p className='font-semibold text-red-800 dark:text-red-200'>{titulo}</p>
        {mensajes.length === 1 ? (
          <p className='mt-0.5 text-red-700 dark:text-red-300'>{mensajes[0]}</p>
        ) : (
          <ul className='mt-1 list-disc space-y-0.5 pl-4 text-red-700 dark:text-red-300'>
            {mensajes.map(m => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  )
}
