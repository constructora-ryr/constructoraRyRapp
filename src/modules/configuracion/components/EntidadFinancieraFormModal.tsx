/**
 * Component: EntidadFinancieraFormModal
 *
 * Modal para crear/editar entidades financieras.
 * Componente presentacional puro - toda la lógica está en useEntidadFinancieraFormModal.
 */

'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpDown,
  BadgeDollarSign,
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  HandCoins,
  Hash,
  Home,
  Landmark,
  Mail,
  MapPin,
  Palette,
  Phone,
  Shield,
  Wallet,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { FormSelect } from '@/shared/components/ui/form-select'

import { useEntidadFinancieraFormModal } from '../hooks/useEntidadFinancieraFormModal'
import type { EntidadFinanciera } from '../types/entidades-financieras.types'
import {
  ENTIDAD_COLOR_VALUES,
  TIPO_ENTIDAD_VALUES,
} from '../types/entidades-financieras.types'
import type { TipoFuenteIcono } from '../types/tipos-fuentes-pago.types'

import {
  colorClasses,
  entidadFinancieraModalAnimations,
  entidadFinancieraModalStyles as styles,
} from './EntidadFinancieraFormModal.styles'

// =====================================================
// ICON MAP
// =====================================================

const ICON_MAP: Record<
  TipoFuenteIcono,
  React.ComponentType<{ className?: string }>
> = {
  Wallet,
  Building2,
  Home,
  Shield,
  CreditCard,
  Landmark,
  BadgeDollarSign,
  DollarSign,
  Banknote,
  HandCoins,
}

// =====================================================
// PROPS
// =====================================================

interface EntidadFinancieraFormModalProps {
  isOpen: boolean
  onClose: () => void
  entidad?: EntidadFinanciera | null
}

// =====================================================
// COMPONENT
// =====================================================

export function EntidadFinancieraFormModal({
  isOpen,
  onClose,
  entidad,
}: EntidadFinancieraFormModalProps) {
  const {
    register,
    handleSubmit,
    errors,
    selectedColor,
    fuentesSeleccionadas,
    fuentesDisponibles,
    loadingFuentes,
    toggleFuente,
    handleClose,
    isEdit,
    isSubmitting,
  } = useEntidadFinancieraFormModal({ entidad, onClose })

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <>
          {/* Backdrop */}
          <motion.div
            {...entidadFinancieraModalAnimations.backdrop}
            onClick={handleClose}
            className={styles.backdrop}
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
          />

          {/* Modal */}
          <div
            className={styles.container}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            <motion.div
              {...entidadFinancieraModalAnimations.modal}
              className={styles.modal}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className={styles.header.container}>
                <div className={styles.header.content}>
                  <div className='flex items-center gap-3'>
                    <div className={styles.header.icon}>
                      <Building2 className={styles.header.iconSvg} />
                    </div>
                    <div>
                      <h2 className={styles.header.title}>
                        {isEdit
                          ? 'Editar Entidad Financiera'
                          : 'Nueva Entidad Financiera'}
                      </h2>
                      <p className={styles.header.subtitle}>
                        {isEdit
                          ? 'Actualiza la información'
                          : 'Registra banco, caja o cooperativa'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className={styles.header.closeButton}
                  >
                    <X className={styles.header.closeIcon} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className={styles.form.container}>
                <div className={styles.form.grid}>
                  {/* Nombre */}
                  <div>
                    <label className={styles.input.label}>Nombre *</label>
                    <div className={styles.input.relative}>
                      <Building2 className={styles.input.icon} />
                      <input
                        {...register('nombre')}
                        className={styles.input.inputWithIcon}
                        placeholder='Bancolombia'
                      />
                    </div>
                    {errors.nombre ? (
                      <p className={styles.input.error}>
                        {errors.nombre.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Código */}
                  <div>
                    <label className={styles.input.label}>Código *</label>
                    <div className={styles.input.relative}>
                      <Hash className={styles.input.icon} />
                      <input
                        {...register('codigo')}
                        className={styles.input.inputWithIcon}
                        placeholder='bancolombia'
                      />
                    </div>
                    {errors.codigo ? (
                      <p className={styles.input.error}>
                        {errors.codigo.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className={styles.input.label}>
                      Tipo *{' '}
                      <span className={styles.input.labelHint}>
                        (categorización visual)
                      </span>
                    </label>
                    <FormSelect
                      {...register('tipo')}
                      className={styles.select.base}
                    >
                      {TIPO_ENTIDAD_VALUES.map(tipo => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </FormSelect>
                    {errors.tipo ? (
                      <p className={styles.input.error}>
                        {errors.tipo.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Fuentes de Pago Aplicables */}
                  <div className={styles.form.gridFullWidth}>
                    <label className={styles.input.label}>
                      Fuentes de Pago Aplicables *
                    </label>
                    <p className={styles.fuentesAplicables.description}>
                      Selecciona en qué tipos de fuentes aparecerá esta entidad.
                      Ejemplo: Bancolombia solo en Crédito Hipotecario, Comfandi
                      solo en Subsidio de Cajas.
                    </p>
                    {loadingFuentes ? (
                      <div className={styles.fuentesAplicables.loadingBox}>
                        Cargando fuentes disponibles...
                      </div>
                    ) : fuentesDisponibles.length === 0 ? (
                      <div className={styles.fuentesAplicables.emptyBox}>
                        No hay fuentes de pago que requieran entidad. Crea
                        primero tipos de fuentes con &quot;Requiere
                        Entidad&quot; activado.
                      </div>
                    ) : (
                      <div className={styles.fuentesAplicables.listContainer}>
                        {fuentesDisponibles.map(fuente => {
                          const isSelected = fuentesSeleccionadas.includes(
                            fuente.id
                          )
                          const Icon = ICON_MAP[fuente.icono] || Wallet

                          return (
                            <label
                              key={fuente.id}
                              className={styles.fuentesAplicables.listItem}
                            >
                              <input
                                type='checkbox'
                                checked={isSelected}
                                onChange={() => toggleFuente(fuente.id)}
                                className={
                                  styles.fuentesAplicables.checkboxInput
                                }
                              />
                              <div
                                className={styles.fuentesAplicables.itemContent}
                              >
                                <div className='flex items-center gap-2'>
                                  <Icon className='h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400' />
                                  <p
                                    className={
                                      styles.fuentesAplicables.itemTitle
                                    }
                                  >
                                    {fuente.nombre}
                                  </p>
                                </div>
                              </div>
                              {isSelected ? (
                                <CheckCircle2
                                  className={styles.fuentesAplicables.checkIcon}
                                />
                              ) : null}
                            </label>
                          )
                        })}
                      </div>
                    )}
                    {fuentesSeleccionadas.length > 0 ? (
                      <p className={styles.fuentesAplicables.counterSuccess}>
                        ✓ {fuentesSeleccionadas.length} fuente(s)
                        seleccionada(s)
                      </p>
                    ) : (
                      <p className={styles.fuentesAplicables.counterEmpty}>
                        Selecciona al menos una fuente de pago
                      </p>
                    )}
                  </div>

                  {/* NIT */}
                  <div>
                    <label className={styles.input.label}>NIT</label>
                    <input
                      {...register('nit')}
                      className={styles.input.inputBase}
                      placeholder='890.123.456-7'
                    />
                    {errors.nit ? (
                      <p className={styles.input.error}>{errors.nit.message}</p>
                    ) : null}
                  </div>

                  {/* Razón Social */}
                  <div className={styles.form.gridFullWidth}>
                    <label className={styles.input.label}>Razón Social</label>
                    <input
                      {...register('razon_social')}
                      className={styles.input.inputBase}
                      placeholder='Bancolombia S.A.'
                    />
                    {errors.razon_social ? (
                      <p className={styles.input.error}>
                        {errors.razon_social.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className={styles.input.label}>Teléfono</label>
                    <div className={styles.input.relative}>
                      <Phone className={styles.input.icon} />
                      <input
                        {...register('telefono')}
                        className={styles.input.inputWithIcon}
                        placeholder='(602) 123-4567'
                      />
                    </div>
                    {errors.telefono ? (
                      <p className={styles.input.error}>
                        {errors.telefono.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={styles.input.label}>Email</label>
                    <div className={styles.input.relative}>
                      <Mail className={styles.input.icon} />
                      <input
                        {...register('email_contacto')}
                        type='email'
                        className={styles.input.inputWithIcon}
                        placeholder='contacto@banco.com'
                      />
                    </div>
                    {errors.email_contacto ? (
                      <p className={styles.input.error}>
                        {errors.email_contacto.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Sitio Web */}
                  <div>
                    <label className={styles.input.label}>Sitio Web</label>
                    <div className={styles.input.relative}>
                      <Globe className={styles.input.icon} />
                      <input
                        {...register('sitio_web')}
                        type='url'
                        className={styles.input.inputWithIcon}
                        placeholder='https://www.banco.com'
                      />
                    </div>
                    {errors.sitio_web ? (
                      <p className={styles.input.error}>
                        {errors.sitio_web.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Código Superintendencia */}
                  <div>
                    <label className={styles.input.label}>
                      Código Superintendencia
                    </label>
                    <input
                      {...register('codigo_superintendencia')}
                      className={styles.input.inputBase}
                      placeholder='007'
                    />
                    {errors.codigo_superintendencia ? (
                      <p className={styles.input.error}>
                        {errors.codigo_superintendencia.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Dirección */}
                  <div className={styles.form.gridFullWidth}>
                    <label className={styles.input.label}>Dirección</label>
                    <div className={styles.input.relative}>
                      <MapPin className={styles.input.iconTop} />
                      <textarea
                        {...register('direccion')}
                        rows={2}
                        className={styles.textarea.base}
                        placeholder='Calle 50 # 51-80, Cali, Valle del Cauca'
                      />
                    </div>
                    {errors.direccion ? (
                      <p className={styles.input.error}>
                        {errors.direccion.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Color */}
                  <div>
                    <label className={styles.input.label}>
                      Color Representativo
                    </label>
                    <div className={styles.colorPicker.container}>
                      <Palette className={styles.colorPicker.icon} />
                      <FormSelect
                        {...register('color')}
                        className={styles.select.withIcon}
                      >
                        {ENTIDAD_COLOR_VALUES.map(color => (
                          <option key={color} value={color}>
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </option>
                        ))}
                      </FormSelect>
                      <div
                        className={`${styles.colorPicker.preview} ${colorClasses[selectedColor]}`}
                      />
                    </div>
                    {errors.color ? (
                      <p className={styles.input.error}>
                        {errors.color.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Orden */}
                  <div>
                    <label className={styles.input.label}>Orden</label>
                    <div className={styles.input.relative}>
                      <ArrowUpDown className={styles.input.icon} />
                      <input
                        {...register('orden', { valueAsNumber: true })}
                        type='number'
                        min={1}
                        className={styles.input.inputWithIcon}
                      />
                    </div>
                    {errors.orden ? (
                      <p className={styles.input.error}>
                        {errors.orden.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Notas */}
                  <div className={styles.form.gridFullWidth}>
                    <label className={styles.input.label}>Notas</label>
                    <div className={styles.input.relative}>
                      <FileText className={styles.input.iconTop} />
                      <textarea
                        {...register('notas')}
                        rows={3}
                        className={styles.textarea.base}
                        placeholder='Información adicional...'
                      />
                    </div>
                    {errors.notas ? (
                      <p className={styles.input.error}>
                        {errors.notas.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Estado Activo */}
                  <div className={styles.form.gridFullWidth}>
                    <label className={styles.checkbox.label}>
                      <input
                        {...register('activo')}
                        type='checkbox'
                        className={styles.checkbox.input}
                      />
                      <span className={styles.checkbox.text}>
                        Entidad activa (visible en formularios)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className={styles.footer.container}>
                  <button
                    type='button'
                    onClick={handleClose}
                    className={styles.footer.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className={styles.footer.submitButton}
                  >
                    {isSubmitting
                      ? 'Guardando...'
                      : isEdit
                        ? 'Actualizar'
                        : 'Crear Entidad'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
