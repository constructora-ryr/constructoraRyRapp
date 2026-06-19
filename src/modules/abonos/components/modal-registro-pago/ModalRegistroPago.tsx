'use client'

import { useMemo } from 'react'

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Landmark,
  Loader2,
} from 'lucide-react'

import { getTodayDateString } from '@/lib/utils/date.utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog'

import type { FuentePagoConAbonos } from '../../types'
import { formatearNumeroRecibo } from '../../utils/formato-recibo'
import type { AbonoParaDetalle } from '../abono-detalle-modal/useAbonoDetalle'

import { CampoMontoPago } from './CampoMontoPago'
import { ComprobantePago } from './ComprobantePago'
import { HeaderPago } from './HeaderPago'
import { MetodosPago } from './MetodosPago'
import { getModalStyles } from './ModalRegistroPago.styles'
import { useModalRegistroPago } from './useModalRegistroPago'

export interface ModalRegistroPagoProps {
  open: boolean
  onClose: () => void
  negociacionId: string
  clienteId: string
  fechaMinima?: string
  fuentesPago: FuentePagoConAbonos[]
  fuenteInicial?: FuentePagoConAbonos
  /** Pre-carga el monto del campo y lo bloquea (para pago de cuotas de crédito) */
  montoPrecargado?: number
  /** Mora incluida en montoPrecargado (se separa contablemente) */
  moraIncluida?: number
  onSuccess: (meta?: { fechaAbono?: string }) => void
  /** Contexto de la negoción para generar el recibo PDF en la pantalla de éxito */
  negociacionContext?: {
    cliente: {
      id: string
      nombres: string
      apellidos: string
      numero_documento: string
    }
    vivienda: { numero: string; manzana?: { identificador?: string } }
    proyecto: { nombre: string }
    /** Valor total de la vivienda para el resumen financiero del PDF */
    valorVivienda?: number
    /** Total ya abonado ANTES de este pago (para calcular nuevo saldo) */
    totalAbonadoAntes?: number
  }
}

export function ModalRegistroPago(props: ModalRegistroPagoProps) {
  const {
    fuenteSeleccionada,
    setFuenteSeleccionada,
    modo,
    esDesembolso,
    colorScheme,
    monto,
    setMonto,
    metodoPago,
    setMetodoPago,
    metodosDisponibles,
    referencia,
    setReferencia,
    notas,
    setNotas,
    fechaAbono,
    setFechaAbono,
    comprobante,
    setComprobante,
    errors,
    isSubmitting,
    handleSubmit,
    handleClose,
    abonoRegistrado,
    handleCloseExito,
    valorCuota,
    numeroCuota,
  } = useModalRegistroPago(props)

  const styles = getModalStyles(colorScheme, modo)

  // Construir AbonoParaDetalle para el recibo PDF (solo disponible si tenemos negociacionContext)
  const abonoParaRecibo = useMemo((): AbonoParaDetalle | null => {
    if (!abonoRegistrado || !props.negociacionContext || !fuenteSeleccionada)
      return null
    const ctx = props.negociacionContext
    return {
      id: abonoRegistrado.id,
      numero_recibo: abonoRegistrado.numero_recibo,
      monto: abonoRegistrado.monto,
      fecha_abono: abonoRegistrado.fecha_abono,
      metodo_pago: abonoRegistrado.metodo_pago,
      numero_referencia: abonoRegistrado.numero_referencia,
      comprobante_url: abonoRegistrado.comprobante_url,
      notas: abonoRegistrado.notas,
      fecha_creacion: abonoRegistrado.fecha_creacion,
      negociacion: { id: props.negociacionId, estado: 'Activa' },
      cliente: ctx.cliente,
      vivienda: {
        id: '',
        numero: ctx.vivienda.numero,
        manzana: { identificador: ctx.vivienda.manzana?.identificador ?? '' },
      },
      proyecto: { id: '', nombre: ctx.proyecto.nombre },
      fuente_pago: { id: fuenteSeleccionada.id, tipo: fuenteSeleccionada.tipo },
    }
  }, [
    abonoRegistrado,
    props.negociacionContext,
    props.negociacionId,
    fuenteSeleccionada,
  ])

  const handleDescargarRecibo = async () => {
    if (!abonoParaRecibo) return
    const { generarYDescargarRecibo } = await import(
      '../recibo-pdf/generarReciboPDF'
    )
    const ctx = props.negociacionContext
    const valorVivienda = ctx?.valorVivienda
    const totalAbonadoNuevo =
      (ctx?.totalAbonadoAntes ?? 0) + abonoParaRecibo.monto
    await generarYDescargarRecibo(abonoParaRecibo, {
      valorTotal: valorVivienda,
      totalAbonado: valorVivienda !== undefined ? totalAbonadoNuevo : undefined,
      saldoPendiente:
        valorVivienda !== undefined
          ? Math.max(0, valorVivienda - totalAbonadoNuevo)
          : undefined,
    })
  }

  if (!fuenteSeleccionada) return null

  // ── Formato del número de recibo ─────────────────────────────────────────
  const numRecibo = abonoRegistrado
    ? formatearNumeroRecibo(abonoRegistrado.numero_recibo)
    : ''

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (abonoRegistrado) {
    return (
      <Dialog
        open={props.open}
        onOpenChange={open => !open && handleCloseExito()}
      >
        <DialogContent className={styles.dialogContent}>
          <DialogTitle className='sr-only'>
            Abono registrado exitosamente
          </DialogTitle>
          <DialogDescription className='sr-only'>
            El abono fue guardado con éxito
          </DialogDescription>

          <div className='flex flex-col items-center gap-5 px-6 py-10 text-center'>
            {/* Ícono de éxito */}
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40'>
              <CheckCircle2 className='h-11 w-11 text-emerald-600 dark:text-emerald-400' />
            </div>

            {/* Título */}
            <div className='space-y-1'>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                {esDesembolso ? 'Desembolso registrado' : 'Abono registrado'}
              </h3>
              <p className='font-mono text-xs font-medium text-gray-500 dark:text-gray-400'>
                {numRecibo}
              </p>
            </div>

            {/* Datos del pago */}
            <div className='w-full max-w-xs space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-left dark:border-emerald-800 dark:bg-emerald-950/30'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  Monto
                </span>
                <span className='text-base font-bold text-emerald-700 dark:text-emerald-400'>
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                  }).format(abonoRegistrado.monto)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  Fuente
                </span>
                <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                  {fuenteSeleccionada.tipo}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  Método
                </span>
                <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                  {abonoRegistrado.metodo_pago}
                </span>
              </div>
            </div>

            {/* Botones */}
            <div className='flex w-full max-w-xs flex-col gap-2'>
              {abonoParaRecibo ? (
                <button
                  type='button'
                  onClick={handleDescargarRecibo}
                  className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-colors hover:bg-emerald-700'
                >
                  <Download className='h-4 w-4' />
                  Descargar Recibo PDF
                </button>
              ) : null}
              <button
                type='button'
                onClick={handleCloseExito}
                className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cerrar
              </button>
              {!abonoParaRecibo ? (
                <p className='text-xs text-gray-400 dark:text-gray-500'>
                  El recibo PDF está disponible en el historial de abonos
                </p>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Formulario de registro ────────────────────────────────────────────────
  return (
    <Dialog open={props.open} onOpenChange={open => !open && handleClose()}>
      <DialogContent className={styles.dialogContent}>
        <DialogTitle className='sr-only'>
          Registrar {esDesembolso ? 'Desembolso' : 'Abono'} —{' '}
          {fuenteSeleccionada.tipo}
        </DialogTitle>
        <DialogDescription className='sr-only'>
          Formulario para registrar{' '}
          {esDesembolso ? 'un desembolso bancario único' : 'un abono parcial'}{' '}
          de la fuente {fuenteSeleccionada.tipo}
        </DialogDescription>

        <HeaderPago
          modo={modo}
          fuenteSeleccionada={fuenteSeleccionada}
          fuentesPago={props.fuentesPago}
          colorScheme={colorScheme}
          onFuenteChange={setFuenteSeleccionada}
          valorCuota={valorCuota}
          numeroCuota={numeroCuota}
        />

        <div className={styles.body}>
          <CampoMontoPago
            modo={modo}
            monto={monto}
            onMontoChange={setMonto}
            saldoPendiente={fuenteSeleccionada.saldo_pendiente ?? 0}
            montoAprobado={fuenteSeleccionada.monto_aprobado}
            colorScheme={colorScheme}
            error={errors.monto}
          />

          <MetodosPago
            modo={modo}
            metodosDisponibles={metodosDisponibles}
            metodoPago={metodoPago}
            onMetodoChange={setMetodoPago}
            colorScheme={colorScheme}
          />

          {/* Fecha */}
          <div>
            <label htmlFor='fecha-pago' className={styles.label}>
              <Calendar className='h-4 w-4' />
              Fecha del {esDesembolso ? 'desembolso' : 'abono'}{' '}
              <span className='text-red-500'>*</span>
            </label>
            <input
              type='date'
              id='fecha-pago'
              value={fechaAbono}
              min={props.fechaMinima}
              max={getTodayDateString()}
              onChange={e => setFechaAbono(e.target.value)}
              className={errors.fechaAbono ? styles.inputError : styles.input}
            />
            {errors.fechaAbono ? (
              <p className='mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400'>
                <AlertCircle className='h-3 w-3' /> {errors.fechaAbono}
              </p>
            ) : null}
          </div>

          {/* Referencia — solo para Transferencia o Cheque */}
          {metodoPago === 'Transferencia' || metodoPago === 'Cheque' ? (
            <div>
              <label htmlFor='referencia-pago' className={styles.label}>
                <FileText className='h-4 w-4' />
                {metodoPago === 'Transferencia'
                  ? 'Número de transferencia'
                  : 'Número de cheque'}
                <span className='text-xs font-normal text-gray-400 dark:text-gray-500'>
                  (Opcional)
                </span>
              </label>
              <input
                type='text'
                id='referencia-pago'
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
            <label htmlFor='notas-pago' className={styles.label}>
              <FileText className='h-4 w-4' />
              Observaciones
              <span className='text-xs font-normal text-gray-400 dark:text-gray-500'>
                (Opcional)
              </span>
            </label>
            <textarea
              id='notas-pago'
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={2}
              placeholder='Notas adicionales sobre este pago...'
              className={`${styles.input} resize-none`}
            />
          </div>

          <ComprobantePago
            modo={modo}
            archivo={comprobante}
            onArchivoChange={setComprobante}
            error={errors.comprobante}
          />

          {errors.submit ? (
            <div className='flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30'>
              <AlertCircle className='h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400' />
              <p className='text-sm text-red-700 dark:text-red-300'>
                {errors.submit}
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className={styles.footer.container}>
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={
              esDesembolso
                ? styles.footer.submitDesembolso
                : styles.footer.submitAbono
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' /> Guardando...
              </>
            ) : esDesembolso ? (
              <>
                <Landmark className='h-4 w-4' /> Registrar Desembolso
              </>
            ) : (
              <>
                <CheckCircle2 className='h-4 w-4' /> Confirmar Abono
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
