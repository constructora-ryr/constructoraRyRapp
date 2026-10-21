'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Pencil,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { formatCOP } from '@/shared/components/list-page'
import { ABONO_ESTADO_BADGE } from '@/shared/config/estados.colors'
import { cn } from '@/shared/utils/helpers'

import { formatearNumeroRecibo } from '../../utils/formato-recibo'
import { fuenteVisual } from '../lista/fuente-visual'
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
  /** Pasar al abono anterior/siguiente sin cerrar (botones y ← →) */
  navegacion?: {
    /** Posición 1-based del abono actual */
    actual: number
    total: number
    onAnterior?: () => void
    onSiguiente?: () => void
  }
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
  navegacion,
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
    esRenuncia,
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
    onAnterior: navegacion?.onAnterior,
    onSiguiente: navegacion?.onSiguiente,
    onAnulado: () => {
      onAnulado?.()
      onClose()
    },
  })

  if (!mounted) return null

  const fuente = abono ? fuenteVisual(abono.fuente_pago.tipo) : null
  const FuenteIcono = fuente?.icon
  const estado =
    ABONO_ESTADO_BADGE[
      estaAnulado ? 'Anulado' : esRenuncia ? 'Renuncia' : 'Activo'
    ]
  const EstadoIcono = estado.icon

  return createPortal(
    <AnimatePresence>
      {isOpen && abono && fuente && FuenteIcono ? (
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
            {/* Header: color de la fuente (rojo si está anulado) */}
            <div
              className={cn(
                s.header.container,
                estaAnulado ? s.header.anulado : fuente.gradient
              )}
            >
              <span aria-hidden className={s.header.glow} />
              <div className={s.header.left}>
                <div className={s.header.iconWrap}>
                  {estaAnulado ? (
                    <Ban className='h-5 w-5 text-white' />
                  ) : (
                    <FuenteIcono className='h-5 w-5 text-white' />
                  )}
                </div>
                <div className='min-w-0'>
                  <div className='flex min-w-0 items-center gap-2'>
                    <p className={s.header.title}>
                      {formatearNumeroRecibo(abono.numero_recibo)}
                      {' · '}
                      <span className={estaAnulado ? 'line-through' : ''}>
                        {formatCOP(Number(abono.monto))}
                      </span>
                    </p>
                    <span className={s.header.badgeEstado}>
                      <EstadoIcono className='h-3 w-3' />
                      {estado.label}
                    </span>
                  </div>
                  <p className={s.header.subtitle}>
                    {formatNombreCompleto(
                      `${abono.cliente.nombres} ${abono.cliente.apellidos}`
                    )}{' '}
                    &middot; {abono.fuente_pago.tipo} &middot;{' '}
                    {formatDateForDisplay(abono.fecha_abono)}
                  </p>
                </div>
              </div>

              <div className={s.header.actions}>
                {navegacion && navegacion.total > 1 ? (
                  <div className={s.header.nav}>
                    <button
                      type='button'
                      onClick={navegacion.onAnterior}
                      disabled={!navegacion.onAnterior}
                      className={s.header.navBtn}
                      aria-label='Abono anterior (←)'
                      title='Anterior (←)'
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </button>
                    <span className={s.header.navLabel}>
                      {navegacion.actual} de {navegacion.total}
                    </span>
                    <button
                      type='button'
                      onClick={navegacion.onSiguiente}
                      disabled={!navegacion.onSiguiente}
                      className={s.header.navBtn}
                      aria-label='Abono siguiente (→)'
                      title='Siguiente (→)'
                    >
                      <ChevronRight className='h-4 w-4' />
                    </button>
                  </div>
                ) : null}

                {tieneComprobante ? (
                  <button
                    onClick={handleDescargarComprobante}
                    className={s.header.btn}
                    title='Descargar comprobante original'
                  >
                    <Download className='h-3.5 w-3.5' />
                    <span className={s.header.btnLabel}>Comprobante</span>
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
                  <span className={s.header.btnLabel}>Generar recibo</span>
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
                        <span className={s.header.btnLabel}>Editar</span>
                      </button>
                    ) : null}
                    {esAdmin || canAnular ? (
                      <button
                        onClick={() => setShowModalAnular(true)}
                        className={s.header.btnDanger}
                        title='Anular este abono'
                      >
                        <Ban className='h-3.5 w-3.5' />
                        <span className={s.header.btnLabel}>Anular</span>
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
                anulado={estaAnulado}
              />
              <AbonoDetalleSidebarPanel
                abono={abono}
                estaAnulado={estaAnulado}
                esRenuncia={esRenuncia}
                canVerCliente={canVerCliente}
                negociacionFinancials={negociacionFinancials}
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
