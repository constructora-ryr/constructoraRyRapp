/**
 * ============================================
 * COMPONENTE: Formulario de Requisito (Compacto)
 * ============================================
 * Formulario para crear/editar requisitos.
 * Componente PRESENTACIONAL con validación básica.
 *
 * Diseño compacto (~320px vs ~600px anterior):
 * - Alcance: pill toggle (no radio cards grandes)
 * - Fuentes: solo visible cuando alcance = COMPARTIDO_CLIENTE
 * - paso_identificador: auto-generado desde titulo en creación
 * - tipo_documento_sugerido: oculto, auto-guardado = titulo
 * - instrucciones + categoria: acordeón "Opciones avanzadas"
 * - orden: removido de UI (D&D es el mecanismo)
 */

'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Save, X } from 'lucide-react'
import { toast } from 'sonner'

import { FormSelect } from '@/shared/components/ui/form-select'

import { requisitosConfigStyles as styles } from '../styles/requisitos-config.styles'
import type { CrearRequisitoDTO, RequisitoFuenteConfig } from '../types'
import { CATEGORIAS_DOCUMENTO, NIVELES_VALIDACION } from '../types'

interface RequisitoFormProps {
  tipoFuente: string
  ordenSiguiente: number
  requisitoEditar?: RequisitoFuenteConfig
  onGuardar: (datos: CrearRequisitoDTO) => void
  onCancelar: () => void
  tiposFuenteDisponibles: Array<{ value: string; label: string }> // ✅ Lista de fuentes
  defaultAlcance?: 'ESPECIFICO_FUENTE' | 'COMPARTIDO_CLIENTE' // ✅ Pre-selección de alcance
}

// Auto-genera paso_identificador desde título (snake_case, sin acentos)
function autoIdentificador(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
}

export function RequisitoForm({
  tipoFuente,
  ordenSiguiente,
  requisitoEditar,
  onGuardar,
  onCancelar,
  tiposFuenteDisponibles,
  defaultAlcance = 'ESPECIFICO_FUENTE',
}: RequisitoFormProps) {
  const [opcAvanzadasOpen, setOpcAvanzadasOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<CrearRequisitoDTO>>(() => {
    let tipoFuenteInicial: string | string[]
    if (requisitoEditar) {
      if (requisitoEditar.alcance === 'COMPARTIDO_CLIENTE') {
        tipoFuenteInicial =
          requisitoEditar.fuentes_aplicables ??
          tiposFuenteDisponibles.map(f => f.value)
      } else {
        tipoFuenteInicial = [requisitoEditar.tipo_fuente]
      }
    } else {
      tipoFuenteInicial = [tipoFuente]
    }
    return {
      tipo_fuente: tipoFuenteInicial,
      paso_identificador: requisitoEditar?.paso_identificador ?? '',
      titulo: requisitoEditar?.titulo ?? '',
      descripcion: requisitoEditar?.descripcion ?? '',
      instrucciones: requisitoEditar?.instrucciones ?? '',
      nivel_validacion:
        requisitoEditar?.nivel_validacion ?? 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_sugerido: requisitoEditar?.tipo_documento_sugerido ?? '',
      categoria_documento: requisitoEditar?.categoria_documento ?? '',
      alcance: requisitoEditar?.alcance ?? defaultAlcance,
      orden: requisitoEditar?.orden ?? ordenSiguiente,
    }
  })

  const modoEdicion = !!requisitoEditar

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Al cambiar título en modo creación → auto-generar paso_identificador
  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoTitulo = e.target.value
    setFormData(prev => ({
      ...prev,
      titulo: nuevoTitulo,
      ...(!modoEdicion && {
        paso_identificador: autoIdentificador(nuevoTitulo),
      }),
    }))
  }

  // Cambio de alcance: si cambia a ESPECÍFICO, restaurar tipo_fuente al tab actual
  const handleAlcanceChange = (
    nuevoAlcance: 'ESPECIFICO_FUENTE' | 'COMPARTIDO_CLIENTE'
  ) => {
    setFormData(prev => ({
      ...prev,
      alcance: nuevoAlcance,
      tipo_fuente:
        nuevoAlcance === 'COMPARTIDO_CLIENTE'
          ? tiposFuenteDisponibles.map(f => f.value)
          : [tipoFuente],
    }))
  }

  // Handler para checkbox de fuentes múltiples (solo visible en COMPARTIDO)
  const handleFuenteToggle = (fuenteValue: string) => {
    setFormData(prev => {
      const fuentes = Array.isArray(prev.tipo_fuente)
        ? prev.tipo_fuente
        : [prev.tipo_fuente ?? tipoFuente]
      const yaSeleccionada = fuentes.includes(fuenteValue)
      const nuevasFuentes = yaSeleccionada
        ? fuentes.filter(f => f !== fuenteValue)
        : [...fuentes, fuenteValue]
      return {
        ...prev,
        tipo_fuente: nuevasFuentes.length > 0 ? nuevasFuentes : [tipoFuente],
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.paso_identificador ||
      !formData.titulo ||
      !formData.nivel_validacion
    ) {
      toast.info('Los campos marcados con * son obligatorios')
      return
    }
    // tipo_documento_sugerido siempre sincronizado con titulo
    const dataToSave: CrearRequisitoDTO = {
      ...(formData as CrearRequisitoDTO),
      tipo_documento_sugerido: formData.titulo ?? '',
    }
    onGuardar(dataToSave)
  }

  const esCompartido = formData.alcance === 'COMPARTIDO_CLIENTE'
  const fuentesSeleccionadas = Array.isArray(formData.tipo_fuente)
    ? formData.tipo_fuente
    : [formData.tipo_fuente ?? tipoFuente]

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className={styles.form.container}
    >
      <h3 className={styles.form.title}>
        {modoEdicion ? '✏️ Editar Requisito' : '➕ Nuevo Requisito'}
      </h3>

      <div className='space-y-3'>
        {/* ── ALCANCE: Pill toggle ── */}
        <div>
          <label className={styles.form.label}>Alcance *</label>
          <div className='flex w-fit gap-0 rounded-lg border border-gray-300 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-900/50'>
            <button
              type='button'
              onClick={() => handleAlcanceChange('ESPECIFICO_FUENTE')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                !esCompartido
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              ⚡ Específico
            </button>
            <button
              type='button'
              onClick={() => handleAlcanceChange('COMPARTIDO_CLIENTE')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                esCompartido
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              ↔ Compartido
            </button>
          </div>
          <p className='mt-1 text-[10px] text-gray-500 dark:text-gray-400'>
            {esCompartido
              ? 'El cliente sube el documento UNA sola vez, válido para todas las fuentes marcadas.'
              : 'El cliente sube un documento diferente por cada fuente de pago.'}
          </p>
        </div>

        {/* ── FUENTES (solo visible en COMPARTIDO) ── */}
        <AnimatePresence>
          {esCompartido && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden'
            >
              <div className='pt-1'>
                <label className={styles.form.label}>
                  Fuentes aplicables
                  <span className='ml-1 text-[10px] text-gray-500'>
                    (sin selección = todas)
                  </span>
                </label>
                <div className='grid grid-cols-2 gap-1.5'>
                  {tiposFuenteDisponibles.map(fuente => {
                    const seleccionada = fuentesSeleccionadas.includes(
                      fuente.value
                    )
                    return (
                      <label
                        key={fuente.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-1.5 text-xs font-medium transition-all ${
                          seleccionada
                            ? 'border-blue-500 bg-blue-50 text-gray-900 dark:bg-blue-950/30 dark:text-white'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700'
                        }`}
                      >
                        <input
                          type='checkbox'
                          checked={seleccionada}
                          onChange={() => handleFuenteToggle(fuente.value)}
                          className='rounded'
                        />
                        {fuente.label}
                      </label>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TÍTULO ── */}
        <div>
          <label className={styles.form.label}>Título *</label>
          <input
            type='text'
            name='titulo'
            value={formData.titulo}
            onChange={handleTituloChange}
            placeholder='Ej: Boleta de Registro'
            className={styles.form.input}
            required
          />
          {/* paso_identificador: auto en creación, readonly en edición */}
          {modoEdicion ? (
            <p className='mt-0.5 text-[10px] text-gray-500 dark:text-gray-400'>
              ID:{' '}
              <code className='rounded bg-gray-200 px-1 dark:bg-gray-700'>
                {formData.paso_identificador}
              </code>
            </p>
          ) : formData.paso_identificador ? (
            <p className='mt-0.5 text-[10px] text-gray-500 dark:text-gray-400'>
              ID auto:{' '}
              <code className='rounded bg-gray-200 px-1 dark:bg-gray-700'>
                {formData.paso_identificador}
              </code>
            </p>
          ) : null}
        </div>

        {/* ── DESCRIPCIÓN ── */}
        <div>
          <label className={styles.form.label}>Descripción</label>
          <textarea
            name='descripcion'
            value={formData.descripcion}
            onChange={handleChange}
            placeholder='Breve descripción del requisito'
            rows={2}
            className={styles.form.textarea}
          />
        </div>

        {/* ── NIVEL DE VALIDACIÓN ── */}
        <div>
          <label className={styles.form.label}>Nivel de Validación *</label>
          <FormSelect
            name='nivel_validacion'
            value={formData.nivel_validacion}
            onChange={handleChange}
            className={styles.form.select}
            required
          >
            {NIVELES_VALIDACION.map(nivel => (
              <option key={nivel.value} value={nivel.value}>
                {nivel.label}
              </option>
            ))}
          </FormSelect>
        </div>

        {/* ── OPCIONES AVANZADAS (acordeón) ── */}
        <div className='overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700'>
          <button
            type='button'
            onClick={() => setOpcAvanzadasOpen(o => !o)}
            className='flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
          >
            <span>Opciones avanzadas</span>
            <motion.span
              animate={{ rotate: opcAvanzadasOpen ? 180 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown className='h-3.5 w-3.5' />
            </motion.span>
          </button>
          <AnimatePresence>
            {opcAvanzadasOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='overflow-hidden'
              >
                <div className='space-y-3 border-t border-gray-200 px-3 pb-3 pt-3 dark:border-gray-700'>
                  {/* Instrucciones */}
                  <div>
                    <label className={styles.form.label}>
                      Instrucciones para el usuario
                    </label>
                    <textarea
                      name='instrucciones'
                      value={formData.instrucciones}
                      onChange={handleChange}
                      placeholder='Instrucciones detalladas de qué debe subir'
                      rows={2}
                      className={styles.form.textarea}
                    />
                  </div>
                  {/* Categoría */}
                  <div>
                    <label className={styles.form.label}>
                      Categoría de documento
                    </label>
                    <FormSelect
                      name='categoria_documento'
                      value={formData.categoria_documento}
                      onChange={handleChange}
                      className={styles.form.select}
                    >
                      <option value=''>-- Sin categoría --</option>
                      {CATEGORIAS_DOCUMENTO.map(categoria => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </FormSelect>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Acciones */}
      <div className={styles.form.actions}>
        <motion.button
          type='button'
          onClick={onCancelar}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={styles.form.btnSecondary}
        >
          <X className='h-4 w-4' />
          Cancelar
        </motion.button>

        <motion.button
          type='submit'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={styles.form.btnPrimary}
        >
          <Save className='h-4 w-4' />
          {modoEdicion ? 'Guardar Cambios' : 'Crear Requisito'}
        </motion.button>
      </div>
    </motion.form>
  )
}
