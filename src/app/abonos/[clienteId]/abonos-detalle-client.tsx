'use client'

import { useCallback, useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowDownToLine,
  CheckCircle2,
  Wallet,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateForInput } from '@/lib/utils/date.utils'
import { getShortId } from '@/lib/utils/slug.utils'
import { AbonoDetalleModal } from '@/modules/abonos/components/abono-detalle-modal/AbonoDetalleModal'
import type { AbonoParaDetalle } from '@/modules/abonos/components/abono-detalle-modal/useAbonoDetalle'
import { ModalEditarAbono } from '@/modules/abonos/components/modal-editar-abono'
import { ModalRegistroPago } from '@/modules/abonos/components/modal-registro-pago'
import type { AbonoHistorial } from '@/modules/abonos/types'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import { PantallaCarga } from '@/shared/components/carga'
import { formatCurrency } from '@/shared/utils/format'

import {
  AvisoAbonos,
  FuentePagoCard,
  HeaderCliente,
  TimelineAbonos,
} from './components'
import { useAbonosDetalle } from './hooks/useAbonosDetalle'

interface AbonosDetalleClientProps {
  clienteId: string
}

export default function AbonosDetalleClient({
  clienteId,
}: AbonosDetalleClientProps) {
  const router = useRouter()

  const {
    negociacion,
    metricas,
    abonos,
    fuenteSeleccionada,
    isLoading,
    loadingAbonos,
    modalAbonoOpen,
    validarFuentePago,
    estaBalanceado,
    excedente,
    estadoDevolucion,
    handleRegistrarAbono,
    handleCerrarModal,
    handleAbonoRegistrado,
  } = useAbonosDetalle(clienteId)

  // ─── Permisos granulares de abonos ──────────────────────────────────────
  const { esAdmin, puede } = usePermisosQuery()
  const canRegistrar =
    (esAdmin || puede('abonos', 'registrar')) && estaBalanceado
  const canEditar = esAdmin || puede('abonos', 'editar')
  const canAnular = esAdmin || puede('abonos', 'anular')

  const [cuotasRefreshKey, setCuotasRefreshKey] = useState(0)

  // Modal unificado de detalle (comprobante + acciones)
  const [abonoDetalle, setAbonoDetalle] = useState<AbonoParaDetalle | null>(
    null
  )
  // Modal de edición (se abre desde dentro del modal de detalle)
  const [abonoEditando, setAbonoEditando] = useState<AbonoParaEditar | null>(
    null
  )

  /** Construye AbonoParaDetalle desde AbonoHistorial + datos del negociacion en memoria */
  const buildAbonoParaDetalle = useCallback(
    (abono: AbonoHistorial): AbonoParaDetalle | null => {
      if (!negociacion) return null
      return {
        id: abono.id,
        numero_recibo: abono.numero_recibo,
        monto: abono.monto,
        fecha_abono: abono.fecha_abono,
        metodo_pago: abono.metodo_pago,
        numero_referencia: abono.numero_referencia ?? null,
        comprobante_url: abono.comprobante_url ?? null,
        notas: abono.notas ?? null,
        fecha_creacion: abono.fecha_creacion,
        estado: abono.estado,
        motivo_categoria: abono.motivo_categoria ?? null,
        motivo_detalle: abono.motivo_detalle ?? null,
        anulado_por_nombre: abono.anulado_por_nombre ?? null,
        fecha_anulacion: abono.fecha_anulacion ?? null,
        negociacion: {
          id: negociacion.id,
          estado: negociacion.estado as
            | 'Activa'
            | 'Completada'
            | 'Suspendida'
            | 'Cerrada por Renuncia',
        },
        cliente: {
          id: negociacion.cliente.id,
          nombres: negociacion.cliente.nombres,
          apellidos: negociacion.cliente.apellidos,
          numero_documento: negociacion.cliente.numero_documento,
        },
        vivienda: {
          id: negociacion.vivienda.id,
          numero: negociacion.vivienda.numero,
          manzana: {
            identificador: negociacion.vivienda.manzana?.nombre ?? '',
          },
        },
        proyecto: {
          id: negociacion.proyecto.id,
          nombre: negociacion.proyecto.nombre,
        },
        fuente_pago: {
          id: abono.fuente_pago_id,
          tipo:
            negociacion.fuentes_pago?.find(f => f.id === abono.fuente_pago_id)
              ?.tipo ??
            abono.fuente_tipo ??
            '',
        },
      }
    },
    [negociacion]
  )

  const handleVerDetalle = useCallback(
    (abono: AbonoHistorial) => {
      const detalle = buildAbonoParaDetalle(abono)
      if (detalle) setAbonoDetalle(detalle)
    },
    [buildAbonoParaDetalle]
  )

  const handleEditarDesdeDetalle = useCallback((abono: AbonoParaDetalle) => {
    setAbonoDetalle(null)
    setAbonoEditando({
      id: abono.id,
      negociacion_id: abono.negociacion.id,
      fuente_pago_id: abono.fuente_pago.id,
      fuente_tipo: abono.fuente_pago.tipo,
      monto: abono.monto,
      fecha_abono: abono.fecha_abono,
      metodo_pago: abono.metodo_pago as AbonoParaEditar['metodo_pago'],
      numero_referencia: abono.numero_referencia,
      notas: abono.notas,
      comprobante_url: abono.comprobante_url,
    })
  }, [])

  const handleAbonoConRefresh = useCallback(() => {
    handleAbonoRegistrado()
    setCuotasRefreshKey(k => k + 1)
  }, [handleAbonoRegistrado])

  const handleEditarSuccess = useCallback(() => {
    setAbonoEditando(null)
    handleAbonoConRefresh()
  }, [handleAbonoConRefresh])

  // Construir slug canónico desde los datos resueltos (no desde el parámetro URL)
  const clienteSlug = negociacion
    ? getShortId(negociacion.cliente.id)
    : getShortId(clienteId)

  // Sin negociación activa (p.ej. ya saldada): volver al listado
  const sinNegociacion = !isLoading && !negociacion
  useEffect(() => {
    if (sinNegociacion) router.replace('/abonos/registrar')
  }, [sinNegociacion, router])

  if (isLoading) {
    return (
      <PantallaCarga
        modulo='abonos'
        icon={Wallet}
        label='Cargando abonos del cliente'
      />
    )
  }

  if (!negociacion || !metricas) return null

  const fuentes = negociacion.fuentes_pago ?? []
  // Primero lo que falta por recibir; las completadas van al final
  const fuentesOrdenadas = [...fuentes].sort(
    (a, b) =>
      Number((a.saldo_pendiente || 0) <= 0) -
      Number((b.saldo_pendiente || 0) <= 0)
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/60 to-purple-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className='mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 lg:py-8'
      >
        <HeaderCliente
          negociacion={negociacion}
          metricas={metricas}
          excedente={estaBalanceado ? excedente : 0}
          canVerCliente={esAdmin || puede('clientes', 'ver')}
        />

        {/* Avisos del cierre financiero */}
        {!estaBalanceado && fuentes.length > 0 ? (
          <AvisoAbonos
            tono='rojo'
            icon={AlertTriangle}
            titulo='Las fuentes de pago no cuadran con el total'
          >
            No se pueden registrar pagos hasta corregir el cierre financiero en
            la pestaña Negociación del cliente.
          </AvisoAbonos>
        ) : null}
        {estaBalanceado && excedente > 0 ? (
          estadoDevolucion === 'procesada' ? (
            <AvisoAbonos
              tono='verde'
              icon={CheckCircle2}
              titulo={`Excedente devuelto · ${formatCurrency(negociacion.excedente_devolucion_monto ?? excedente)}`}
            >
              Las fuentes de pago superaban el total y la diferencia ya se le
              devolvió al cliente
              {negociacion.excedente_devolucion_fecha
                ? ` el ${negociacion.excedente_devolucion_fecha}`
                : ''}
              .
            </AvisoAbonos>
          ) : (
            <AvisoAbonos
              tono='ambar'
              icon={ArrowDownToLine}
              titulo={`Excedente por devolver · ${formatCurrency(excedente)}`}
            >
              Las fuentes de pago superan el total a pagar. Registra la
              devolución al cliente desde la pestaña Negociación.
            </AvisoAbonos>
          )
        ) : null}

        {/* Fuentes de pago */}
        <section className='space-y-3'>
          <div className='flex items-center gap-2 px-1'>
            <Wallet className='h-4 w-4 text-violet-600 dark:text-violet-400' />
            <h2 className='text-sm font-bold text-slate-800 dark:text-slate-100'>
              Fuentes de pago
            </h2>
            <span className='ml-auto text-xs text-slate-500 dark:text-slate-400'>
              {fuentes.length} fuente{fuentes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {fuentes.length > 0 ? (
            fuentesOrdenadas.map((fuente, index) => (
              <FuentePagoCard
                key={fuente.id}
                fuente={fuente}
                negociacionId={negociacion.id}
                clienteSlug={clienteSlug}
                onRegistrarAbono={handleRegistrarAbono}
                onAbonoRegistrado={handleAbonoConRefresh}
                cuotasRefreshKey={cuotasRefreshKey}
                index={index}
                canCreate={canRegistrar}
                validacion={validarFuentePago[fuente.id]}
              />
            ))
          ) : (
            <div className='rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40'>
              <Wallet className='mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600' />
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Esta negociación no tiene fuentes de pago configuradas
              </p>
            </div>
          )}
        </section>

        {/* Historial */}
        <TimelineAbonos
          abonos={abonos}
          fuentesPago={fuentes}
          loading={loadingAbonos}
          onVerDetalle={handleVerDetalle}
        />
        {/* Modal de registro de abono */}
        {modalAbonoOpen && fuenteSeleccionada && (
          <ModalRegistroPago
            open={modalAbonoOpen}
            onClose={handleCerrarModal}
            negociacionId={negociacion.id}
            esAdmin={esAdmin}
            fechaMinima={
              negociacion.fecha_negociacion
                ? formatDateForInput(negociacion.fecha_negociacion)
                : undefined
            }
            fuente={fuenteSeleccionada}
            onSuccess={handleAbonoConRefresh}
            negociacionContext={
              negociacion
                ? {
                    cliente: negociacion.cliente,
                    vivienda: {
                      numero: negociacion.vivienda.numero,
                      manzana: negociacion.vivienda.manzana
                        ? { identificador: negociacion.vivienda.manzana.nombre }
                        : undefined,
                    },
                    proyecto: negociacion.proyecto,
                    valorVivienda: metricas?.valorVivienda,
                    totalAbonadoAntes: metricas?.totalAbonado,
                  }
                : undefined
            }
          />
        )}

        {/* Modal unificado de detalle (comprobante + editar + anular + recibo PDF) */}
        <AbonoDetalleModal
          abono={abonoDetalle}
          isOpen={abonoDetalle !== null}
          onClose={() => setAbonoDetalle(null)}
          onAnulado={handleAbonoConRefresh}
          onEditar={canEditar ? handleEditarDesdeDetalle : undefined}
          canEditar={canEditar}
          canAnular={canAnular}
          negociacionFinancials={
            metricas
              ? {
                  valorTotal: metricas.valorVivienda ?? 0,
                  totalAbonado: metricas.totalAbonado ?? 0,
                  saldoPendiente: metricas.saldoPendiente ?? 0,
                }
              : null
          }
        />

        {/* Modal de edición (abierto desde el modal de detalle) */}
        {canEditar && abonoEditando ? (
          <ModalEditarAbono
            isOpen={true}
            abono={abonoEditando}
            onClose={() => setAbonoEditando(null)}
            onSuccess={handleEditarSuccess}
          />
        ) : null}
      </motion.div>
    </div>
  )
}
