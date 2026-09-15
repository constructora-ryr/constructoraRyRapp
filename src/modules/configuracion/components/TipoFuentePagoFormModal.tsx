'use client'

import { useEffect } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  BadgeDollarSign,
  Banknote,
  Building2,
  Check,
  CreditCard,
  DollarSign,
  HandCoins,
  Home,
  Landmark,
  Loader2,
  Shield,
  Wallet,
  X,
} from 'lucide-react'

import { getFuenteColorClasses } from '@/shared/constants/fuentes-pago.constants'

import { useTipoFuentePagoFormModal } from '../hooks/useTipoFuentePagoFormModal'
import type { TipoFuentePago } from '../types'
import { TIPO_FUENTE_PAGO_LIMITS } from '../types'

import { tipoFuentePagoFormModalStyles as s } from './TipoFuentePagoFormModal.styles'

// ─── Opciones de color (clases literales para que Tailwind no las purgue) ────
const COLORES_OPCIONES = [
  { valor: 'blue', label: 'Azul', bg: 'bg-blue-500' },
  { valor: 'indigo', label: 'Índigo', bg: 'bg-indigo-500' },
  { valor: 'purple', label: 'Púrpura', bg: 'bg-purple-500' },
  { valor: 'pink', label: 'Rosa', bg: 'bg-pink-500' },
  { valor: 'red', label: 'Rojo', bg: 'bg-red-500' },
  { valor: 'orange', label: 'Naranja', bg: 'bg-orange-500' },
  { valor: 'yellow', label: 'Amarillo', bg: 'bg-yellow-500' },
  { valor: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-500' },
  { valor: 'green', label: 'Verde', bg: 'bg-green-500' },
  { valor: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
] as const

// ─── Opciones de ícono ───────────────────────────────────────────────────────
const ICONOS_OPCIONES = [
  { valor: 'Wallet', label: 'Billetera', Icon: Wallet },
  { valor: 'Building2', label: 'Banco', Icon: Building2 },
  { valor: 'Home', label: 'Casa', Icon: Home },
  { valor: 'Shield', label: 'Escudo', Icon: Shield },
  { valor: 'CreditCard', label: 'Tarjeta', Icon: CreditCard },
  { valor: 'Landmark', label: 'Institución', Icon: Landmark },
  { valor: 'BadgeDollarSign', label: 'Insignia $', Icon: BadgeDollarSign },
  { valor: 'DollarSign', label: 'Dólar', Icon: DollarSign },
  { valor: 'Banknote', label: 'Billete', Icon: Banknote },
  { valor: 'HandCoins', label: 'Monedas', Icon: HandCoins },
] as const

interface TipoFuentePagoFormModalProps {
  isOpen: boolean
  onClose: () => void
  tipoFuente?: TipoFuentePago | null
  onSuccess?: () => void
}

export function TipoFuentePagoFormModal({
  isOpen,
  onClose,
  tipoFuente,
  onSuccess,
}: TipoFuentePagoFormModalProps) {
  const {
    form,
    isEditing,
    isPending,
    register,
    handleSubmit,
    errors,
    isDirty,
    onSubmit,
  } = useTipoFuentePagoFormModal({ isOpen, onClose, tipoFuente, onSuccess })

  const colorActual = form.watch('color')
  const iconoActual = form.watch('icono')
  const nombreActual = form.watch('nombre')

  const colorClases = getFuenteColorClasses(colorActual)
  const IconoActual =
    ICONOS_OPCIONES.find(i => i.valor === iconoActual)?.Icon ?? Wallet
  const colorLabel =
    COLORES_OPCIONES.find(c => c.valor === colorActual)?.label ?? colorActual

  // Bloquea el scroll del body mientras la modal está abierta
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className={s.backdrop}>
        {/* Overlay */}
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
          {/* Header con preview del color/ícono seleccionado */}
          <div className={s.header.container}>
            <div className={s.header.left}>
              <div className={`${s.header.preview} ${colorClases.icon}`}>
                <IconoActual className='h-5 w-5 text-white' />
              </div>
              <div>
                <h2 className={s.header.title}>
                  {isEditing ? 'Editar Tipo de Fuente' : 'Nueva Fuente de Pago'}
                </h2>
                {nombreActual ? (
                  <p className={s.header.subtitle}>{nombreActual}</p>
                ) : null}
              </div>
            </div>
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
            {/* Cuerpo scrollable */}
            <div className={s.form.scrollBody}>
              {/* ── Información Básica ─────────────────────────────────────── */}
              <div className={s.form.section}>
                <h3 className={s.form.sectionTitle}>Información Básica</h3>

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
                  {errors.nombre ? (
                    <p className={s.input.error}>
                      <AlertCircle className={s.input.errorIcon} />
                      {errors.nombre.message}
                    </p>
                  ) : null}
                </div>

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
                  {errors.codigo ? (
                    <p className={s.input.error}>
                      <AlertCircle className={s.input.errorIcon} />
                      {errors.codigo.message}
                    </p>
                  ) : null}
                </div>

                <div className={s.input.container}>
                  <label className={s.input.label}>Descripción</label>
                  <textarea
                    {...register('descripcion')}
                    rows={2}
                    placeholder='Breve descripción de la fuente de pago...'
                    className={s.input.textarea}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className={s.divider} />

              {/* ── Configuración ──────────────────────────────────────────── */}
              <div className={s.form.section}>
                <h3 className={s.form.sectionTitle}>Comportamiento</h3>

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
                      <p className={s.checkbox.description}>Banco / Caja</p>
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

              <div className={s.divider} />

              {/* ── Apariencia ─────────────────────────────────────────────── */}
              <div className={s.form.section}>
                <h3 className={s.form.sectionTitle}>Apariencia</h3>

                {/* Color picker */}
                <div className={s.input.container}>
                  <label className={s.input.label}>Color</label>
                  {/* Campo oculto para react-hook-form */}
                  <input type='hidden' {...register('color')} />
                  <div className={s.colorPicker.wrapper}>
                    {COLORES_OPCIONES.map(c => (
                      <button
                        key={c.valor}
                        type='button'
                        title={c.label}
                        disabled={isPending}
                        onClick={() =>
                          form.setValue('color', c.valor, { shouldDirty: true })
                        }
                        className={`${c.bg} ${s.colorPicker.swatch(colorActual === c.valor)}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Ícono picker */}
                <div className={s.input.container}>
                  <label className={s.input.label}>Ícono</label>
                  <input type='hidden' {...register('icono')} />
                  <div className={s.iconPicker.wrapper}>
                    {ICONOS_OPCIONES.map(({ valor, label, Icon }) => (
                      <button
                        key={valor}
                        type='button'
                        disabled={isPending}
                        onClick={() =>
                          form.setValue('icono', valor, { shouldDirty: true })
                        }
                        className={s.iconPicker.item(iconoActual === valor)}
                      >
                        <Icon className='h-5 w-5' />
                        <span className={s.iconPicker.label}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vista previa */}
                <div className={s.preview.wrapper}>
                  <div className={`${s.preview.iconWrap} ${colorClases.icon}`}>
                    <IconoActual className='h-5 w-5 text-white' />
                  </div>
                  <div>
                    <p className={s.preview.name}>
                      {nombreActual || 'Nombre de la fuente'}
                    </p>
                    <p className={`${s.preview.meta} ${colorClases.texto}`}>
                      {colorLabel} ·{' '}
                      {
                        ICONOS_OPCIONES.find(i => i.valor === iconoActual)
                          ?.label
                      }
                    </p>
                  </div>
                </div>

                {/* Orden */}
                <div className={s.input.container}>
                  <label className={s.input.label}>
                    Orden de Visualización
                  </label>
                  <input
                    {...register('orden', { valueAsNumber: true })}
                    type='number'
                    min={TIPO_FUENTE_PAGO_LIMITS.ORDEN_MIN}
                    max={TIPO_FUENTE_PAGO_LIMITS.ORDEN_MAX}
                    className={s.input.field}
                    disabled={isPending}
                  />
                  {errors.orden ? (
                    <p className={s.input.error}>{errors.orden.message}</p>
                  ) : null}
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

              {/* ── Nota requisitos ────────────────────────────────────────── */}
              <div className={s.infoBox}>
                <p className='mb-0.5 text-sm font-medium text-blue-900 dark:text-blue-100'>
                  💡 Configuración de Requisitos
                </p>
                <p className='text-xs text-blue-700 dark:text-blue-300'>
                  Para configurar los documentos obligatorios, ve a{' '}
                  <strong>
                    Admin → Fuentes de Pago → Requisitos de Fuentes
                  </strong>
                </p>
              </div>
            </div>
            {/* fin scrollBody */}

            {/* ── Acciones fijas al fondo ────────────────────────────────── */}
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
