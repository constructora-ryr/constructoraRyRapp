'use client'

import { Ban, Download, FileText, Loader2, Pencil } from 'lucide-react'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { TEMA_ABONOS } from '@/modules/abonos/styles/tema-abonos'
import { formatCOP } from '@/shared/components/list-page'
import {
  VisorArchivoModal,
  VisorArchivoPreview,
  tipoDeArchivo,
  visorArchivoStyles as v,
  type VisorNavegacion,
} from '@/shared/components/visor-archivo'
import { ABONO_ESTADO_BADGE } from '@/shared/config/estados.colors'

import { formatearNumeroRecibo } from '../../utils/formato-recibo'
import { fuenteVisual } from '../lista/fuente-visual'
import { ModalAnularAbono } from '../modal-anular-abono'

import { abonoDetalleStyles as s } from './AbonoDetalleModal.styles'
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
  navegacion?: Omit<VisorNavegacion, 'nombre'>
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
    comprobanteUrl,
    tieneComprobante,
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
    negociacionFinancials,
    onAnulado: () => {
      onAnulado?.()
      onClose()
    },
  })

  if (!abono) return null

  const fuente = fuenteVisual(abono.fuente_pago.tipo)
  const FuenteIcono = fuente.icon
  const estado =
    ABONO_ESTADO_BADGE[
      estaAnulado ? 'Anulado' : esRenuncia ? 'Renuncia' : 'Activo'
    ]
  const EstadoIcono = estado.icon
  const recibo = formatearNumeroRecibo(abono.numero_recibo)
  const nav = navegacion ? { ...navegacion, nombre: 'Abono' } : undefined

  const acciones = (
    <>
      {tieneComprobante ? (
        <button
          type='button'
          onClick={handleDescargarComprobante}
          className={v.accion.btn}
          title='Descargar comprobante original'
        >
          <Download className='h-3.5 w-3.5' />
          <span className={v.accion.label}>Comprobante</span>
        </button>
      ) : null}

      <button
        type='button'
        onClick={handleGenerarRecibo}
        disabled={generandoRecibo}
        className={v.accion.btn}
        title='Generar recibo oficial en PDF'
      >
        {generandoRecibo ? (
          <Loader2 className='h-3.5 w-3.5 animate-spin' />
        ) : (
          <FileText className='h-3.5 w-3.5' />
        )}
        <span className={v.accion.label}>Generar recibo</span>
      </button>

      {esNegociacionActiva && !estaAnulado ? (
        <>
          {(esAdmin || canEditar) && onEditar ? (
            <button
              type='button'
              onClick={() => {
                onEditar(abono)
                onClose()
              }}
              className={v.accion.btn}
              title='Editar este abono'
            >
              <Pencil className='h-3.5 w-3.5' />
              <span className={v.accion.label}>Editar</span>
            </button>
          ) : null}
          {esAdmin || canAnular ? (
            <button
              type='button'
              onClick={() => setShowModalAnular(true)}
              className={v.accion.btnDanger}
              title='Anular este abono'
            >
              <Ban className='h-3.5 w-3.5' />
              <span className={v.accion.label}>Anular</span>
            </button>
          ) : null}
        </>
      ) : null}
    </>
  )

  return (
    <VisorArchivoModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`Detalle del abono ${recibo}`}
      // Header: color de la fuente (rojo si está anulado)
      gradient={estaAnulado ? s.headerAnulado : fuente.gradient}
      icono={
        estaAnulado ? (
          <Ban className='h-5 w-5' />
        ) : (
          <FuenteIcono className='h-5 w-5' />
        )
      }
      titulo={
        <>
          {recibo}
          {' · '}
          <span className={estaAnulado ? 'line-through' : ''}>
            {formatCOP(Number(abono.monto))}
          </span>
        </>
      }
      insignia={
        <span className={v.accion.insignia}>
          <EstadoIcono className='h-3 w-3' />
          {estado.label}
        </span>
      }
      subtitulo={
        <>
          {formatNombreCompleto(
            `${abono.cliente.nombres} ${abono.cliente.apellidos}`
          )}{' '}
          &middot; {abono.fuente_pago.tipo} &middot;{' '}
          {formatDateForDisplay(abono.fecha_abono)}
        </>
      }
      acciones={acciones}
      navegacion={nav}
      tecladoActivo={!showModalAnular}
      extra={
        showModalAnular ? (
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
        ) : null
      }
    >
      <VisorArchivoPreview
        url={comprobanteUrl}
        tipo={tipoDeArchivo(null, abono.comprobante_url)}
        titulo='Comprobante de pago'
        sinArchivo={
          tieneComprobante
            ? undefined
            : {
                titulo: 'Sin comprobante adjunto',
                descripcion:
                  'No se adjuntó comprobante al registrar este abono',
              }
        }
        marcaAgua={estaAnulado ? 'ANULADO' : undefined}
        onDescargar={handleDescargarComprobante}
        acento={TEMA_ABONOS.degradado}
        navegacion={nav}
      />
      <AbonoDetalleSidebarPanel
        abono={abono}
        estaAnulado={estaAnulado}
        esRenuncia={esRenuncia}
        canVerCliente={canVerCliente}
        negociacionFinancials={negociacionFinancials}
      />
    </VisorArchivoModal>
  )
}
