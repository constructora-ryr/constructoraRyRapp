/**
 * Componente: Modal de Formulario de Tipo de Fuente de Pago
 *
 * Modal profesional para crear/editar tipos de fuentes de pago.
 *
 * ✅ REFACTORIZADO según REGLA CRÍTICA #0
 * - Componente < 150 líneas (SOLO UI PRESENTACIONAL)
 * - Lógica en useTipoFuentePagoFormModal.ts
 * - Estilos en TipoFuentePagoFormModal.styles.ts
 *
 * Responsabilidad: UI PRESENTACIONAL (NO LÓGICA)
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, Loader2, X } from 'lucide-react'

import { FormSelect } from '@/shared/components/ui/form-select'

import { useTipoFuentePagoFormModal } from '../hooks/useTipoFuentePagoFormModal'
import type { TipoFuentePago } from '../types'
import { TIPO_FUENTE_PAGO_LIMITS } from '../types'

import { tipoFuentePagoFormModalStyles as s } from './TipoFuentePagoFormModal.styles'

// =====================================================
// PROPS
// =====================================================

interface TipoFuentePagoFormModalProps {
  isOpen: boolean
  onClose: () => void
  tipoFuente?: TipoFuentePago | null
  onSuccess?: () => void
}

// =====================================================
// COMPONENT
// =====================================================

export function TipoFuentePagoFormModal({
  isOpen,
  onClose,
  tipoFuente,
  onSuccess,
}: TipoFuentePagoFormModalProps) {
  // ✅ HOOK CON TODA LA LÓGICA
  const {
    isEditing,
    isPending,
    register,
    handleSubmit,
    errors,
    isDirty,
    onSubmit,
  } = useTipoFuentePagoFormModal({ isOpen, onClose, tipoFuente, onSuccess })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className={s.backdrop}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={s.backdropOverlay}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={s.modal}
        >
          {/* Header */}
          <div className={s.header.container}>
            <h2 className={s.header.title}>
              {isEditing ? 'Editar Tipo de Fuente' : 'Nueva Fuente de Pago'}
            </h2>
            <button
              onClick={onClose}
              disabled={isPending}
              className={s.header.closeButton}
            >
              <X className={s.header.closeIcon} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className={s.form.container}>
            {/* Información Básica */}
            <div className={s.form.section}>
              <h3 className={s.form.sectionTitle}>Información Básica</h3>

              {/* Nombre */}
              <div className={s.input.container}>
                <label className={s.input.label}>
                  Nombre <span className={s.input.required}>*</span>
                </label>
                <input
                  {...register('nombre')}
                  type='text'
                  placeholder='Ej: Crédito Hipotecario'
                  className={s.input.field}
                  disabled={isPending}
                />
                {errors.nombre && (
                  <p className={s.input.error}>
                    <AlertCircle className={s.input.errorIcon} />
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              {/* Código */}
              <div className={s.input.container}>
                <label className={s.input.label}>
                  Código <span className={s.input.required}>*</span>
                  <span className={s.input.hint}>(snake_case, único)</span>
                </label>
                <input
                  {...register('codigo')}
                  type='text'
                  placeholder='Ej: credito_hipotecario'
                  className={s.input.fieldMono}
                  disabled={isPending || isEditing}
                />
                {errors.codigo && (
                  <p className={s.input.error}>
                    <AlertCircle className={s.input.errorIcon} />
                    {errors.codigo.message}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div className={s.input.container}>
                <label className={s.input.label}>Descripción</label>
                <textarea
                  {...register('descripcion')}
                  rows={3}
                  placeholder='Breve descripción de la fuente de pago...'
                  className={s.input.textarea}
                  disabled={isPending}
                />
                {errors.descripcion && (
                  <p className={s.input.error}>{errors.descripcion.message}</p>
                )}
              </div>
            </div>

            {/* Configuración */}
            <div className={s.form.section}>
              <h3 className={s.form.sectionTitle}>Configuración</h3>

              <div className={s.grid.threeColumns}>
                <label className={s.checkbox.container}>
                  <input
                    {...register('requiere_entidad')}
                    type='checkbox'
                    className={s.checkbox.field}
                    disabled={isPending}
                  />
                  <div className={s.checkbox.labelContainer}>
                    <p className={s.checkbox.label}>Requiere Entidad</p>
                    <p className={s.checkbox.description}>Banco/Caja</p>
                  </div>
                </label>

                <label className={s.checkbox.container}>
                  <input
                    {...register('permite_multiples_abonos')}
                    type='checkbox'
                    className={s.checkbox.field}
                    disabled={isPending}
                  />
                  <div className={s.checkbox.labelContainer}>
                    <p className={s.checkbox.label}>Múltiples Abonos</p>
                    <p className={s.checkbox.description}>Pagos parciales</p>
                  </div>
                </label>

                <label className={s.checkbox.container}>
                  <input
                    {...register('es_subsidio')}
                    type='checkbox'
                    className={s.checkbox.field}
                    disabled={isPending}
                  />
                  <div className={s.checkbox.labelContainer}>
                    <p className={s.checkbox.label}>Es Subsidio</p>
                    <p className={s.checkbox.description}>Gubernamental</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Apariencia */}
            <div className={s.form.section}>
              <h3 className={s.form.sectionTitle}>Apariencia</h3>

              <div className={s.grid.twoColumns}>
                <div className={s.input.container}>
                  <label className={s.input.label}>Color</label>
                  <FormSelect
                    {...register('color')}
                    className={s.input.field}
                    disabled={isPending}
                  >
                    <option value='blue'>Azul</option>
                    <option value='green'>Verde</option>
                    <option value='purple'>Púrpura</option>
                    <option value='orange'>Naranja</option>
                    <option value='red'>Rojo</option>
                    <option value='cyan'>Cyan</option>
                    <option value='pink'>Rosa</option>
                    <option value='indigo'>Índigo</option>
                    <option value='yellow'>Amarillo</option>
                    <option value='emerald'>Esmeralda</option>
                  </FormSelect>
                </div>

                <div className={s.input.container}>
                  <label className={s.input.label}>Icono</label>
                  <FormSelect
                    {...register('icono')}
                    className={s.input.field}
                    disabled={isPending}
                  >
                    <option value='Wallet'>Wallet (Billetera)</option>
                    <option value='Building2'>Building2 (Banco)</option>
                    <option value='Home'>Home (Casa)</option>
                    <option value='Shield'>Shield (Escudo)</option>
                    <option value='CreditCard'>CreditCard (Tarjeta)</option>
                    <option value='Landmark'>Landmark (Institución)</option>
                    <option value='BadgeDollarSign'>
                      BadgeDollarSign (Insignia $)
                    </option>
                    <option value='DollarSign'>DollarSign (Dólar)</option>
                    <option value='Banknote'>Banknote (Billete)</option>
                    <option value='HandCoins'>HandCoins (Monedas)</option>
                  </FormSelect>
                </div>
              </div>

              <div className={s.input.container}>
                <label className={s.input.label}>Orden de Visualización</label>
                <input
                  {...register('orden', { valueAsNumber: true })}
                  type='number'
                  min={TIPO_FUENTE_PAGO_LIMITS.ORDEN_MIN}
                  max={TIPO_FUENTE_PAGO_LIMITS.ORDEN_MAX}
                  className={s.input.field}
                  disabled={isPending}
                />
                {errors.orden && (
                  <p className={s.input.error}>{errors.orden.message}</p>
                )}
              </div>

              <label className={s.checkbox.container}>
                <input
                  {...register('activo')}
                  type='checkbox'
                  className={s.checkbox.fieldActive}
                  disabled={isPending}
                />
                <div className={s.checkbox.labelContainer}>
                  <p className={s.checkbox.label}>Fuente Activa</p>
                  <p className={s.checkbox.description}>
                    Disponible para usar en negociaciones
                  </p>
                </div>
              </label>
            </div>

            {/* Info: Configurar Requisitos */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30'>
              <p className='mb-1 text-sm font-medium text-blue-900 dark:text-blue-100'>
                💡 Configuración de Requisitos
              </p>
              <p className='text-xs text-blue-700 dark:text-blue-300'>
                Para configurar los documentos obligatorios de esta fuente, ve a{' '}
                <strong>Admin → Fuentes de Pago → Requisitos de Fuentes</strong>
              </p>
            </div>

            {/* Actions */}
            <div className={s.actions.container}>
              <button
                type='button'
                onClick={onClose}
                disabled={isPending}
                className={s.actions.cancelButton}
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={isPending || !isDirty}
                className={s.actions.submitButton}
              >
                {isPending ? (
                  <>
                    <Loader2 className={s.actions.iconSpin} />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Check className={s.actions.icon} />
                    {isEditing ? 'Actualizar' : 'Crear Fuente'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
