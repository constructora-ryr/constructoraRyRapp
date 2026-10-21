'use client'

/**
 * Pestaña Negociación — orquestador:
 * - Datos y acciones: useNegociacionTab
 * - Saldo y avance: calcularTotalesNegociacion (misma fórmula que Información General)
 * - UI: ResumenNegociacionCard · PlanDePagosCard · AbonosRecibidosCard
 * - Modales de las acciones (ajuste, descuento, escritura, renuncia, …)
 */

import { useState } from 'react'

import { FileText } from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { formatDateForDB } from '@/lib/utils/date.utils'
import { ProcesarDevolucionExcedenteModal } from '@/modules/abonos/components/devolucion-excedente/ProcesarDevolucionExcedenteModal'
import { PagosExcedentesBanner } from '@/modules/abonos/components/pago-excedente/PagosExcedentesBanner'
import { usePagosExcedentes } from '@/modules/abonos/hooks/usePagosExcedentes'
import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import type { Cliente } from '@/modules/clientes/types'
import { calcularTotalesNegociacion } from '@/modules/clientes/utils/totales-negociacion'
import { CuotasCreditoTab } from '@/modules/fuentes-pago/components/CuotasCreditoTab'
import { RegistrarRenunciaModal } from '@/modules/renuncias/components/modals/RegistrarRenunciaModal'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import { SectionLoadingSpinner } from '@/shared/components/ui'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'

import {
  AbonosRecibidosCard,
  AjusteCierreFinancieroModal,
  DescuadreFinancieroAlert,
  DescuentoModal,
  EditarActaModal,
  EditarReferenciaModal,
  EstadoDeCuenta,
  ExcedenteDevolucionBanners,
  HistorialNegociacionModal,
  MarcarEscrituraModal,
  NegociacionCerradaRenuncia,
  PlanDePagosCard,
  ResumenNegociacionCard,
  SinNegociacion,
} from './negociacion/components'
import { LABELS_TIPO_DESCUENTO, useNegociacionTab } from './negociacion/hooks'

interface NegociacionTabProps {
  cliente: Cliente
  onIrADocumentos?: () => void
}

type FuenteEditando = Pick<
  FuentePago,
  'id' | 'tipo' | 'numero_referencia' | 'fecha_acta'
>

export function NegociacionTab({
  cliente,
  onIrADocumentos,
}: NegociacionTabProps) {
  const router = useRouter()
  const { esAdmin: esAdminPermisos, puede } = usePermisosQuery()
  const canVerAbonos = esAdminPermisos || puede('abonos', 'ver')
  const canAsignarVivienda =
    esAdminPermisos || puede('negociaciones', 'asignar')
  const canVerDocumentos =
    esAdminPermisos ||
    (puede('documentos', 'ver') && puede('documentos', 'subir'))

  // ── Estado de la UI (modales y despliegues) ──────────────────────────────
  const [cuotasExpandidas, setCuotasExpandidas] = useState<
    Record<string, boolean>
  >({})
  const [fuenteEditandoActa, setFuenteEditandoActa] =
    useState<FuenteEditando | null>(null)
  const [fuenteEditandoReferencia, setFuenteEditandoReferencia] =
    useState<FuenteEditando | null>(null)
  const [historialNegOpen, setHistorialNegOpen] = useState(false)
  const [modalDevolucionOpen, setModalDevolucionOpen] = useState(false)
  const [modalRenunciaOpen, setModalRenunciaOpen] = useState(false)
  const [modalEscriturarOpen, setModalEscriturarOpen] = useState(false)

  const {
    negociacion,
    valorVivienda,
    totalComprometido,
    interesesTotales,
    fuentesPago,
    abonos,
    totalAbonado,
    diferencia,
    estaBalanceado,
    tiposDisponibles,
    tiposFuentes,
    tiposConfigConEntidad,
    requisitosMap,
    entidadesPorTipoEntidad,
    isLoading,
    isLoadingAbonos,
    isAjustando,
    isAdmin,
    puedeTrasladar,
    puedeRenunciar,
    puedeDescuento,
    puedeEscritura,
    puedeAjustar,
    modalAjusteOpen,
    openAjuste,
    closeAjuste,
    handleGuardarAjuste,
    modalDescuentoOpen,
    openDescuento,
    closeDescuento,
    isAplicandoDescuento,
    handleAplicarDescuento,
    pendientesPorFuente,
    totalDocsPendientes,
    totalDocsObligatoriosPendientes,
    refetchFuentes,
    refetchNegociaciones,
  } = useNegociacionTab({ cliente })

  const { data: pagosExcedentes = [] } = usePagosExcedentes(negociacion?.id)

  if (isLoading)
    return (
      <SectionLoadingSpinner
        label='Cargando negociación...'
        moduleName='negociaciones'
        icon={FileText}
      />
    )
  if (!negociacion)
    return <SinNegociacion canAsignarVivienda={canAsignarVivienda} />

  if (negociacion.estado === 'Cerrada por Renuncia')
    return (
      <NegociacionCerradaRenuncia
        fechaRenuncia={negociacion.fecha_renuncia_efectiva}
      />
    )

  // Solo se ajusta en estados editables: Completada o Cerrada por Traslado no
  const puedeAjustarAhora =
    puedeAjustar &&
    (negociacion.estado === 'Activa' || negociacion.estado === 'Suspendida')
  const esActiva = negociacion.estado === 'Activa'

  const vivienda = negociacion.vivienda
  const codigoVivienda = `${vivienda?.manzanas?.nombre ?? ''}${vivienda?.numero ?? ''}`
  const descuento = negociacion.descuento_aplicado ?? 0

  const { saldo, pctPagado } = calcularTotalesNegociacion({
    negociacion,
    valorVivienda,
    totalComprometido,
    interesesTotales,
    totalAbonado,
  })
  // Deuda real cuando las fuentes superan el valor (hay excedente)
  const saldoReal = Math.max(0, valorVivienda - totalAbonado)

  const actualizar = async (
    campos: Parameters<typeof negociacionesService.actualizarNegociacion>[1],
    ok: string
  ) => {
    await negociacionesService.actualizarNegociacion(negociacion.id, campos)
    toast.success(ok)
    await refetchNegociaciones()
  }

  const creditoExpandido = fuentesPago.find(
    f => esCreditoConstructora(f.tipo) && cuotasExpandidas[f.id]
  )

  const avisos = (
    <>
      {fuentesPago.length > 0 && !estaBalanceado ? (
        <DescuadreFinancieroAlert
          diferencia={diferencia}
          puedeAjustar={puedeAjustarAhora}
          onCorregir={openAjuste}
        />
      ) : null}
      {estaBalanceado ? (
        <ExcedenteDevolucionBanners
          diferencia={diferencia}
          estado={negociacion.excedente_devolucion_estado}
          monto={negociacion.excedente_devolucion_monto}
          fecha={negociacion.excedente_devolucion_fecha}
          comprobanteUrl={negociacion.excedente_devolucion_comprobante_url}
          puedeAjustar={puedeAjustar}
          onRegistrar={() => setModalDevolucionOpen(true)}
        />
      ) : null}
      {isAdmin && pagosExcedentes.length > 0 ? (
        <PagosExcedentesBanner
          pagos={pagosExcedentes}
          negociacionId={negociacion.id}
        />
      ) : null}
    </>
  )

  return (
    <div className='space-y-4'>
      <ResumenNegociacionCard
        proyecto={negociacion.proyecto?.nombre ?? '—'}
        codigoVivienda={codigoVivienda}
        estado={negociacion.estado}
        fechaInicio={negociacion.fecha_negociacion ?? null}
        valorVivienda={valorVivienda}
        totalComprometido={totalComprometido}
        interesesTotales={interesesTotales}
        descuento={descuento}
        pctDescuento={negociacion.porcentaje_descuento ?? 0}
        tipoDescuento={
          negociacion.tipo_descuento
            ? (LABELS_TIPO_DESCUENTO[
                negociacion.tipo_descuento as keyof typeof LABELS_TIPO_DESCUENTO
              ] ?? negociacion.tipo_descuento)
            : null
        }
        motivoDescuento={negociacion.motivo_descuento ?? null}
        valorEscritura={negociacion.valor_escritura_publica ?? 0}
        totalAbonado={totalAbonado}
        saldo={saldo}
        saldoReal={saldoReal}
        diferencia={diferencia}
        pctPagado={pctPagado}
        esAdmin={esAdminPermisos}
        puedeEditarEscritura={puedeEscritura}
        onTrasladar={
          puedeTrasladar && esActiva
            ? () =>
                router.push(
                  `/clientes/${cliente.id}/traslado-vivienda?negociacion_id=${negociacion.id}&nombre=${encodeURIComponent(`${cliente.nombres} ${cliente.apellidos}`)}`
                )
            : undefined
        }
        onEscriturar={
          puedeEscritura && esActiva && vivienda?.estado === 'Asignada'
            ? () => setModalEscriturarOpen(true)
            : undefined
        }
        onRenunciar={
          puedeRenunciar && (esActiva || negociacion.estado === 'Suspendida')
            ? () => setModalRenunciaOpen(true)
            : undefined
        }
        onGuardarFechaInicio={fecha =>
          actualizar(
            { fecha_negociacion: formatDateForDB(fecha) },
            'Fecha de negociación actualizada'
          )
        }
        onGuardarEscritura={valor =>
          actualizar(
            { valor_escritura_publica: valor },
            'Valor de escritura actualizado'
          )
        }
        estadoDeCuenta={
          <EstadoDeCuenta
            valorBase={vivienda?.valor_base ?? negociacion.valor_negociado}
            gastosNotariales={vivienda?.gastos_notariales ?? 0}
            recargoEsquinera={
              vivienda?.es_esquinera ? (vivienda?.recargo_esquinera ?? 0) : 0
            }
            descuento={descuento}
            motivoDescuento={negociacion.motivo_descuento}
            valorTotalPagar={valorVivienda}
            fuentes={fuentesPago}
            totalAbonado={totalAbonado}
            diferencia={diferencia}
            estadoDevolucion={negociacion.excedente_devolucion_estado}
            montoDevolucion={negociacion.excedente_devolucion_monto}
            fechaDevolucion={negociacion.excedente_devolucion_fecha}
          />
        }
      />

      <PlanDePagosCard
        fuentes={fuentesPago}
        valorVivienda={valorVivienda}
        estaBalanceado={estaBalanceado}
        tiposFuentes={tiposFuentes}
        pendientesPorFuente={pendientesPorFuente}
        totalDocsPendientes={totalDocsPendientes}
        totalDocsObligatoriosPendientes={totalDocsObligatoriosPendientes}
        avisos={avisos}
        cuotas={
          creditoExpandido ? (
            <div className='rounded-2xl border border-indigo-200/60 bg-indigo-50/30 p-3 dark:border-indigo-800/40 dark:bg-indigo-950/10'>
              <CuotasCreditoTab
                fuentePagoId={creditoExpandido.id}
                negociacionId={negociacion.id}
                montoFuente={creditoExpandido.monto_aprobado}
                onPagoCuotaRegistrado={() => refetchFuentes()}
                isAdmin={isAdmin}
              />
            </div>
          ) : null
        }
        cuotasExpandidas={cuotasExpandidas}
        esCredito={esCreditoConstructora}
        onToggleCuotas={id =>
          setCuotasExpandidas(p => ({ ...p, [id]: !p[id] }))
        }
        onEditarActa={esAdminPermisos ? setFuenteEditandoActa : undefined}
        onEditarReferencia={
          esAdminPermisos ? setFuenteEditandoReferencia : undefined
        }
        onHistorial={() => setHistorialNegOpen(true)}
        onDescuento={puedeDescuento && esActiva ? openDescuento : undefined}
        tieneDescuento={descuento > 0}
        onAjustar={puedeAjustarAhora ? openAjuste : undefined}
        onIrADocumentos={canVerDocumentos ? onIrADocumentos : undefined}
      />

      {negociacion.notas ? (
        <div className='flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20'>
          <FileText className='mt-0.5 h-4 w-4 shrink-0 text-amber-500' />
          <div className='min-w-0'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300'>
              Notas
            </p>
            <p className='whitespace-pre-wrap text-sm text-amber-900 dark:text-amber-200'>
              {negociacion.notas}
            </p>
          </div>
        </div>
      ) : null}

      <AbonosRecibidosCard
        abonos={abonos}
        isLoading={isLoadingAbonos}
        totalAbonado={totalAbonado}
        fuentes={fuentesPago}
        tiposFuentes={tiposFuentes}
        bloqueado={fuentesPago.length > 0 && !estaBalanceado}
        canVerAbonos={canVerAbonos}
        contexto={{
          cliente: {
            id: cliente.id,
            nombres: cliente.nombres,
            apellidos: cliente.apellidos,
            numero_documento: cliente.numero_documento,
          },
          negociacion: { id: negociacion.id, estado: negociacion.estado },
          vivienda: {
            id: vivienda?.id ?? '',
            numero: vivienda?.numero ?? '',
            manzana: vivienda?.manzanas?.nombre ?? '',
          },
          proyecto: {
            id: negociacion.proyecto?.id ?? '',
            nombre: negociacion.proyecto?.nombre ?? '',
          },
          financiero: {
            valorTotal: valorVivienda,
            totalAbonado,
            saldoPendiente: saldo,
          },
        }}
      />

      {/* ─── Modales ─────────────────────────────────────────────────────── */}
      <HistorialNegociacionModal
        isOpen={historialNegOpen}
        onClose={() => setHistorialNegOpen(false)}
        negociacionId={negociacion.id}
      />

      {puedeAjustarAhora ? (
        <AjusteCierreFinancieroModal
          isOpen={modalAjusteOpen}
          onClose={closeAjuste}
          fuentesPago={fuentesPago}
          valorVivienda={valorVivienda}
          tiposDisponibles={tiposDisponibles}
          tiposConfig={tiposConfigConEntidad}
          requisitosMap={requisitosMap}
          entidadesPorTipoEntidad={entidadesPorTipoEntidad}
          onGuardar={handleGuardarAjuste}
          isGuardando={isAjustando}
        />
      ) : null}

      {puedeDescuento ? (
        <DescuentoModal
          isOpen={modalDescuentoOpen}
          onClose={closeDescuento}
          onGuardar={handleAplicarDescuento}
          isGuardando={isAplicandoDescuento}
          valorTotalPagar={valorVivienda}
          descuentoActual={descuento}
          tipoDescuentoActual={negociacion.tipo_descuento}
          motivoDescuentoActual={negociacion.motivo_descuento}
          esAdmin={esAdminPermisos}
        />
      ) : null}

      {esAdminPermisos && fuenteEditandoReferencia ? (
        <EditarReferenciaModal
          fuenteId={fuenteEditandoReferencia.id}
          tipoFuente={fuenteEditandoReferencia.tipo}
          numeroReferenciaInicial={fuenteEditandoReferencia.numero_referencia}
          onClose={() => setFuenteEditandoReferencia(null)}
          onGuardado={() => refetchFuentes()}
        />
      ) : null}

      {esAdminPermisos && fuenteEditandoActa ? (
        <EditarActaModal
          fuenteId={fuenteEditandoActa.id}
          tipoFuente={fuenteEditandoActa.tipo}
          numeroReferenciaInicial={fuenteEditandoActa.numero_referencia}
          fechaActaInicial={fuenteEditandoActa.fecha_acta}
          onClose={() => setFuenteEditandoActa(null)}
          onGuardado={() => refetchFuentes()}
        />
      ) : null}

      {modalEscriturarOpen && vivienda?.id ? (
        <MarcarEscrituraModal
          viviendaId={vivienda.id}
          viviendaLabel={
            vivienda.manzanas?.nombre
              ? `Manzana ${vivienda.manzanas.nombre} Casa ${vivienda.numero}`
              : 'Vivienda asignada'
          }
          onClose={() => setModalEscriturarOpen(false)}
          onExitosa={async () => {
            setModalEscriturarOpen(false)
            await refetchNegociaciones()
          }}
        />
      ) : null}

      {puedeRenunciar && modalRenunciaOpen ? (
        <RegistrarRenunciaModal
          negociacionId={negociacion.id}
          onClose={() => setModalRenunciaOpen(false)}
          onExitosa={() => {
            setModalRenunciaOpen(false)
            router.push('/renuncias')
          }}
        />
      ) : null}

      {modalDevolucionOpen && diferencia < 0 ? (
        <ProcesarDevolucionExcedenteModal
          negociacionId={negociacion.id}
          montoExcedente={Math.abs(diferencia)}
          nombreCliente={`${cliente.nombres} ${cliente.apellidos}`}
          onClose={() => setModalDevolucionOpen(false)}
          onExitosa={() => {
            setModalDevolucionOpen(false)
            void refetchNegociaciones()
          }}
        />
      ) : null}
    </div>
  )
}
