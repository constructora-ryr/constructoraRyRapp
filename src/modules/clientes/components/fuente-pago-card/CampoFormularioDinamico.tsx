/**
 * Componente: Campo de Formulario Dinámico
 *
 * Renderiza diferentes tipos de campos según la configuración.
 * Soporta validación, ayuda contextual y diseño responsive.
 *
 * @version 1.0 - Sistema Modular de Campos
 */

'use client'

import { forwardRef } from 'react'

import { AlertCircle, HelpCircle } from 'lucide-react'

import {
  useBancos,
  useCajas,
} from '@/modules/configuracion/hooks/useEntidadesFinancierasParaFuentes'
import type {
  CampoConfig,
  ValorCampo,
} from '@/modules/configuracion/types/campos-dinamicos.types'

import { EntidadCombobox } from './EntidadCombobox'

// ============================================
// PROPS
// ============================================

interface CampoFormularioDinamicoProps {
  /** Configuración del campo */
  config: CampoConfig

  /** Valor actual */
  value: ValorCampo

  /** Callback de cambio */
  onChange: (valor: ValorCampo) => void

  /**
   * Callback exclusivo para campos select_banco/select_caja.
   * Recibe el UUID (id) y el nombre (label) de la entidad seleccionada
   * para poder normalizar entidad_financiera_id en la BD.
   */
  onEntidadSeleccionada?: (id: string, label: string) => void

  /** Mensaje de error */
  error?: string

  /** Deshabilitar campo */
  disabled?: boolean

  /** Clase CSS adicional */
  className?: string
}

// ============================================
// COMPONENTE
// ============================================

export const CampoFormularioDinamico = forwardRef<
  HTMLInputElement,
  CampoFormularioDinamicoProps
>(
  (
    {
      config,
      value,
      onChange,
      onEntidadSeleccionada,
      error,
      disabled = false,
      className = '',
    },
    ref
  ) => {
    // ============================================
    // HOOKS
    // ============================================

    const { bancos, isLoading: cargandoBancos } = useBancos()
    const { cajas, isLoading: cargandoCajas } = useCajas()

    // ============================================
    // CLASES BASE
    // ============================================

    const baseInputClasses = `
      w-full px-3 py-2
      bg-white dark:bg-gray-900
      border-2 rounded-lg
      text-sm font-medium
      text-gray-900 dark:text-white
      placeholder:text-gray-400 dark:placeholder:text-gray-500
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${
        error
          ? 'border-red-500 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
          : 'border-gray-200 dark:border-gray-700 focus:border-cyan-500 dark:focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20'
      }
      ${className}
    `.trim()

    const labelClasses = `
      block text-xs font-bold mb-1.5
      text-gray-700 dark:text-gray-300
    `.trim()

    // ============================================
    // RENDERIZADO POR TIPO
    // ============================================

    const renderField = () => {
      switch (config.tipo) {
        // ======== TEXTO SIMPLE ========
        case 'text':
          return (
            <input
              ref={ref}
              type='text'
              value={(value as string) || ''}
              onChange={e => onChange(e.target.value)}
              placeholder={config.placeholder}
              disabled={disabled}
              required={config.requerido}
              pattern={config.pattern}
              className={baseInputClasses}
            />
          )

        // ======== ÁREA DE TEXTO ========
        case 'textarea':
          return (
            <textarea
              value={(value as string) || ''}
              onChange={e => onChange(e.target.value)}
              placeholder={config.placeholder}
              disabled={disabled}
              required={config.requerido}
              rows={3}
              className={`${baseInputClasses} resize-none`}
            />
          )

        // ======== NÚMERO ========
        case 'number':
          return (
            <input
              ref={ref}
              type='number'
              value={(value as number) || ''}
              onChange={e =>
                onChange(e.target.value ? Number(e.target.value) : null)
              }
              placeholder={config.placeholder}
              disabled={disabled}
              required={config.requerido}
              min={config.min}
              max={config.max}
              className={baseInputClasses}
            />
          )

        // ======== MONEDA ========
        case 'currency':
          return (
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 dark:text-gray-400'>
                $
              </span>
              <input
                ref={ref}
                type='text'
                inputMode='numeric'
                value={formatCurrency(value as number)}
                onChange={e => {
                  const numero = parseCurrency(e.target.value)
                  onChange(numero)
                }}
                placeholder={config.placeholder}
                disabled={disabled}
                required={config.requerido}
                className={`${baseInputClasses} pl-7`}
              />
            </div>
          )

        // ======== FECHA ========
        case 'date':
          return (
            <input
              ref={ref}
              type='date'
              value={(value as string) || ''}
              onChange={e => onChange(e.target.value)}
              disabled={disabled}
              required={config.requerido}
              className={baseInputClasses}
            />
          )

        // ======== SELECT BANCO ========
        case 'select_banco':
          return (
            <EntidadCombobox
              opciones={bancos}
              value={(value as string) || ''}
              onChange={v => onChange(v)}
              onSelectOption={opt =>
                onEntidadSeleccionada?.(opt.value, opt.label)
              }
              disabled={disabled || cargandoBancos}
              loading={cargandoBancos}
              placeholder={config.placeholder || 'Buscar banco...'}
              error={!!error}
            />
          )

        // ======== SELECT CAJA ========
        case 'select_caja':
          return (
            <EntidadCombobox
              opciones={cajas}
              value={(value as string) || ''}
              onChange={v => onChange(v)}
              onSelectOption={opt =>
                onEntidadSeleccionada?.(opt.value, opt.label)
              }
              disabled={disabled || cargandoCajas}
              loading={cargandoCajas}
              placeholder={
                config.placeholder || 'Buscar caja de compensación...'
              }
              error={!!error}
            />
          )

        // ======== SELECT CUSTOM ========
        case 'select_custom':
          return (
            <select
              value={(value as string) || ''}
              onChange={e => onChange(e.target.value)}
              disabled={disabled}
              required={config.requerido}
              className={baseInputClasses}
            >
              <option value=''>{config.placeholder || 'Seleccionar...'}</option>
              {config.opciones?.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          )

        // ======== CHECKBOX ========
        case 'checkbox':
          return (
            <label className='flex cursor-pointer items-center gap-2'>
              <input
                ref={ref}
                type='checkbox'
                checked={(value as boolean) || false}
                onChange={e => onChange(e.target.checked)}
                disabled={disabled}
                className='h-4 w-4 rounded border-2 border-gray-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-600'
              />
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                {config.label}
              </span>
            </label>
          )

        // ======== DEFAULT ========
        default:
          return (
            <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20'>
              <p className='text-xs text-amber-600 dark:text-amber-400'>
                ⚠️ Tipo de campo no soportado: {config.tipo}
              </p>
            </div>
          )
      }
    }

    // ============================================
    // RENDERIZADO
    // ============================================

    return (
      <div className='space-y-1.5'>
        {/* Label (excepto checkbox que tiene label integrado) */}
        {config.tipo !== 'checkbox' && (
          <label className={labelClasses}>
            {config.label}
            {config.requerido && <span className='ml-1 text-red-500'>*</span>}
            {config.ayuda && (
              <span
                className='ml-1.5 inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700'
                title={config.ayuda}
              >
                <HelpCircle className='h-2.5 w-2.5 text-gray-600 dark:text-gray-400' />
              </span>
            )}
          </label>
        )}

        {/* Campo */}
        {renderField()}

        {/* Error */}
        {error && (
          <div className='flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 dark:border-red-800 dark:bg-red-900/20'>
            <AlertCircle className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-600 dark:text-red-400' />
            <p className='text-xs font-medium text-red-700 dark:text-red-300'>
              {error}
            </p>
          </div>
        )}

        {/* Ayuda (si no hay error) */}
        {!error && config.ayuda && config.tipo !== 'checkbox' && (
          <p className='text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
            {config.ayuda}
          </p>
        )}
      </div>
    )
  }
)

CampoFormularioDinamico.displayName = 'CampoFormularioDinamico'

// ============================================
// UTILIDADES
// ============================================

/**
 * Formatea número a moneda colombiana
 */
function formatCurrency(value: number | null | undefined): string {
  if (!value) return ''
  return new Intl.NumberFormat('es-CO').format(value)
}

/**
 * Parsea string de moneda a número
 */
function parseCurrency(value: string): number | null {
  if (!value) return null
  const numero = value.replace(/[^\d]/g, '')
  return numero ? parseInt(numero, 10) : null
}
