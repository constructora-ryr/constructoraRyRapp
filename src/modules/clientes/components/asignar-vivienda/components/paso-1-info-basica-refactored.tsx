/**
 * Paso 1: Información Básica
 * ✅ REFACTORIZADO: React Hook Form + Zod (ESTÁNDAR DE LA APLICACIÓN)
 * ✅ Sistema touchedFields (validación progresiva)
 * ✅ Diseño compacto premium
 * ✅ Sistema de descuentos con tipo/motivo
 * ✅ Valor en minuta editable
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  DollarSign,
  Home,
  Info,
  MessageSquare,
  Percent,
  Tag,
  User,
} from 'lucide-react'
import type {
  FieldErrors,
  FieldNamesMarkedBoolean,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { pageStyles as s } from '@/modules/clientes/pages/asignar-vivienda/styles'
import { FormSelect } from '@/shared/components/ui/form-select'

import type { AsignarViviendaFormData } from '../schemas'
import type { ProyectoBasico, ViviendaDetalle } from '../types'

import { ViviendaCombobox } from './vivienda-combobox'

interface Paso1InfoBasicaRefactoredProps {
  // React Hook Form
  register: UseFormRegister<AsignarViviendaFormData>
  errors: FieldErrors<AsignarViviendaFormData>
  touchedFields: Partial<
    Readonly<FieldNamesMarkedBoolean<AsignarViviendaFormData>>
  >
  setValue: UseFormSetValue<AsignarViviendaFormData>
  watch: UseFormWatch<AsignarViviendaFormData>

  // Data
  clienteNombre?: string
  proyectos: ProyectoBasico[]
  viviendas: ViviendaDetalle[]
  cargandoProyectos: boolean
  cargandoViviendas: boolean
  viviendaIdProp?: string

  // Handlers
  onProyectoChange: (proyectoId: string) => void
  onViviendaChange: (viviendaId: string) => void
}

export function Paso1InfoBasicaRefactored({
  register,
  errors,
  touchedFields: _touchedFields,
  setValue,
  watch,
  clienteNombre,
  proyectos,
  viviendas,
  cargandoProyectos,
  cargandoViviendas,
  viviendaIdProp,
  onProyectoChange,
  onViviendaChange,
}: Paso1InfoBasicaRefactoredProps) {
  // Observar valores del formulario
  const proyecto_id = watch('proyecto_id')
  const vivienda_id = watch('vivienda_id')
  const descuento_aplicado = watch('descuento_aplicado') || 0
  const motivo_descuento = watch('motivo_descuento')
  const valor_escritura_publica = watch('valor_escritura_publica')
  const aplicar_descuento = watch('aplicar_descuento') || false

  // Estado local sincronizado con formulario
  const aplicarDescuento = aplicar_descuento

  // Obtener vivienda seleccionada para gastos notariales
  const viviendaSeleccionada = viviendas.find(v => v.id === vivienda_id)
  const gastos_notariales = viviendaSeleccionada?.gastos_notariales || 5000000 // Default $5M
  const valor_base = viviendaSeleccionada?.valor_base || 0
  const recargo_esquinera = viviendaSeleccionada?.recargo_esquinera || 0
  const es_esquinera = viviendaSeleccionada?.es_esquinera || false
  const valor_total_original =
    valor_base + gastos_notariales + recargo_esquinera
  const valor_final = valor_total_original - descuento_aplicado
  const porcentaje_descuento =
    valor_total_original > 0 && descuento_aplicado > 0
      ? ((descuento_aplicado / valor_total_original) * 100).toFixed(2)
      : '0'
  const diferencia_notarial = valor_escritura_publica
    ? valor_escritura_publica - valor_final
    : 0

  // Calcular progreso (2 campos obligatorios: proyecto y vivienda)
  const camposCompletados = [!!proyecto_id, !!vivienda_id].filter(
    Boolean
  ).length

  const porcentajeProgreso = Math.round((camposCompletados / 2) * 100)

  // Helper para clases de input (igual que proyectos/viviendas)
  const getInputClasses = (fieldName: keyof AsignarViviendaFormData) => {
    const hasError = errors[fieldName]
    return `${s.input.base} ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : ''
    }`
  }

  // Helper para mostrar error (igual que proyectos/viviendas)
  const showError = (fieldName: keyof AsignarViviendaFormData) => {
    return errors[fieldName]
  }

  // Opciones de tipo de descuento
  const tiposDescuento = [
    { value: 'trabajador_empresa', label: 'Trabajador de la Empresa' },
    { value: 'cliente_vip', label: 'Cliente VIP' },
    { value: 'promocion_especial', label: 'Promoción Especial' },
    { value: 'pronto_pago', label: 'Pronto Pago' },
    { value: 'negociacion_comercial', label: 'Negociación Comercial' },
    { value: 'liquidacion', label: 'Liquidación de Inventario' },
    { value: 'otro', label: 'Otro' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className='space-y-3'
    >
      {/* Información Guía */}
      <div className='rounded-lg border border-cyan-200/50 bg-gradient-to-br from-cyan-50/90 to-blue-50/90 p-2.5 shadow-lg backdrop-blur-xl dark:border-cyan-800/50 dark:from-cyan-950/30 dark:to-blue-950/30'>
        <p className='text-xs leading-relaxed text-cyan-800 dark:text-cyan-200'>
          <span className='font-bold'>📋 Instrucciones:</span> Selecciona el{' '}
          <span className='font-semibold'>proyecto</span> y la{' '}
          <span className='font-semibold'>vivienda</span> que deseas asignar. El
          valor se cargará automáticamente. Opcionalmente puedes aplicar un
          descuento.
        </p>
      </div>

      {/* Barra de Progreso */}
      <div className='rounded-lg border border-blue-200/50 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 p-2.5 shadow-lg backdrop-blur-xl dark:border-blue-800/50 dark:from-blue-950/30 dark:to-indigo-950/30'>
        <div className='mb-2 flex items-center justify-between'>
          <span className='flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300'>
            <CheckCircle2 className='h-3.5 w-3.5' />
            Progreso: {camposCompletados}/2 campos obligatorios
          </span>
          <span className='text-xs font-bold text-blue-600 dark:text-blue-400'>
            {porcentajeProgreso}%
          </span>
        </div>
        <div className='h-1.5 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900/50'>
          <motion.div
            className='h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg'
            initial={{ width: 0 }}
            animate={{ width: `${porcentajeProgreso}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Cliente Seleccionado */}
      <div className={s.alert.info}>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'>
          <User className='h-5 w-5 text-white' />
        </div>
        <div>
          <p className='text-xs font-semibold text-cyan-700 dark:text-cyan-300'>
            Cliente Seleccionado
          </p>
          <p className='mt-0.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent'>
            {formatNombreCompleto(clienteNombre) || 'Cliente seleccionado'}
          </p>
        </div>
      </div>

      {/* Grid de Campos */}
      <div className='grid grid-cols-1 gap-2.5 md:grid-cols-2'>
        {/* Proyecto */}
        <div className='space-y-1'>
          <label className={s.label.base}>
            <Building2 className='h-4 w-4 text-cyan-500 dark:text-cyan-400' />
            Proyecto
            <span className='ml-0.5 text-red-500'>*</span>
          </label>
          <FormSelect
            {...register('proyecto_id')}
            disabled={cargandoProyectos || !!viviendaIdProp}
            onChange={e => {
              setValue('proyecto_id', e.target.value)
              onProyectoChange(e.target.value)
            }}
            className={getInputClasses('proyecto_id')}
          >
            <option value=''>Selecciona un proyecto</option>
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </FormSelect>
          {showError('proyecto_id') && (
            <p className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
              <AlertCircle className='h-3 w-3' />
              {errors.proyecto_id?.message as string}
            </p>
          )}
        </div>

        {/* Vivienda */}
        <div className='space-y-1'>
          <label className={s.label.base}>
            <Home className='h-4 w-4 text-blue-500 dark:text-blue-400' />
            Vivienda
            <span className='ml-0.5 text-red-500'>*</span>
          </label>

          <ViviendaCombobox
            viviendas={viviendas}
            value={vivienda_id}
            onChange={id => {
              setValue('vivienda_id', id)
              onViviendaChange(id)
            }}
            disabled={!proyecto_id || cargandoViviendas || !!viviendaIdProp}
            placeholder='Busca por manzana o número (ej: A3)'
          />

          {showError('vivienda_id') && (
            <p className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
              <AlertCircle className='h-3 w-3' />
              {errors.vivienda_id?.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Sistema de Descuentos */}
      {vivienda_id && valor_total_original > 0 && (
        <div className='space-y-2.5'>
          {/* Campo hidden para registrar aplicar_descuento en el formulario */}
          <input type='hidden' {...register('aplicar_descuento')} />

          {/* Checkbox Toggle - DESTACADO CON CARD */}
          <div
            className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
              aplicarDescuento
                ? 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-[2px] shadow-lg shadow-orange-500/30'
                : 'bg-gray-200 p-[2px] hover:bg-gradient-to-br hover:from-orange-500 hover:to-orange-400 dark:bg-gray-700'
            } `}
          >
            <label
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-[10px] p-4 transition-all duration-300 ${
                aplicarDescuento
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-white hover:bg-orange-50/50 dark:bg-gray-800 dark:hover:bg-orange-950/20'
              } `}
            >
              <div className='flex flex-1 items-center gap-3'>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
                    aplicarDescuento
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/50'
                      : 'bg-gray-100 dark:bg-gray-700'
                  } `}
                >
                  <Tag
                    className={`h-5 w-5 ${aplicarDescuento ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}
                  />
                </div>

                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-base font-bold transition-colors ${
                        aplicarDescuento
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'
                          : 'text-gray-700 dark:text-gray-300'
                      } `}
                    >
                      ¿Aplicar descuento a esta vivienda?
                    </span>
                    <span className='inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                      Opcional
                    </span>
                  </div>
                  <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                    Activa esta opción para aplicar un descuento especial
                  </p>
                </div>
              </div>

              <input
                type='checkbox'
                checked={aplicarDescuento}
                onChange={e => {
                  const checked = e.target.checked
                  setValue('aplicar_descuento', checked)
                  if (!checked) {
                    // Limpiar campos
                    setValue('descuento_aplicado', 0)
                    setValue('tipo_descuento', '')
                    setValue('motivo_descuento', '')
                  }
                }}
                className='h-6 w-6 cursor-pointer rounded-lg border-2 border-gray-300 text-orange-600 transition-all focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600'
              />
            </label>
          </div>

          {/* Sección Expandible de Descuento */}
          <AnimatePresence>
            {aplicarDescuento && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='overflow-hidden'
              >
                <div className='space-y-2.5 rounded-lg border-2 border-orange-200/50 bg-gradient-to-br from-orange-50/90 to-amber-50/90 p-3 shadow-lg backdrop-blur-xl dark:border-orange-800/50 dark:from-orange-950/30 dark:to-amber-950/30'>
                  <h3 className='flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300'>
                    <Tag className='h-3.5 w-3.5' />
                    Detalles del Descuento
                  </h3>

                  <div className='grid grid-cols-1 gap-2.5 md:grid-cols-2'>
                    {/* Monto del Descuento */}
                    <div className='space-y-1'>
                      <label className={s.label.base}>
                        <DollarSign className='h-4 w-4 text-red-500 dark:text-red-400' />
                        Monto del Descuento
                        <span
                          className='ml-0.5 text-red-500'
                          title='Campo obligatorio'
                        >
                          *
                        </span>
                      </label>
                      <div className='relative'>
                        <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>
                          $
                        </span>
                        <input
                          type='text'
                          value={
                            descuento_aplicado > 0
                              ? descuento_aplicado.toLocaleString('es-CO')
                              : ''
                          }
                          onChange={e => {
                            const valor = e.target.value
                              .replace(/\./g, '')
                              .replace(/,/g, '')
                            const numero = Number(valor)
                            if (
                              !isNaN(numero) &&
                              numero <= valor_total_original
                            ) {
                              setValue('descuento_aplicado', numero)
                            }
                          }}
                          placeholder='0'
                          className={`${getInputClasses('descuento_aplicado')} pl-8`}
                        />
                      </div>
                      {showError('descuento_aplicado') && (
                        <p className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
                          <AlertCircle className='h-3 w-3' />
                          {errors.descuento_aplicado?.message as string}
                        </p>
                      )}
                      {descuento_aplicado > 0 && (
                        <p className='mt-1 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400'>
                          <Percent className='h-3 w-3' />
                          Descuento del {porcentaje_descuento}%
                        </p>
                      )}
                    </div>

                    {/* Tipo de Descuento */}
                    <div className='space-y-1'>
                      <label className={s.label.base}>
                        <Tag className='h-4 w-4 text-orange-500 dark:text-orange-400' />
                        Tipo de Descuento
                        <span
                          className='ml-0.5 text-red-500'
                          title='Campo obligatorio'
                        >
                          *
                        </span>
                      </label>
                      <FormSelect
                        {...register('tipo_descuento')}
                        onChange={e =>
                          setValue('tipo_descuento', e.target.value)
                        }
                        className={getInputClasses('tipo_descuento')}
                      >
                        <option value=''>Selecciona un tipo</option>
                        {tiposDescuento.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </FormSelect>
                      {showError('tipo_descuento') && (
                        <p className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
                          <AlertCircle className='h-3 w-3' />
                          {errors.tipo_descuento?.message as string}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Motivo del Descuento */}
                  <div className='space-y-1'>
                    <label className={s.label.base}>
                      <MessageSquare className='h-4 w-4 text-orange-500 dark:text-orange-400' />
                      Motivo del Descuento
                      <span
                        className='ml-0.5 text-red-500'
                        title='Campo obligatorio'
                      >
                        *
                      </span>
                      <span className='ml-auto text-xs font-normal text-gray-500 dark:text-gray-400'>
                        {motivo_descuento?.length || 0}/500 (mín 10)
                      </span>
                    </label>
                    <textarea
                      {...register('motivo_descuento')}
                      rows={2}
                      maxLength={500}
                      placeholder='Describe la razón del descuento (mínimo 10 caracteres)'
                      className={getInputClasses('motivo_descuento')}
                    />
                    {showError('motivo_descuento') && (
                      <p className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
                        <AlertCircle className='h-3 w-3' />
                        {errors.motivo_descuento?.message as string}
                      </p>
                    )}
                  </div>

                  {/* Resumen Visual del Descuento */}
                  {descuento_aplicado > 0 && (
                    <div className='border-t border-orange-200 pt-2 dark:border-orange-800'>
                      <div className='space-y-1.5 text-xs'>
                        <div className='flex items-center justify-between'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            Valor Original:
                          </span>
                          <span className='font-semibold text-gray-900 dark:text-white'>
                            ${valor_total_original.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className='flex items-center justify-between text-red-600 dark:text-red-400'>
                          <span>Descuento ({porcentaje_descuento}%):</span>
                          <span className='font-bold'>
                            -${descuento_aplicado.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className='flex items-center justify-between border-t border-orange-200 pt-1.5 dark:border-orange-800'>
                          <span className='font-bold text-green-700 dark:text-green-300'>
                            Valor Final:
                          </span>
                          <span className='text-lg font-bold text-green-600 dark:text-green-400'>
                            ${valor_final.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Valor en Escritura Pública — DATO LEGAL, no afecta el plan financiero */}
      {vivienda_id && valor_total_original > 0 && (
        <div className='rounded-lg border border-blue-200/60 bg-blue-50/80 p-3 shadow-sm backdrop-blur-xl dark:border-blue-800/60 dark:bg-blue-950/20'>
          <div className='mb-2.5 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Info className='h-4 w-4 flex-shrink-0 text-blue-500 dark:text-blue-400' />
              <span className='text-xs font-bold text-blue-700 dark:text-blue-300'>
                Valor en Escritura Pública
              </span>
            </div>
            <span className='inline-flex items-center rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-400'>
              DATO LEGAL
            </span>
          </div>
          <p className='mb-2.5 text-[10px] leading-relaxed text-blue-600/80 dark:text-blue-400/80'>
            Solo para efectos legales y bancarios.{' '}
            <strong>No afecta el plan financiero</strong> — el banco lo usa para
            calcular el crédito.
          </p>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-blue-400 dark:text-blue-500'>
              $
            </span>
            <input
              type='text'
              value={
                valor_escritura_publica
                  ? valor_escritura_publica.toLocaleString('es-CO')
                  : ''
              }
              onChange={e => {
                const valor = e.target.value
                  .replace(/\./g, '')
                  .replace(/,/g, '')
                const numero = Number(valor)
                if (!isNaN(numero) && numero > 0) {
                  setValue('valor_escritura_publica', numero)
                }
              }}
              placeholder='128.000.000'
              className='w-full rounded-lg border border-blue-200 bg-white py-2.5 pl-7 pr-3 text-sm font-semibold text-blue-800 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:border-blue-800 dark:bg-gray-900/60 dark:text-blue-200'
            />
          </div>
          {valor_escritura_publica && diferencia_notarial !== 0 && (
            <p className='mt-2 flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400'>
              <Info className='h-3 w-3' />
              Diferencia con valor real:{' '}
              <span className='font-bold'>
                {diferencia_notarial > 0 ? '+' : ''}$
                {diferencia_notarial.toLocaleString('es-CO')}
              </span>{' '}
              (solo en papel)
            </p>
          )}
        </div>
      )}

      {/* Notas */}
      <div className='space-y-1'>
        <label className={s.label.base}>
          <MessageSquare className='h-4 w-4 text-indigo-500 dark:text-indigo-400' />
          Notas / Observaciones
          <span className='ml-auto text-xs font-normal text-gray-500 dark:text-gray-400'>
            (opcional)
          </span>
        </label>
        <textarea
          {...register('notas')}
          rows={2}
          placeholder='Ej: Cliente solicitó descuento por pronto pago, tiene preferencia por segundo piso...'
          className={s.input.base}
        />
      </div>

      {/* Resumen Final */}
      {vivienda_id && valor_final > 0 && (
        <div className='rounded-lg border-2 border-green-200/50 bg-gradient-to-br from-green-50/90 to-emerald-50/90 p-4 backdrop-blur-xl dark:border-green-800/50 dark:from-green-950/30 dark:to-emerald-950/30'>
          <div className='space-y-3'>
            <h3 className='flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-300'>
              <CheckCircle2 className='h-4 w-4' />
              Resumen de la Asignación
            </h3>
            <div className='space-y-2 text-xs'>
              {/* Valor Base */}
              <div className='flex items-center justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Valor Base Vivienda:
                </span>
                <span className='font-semibold text-gray-900 dark:text-white'>
                  ${valor_base.toLocaleString('es-CO')}
                </span>
              </div>

              {/* Gastos Notariales */}
              <div className='flex items-center justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Gastos Notariales:
                </span>
                <span className='font-semibold text-gray-900 dark:text-white'>
                  ${gastos_notariales.toLocaleString('es-CO')}
                </span>
              </div>

              {/* Recargo Esquinera (solo si aplica) */}
              {es_esquinera && recargo_esquinera > 0 && (
                <div className='flex items-center justify-between'>
                  <span className='flex items-center gap-1 text-gray-600 dark:text-gray-400'>
                    Recargo Esquinera:
                    <span className='inline-flex items-center rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'>
                      ESQUINA
                    </span>
                  </span>
                  <span className='font-semibold text-orange-600 dark:text-orange-400'>
                    +${recargo_esquinera.toLocaleString('es-CO')}
                  </span>
                </div>
              )}

              {/* Descuento (solo si aplica) */}
              {descuento_aplicado > 0 && (
                <div className='flex items-center justify-between'>
                  <span className='flex items-center gap-1 text-gray-600 dark:text-gray-400'>
                    Descuento Aplicado:
                    <span className='inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400'>
                      {porcentaje_descuento}%
                    </span>
                  </span>
                  <span className='font-bold text-red-600 dark:text-red-400'>
                    -${descuento_aplicado.toLocaleString('es-CO')}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className='border-t-2 border-green-200 pt-2 dark:border-green-800' />

              {/* Total Final */}
              <div className='flex items-center justify-between'>
                <span className='text-sm font-bold text-green-700 dark:text-green-300'>
                  Valor Total a Pagar:
                </span>
                <span className='bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent'>
                  ${valor_final.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
