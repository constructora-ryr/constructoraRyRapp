'use client'

import { useState } from 'react'

import { AlertTriangle, Info, X } from 'lucide-react'

import { FormSelect } from '@/shared/components/ui/form-select'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'

import type { FuAlteNueva } from '../../hooks'
import { getFuenteColor } from '../../hooks'

import { formatMontoInput } from './helpers'

interface FilaNuevaProps {
  fuente: FuAlteNueva
  index: number
  onChange: (
    index: number,
    campo: keyof FuAlteNueva,
    valor: string | number
  ) => void
  onEliminar: (index: number) => void
  requiereEntidad: boolean
  entidades: string[]
  hasError?: boolean
  hasEntidadError?: boolean
}

export function FilaNueva({
  fuente,
  index,
  onChange,
  onEliminar,
  requiereEntidad,
  entidades,
  hasError = false,
  hasEntidadError = false,
}: FilaNuevaProps) {
  const color = getFuenteColor(fuente.tipo)
  const [inputValue, setInputValue] = useState(formatMontoInput(fuente.monto))
  const mostrarEntidad = requiereEntidad
  const esCredito = esCreditoConstructora(fuente.tipo)

  const handleChange = (raw: string) => {
    const soloDigitos = raw.replace(/[^0-9]/g, '')
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : 0
    setInputValue(soloDigitos ? numero.toLocaleString('es-CO') : '')
    onChange(index, 'monto', numero)
  }

  const hasMessages = hasError || hasEntidadError

  return (
    <div className='flex overflow-hidden rounded-xl border border-emerald-200/80 transition-all dark:border-emerald-800/40'>
      {/* Accent de color lateral */}
      <div className={`w-1 flex-shrink-0 ${color.barra}`} />

      {/* Contenido principal */}
      <div className='flex-1 bg-emerald-50/60 p-3 dark:bg-emerald-900/10'>
        {/* Fila principal: nombre + monto + botón eliminar */}
        <div className='flex items-center gap-2'>
          {/* Nombre de la fuente */}
          <p className='flex-1 text-sm font-semibold leading-snug text-gray-900 dark:text-white'>
            {fuente.tipo}
          </p>

          {/* Etiqueta de capital (solo crédito) */}
          {esCredito ? (
            <span className='text-[10px] font-medium text-gray-500 dark:text-gray-400'>
              Capital
            </span>
          ) : null}

          {/* Input de monto */}
          <div className='flex flex-shrink-0 items-center gap-1'>
            <span className='text-xs font-medium text-gray-400 dark:text-gray-500'>
              $
            </span>
            <input
              type='text'
              inputMode='numeric'
              value={inputValue}
              onChange={e => handleChange(e.target.value)}
              className={`w-32 rounded-lg border px-2.5 py-1.5 text-right text-sm font-semibold tabular-nums text-gray-900 focus:outline-none focus:ring-2 dark:text-white ${
                hasError
                  ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:bg-red-900/20'
                  : 'border-emerald-200 bg-white focus:border-cyan-500 focus:ring-cyan-500/20 dark:border-emerald-800/60 dark:bg-gray-700/60'
              }`}
              placeholder='0'
            />
          </div>

          {/* Botón eliminar */}
          <button
            type='button'
            onClick={() => onEliminar(index)}
            className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        </div>

        {/* Nota para crédito con plan de cuotas */}
        {esCredito ? (
          <p className='mt-1.5 flex items-start gap-1.5 text-xs text-blue-600 dark:text-blue-400'>
            <Info className='mt-0.5 h-3 w-3 flex-shrink-0' />
            El plan de cuotas se configura después de guardar
          </p>
        ) : null}

        {/* Selector de entidad */}
        {mostrarEntidad ? (
          <div className='mt-2'>
            {entidades.length > 0 ? (
              <FormSelect
                value={fuente.entidad}
                onChange={e => onChange(index, 'entidad', e.target.value)}
                className={`w-full rounded-lg border px-2.5 py-1.5 text-xs text-gray-700 focus:border-cyan-500 focus:outline-none dark:text-gray-300 ${
                  hasEntidadError
                    ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700/60'
                }`}
              >
                <option value=''>Seleccionar entidad financiera... *</option>
                {entidades.map(e => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </FormSelect>
            ) : (
              <input
                type='text'
                placeholder='Nombre de la entidad (opcional)'
                value={fuente.entidad}
                onChange={e => onChange(index, 'entidad', e.target.value)}
                className='w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-300 dark:placeholder:text-gray-500'
              />
            )}
          </div>
        ) : null}

        {/* Mensajes de error — ancho completo */}
        {hasMessages ? (
          <div className='mt-2 space-y-1'>
            {hasError ? (
              <p className='flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400'>
                <AlertTriangle className='mt-0.5 h-3 w-3 flex-shrink-0' />
                El monto debe ser mayor a $0
              </p>
            ) : null}
            {hasEntidadError ? (
              <p className='flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400'>
                <AlertTriangle className='mt-0.5 h-3 w-3 flex-shrink-0' />
                Selecciona una entidad financiera
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
