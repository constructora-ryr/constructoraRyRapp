'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  DollarSign,
  FileText,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'

import { FormSelect } from '@/shared/components/ui/form-select'

interface FuentePago {
  id?: string
  tipo: string
  entidad?: string
  monto_aprobado: number
  monto_recibido: number
}

interface FuentesPagoEditarModalProps {
  isOpen: boolean
  onClose: () => void
  fuentesActuales: FuentePago[]
  valorFinal?: number
  onGuardar: (
    fuentes: Partial<FuentePago>[],
    motivoCambio: string
  ) => Promise<void>
}

export function FuentesPagoEditarModal({
  isOpen,
  onClose,
  fuentesActuales,
  onGuardar,
}: FuentesPagoEditarModalProps) {
  const [fuentes, setFuentes] = useState<Partial<FuentePago>[]>(
    fuentesActuales.map(f => ({ ...f }))
  )
  const [motivoCambio, setMotivoCambio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFuentes(fuentesActuales.map(f => ({ ...f })))
      setMotivoCambio('')
      setError(null)
    }
  }, [isOpen, fuentesActuales])

  const agregarFuente = () => {
    setFuentes([
      ...fuentes,
      {
        tipo: '',
        entidad: '',
        monto_aprobado: 0,
        monto_recibido: 0,
      },
    ])
  }

  const eliminarFuente = (index: number) => {
    setFuentes(fuentes.filter((_, i) => i !== index))
  }

  const actualizarFuente = (
    index: number,
    campo: string,
    valor: string | number | boolean | null
  ) => {
    const nuevasFuentes = [...fuentes]

    // ✅ Convertir a número si es campo de monto
    const valorFinal =
      campo === 'monto_aprobado' || campo === 'monto_recibido'
        ? Number(valor) || 0
        : valor

    nuevasFuentes[index] = {
      ...nuevasFuentes[index],
      [campo]: valorFinal,
    }

    setFuentes(nuevasFuentes)
  }

  const handleGuardar = async () => {
    // Validar motivo obligatorio
    if (!motivoCambio.trim()) {
      setError('Debes proporcionar un motivo para este cambio')
      return
    }

    // Validar fuentes
    const fuentesValidas = fuentes.filter(
      f => f.tipo && f.monto_aprobado && f.monto_aprobado > 0
    )

    if (fuentesValidas.length === 0) {
      setError('Debe haber al menos una fuente de pago válida')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onGuardar(fuentesValidas, motivoCambio)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
          >
            <div className='w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800'>
              {/* Header */}
              <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                      <DollarSign className='h-6 w-6 text-white' />
                    </div>
                    <div>
                      <h2 className='text-xl font-bold text-white'>
                        Editar Fuentes de Pago
                      </h2>
                      <p className='text-sm text-blue-100'>
                        {fuentes.length} fuente(s) configurada(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className='rounded-lg p-2 transition-colors hover:bg-white/20'
                  >
                    <X className='h-5 w-5 text-white' />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className='max-h-[70vh] space-y-6 overflow-y-auto p-6'>
                {/* Motivo del Cambio (OBLIGATORIO) */}
                <div className='rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30'>
                  <label className='mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-900 dark:text-yellow-100'>
                    <FileText className='h-4 w-4' />
                    ¿Por qué estás realizando este cambio? *
                  </label>
                  <textarea
                    value={motivoCambio}
                    onChange={e => setMotivoCambio(e.target.value)}
                    placeholder='Ejemplo: Cliente no fue aprobado para subsidio, se cambia por crédito hipotecario...'
                    className='w-full resize-none rounded-lg border-2 border-yellow-300 bg-white px-3 py-2 text-sm transition-all focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 dark:border-yellow-700 dark:bg-gray-900'
                    rows={3}
                    required
                  />
                  <p className='mt-1 text-xs text-yellow-700 dark:text-yellow-300'>
                    Este motivo quedará registrado en el historial de versiones
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30'>
                    <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400' />
                    <p className='text-sm text-red-700 dark:text-red-300'>
                      {error}
                    </p>
                  </div>
                )}

                {/* Fuentes de Pago */}
                <div className='space-y-3'>
                  {fuentes.map((fuente, index) => (
                    <div
                      key={index}
                      className='rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50'
                    >
                      <div className='mb-3 flex items-start justify-between'>
                        <p className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                          Fuente {index + 1}
                        </p>
                        {fuentes.length > 1 && (
                          <button
                            onClick={() => eliminarFuente(index)}
                            className='rounded-lg p-1.5 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30'
                          >
                            <Trash2 className='h-4 w-4 text-red-600 dark:text-red-400' />
                          </button>
                        )}
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        {/* Tipo */}
                        <div>
                          <label className='mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400'>
                            Tipo de Fuente *
                          </label>
                          <FormSelect
                            value={fuente.tipo || ''}
                            onChange={e =>
                              actualizarFuente(index, 'tipo', e.target.value)
                            }
                            className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900'
                            required
                          >
                            <option value=''>Seleccionar...</option>
                            <option value='Crédito Hipotecario'>
                              Crédito Hipotecario
                            </option>
                            <option value='Subsidio Caja Compensación'>
                              Subsidio Caja
                            </option>
                            <option value='Subsidio Nacional'>
                              Subsidio Nacional
                            </option>
                            <option value='Cuota Inicial'>Cuota Inicial</option>
                            <option value='Recursos Propios'>
                              Recursos Propios
                            </option>
                          </FormSelect>
                        </div>

                        {/* Entidad */}
                        <div>
                          <label className='mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400'>
                            Entidad
                          </label>
                          <input
                            type='text'
                            value={fuente.entidad || ''}
                            onChange={e =>
                              actualizarFuente(index, 'entidad', e.target.value)
                            }
                            placeholder='Banco, Caja...'
                            className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900'
                          />
                        </div>

                        {/* Monto Aprobado */}
                        <div>
                          <label className='mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400'>
                            Monto Aprobado *
                          </label>
                          <input
                            type='number'
                            value={fuente.monto_aprobado || 0}
                            onChange={e =>
                              actualizarFuente(
                                index,
                                'monto_aprobado',
                                parseFloat(e.target.value)
                              )
                            }
                            placeholder='0'
                            className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900'
                            required
                          />
                        </div>

                        {/* Monto Recibido */}
                        <div>
                          <label className='mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400'>
                            Monto Recibido
                          </label>
                          <input
                            type='number'
                            value={fuente.monto_recibido || 0}
                            onChange={e =>
                              actualizarFuente(
                                index,
                                'monto_recibido',
                                parseFloat(e.target.value)
                              )
                            }
                            placeholder='0'
                            className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900'
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Botón Agregar */}
                  <button
                    onClick={agregarFuente}
                    className='flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-3 text-gray-600 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-blue-950/30 dark:hover:text-blue-400'
                  >
                    <Plus className='h-5 w-5' />
                    <span className='text-sm font-medium'>
                      Agregar otra fuente
                    </span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className='flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50'>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={isSubmitting}
                  className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50'
                >
                  <Save className='h-4 w-4' />
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
