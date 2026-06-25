'use client'

import { useEffect, useState } from 'react'

import { AlertTriangle, Lock, Minus, Plus } from 'lucide-react'

import { EntidadCombobox } from '@/modules/clientes/components/fuente-pago-card/EntidadCombobox'
import type { RestriccionesFuente } from '@/shared/utils/reglas-cierre-financiero'

import type { AjusteLocal } from '../../hooks'
import { getFuenteColor } from '../../hooks'

import { formatMontoInput } from './helpers'

interface FilaFuenteProps {
  ajuste: AjusteLocal
  restricciones: RestriccionesFuente
  onChange: (id: string, monto: number) => void
  onCambioEntidad: (id: string, entidad: string) => void
  onToggleEliminar: (id: string) => void
  requiereEntidad: boolean
  entidades: string[]
  hasMontoError?: boolean
  hasEntidadError?: boolean
}

export function FilaFuente({
  ajuste,
  restricciones,
  onChange,
  onCambioEntidad,
  onToggleEliminar,
  requiereEntidad,
  entidades,
  hasMontoError = false,
  hasEntidadError = false,
}: FilaFuenteProps) {
  const color = getFuenteColor(ajuste.tipo)
  const [inputValue, setInputValue] = useState(
    formatMontoInput(ajuste.montoEditable)
  )
  const mostrarEntidad = requiereEntidad

  useEffect(() => {
    setInputValue(formatMontoInput(ajuste.montoEditable))
  }, [ajuste.montoEditable])

  const handleChange = (raw: string) => {
    const soloDigitos = raw.replace(/[^0-9]/g, '')
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : 0
    setInputValue(soloDigitos ? numero.toLocaleString('es-CO') : '')
    onChange(ajuste.id, numero)
  }

  const hasMessages =
    !ajuste.paraEliminar &&
    (restricciones.razonBloqueoMonto ||
      (restricciones.razonBloqueoEntidad && mostrarEntidad) ||
      restricciones.advertencias.length > 0 ||
      (hasMontoError && restricciones.puedeEditarMonto) ||
      (hasEntidadError && mostrarEntidad))

  return (
    <div
      className={`flex overflow-hidden rounded-xl border transition-all ${
        ajuste.paraEliminar
          ? 'border-dashed border-gray-300 dark:border-gray-600'
          : 'border-gray-200/80 shadow-sm dark:border-gray-700/50'
      }`}
    >
      {/* Accent de color lateral */}
      <div
        className={`w-1 flex-shrink-0 ${color.barra} ${ajuste.paraEliminar ? 'opacity-30' : ''}`}
      />

      {/* Contenido principal */}
      <div
        className={`flex-1 bg-white p-3 dark:bg-gray-800/60 ${ajuste.paraEliminar ? 'opacity-40' : ''}`}
      >
        {/* Fila principal: nombre + monto + botón */}
        <div className='flex items-center gap-2'>
          {/* Nombre de la fuente */}
          <p
            className={`flex-1 text-sm font-semibold leading-snug text-gray-900 dark:text-white ${
              ajuste.paraEliminar
                ? 'text-gray-400 line-through dark:text-gray-500'
                : ''
            }`}
          >
            {ajuste.tipo}
          </p>

          {/* Monto (solo cuando no está para eliminar) */}
          {!ajuste.paraEliminar && (
            <div className='flex flex-shrink-0 items-center gap-1'>
              <span className='text-xs font-medium text-gray-400 dark:text-gray-500'>
                $
              </span>
              <input
                type='text'
                inputMode='numeric'
                value={inputValue}
                onChange={e => handleChange(e.target.value)}
                disabled={!restricciones.puedeEditarMonto}
                className={`w-32 rounded-lg border px-2.5 py-1.5 text-right text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 dark:text-white ${
                  hasMontoError && restricciones.puedeEditarMonto
                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:bg-red-900/20'
                    : !restricciones.puedeEditarMonto
                      ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400'
                      : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500/20 dark:border-gray-600 dark:bg-gray-700'
                }`}
                placeholder='0'
              />
            </div>
          )}

          {/* Entidad cuando está para eliminar */}
          {ajuste.paraEliminar && ajuste.entidad ? (
            <span className='truncate text-xs text-gray-400 dark:text-gray-500'>
              {ajuste.entidad}
            </span>
          ) : null}

          {/* Botón eliminar / restaurar */}
          <button
            type='button'
            onClick={() =>
              restricciones.puedeEliminar || ajuste.paraEliminar
                ? onToggleEliminar(ajuste.id)
                : undefined
            }
            title={
              ajuste.paraEliminar
                ? 'Restaurar fuente'
                : (restricciones.razonBloqueoEliminar ?? 'Quitar fuente')
            }
            disabled={!restricciones.puedeEliminar && !ajuste.paraEliminar}
            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
              !restricciones.puedeEliminar && !ajuste.paraEliminar
                ? 'cursor-not-allowed bg-gray-100 text-gray-300 dark:bg-gray-800/30 dark:text-gray-600'
                : ajuste.paraEliminar
                  ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
            }`}
          >
            {ajuste.paraEliminar ? (
              <Plus className='h-3.5 w-3.5' />
            ) : (
              <Minus className='h-3.5 w-3.5' />
            )}
          </button>
        </div>

        {/* Selector de entidad (cuando aplica) */}
        {!ajuste.paraEliminar && mostrarEntidad ? (
          <div className='mt-2'>
            {entidades.length > 0 ? (
              <EntidadCombobox
                opciones={entidades.map(e => ({ value: e, label: e }))}
                value={ajuste.entidadEditable}
                onChange={v => onCambioEntidad(ajuste.id, v)}
                disabled={!restricciones.puedeEditarEntidad}
                placeholder='Seleccionar entidad financiera...'
                error={hasEntidadError}
              />
            ) : (
              <input
                type='text'
                placeholder='Nombre de la entidad financiera'
                value={ajuste.entidadEditable}
                onChange={e => onCambioEntidad(ajuste.id, e.target.value)}
                disabled={!restricciones.puedeEditarEntidad}
                className={`w-full rounded-lg border px-2.5 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500 ${!restricciones.puedeEditarEntidad ? 'cursor-not-allowed opacity-60' : ''}`}
              />
            )}
          </div>
        ) : null}

        {/* Mensajes de error / bloqueo / advertencia — ancho completo, legibles */}
        {hasMessages ? (
          <div className='mt-2 space-y-1'>
            {hasMontoError && restricciones.puedeEditarMonto ? (
              <p className='flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400'>
                <AlertTriangle className='mt-0.5 h-3 w-3 flex-shrink-0' />
                El monto debe ser mayor a $0
              </p>
            ) : null}
            {hasEntidadError && mostrarEntidad ? (
              <p className='flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400'>
                <AlertTriangle className='mt-0.5 h-3 w-3 flex-shrink-0' />
                Selecciona una entidad financiera
              </p>
            ) : null}
            {restricciones.razonBloqueoMonto ? (
              <p className='flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'>
                <Lock className='mt-0.5 h-3 w-3 flex-shrink-0' />
                <span>{restricciones.razonBloqueoMonto}</span>
              </p>
            ) : null}
            {restricciones.razonBloqueoEntidad && mostrarEntidad ? (
              <p className='flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'>
                <Lock className='mt-0.5 h-3 w-3 flex-shrink-0' />
                <span>{restricciones.razonBloqueoEntidad}</span>
              </p>
            ) : null}
            {restricciones.advertencias.map(adv => (
              <p
                key={adv}
                className='flex items-start gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              >
                <AlertTriangle className='mt-0.5 h-3 w-3 flex-shrink-0' />
                <span>{adv}</span>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
