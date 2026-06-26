'use client'

import { MessageSquare } from 'lucide-react'

import { MOTIVOS_AJUSTE } from '../../hooks'

interface SeccionMotivoProps {
  motivo: string
  notas: string
  motivoRequiereNotas: boolean
  onMotivoChange: (v: string) => void
  onNotasChange: (v: string) => void
}

const textareaClass =
  'w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500'

export function SeccionMotivo({
  motivo,
  notas,
  motivoRequiereNotas,
  onMotivoChange,
  onNotasChange,
}: SeccionMotivoProps) {
  return (
    <div className='space-y-2 border-t border-gray-100 pt-2 dark:border-gray-700/50'>
      <label className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
        <MessageSquare className='h-3.5 w-3.5' />
        Motivo del cambio <span className='text-red-400'>*</span>
      </label>

      <select
        value={motivo}
        onChange={e => onMotivoChange(e.target.value)}
        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]'
      >
        <option value=''>Seleccionar motivo...</option>
        {MOTIVOS_AJUSTE.map(m => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {motivoRequiereNotas && (
        <textarea
          value={notas}
          onChange={e => onNotasChange(e.target.value)}
          placeholder='Describe el motivo del cambio... (requerido)'
          rows={2}
          className={textareaClass}
        />
      )}

      {motivo && !motivoRequiereNotas && (
        <textarea
          value={notas}
          onChange={e => onNotasChange(e.target.value)}
          placeholder='Notas adicionales (opcional)'
          rows={2}
          className={textareaClass}
        />
      )}
    </div>
  )
}
