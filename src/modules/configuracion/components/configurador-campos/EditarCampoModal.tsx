/**
 * Componente: EditarCampoModal
 *
 * Modal presentacional para crear o editar un campo individual.
 * UI pura con lógica delegada a useEditarCampoModal hook.
 *
 * @version 2.0 - Refactorizado con separación de responsabilidades
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Plus, Save, X } from 'lucide-react'

import { FormSelect } from '@/shared/components/ui/form-select'

import type {
  CampoConfig,
  RolCampo,
  TipoCampoDinamico,
} from '../../types/campos-dinamicos.types'

import { TIPOS_DISPONIBLES } from './constants/campos-disponibles'
import { s } from './EditarCampoModal.styles'
import { useEditarCampoModal } from './hooks/useEditarCampoModal'

// ============================================
// TIPOS
// ============================================

interface EditarCampoModalProps {
  isOpen: boolean
  modo: 'crear' | 'editar'
  campoInicial: CampoConfig | null
  camposExistentes: CampoConfig[]
  onConfirmar: (campo: CampoConfig) => void
  onCancelar: () => void
}

// ============================================
// COMPONENTE
// ============================================

export function EditarCampoModal({
  isOpen,
  modo,
  campoInicial,
  camposExistentes,
  onConfirmar,
  onCancelar,
}: EditarCampoModalProps) {
  // Hook con lógica
  const {
    nombre,
    tipo,
    rol,
    label,
    placeholder,
    ayuda,
    requerido,
    errores,
    rolDescripcion,
    rolesDisponibles,
    setNombre,
    setTipo,
    setRol,
    setLabel,
    setPlaceholder,
    setAyuda,
    setRequerido,
    handleConfirmar,
  } = useEditarCampoModal({
    modo,
    campoInicial,
    camposExistentes,
    onConfirmar,
  })

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={s.modal.overlay}
      onClick={onCancelar}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={s.editor.container}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`${s.modal.header.container} ${s.modal.header.gradient} from-blue-600 to-indigo-600`}
        >
          <div className='flex items-center justify-between'>
            <div>
              <h2 className={`${s.modal.header.title} text-white`}>
                {modo === 'crear' ? '✨ Nuevo Campo' : '✏️ Editar Campo'}
              </h2>
              <p className={`${s.modal.header.subtitle} text-blue-100`}>
                {modo === 'crear'
                  ? 'Configura un nuevo campo para el formulario'
                  : 'Modifica la configuración del campo'}
              </p>
            </div>
            <button
              type='button'
              onClick={onCancelar}
              className={`${s.modal.header.closeButton} text-white`}
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className='bg-white p-6 dark:bg-gray-800'>
          <form className={s.editor.form}>
            {/* Nombre */}
            <div className={s.editor.field}>
              <label className={s.editor.label}>
                Nombre (ID) <span className={s.editor.required}>*</span>
              </label>
              <input
                type='text'
                value={nombre}
                onChange={e => setNombre(e.target.value.toLowerCase())}
                placeholder='monto_aprobado'
                disabled={modo === 'editar'}
                className={s.editor.input}
              />
              {errores.nombre && (
                <div className={s.editor.error}>
                  <AlertCircle className={s.editor.errorIcon} />
                  <span className={s.editor.errorText}>{errores.nombre}</span>
                </div>
              )}
              <p className={s.editor.help}>
                Snake_case, solo minúsculas y guiones bajos
              </p>
            </div>

            {/* Tipo */}
            <div className={s.editor.field}>
              <label className={s.editor.label}>
                Tipo de Campo <span className={s.editor.required}>*</span>
              </label>
              <FormSelect
                value={tipo}
                onChange={e => setTipo(e.target.value as TipoCampoDinamico)}
                className={s.editor.select}
              >
                {TIPOS_DISPONIBLES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </FormSelect>
            </div>

            {/* Rol */}
            <div className={s.editor.field}>
              <label className={s.editor.label}>
                Rol del Campo <span className={s.editor.required}>*</span>
              </label>
              <FormSelect
                value={rol}
                onChange={e => setRol(e.target.value as RolCampo)}
                className={s.editor.select}
              >
                {rolesDisponibles.map(r => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </FormSelect>
              {errores.rol && (
                <div className={s.editor.error}>
                  <AlertCircle className={s.editor.errorIcon} />
                  <span className={s.editor.errorText}>{errores.rol}</span>
                </div>
              )}
              <p className={s.editor.help}>{rolDescripcion}</p>
            </div>

            {/* Label */}
            <div className={s.editor.field}>
              <label className={s.editor.label}>
                Etiqueta (Label) <span className={s.editor.required}>*</span>
              </label>
              <input
                type='text'
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder='Monto Aprobado'
                className={s.editor.input}
              />
              {errores.label && (
                <div className={s.editor.error}>
                  <AlertCircle className={s.editor.errorIcon} />
                  <span className={s.editor.errorText}>{errores.label}</span>
                </div>
              )}
            </div>

            {/* Placeholder */}
            <div className={s.editor.field}>
              <label className={s.editor.label}>Placeholder</label>
              <input
                type='text'
                value={placeholder}
                onChange={e => setPlaceholder(e.target.value)}
                placeholder='Ej: 50.000.000'
                className={s.editor.input}
              />
            </div>

            {/* Ayuda */}
            <div className={s.editor.field}>
              <label className={s.editor.label}>Texto de Ayuda</label>
              <textarea
                value={ayuda}
                onChange={e => setAyuda(e.target.value)}
                placeholder='Explicación breve del campo...'
                rows={2}
                className={s.editor.textarea}
              />
            </div>

            {/* Requerido */}
            <div className={s.editor.field}>
              <label className='flex cursor-pointer items-center gap-2'>
                <input
                  type='checkbox'
                  checked={requerido}
                  onChange={e => setRequerido(e.target.checked)}
                  className={s.editor.checkbox}
                />
                <span className={s.editor.label}>Campo obligatorio</span>
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={s.modal.footer.container}>
          <button
            type='button'
            onClick={onCancelar}
            className={s.modal.footer.buttonSecondary}
          >
            <X className='h-4 w-4' />
            Cancelar
          </button>

          <button
            type='button'
            onClick={handleConfirmar}
            className={`${s.modal.footer.buttonPrimary} bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700`}
          >
            {modo === 'crear' ? (
              <>
                <Plus className='h-4 w-4' />
                Crear Campo
              </>
            ) : (
              <>
                <Save className='h-4 w-4' />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
