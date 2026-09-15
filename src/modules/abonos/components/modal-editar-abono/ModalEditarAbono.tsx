'use client'

import { useRef } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Lock,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { useTiposFuentePagoConfig } from '@/modules/fuentes-pago/hooks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog'

import type { AbonoParaEditar } from '../../types/editar-abono.types'
import { formatMontoDisplay } from '../modal-registro-pago/CampoMontoPago'
import { ComprobantePago } from '../modal-registro-pago/ComprobantePago'
import { MetodosPago } from '../modal-registro-pago/MetodosPago'
import {
  getColorSchemeByToken,
  getModalStyles,
} from '../modal-registro-pago/ModalRegistroPago.styles'

import { useModalEditarAbono } from './useModalEditarAbono'

interface ModalEditarAbonoProps {
  isOpen: boolean
  abono: AbonoParaEditar
  onClose: () => void
  onSuccess: () => void
}

export function ModalEditarAbono({
  isOpen,
  abono,
  onClose,
  onSuccess,
}: ModalEditarAbonoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getTipoConfig } = useTiposFuentePagoConfig()

  const colorScheme = getColorSchemeByToken(
    getTipoConfig(abono.fuente_tipo ?? '').color
  )
  const styles = getModalStyles(colorScheme, 'abono')

  const {
    monto,
    setMonto,
    fechaAbono,
    setFechaAbono,
    metodoPago,
    setMetodoPago,
    metodosDisponibles,
    referencia,
    setReferencia,
    notas,
    setNotas,
    motivo,
    setMotivo,
    nuevoComprobante,
    setNuevoComprobante,
    eliminarComprobante,
    setEliminarComprobante,
    subiendoComprobante,
    diff,
    hayCambios,
    fase,
    puedeRevisar,
    puedeConfirmar,
    irAConfirmar,
    volverAEditar,
    isSubmitting,
    error,
    exito,
    handleSubmit,
    handleClose,
  } = useModalEditarAbono({ abonoInicial: abono, onSuccess, onClose })

  // Suppress unused variable warning — hayCambios is used implicitly via puedeRevisar
  void hayCambios

  if (exito) {
    return (
      <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
        <DialogContent className={styles.dialogContent}>
          <DialogTitle className='sr-only'>Abono actualizado</DialogTitle>
          <DialogDescription className='sr-only'>
            El abono fue editado correctamente.
          </DialogDescription>
          <div className='flex flex-col items-center gap-5 px-6 py-10 text-center'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40'>
              <CheckCircle2 className='h-11 w-11 text-emerald-600 dark:text-emerald-400' />
            </div>
            <div className='space-y-1'>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                Abono actualizado
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Los cambios se guardaron correctamente.
              </p>
            </div>
            <button
              type='button'
              onClick={handleClose}
              className='inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              Cerrar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className={styles.dialogContent}>
        <DialogTitle className='sr-only'>Editar abono</DialogTitle>
        <DialogDescription className='sr-only'>
          Formulario para editar los datos de un abono existente.
        </DialogDescription>

        {/* Header — siempre visible, titulo cambia segun fase */}
        <div className={styles.header.container}>
          <div className='pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white opacity-10 blur-3xl' />
          <div className='pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white opacity-5 blur-3xl' />
          <div className='relative z-10 flex items-start gap-3'>
            <div className={styles.header.iconWrapper}>
              <Pencil className='h-5 w-5 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-base font-bold leading-tight text-white'>
                  {fase === 'confirmar' ? 'Confirmar cambios' : 'Editar Abono'}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colorScheme.headerBadgeAbono}`}
                >
                  {fase === 'confirmar' ? 'Revision' : 'Edicion'}
                </span>
              </div>
              <p className='mt-0.5 text-xs text-white/80'>
                {abono.fuente_tipo ?? 'Fuente de pago'}
              </p>
            </div>
            <div className='flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/15 px-2.5 py-1'>
              <Lock className='h-3 w-3 text-white/70' />
              <span className='text-[10px] font-medium text-white/70'>
                Solo admin
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo animado — slide entre fases */}
        <AnimatePresence mode='wait' initial={false}>
          {fase === 'editar' ? (
            <motion.div
              key='editar'
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={styles.body}
            >
              {/* Monto */}
              <div>
                <label className={styles.label}>
                  Monto del abono <span className='ml-0.5 text-red-500'>*</span>
                </label>
                <div
                  className={`relative flex items-center rounded-xl border-2 border-gray-200 bg-gray-50 transition-all ${colorScheme.inputFocusWithin} dark:border-gray-700 dark:bg-gray-800/80`}
                >
                  <span className='select-none pl-4 text-base font-semibold text-gray-500 dark:text-gray-400'>
                    $
                  </span>
                  <input
                    type='text'
                    inputMode='numeric'
                    value={formatMontoDisplay(monto)}
                    onChange={e =>
                      setMonto(e.target.value.replace(/[^0-9]/g, ''))
                    }
                    placeholder='0'
                    className='flex-1 bg-transparent py-2.5 pl-2 pr-4 text-base font-semibold text-gray-900 outline-none dark:text-white'
                  />
                </div>
              </div>

              {/* Metodo de pago */}
              <MetodosPago
                modo='abono'
                metodosDisponibles={metodosDisponibles}
                metodoPago={metodoPago}
                onMetodoChange={m => setMetodoPago(m)}
                colorScheme={colorScheme}
              />

              {/* Fecha */}
              <div>
                <label htmlFor='fecha-edicion-abono' className={styles.label}>
                  <Calendar className='h-4 w-4' />
                  Fecha del abono <span className='ml-0.5 text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  id='fecha-edicion-abono'
                  value={fechaAbono}
                  max={getTodayDateString()}
                  onChange={e => setFechaAbono(e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* Referencia */}
              {metodoPago === 'Transferencia' || metodoPago === 'Cheque' ? (
                <div>
                  <label
                    htmlFor='referencia-edicion-abono'
                    className={styles.label}
                  >
                    <FileText className='h-4 w-4' />
                    {metodoPago === 'Transferencia'
                      ? 'Numero de transferencia'
                      : 'Numero de cheque'}
                    <span className='ml-1 text-xs font-normal text-gray-400 dark:text-gray-500'>
                      (Opcional)
                    </span>
                  </label>
                  <input
                    type='text'
                    id='referencia-edicion-abono'
                    value={referencia}
                    onChange={e => setReferencia(e.target.value)}
                    placeholder={
                      metodoPago === 'Transferencia'
                        ? 'Ej: TRF-2025-001234'
                        : 'Ej: 0001234'
                    }
                    className={styles.input}
                  />
                </div>
              ) : null}

              {/* Notas */}
              <div>
                <label htmlFor='notas-edicion-abono' className={styles.label}>
                  <FileText className='h-4 w-4' />
                  Observaciones
                  <span className='ml-1 text-xs font-normal text-gray-400 dark:text-gray-500'>
                    (Opcional)
                  </span>
                </label>
                <textarea
                  id='notas-edicion-abono'
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  rows={2}
                  placeholder='Notas adicionales sobre este pago...'
                  className={`${styles.input} resize-none`}
                />
              </div>

              {/* Comprobante */}
              <div>
                <label className={styles.label}>
                  <Upload className='h-4 w-4' />
                  Comprobante de pago
                </label>
                {eliminarComprobante ? (
                  <div className='flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-2.5 dark:border-amber-700 dark:bg-amber-950/20'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0 text-amber-500' />
                    <span className='flex-1 text-sm text-amber-700 dark:text-amber-300'>
                      El comprobante sera eliminado
                    </span>
                    <button
                      type='button'
                      onClick={() => setEliminarComprobante(false)}
                      className='shrink-0 text-xs font-medium text-gray-600 hover:underline dark:text-gray-400'
                    >
                      Deshacer
                    </button>
                  </div>
                ) : abono.comprobante_url && !nuevoComprobante ? (
                  <>
                    <div className='flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-2.5 dark:border-emerald-800/60 dark:bg-emerald-950/20'>
                      <FileText className='h-4 w-4 flex-shrink-0 text-emerald-500' />
                      <span className='flex-1 truncate text-sm text-gray-700 dark:text-gray-300'>
                        Comprobante actual
                      </span>
                      <a
                        href={`/api/abonos/comprobante?path=${encodeURIComponent(abono.comprobante_url)}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400'
                      >
                        <Eye className='h-3.5 w-3.5' />
                        Ver
                      </a>
                      <button
                        type='button'
                        onClick={() => fileInputRef.current?.click()}
                        className='shrink-0 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400'
                      >
                        Reemplazar
                      </button>
                      <button
                        type='button'
                        onClick={() => setEliminarComprobante(true)}
                        className='ml-1 text-red-400 transition-colors hover:text-red-600 dark:hover:text-red-400'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/jpeg,image/png,image/webp,application/pdf'
                      className='hidden'
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) setNuevoComprobante(f)
                        e.target.value = ''
                      }}
                    />
                  </>
                ) : (
                  <ComprobantePago
                    modo='abono'
                    archivo={nuevoComprobante}
                    onArchivoChange={f => {
                      setNuevoComprobante(f)
                      setEliminarComprobante(false)
                    }}
                  />
                )}
              </div>
            </motion.div>
          ) : (
            /* Pantalla de confirmacion — reemplaza el body entero */
            <motion.div
              key='confirmar'
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className='flex flex-1 flex-col gap-5 px-5 py-6'
            >
              {/* Encabezado de cambios */}
              <div className='inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800/50 dark:bg-amber-950/25'>
                <ArrowLeftRight className='h-3.5 w-3.5 text-amber-500' />
                <p className='text-xs font-semibold text-amber-700 dark:text-amber-300'>
                  {diff.length} campo{diff.length !== 1 ? 's' : ''} modificado
                  {diff.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Cambios — una tarjeta por campo */}
              <div className='space-y-2.5'>
                {diff.map(d => (
                  <div
                    key={d.campo}
                    className='overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700'
                  >
                    {/* Nombre del campo */}
                    <div className='border-b border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800/60'>
                      <span className='text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
                        {d.label}
                      </span>
                    </div>
                    {/* Valor anterior */}
                    <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2.5 dark:border-gray-800'>
                      <span className='mt-0.5 shrink-0 rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600 dark:bg-red-950/60 dark:text-red-400'>
                        Antes
                      </span>
                      <p className='text-sm leading-relaxed text-red-600 line-through decoration-red-400/60 dark:text-red-400'>
                        {d.anterior}
                      </p>
                    </div>
                    {/* Valor nuevo */}
                    <div className='flex items-start gap-2.5 bg-emerald-50/70 px-3 py-2.5 dark:bg-emerald-950/20'>
                      <span className='mt-0.5 shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'>
                        Nuevo
                      </span>
                      <p className='text-sm font-semibold leading-relaxed text-emerald-800 dark:text-emerald-300'>
                        {d.nuevo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Motivo del cambio */}
              <div>
                <label htmlFor='motivo-edicion-abono' className={styles.label}>
                  <FileText className='h-4 w-4' />
                  Motivo del cambio{' '}
                  <span className='ml-0.5 text-red-500'>*</span>
                </label>
                <textarea
                  id='motivo-edicion-abono'
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  rows={3}
                  placeholder='Describe por que se realiza esta correccion...'
                  className={`${styles.input} resize-none`}
                  autoFocus
                />
                {motivo.trim().length > 0 && motivo.trim().length < 5 ? (
                  <p className='mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400'>
                    <AlertCircle className='h-3 w-3' /> Minimo 5 caracteres.
                  </p>
                ) : null}
              </div>

              {/* Error */}
              {error ? (
                <div className='flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30'>
                  <AlertCircle className='h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400' />
                  <p className='text-sm text-red-700 dark:text-red-300'>
                    {error}
                  </p>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className={styles.footer.container}>
          {fase === 'editar' ? (
            <>
              <button
                type='button'
                onClick={handleClose}
                disabled={isSubmitting}
                className={styles.footer.cancelButton}
              >
                Cancelar
              </button>
              <button
                type='button'
                onClick={irAConfirmar}
                disabled={!puedeRevisar}
                className={styles.footer.submitAbono}
              >
                <CheckCircle2 className='h-4 w-4' />
                Guardar cambios
              </button>
            </>
          ) : (
            <>
              <button
                type='button'
                onClick={volverAEditar}
                disabled={isSubmitting}
                className={`${styles.footer.cancelButton} inline-flex items-center justify-center gap-1.5`}
              >
                <ArrowLeft className='h-4 w-4' />
                Volver
              </button>
              <button
                type='button'
                onClick={handleSubmit}
                disabled={!puedeConfirmar}
                className={styles.footer.submitAbono}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    {subiendoComprobante ? 'Subiendo...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className='h-4 w-4' />
                    Confirmar cambios
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
