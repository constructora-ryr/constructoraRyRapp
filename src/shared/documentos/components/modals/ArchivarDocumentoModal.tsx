'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Archive, X } from 'lucide-react'

import { FormSelect } from '@/shared/components/ui/form-select'
import { type ModuleName } from '@/shared/config/module-themes'

import { MOTIVOS_ARCHIVADO } from '../../constants/archivado.constants'
import { useArchivarDocumentoModal } from '../../hooks/useArchivarDocumentoModal'

import { getArchivarDocumentoModalStyles } from './ArchivarDocumentoModal.styles'

interface ArchivarDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (
    motivoCategoria: string,
    motivoDetalle: string
  ) => void | Promise<void>
  tituloDocumento: string
  tieneVersiones?: boolean
  totalVersiones?: number
  moduleName?: ModuleName
}

export function ArchivarDocumentoModal({
  isOpen,
  onClose,
  onConfirm,
  tituloDocumento,
  tieneVersiones = false,
  totalVersiones = 1,
  moduleName = 'proyectos',
}: ArchivarDocumentoModalProps) {
  // 🎯 TODA la lógica en el hook
  const {
    motivoCategoria,
    motivoDetalle,
    procesando,
    error,
    isValid,
    handleConfirm,
    handleClose,
    handleChangeMotivoCategoria,
    handleChangeMotivoDetalle,
  } = useArchivarDocumentoModal({ onConfirm, onClose })

  // 🎨 Estilos centralizados
  const styles = getArchivarDocumentoModalStyles(moduleName)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className={styles.backdrop}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={styles.modal.container}
          >
            {/* Header con gradiente */}
            <div className={styles.header.container}>
              <div className={styles.header.pattern} />
              <div className={styles.header.content}>
                <div className={styles.header.textWrapper}>
                  <div className={styles.header.iconWrapper}>
                    <Archive className={styles.header.icon} />
                  </div>
                  <div>
                    <h2 className={styles.header.title}>Archivar Documento</h2>
                    <p className={styles.header.subtitle}>
                      Especifica el motivo del archivado
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={procesando}
                  className={styles.header.closeButton}
                >
                  <X className={styles.header.icon} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className={styles.content.container}>
              {/* Información del documento */}
              <div className={styles.content.infoBox.wrapper}>
                <p className={styles.content.infoBox.label}>Documento:</p>
                <p className={styles.content.infoBox.value}>
                  {tituloDocumento}
                </p>
                {tieneVersiones && totalVersiones > 1 && (
                  <p className={styles.content.infoBox.warning}>
                    <AlertCircle
                      className={styles.content.infoBox.warningIcon}
                    />
                    Se archivarán TODAS las {totalVersiones} versiones
                  </p>
                )}
              </div>

              {/* Motivo predefinido */}
              <div className={styles.content.form.field}>
                <label className={styles.content.form.label}>
                  Motivo de archivado:{' '}
                  <span className={styles.content.form.required}>*</span>
                </label>
                <FormSelect
                  value={motivoCategoria}
                  onChange={e => handleChangeMotivoCategoria(e.target.value)}
                  disabled={procesando}
                  className={styles.content.form.select}
                >
                  <option value=''>Selecciona un motivo...</option>
                  {MOTIVOS_ARCHIVADO.map(motivo => (
                    <option key={motivo.value} value={motivo.value}>
                      {motivo.label}
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Detalle adicional */}
              <div className={styles.content.form.field}>
                <div className='mb-1 flex items-center justify-between'>
                  <label className={styles.content.form.label}>
                    Observaciones:{' '}
                    <span className={styles.content.form.required}>*</span>
                  </label>
                  <span
                    className={`text-xs ${motivoDetalle.trim().length >= 10 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {motivoDetalle.trim().length}/10 mín.
                  </span>
                </div>
                <textarea
                  value={motivoDetalle}
                  onChange={e => handleChangeMotivoDetalle(e.target.value)}
                  disabled={procesando}
                  rows={3}
                  placeholder='Ej: Se usó Subsidio Comfenalco ($20M) en lugar de Comfandi ($5M)'
                  className={styles.content.form.textarea}
                />
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                  Describe brevemente por qué archivas este documento (mínimo 10
                  caracteres)
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className={styles.content.error.wrapper}>
                  <AlertCircle className={styles.content.error.icon} />
                  <p className={styles.content.error.text}>{error}</p>
                </div>
              )}

              {/* Info */}
              <div className={styles.content.alert.wrapper}>
                <AlertCircle className={styles.content.alert.icon} />
                <p className={styles.content.alert.text}>
                  Podrás restaurar este documento desde la pestaña
                  &quot;Archivados&quot; con todo su historial de versiones.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer.container}>
              <button
                onClick={handleClose}
                disabled={procesando}
                className={styles.footer.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={procesando || !isValid}
                className={styles.footer.confirmButton}
              >
                {procesando ? (
                  <>
                    <div className={styles.footer.spinner} />
                    Archivando...
                  </>
                ) : (
                  <>
                    <Archive className='h-4 w-4' />
                    Archivar Documento
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
