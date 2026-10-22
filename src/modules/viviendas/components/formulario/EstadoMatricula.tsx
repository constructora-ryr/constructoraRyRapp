/**
 * Indicador junto a la matrícula: verificando, libre o ya registrada.
 */

'use client'

import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import type { EstadoMatricula as Estado } from '../../hooks/useVerificacionMatricula'

export function EstadoMatricula({ estado }: { estado: Estado }) {
  switch (estado.estado) {
    case 'verificando':
      return (
        <span className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
          <Loader2 className='h-3.5 w-3.5 animate-spin' />
          Verificando…
        </span>
      )
    case 'libre':
      return (
        <span className='flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
          <CheckCircle2 className='h-3.5 w-3.5' />
          Disponible
        </span>
      )
    case 'duplicada':
      return (
        <span className='flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400'>
          <XCircle className='h-3.5 w-3.5' />
          Ya registrada en Mz. {estado.manzana} casa {estado.numero}
        </span>
      )
    default:
      return null
  }
}
