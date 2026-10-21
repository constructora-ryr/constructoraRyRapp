'use client'

/**
 * Chip con un valor que se puede editar en línea (lápiz → input → Guardar).
 * Maneja su propio estado de edición y guardado: reemplaza los pares
 * editando/valor/guardando que vivían en la pestaña Negociación.
 */

import { useState, type ReactNode } from 'react'

import { Check, Loader2, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/shared/utils/helpers'

interface CampoEditableProps {
  /** Contenido del chip en modo lectura */
  children: ReactNode
  /** Clases del chip (color) */
  chipClassName: string
  /** Si es false, solo se muestra el chip */
  editable: boolean
  tipo: 'date' | 'dinero'
  /** Valor con el que arranca el input (YYYY-MM-DD o número en texto) */
  valorInicial: string
  ariaLabel: string
  /** Recibe el valor ya validado (YYYY-MM-DD o número) */
  onGuardar: (valor: string | number) => Promise<void>
}

export function CampoEditable({
  children,
  chipClassName,
  editable,
  tipo,
  valorInicial,
  ariaLabel,
  onGuardar,
}: CampoEditableProps) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardar = async () => {
    let limpio: string | number = valor
    if (tipo === 'dinero') {
      const n = parseFloat(valor.replace(/\D/g, ''))
      if (isNaN(n) || n < 0) {
        toast.error('Ingresa un valor válido')
        return
      }
      limpio = n
    } else if (!valor) {
      toast.error('Selecciona una fecha válida')
      return
    }
    setGuardando(true)
    try {
      await onGuardar(limpio)
      setEditando(false)
    } catch (err) {
      toast.error('Error al actualizar', {
        description: err instanceof Error ? err.message : 'Error desconocido',
      })
    } finally {
      setGuardando(false)
    }
  }

  if (editando) {
    return (
      <span className='inline-flex flex-wrap items-center gap-1.5'>
        <input
          aria-label={ariaLabel}
          autoFocus
          type={tipo === 'date' ? 'date' : 'text'}
          inputMode={tipo === 'dinero' ? 'numeric' : undefined}
          placeholder={tipo === 'dinero' ? 'Ej: 18000000' : undefined}
          value={valor}
          disabled={guardando}
          onChange={e => setValor(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') void guardar()
            if (e.key === 'Escape') setEditando(false)
          }}
          className='h-9 w-40 rounded-lg border-2 border-cyan-400 bg-white px-2 text-sm font-medium tabular-nums text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-cyan-600 dark:bg-slate-900 dark:text-slate-100 sm:h-8 sm:text-xs'
        />
        <button
          type='button'
          onClick={() => void guardar()}
          disabled={guardando}
          aria-label='Guardar'
          className='flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50 sm:h-8 sm:w-8'
        >
          {guardando ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Check className='h-4 w-4' />
          )}
        </button>
        <button
          type='button'
          onClick={() => setEditando(false)}
          disabled={guardando}
          aria-label='Cancelar'
          className='flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 sm:h-8 sm:w-8'
        >
          <X className='h-4 w-4' />
        </button>
      </span>
    )
  }

  return (
    <span className='inline-flex items-center gap-1'>
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
          chipClassName
        )}
      >
        {children}
      </span>
      {editable && (
        <button
          type='button'
          aria-label={`Editar: ${ariaLabel}`}
          title='Editar'
          onClick={() => {
            setValor(valorInicial)
            setEditando(true)
          }}
          className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-100 hover:text-cyan-600 dark:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-cyan-400 sm:h-7 sm:w-7'
        >
          <Pencil className='h-3.5 w-3.5' />
        </button>
      )}
    </span>
  )
}
