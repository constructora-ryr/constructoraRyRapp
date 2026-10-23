'use client'

/**
 * Modal única para registrar pagos de cualquier fuente. Se adapta al tipo:
 * - Desembolso (permite_multiples_abonos = false): monto fijo = el aprobado
 *   (créditos) o asignado (subsidios),
 *   solo transferencia o cheque.
 * - Abonos parciales: monto libre (hasta el saldo; un Admin puede excederlo
 *   y queda como devolución), también en efectivo.
 * La validación definitiva la hace la RPC registrar_abono en el servidor.
 */

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileText,
  Hash,
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
import { getLabelsContextuales } from '@/shared/constants/fuentes-pago.constants'

import type { FuentePagoConAbonos } from '../../types'
import type { AbonoParaDetalle } from '../abono-detalle-modal/useAbonoDetalle'

import { CampoMontoPago } from './CampoMontoPago'
import { ComprobantePago } from './ComprobantePago'
import { HeaderPago } from './HeaderPago'
import { MetodosPago } from './MetodosPago'
import { getModalStyles } from './ModalRegistroPago.styles'
import { PantallaExitoPago } from './PantallaExitoPago'
import {
  useModalRegistroPago,
  type AbonoRegistrado,
} from './useModalRegistroPago'

export interface NegociacionContextoRecibo {
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
  /** Total ya abonado ANTES de este pago (para calcular el nuevo saldo) */
  totalAbonadoAntes?: number
}

export interface ModalRegistroPagoProps {
  open: boolean
  onClose: () => void
  negociacionId: string
  fuente: FuentePagoConAbonos
  fechaMinima?: string
  /** Admin puede registrar más del saldo (queda como devolución pendiente) */
  esAdmin?: boolean
  onSuccess: (meta?: { fechaAbono?: string }) => void
  /** Datos de la negociación para generar el recibo PDF al terminar */
  negociacionContext?: NegociacionContextoRecibo
}

const TEXTO_FASE = {
  subiendo: 'Subiendo comprobante…',
  guardando: 'Guardando pago…',
}

function abonoParaRecibo(
  abono: AbonoRegistrado,
  negociacionId: string,
  fuente: FuentePagoConAbonos,
  ctx: NegociacionContextoRecibo
): AbonoParaDetalle {
  return {
    id: abono.id,
    numero_recibo: abono.numero_recibo,
    monto: abono.monto,
    fecha_abono: abono.fecha_abono,
    metodo_pago: abono.metodo_pago,
    numero_referencia: abono.numero_referencia,
    comprobante_url: abono.comprobante_url,
    notas: abono.notas,
    fecha_creacion: abono.fecha_creacion,
    negociacion: { id: negociacionId, estado: 'Activa' },
    cliente: ctx.cliente,
    vivienda: {
      id: '',
      numero: ctx.vivienda.numero,
      manzana: { identificador: ctx.vivienda.manzana?.identificador ?? '' },
    },
    proyecto: { id: '', nombre: ctx.proyecto.nombre },
    fuente_pago: { id: fuente.id, tipo: fuente.tipo },
  }
}

export function ModalRegistroPago(props: ModalRegistroPagoProps) {
  const { fuente, negociacionContext: ctx } = props
  const m = useModalRegistroPago(props)
  const styles = getModalStyles(m.colorScheme)
  const pago = m.esDesembolso ? 'desembolso' : 'abono'

  const descargarRecibo =
    m.abonoRegistrado && ctx
      ? async () => {
          const abono = abonoParaRecibo(
            m.abonoRegistrado as AbonoRegistrado,
            props.negociacionId,
            fuente,
            ctx
          )
          const { generarYDescargarRecibo } = await import(
            '../recibo-pdf/generarReciboPDF'
          )
          const valorTotal = ctx.valorVivienda
          const totalAbonado = (ctx.totalAbonadoAntes ?? 0) + abono.monto
          await generarYDescargarRecibo(abono, {
            valorTotal,
            totalAbonado: valorTotal !== undefined ? totalAbonado : undefined,
            saldoPendiente:
              valorTotal !== undefined
                ? Math.max(0, valorTotal - totalAbonado)
                : undefined,
          })
        }
      : undefined

  if (m.abonoRegistrado) {
    return (
      <Dialog
        open={props.open}
        onOpenChange={open => !open && m.handleCloseExito()}
      >
        <DialogContent className={styles.dialogContent}>
          <DialogTitle className='sr-only'>Pago registrado</DialogTitle>
          <DialogDescription className='sr-only'>
            El {pago} quedó guardado
          </DialogDescription>
          <PantallaExitoPago
            abono={m.abonoRegistrado}
            esDesembolso={m.esDesembolso}
            fuenteTipo={fuente.tipo}
            onDescargarRecibo={descargarRecibo}
            onCerrar={m.handleCloseExito}
          />
        </DialogContent>
      </Dialog>
    )
  }

  const esReferenciable =
    m.metodoPago === 'Transferencia' || m.metodoPago === 'Cheque'

  return (
    <Dialog
      open={props.open}
      onOpenChange={open => !open && !m.isSubmitting && m.handleClose()}
    >
      <DialogContent className={styles.dialogContent}>
        <DialogTitle className='sr-only'>
          Registrar {pago} — {fuente.tipo}
        </DialogTitle>
        <DialogDescription className='sr-only'>
          Formulario para registrar un {pago} de la fuente {fuente.tipo}
        </DialogDescription>

        <HeaderPago
          modo={m.modo}
          fuente={fuente}
          className={styles.header.container}
          chipClassName={styles.header.chip}
          valorCuota={m.valorCuota}
        />

        <div className={styles.body}>
          <p className='text-sm text-gray-600 dark:text-gray-300'>
            {m.esDesembolso
              ? 'Registra el dinero que la entidad ya consignó a la constructora y adjunta el soporte del banco.'
              : 'Registra un pago que el cliente ya hizo y adjunta el recibo o soporte.'}
          </p>

          <CampoMontoPago
            modo={m.modo}
            monto={m.monto}
            onMontoChange={m.setMonto}
            montoNum={m.montoNum}
            montoAprobado={fuente.monto_aprobado ?? 0}
            etiquetaMonto={getLabelsContextuales(
              fuente.tipo
            ).montoLabel.toLowerCase()}
            montoRecibido={fuente.monto_recibido ?? 0}
            saldoPendiente={m.saldoPendiente}
            saldoDespues={m.saldoDespues}
            excedente={m.excedente}
            esAdmin={!!props.esAdmin}
            valorCuota={m.valorCuota}
            colorScheme={m.colorScheme}
            error={m.errors.monto}
          />

          <MetodosPago
            modo={m.modo}
            metodosDisponibles={m.metodosDisponibles}
            metodoPago={m.metodoPago}
            onMetodoChange={m.setMetodoPago}
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <label htmlFor='fecha-pago' className={styles.label}>
                <Calendar className='h-4 w-4' />
                Fecha del {pago} <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                id='fecha-pago'
                value={m.fechaAbono}
                min={props.fechaMinima}
                max={getTodayDateString()}
                onChange={e => m.setFechaAbono(e.target.value)}
                className={
                  m.errors.fechaAbono ? styles.inputError : styles.input
                }
              />
              {m.errors.fechaAbono ? (
                <p className={styles.error}>
                  <AlertCircle className='h-3 w-3' /> {m.errors.fechaAbono}
                </p>
              ) : (
                <p className={styles.hint}>
                  Día en que el dinero llegó, no el de hoy si fue antes.
                </p>
              )}
            </div>

            {esReferenciable ? (
              <div>
                <label htmlFor='referencia-pago' className={styles.label}>
                  <Hash className='h-4 w-4' />
                  {m.metodoPago === 'Transferencia'
                    ? 'N.º de transferencia'
                    : 'N.º de cheque'}
                  <span className={styles.opcional}>(opcional)</span>
                </label>
                <input
                  type='text'
                  id='referencia-pago'
                  value={m.referencia}
                  onChange={e => m.setReferencia(e.target.value)}
                  placeholder={
                    m.metodoPago === 'Transferencia'
                      ? 'Ej: TRF-001234'
                      : 'Ej: 0001234'
                  }
                  className={styles.input}
                />
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor='notas-pago' className={styles.label}>
              <FileText className='h-4 w-4' />
              Observaciones <span className={styles.opcional}>(opcional)</span>
            </label>
            <textarea
              id='notas-pago'
              value={m.notas}
              onChange={e => m.setNotas(e.target.value)}
              rows={2}
              placeholder='Ej: pagó en la oficina, consignación desde otra cuenta…'
              className={`${styles.input} resize-none`}
            />
          </div>

          <ComprobantePago
            modo={m.modo}
            archivo={m.comprobante}
            onArchivoChange={m.setComprobante}
            error={m.errors.comprobante}
          />

          {m.errors.submit ? (
            <div className='flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30'>
              <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400' />
              <p className='text-sm text-red-700 dark:text-red-300'>
                {m.errors.submit}
              </p>
            </div>
          ) : null}
        </div>

        <div className={styles.footer.container}>
          <button
            type='button'
            onClick={m.handleClose}
            disabled={m.isSubmitting}
            className={styles.footer.cancelButton}
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={m.handleSubmit}
            disabled={m.isSubmitting}
            className={styles.footer.submit}
          >
            {m.faseLoading !== 'idle' ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                {TEXTO_FASE[m.faseLoading]}
              </>
            ) : m.esDesembolso ? (
              <>
                <Landmark className='h-4 w-4' /> Registrar desembolso
              </>
            ) : (
              <>
                <CheckCircle2 className='h-4 w-4' /> Registrar abono
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
