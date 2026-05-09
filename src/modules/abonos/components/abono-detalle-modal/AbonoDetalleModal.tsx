'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Ban,
  Download,
  FileText,
  Loader2,
  Pencil,
  Receipt,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/lib/utils/format.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'

import { formatearNumeroRecibo } from '../../utils/formato-recibo'
import { ModalAnularAbono } from '../modal-anular-abono'

import { abonoDetalleStyles as s } from './AbonoDetalleModal.styles'
import { AbonoDetallePreviewPanel } from './AbonoDetallePreviewPanel'
import { AbonoDetalleSidebarPanel } from './AbonoDetalleSidebarPanel'
import { type AbonoParaDetalle, useAbonoDetalle } from './useAbonoDetalle'

interface AbonoDetalleModalProps {
  abono: AbonoParaDetalle | null
  isOpen: boolean
  onClose: () => void
  onEditar?: (abono: AbonoParaDetalle) => void
  onAnulado?: () => void
  canEditar?: boolean
  canAnular?: boolean
  canVerCliente?: boolean
  /** Datos financieros de la negociacion (del parent — evita fetch redundante) */
  negociacionFinancials?: {
    valorTotal: number
    totalAbonado: number
    saldoPendiente: number
  } | null
}

export function AbonoDetalleModal({
  abono,
  isOpen,
  onEditar,
  onClose,
  onAnulado,
  canEditar,
  canAnular,
  canVerCliente,
  negociacionFinancials,
}: AbonoDetalleModalProps) {
  const {
    mounted,
    closeButtonRef,
    comprobanteUrl,
    loadingComprobante,
    tieneComprobante,
    esImagen,
    esPDF,
    esNegociacionActiva,
    estaAnulado,
    generandoRecibo,
    showModalAnular,
    setShowModalAnular,
    esAdmin,
    viviendaLabel,
    handleDescargarComprobante,
    handleGenerarRecibo,
    handleAbonoAnulado,
  } = useAbonoDetalle({
    abono,
    isOpen,
    onClose,
    negociacionFinancials,
    onAnulado: () => {
      onAnulado?.()
      onClose()
    },
  })

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && abono ? (
        <>
          {/* Overlay */}
          <motion.div
            key='overlay'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={s.overlay}
          />

          {/* Modal */}
          <motion.div
            key='modal'
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={s.modal}
            role='dialog'
            aria-modal='true'
            aria-label={`Detalle del abono ${formatearNumeroRecibo(abono.numero_recibo)}`}
          >
            {/* Header */}
            <div
              className={
                estaAnulado ? s.header.containerAnulado : s.header.container
              }
            >
              <div className={s.header.left}>
                <div className={s.header.iconWrap}>
                  {estaAnulado ? (
                    <Ban className='h-5 w-5 text-white' />
                  ) : (
                    <Receipt className='h-5 w-5 text-white' />
                  )}
                </div>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className={s.header.title}>
                      {formatearNumeroRecibo(abono.numero_recibo)}
                      {' · '}
                      {formatCurrency(abono.monto)}
                    </p>
                    {estaAnulado ? (
                      <span className={s.header.badgeAnulado}>
                        <Ban className='h-2.5 w-2.5' />
                        Anulado
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={
                      estaAnulado ? s.header.subtitleAnulado : s.header.subtitle
                    }
                  >
                    {formatNombreCompleto(
                      `${abono.cliente.nombres} ${abono.cliente.apellidos}`
                    )}{' '}
                    &middot; {formatDateForDisplay(abono.fecha_abono)}
                  </p>
                </div>
              </div>

              <div className={s.header.actions}>
                {tieneComprobante ? (
                  <button
                    onClick={handleDescargarComprobante}
                    className={s.header.btn}
                    title='Descargar comprobante original'
                  >
                    <Download className='h-3.5 w-3.5' />
                    Comprobante
                  </button>
                ) : null}

                <button
                  onClick={handleGenerarRecibo}
                  disabled={generandoRecibo}
                  className={s.header.btn}
                  title='Generar recibo oficial en PDF'
                >
                  {generandoRecibo ? (
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  ) : (
                    <FileText className='h-3.5 w-3.5' />
                  )}
                  Generar Recibo
                </button>

                {esNegociacionActiva && !estaAnulado ? (
                  <>
                    {(esAdmin || canEditar) && onEditar ? (
                      <button
                        onClick={() => {
                          onEditar?.(abono)
                          onClose()
                        }}
                        className={s.header.btn}
                        title='Editar este abono'
                      >
                        <Pencil className='h-3.5 w-3.5' />
                        Editar
                      </button>
                    ) : null}
                    {esAdmin || canAnular ? (
                      <button
                        onClick={() => setShowModalAnular(true)}
                        className={s.header.btnDanger}
                        title='Anular este abono'
                      >
                        <Ban className='h-3.5 w-3.5' />
                        Anular
                      </button>
                    ) : null}
                  </>
                ) : null}

                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className={s.header.btnClose}
                  aria-label='Cerrar'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className={s.body}>
              <AbonoDetallePreviewPanel
                comprobanteUrl={comprobanteUrl}
                loadingComprobante={loadingComprobante}
                tieneComprobante={tieneComprobante}
                esImagen={esImagen}
                esPDF={esPDF}
              />
              <AbonoDetalleSidebarPanel
                abono={abono}
                estaAnulado={estaAnulado}
                viviendaLabel={viviendaLabel}
                canVerCliente={canVerCliente}
              />
            </div>

            {/* Modal de Anulacion */}
            {showModalAnular ? (
              <ModalAnularAbono
                abono={{
                  id: abono.id,
                  numero_recibo: abono.numero_recibo,
                  monto: abono.monto,
                  fecha_abono: abono.fecha_abono,
                  cliente_nombre:
                    `${abono.cliente.nombres} ${abono.cliente.apellidos}`.trim(),
                  vivienda_info: viviendaLabel,
                  proyecto_nombre: abono.proyecto.nombre,
                  fuente_tipo: abono.fuente_pago.tipo,
                }}
                onAnulacionExitosa={() => {
                  setShowModalAnular(false)
                  handleAbonoAnulado()
                }}
                onClose={() => setShowModalAnular(false)}
              />
            ) : null}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
