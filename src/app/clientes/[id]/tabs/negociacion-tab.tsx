'use client'

/**
 * NegociacionTab — Vista compacta de negociación
 *
 * 3 bloques:
 * 1. Header unificado (vivienda + KPIs financieros)
 * 2. Plan de Pagos (grid de fuentes + barra visual)
 * 3. Abonos recientes
 */

import { useCallback, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  FileX,
  Home,
  Lock,
  Pencil,
  Percent,
  RefreshCw,
  Shield,
  SlidersHorizontal,
  Stamp,
  Tag,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { ModalEditarAbono } from '@/modules/abonos/components/modal-editar-abono'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import type { Cliente } from '@/modules/clientes/types'
import { CuotasCreditoTab } from '@/modules/fuentes-pago/components/CuotasCreditoTab'
import { RegistrarRenunciaModal } from '@/modules/renuncias/components/modals/RegistrarRenunciaModal'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import { SectionLoadingSpinner } from '@/shared/components/ui'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'
import { formatCurrency } from '@/shared/utils/format'

import {
  AbonosRecientes,
  AjusteCierreFinancieroModal,
  DescuentoModal,
  EditarActaModal,
  FuenteMiniCard,
  NegociacionCerradaRenuncia,
  SinNegociacion,
} from './negociacion/components'
import { LABELS_TIPO_DESCUENTO, useNegociacionTab } from './negociacion/hooks'

interface NegociacionTabProps {
  cliente: Cliente
  onIrADocumentos?: () => void
}

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
  const [cuotasExpandidas, setCuotasExpandidas] = useState<
    Record<string, boolean>
  >({})
  const toggleCuotas = (id: string) =>
    setCuotasExpandidas(p => ({ ...p, [id]: !p[id] }))

  // ── Estado para edición de abonos ────────────────────────────────────────
  const [abonoEditando, setAbonoEditando] = useState<AbonoParaEditar | null>(
    null
  )

  // ── Estado para edición de acta (solo admin) ─────────────────────────────
  const [fuenteEditandoActa, setFuenteEditandoActa] = useState<{
    id: string
    tipo: string
    numeroReferencia: string | null
    fechaActa: string | null
  } | null>(null)

  // ── Estado para modal de renuncia ───────────────────────────────────────
  const [modalRenunciaOpen, setModalRenunciaOpen] = useState(false)

  // ── Estado para modal de escritura ──────────────────────────────────────
  const [modalEscriturarOpen, setModalEscriturarOpen] = useState(false)
  const [fechaEscriturar, setFechaEscriturar] = useState('')
  const [guardandoEscriturar, setGuardandoEscriturar] = useState(false)

  // ── Estado para edición inline de valor escritura ────────────────────────
  const [editandoEscritura, setEditandoEscritura] = useState(false)
  const [valorEscrituraEdit, setValorEscrituraEdit] = useState('')
  const [guardandoEscritura, setGuardandoEscritura] = useState(false)

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
    refetchAbonos,
    refetchNegociaciones,
  } = useNegociacionTab({ cliente })

  // ── Guardar valor de escritura (debe estar antes de early returns) ─────────
  const handleGuardarEscritura = useCallback(async () => {
    if (!negociacion) return
    const parsed = parseFloat(valorEscrituraEdit.replace(/\D/g, ''))
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Ingresa un valor válido para la escritura')
      return
    }
    setGuardandoEscritura(true)
    try {
      await negociacionesService.actualizarNegociacion(negociacion.id, {
        valor_escritura_publica: parsed,
      })
      toast.success('Valor de escritura actualizado')
      setEditandoEscritura(false)
      await refetchNegociaciones()
    } catch (err) {
      toast.error('Error al actualizar', {
        description: err instanceof Error ? err.message : 'Error desconocido',
      })
    } finally {
      setGuardandoEscritura(false)
    }
  }, [valorEscrituraEdit, negociacion, refetchNegociaciones])

  const handleMarcarEscriturada = useCallback(async () => {
    if (!negociacion?.vivienda?.id || !fechaEscriturar) return
    setGuardandoEscriturar(true)
    try {
      const res = await fetch('/api/viviendas/escriturar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vivienda_id: negociacion.vivienda.id,
          fecha_escritura: fechaEscriturar,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')
      toast.success('Vivienda marcada como Escriturada')
      setModalEscriturarOpen(false)
      setFechaEscriturar('')
      await refetchNegociaciones()
    } catch (err) {
      toast.error('Error al escriturar', {
        description: err instanceof Error ? err.message : 'Error desconocido',
      })
    } finally {
      setGuardandoEscriturar(false)
    }
  }, [negociacion, fechaEscriturar, refetchNegociaciones])

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

  const proyecto = negociacion.proyecto?.nombre ?? '—'
  const vivienda = negociacion.vivienda
  const manzana = vivienda?.manzanas?.nombre
  const numero = vivienda?.numero
  const valorEscritura = negociacion.valor_escritura_publica ?? 0
  const notasNeg = negociacion.notas ?? ''
  // Saldo y % — usar siempre los campos calculados por el trigger de BD.
  // total_abonado solo suma capital (sin mora/intereses del crédito constructora),
  // así que computar totalComprometido - totalAbonado genera un saldo fantasma.
  const baseTotal = interesesTotales > 0 ? totalComprometido : valorVivienda
  // Saldo: cuando hay intereses, recalcular sobre baseTotal (que ya los incluye).
  // Usar saldo_pendiente de BD solo cuando no hay intereses (el trigger no los suma).
  const saldo =
    interesesTotales > 0
      ? Math.max(0, baseTotal - totalAbonado)
      : (negociacion.saldo_pendiente ?? Math.max(0, baseTotal - totalAbonado))
  const totalAbonadoDisplay = totalAbonado
  const pctPagado =
    negociacion.porcentaje_pagado !== null &&
    negociacion.porcentaje_pagado !== undefined
      ? negociacion.porcentaje_pagado
      : baseTotal > 0
        ? Math.max(0, ((baseTotal - saldo) / baseTotal) * 100)
        : 0
  const descuento = negociacion.descuento_aplicado ?? 0
  const pctDescuento = negociacion.porcentaje_descuento ?? 0

  // Fuente con cuotas expandidas (para renderizar CuotasCreditoTab fuera del grid)
  const creditoExpandido = fuentesPago.find(
    f => esCreditoConstructora(f.tipo) && cuotasExpandidas[f.id]
  )

  const abonosParaUI = abonos as Array<{
    id: string
    numero_recibo?: string | number | null
    negociacion_id?: string
    fuente_pago_id?: string
    monto: number
    fecha_abono: string
    metodo_pago?: string | null
    numero_referencia?: string | null
    notas?: string | null
    comprobante_url?: string | null
  }>

  return (
    <div className='space-y-3'>
      {/* ─── BLOQUE 1: HEADER UNIFICADO + KPIs ───── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className='overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/50 dark:bg-gray-800/50'
      >
        {/* Row 1: Identificación de vivienda + acciones */}
        <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/40'>
          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30'>
            <Home className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-bold leading-tight text-gray-900 dark:text-white'>
              {proyecto}
            </p>
            {manzana || numero ? (
              <p className='text-[11px] text-gray-500 dark:text-gray-400'>
                {manzana ? `Manzana ${manzana}` : ''}
                {manzana && numero ? ' · ' : ''}
                {numero ? `Casa ${numero}` : ''}
              </p>
            ) : null}
          </div>
          <div className='flex flex-shrink-0 items-center gap-2'>
            {puedeTrasladar && negociacion.estado === 'Activa' ? (
              <button
                onClick={() =>
                  router.push(
                    `/clientes/${cliente.id}/traslado-vivienda?negociacion_id=${negociacion.id}&nombre=${encodeURIComponent(`${cliente.nombres} ${cliente.apellidos}`)}`
                  )
                }
                className='inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition-all hover:border-amber-300 hover:bg-amber-100 hover:shadow-sm dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40'
              >
                <ArrowRightLeft className='h-3.5 w-3.5' />
                Trasladar vivienda
              </button>
            ) : null}
            {puedeEscritura &&
            negociacion.estado === 'Activa' &&
            vivienda?.estado === 'Asignada' ? (
              <button
                onClick={() => {
                  setFechaEscriturar(new Date().toISOString().slice(0, 10))
                  setModalEscriturarOpen(true)
                }}
                className='inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 transition-all hover:border-violet-300 hover:bg-violet-100 hover:shadow-sm dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/40'
              >
                <Stamp className='h-3.5 w-3.5' />
                Marcar Escriturada
              </button>
            ) : null}
            {puedeRenunciar &&
            (negociacion.estado === 'Activa' ||
              negociacion.estado === 'Suspendida') ? (
              <button
                onClick={() => setModalRenunciaOpen(true)}
                className='inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 transition-all hover:border-red-300 hover:bg-red-100 hover:shadow-sm dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
              >
                <FileX className='h-3.5 w-3.5' />
                Registrar Renuncia
              </button>
            ) : null}
          </div>
        </div>

        {/* KPIs row — cols dinámicas: +1 si hay intereses, +1 si hay descuento */}
        <div
          className={`grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700/40 ${
            interesesTotales > 0 && descuento > 0
              ? 'sm:grid-cols-6'
              : interesesTotales > 0 || descuento > 0
                ? 'sm:grid-cols-5'
                : 'sm:grid-cols-4'
          }`}
        >
          {/* KPI 1: Precio Vivienda (siempre) */}
          <div className='px-4 py-2.5'>
            <div className='mb-0.5 flex items-center gap-1'>
              <DollarSign className='h-3 w-3 text-cyan-500' />
              <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                {interesesTotales > 0
                  ? 'Precio Vivienda'
                  : 'Valor Total a Pagar'}
              </span>
            </div>
            <p className='text-sm font-bold tabular-nums text-gray-900 dark:text-white'>
              {formatCurrency(valorVivienda)}
            </p>
            {/* Escritura: solo visible cuando el valor difiere del precio de la vivienda */}
            {valorVivienda > 0 && valorEscritura !== valorVivienda ? (
              editandoEscritura ? (
                <div className='mt-1.5 flex items-center gap-1.5'>
                  <input
                    aria-label='Valor escritura pública'
                    autoFocus
                    className='w-36 rounded-md border-2 border-indigo-400 bg-white px-2 py-0.5 text-[11px] font-medium tabular-nums text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-600 dark:bg-gray-900 dark:text-indigo-300'
                    disabled={guardandoEscritura}
                    onChange={e => setValorEscrituraEdit(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') void handleGuardarEscritura()
                      if (e.key === 'Escape') setEditandoEscritura(false)
                    }}
                    placeholder='Ej: 18000000'
                    value={valorEscrituraEdit}
                  />
                  <button
                    className='rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50'
                    disabled={guardandoEscritura}
                    onClick={() => void handleGuardarEscritura()}
                    type='button'
                  >
                    {guardandoEscritura ? '...' : 'Guardar'}
                  </button>
                  <button
                    className='rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    disabled={guardandoEscritura}
                    onClick={() => setEditandoEscritura(false)}
                    type='button'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </div>
              ) : (
                <div className='mt-1 flex items-center gap-1'>
                  <span className='inline-flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:border-indigo-800/40 dark:bg-indigo-950/30 dark:text-indigo-400'>
                    <FileText className='h-2.5 w-2.5' />
                    {valorEscritura > 0
                      ? `Valor en Escritura: ${formatCurrency(valorEscritura)}`
                      : 'Sin valor escritura'}
                  </span>
                  {puedeEscritura ? (
                    <button
                      aria-label='Editar valor de escritura'
                      className='rounded p-0.5 text-gray-300 hover:text-indigo-500 dark:text-gray-600 dark:hover:text-indigo-400'
                      onClick={() => {
                        setValorEscrituraEdit(
                          valorEscritura > 0 ? String(valorEscritura) : ''
                        )
                        setEditandoEscritura(true)
                      }}
                      title='Editar valor de escritura'
                      type='button'
                    >
                      <Pencil className='h-3 w-3' />
                    </button>
                  ) : null}
                </div>
              )
            ) : null}
          </div>

          {/* KPI 1b (condicional): Total a Pagar con intereses — solo cuando hay crédito constructora */}
          {interesesTotales > 0 ? (
            <div className='px-4 py-2.5'>
              <div className='mb-0.5 flex items-center gap-1'>
                <TrendingUp className='h-3 w-3 text-violet-500' />
                <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                  Total a Pagar
                </span>
              </div>
              <p className='text-sm font-bold tabular-nums text-gray-900 dark:text-white'>
                {formatCurrency(totalComprometido)}
              </p>
              <p className='mt-0.5 text-[10px] tabular-nums text-violet-500 dark:text-violet-400'>
                +{formatCurrency(interesesTotales)} intereses
              </p>
            </div>
          ) : null}

          {/* KPI 2 (condicional): Descuento aplicado */}
          {descuento > 0 ? (
            <div className='border-l border-gray-100 px-4 py-2.5 dark:border-gray-700/40'>
              <div className='mb-0.5 flex items-center gap-1'>
                <Percent className='h-3 w-3 text-violet-500' />
                <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                  Descuento
                </span>
              </div>
              <p className='text-sm font-bold tabular-nums text-violet-600 dark:text-violet-400'>
                -{formatCurrency(descuento)}
              </p>
              {pctDescuento > 0 ? (
                <p className='mt-0.5 text-[11px] font-medium text-violet-500 dark:text-violet-500'>
                  {pctDescuento}% del valor
                </p>
              ) : null}
            </div>
          ) : null}
          <div className='px-4 py-2.5'>
            <div className='mb-0.5 flex items-center gap-1'>
              <Wallet className='h-3 w-3 text-emerald-500' />
              <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Abonado
              </span>
            </div>
            <p className='text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400'>
              {formatCurrency(totalAbonadoDisplay)}
            </p>
          </div>
          <div className='px-4 py-2.5'>
            <div className='mb-0.5 flex items-center gap-1'>
              <TrendingUp className='h-3 w-3 text-amber-500' />
              <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Saldo
              </span>
            </div>
            <p
              className={`text-sm font-bold tabular-nums ${saldo <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}
            >
              {formatCurrency(Math.max(saldo, 0))}
            </p>
          </div>
          <div className='px-4 py-2.5'>
            <div className='mb-0.5 flex items-center gap-1'>
              <Percent className='h-3 w-3 text-blue-500' />
              <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Avance
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-sm font-bold tabular-nums text-gray-900 dark:text-white'>
                {Math.min(pctPagado, 100).toFixed(1)}%
              </p>
              <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500'
                  style={{ width: `${Math.min(pctPagado, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── BANNER: Detalle del descuento aplicado ─── */}
      {descuento > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.035 }}
          className='overflow-hidden rounded-xl border border-violet-200/60 bg-violet-50/60 dark:border-violet-800/40 dark:bg-violet-950/20'
        >
          <div className='flex items-start gap-0'>
            <div className='w-1 self-stretch bg-violet-400 dark:bg-violet-600' />
            <div className='flex flex-1 flex-wrap items-start gap-x-6 gap-y-1.5 px-4 py-3'>
              <div className='flex items-center gap-2'>
                <Tag className='h-3.5 w-3.5 flex-shrink-0 text-violet-500 dark:text-violet-400' />
                <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                  Tipo
                </span>
                <span className='inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'>
                  {negociacion.tipo_descuento
                    ? (LABELS_TIPO_DESCUENTO[
                        negociacion.tipo_descuento as keyof typeof LABELS_TIPO_DESCUENTO
                      ] ?? negociacion.tipo_descuento)
                    : 'Sin clasificar'}
                </span>
              </div>
              {negociacion.motivo_descuento ? (
                <div className='flex min-w-0 flex-1 items-center gap-2'>
                  <FileText className='h-3.5 w-3.5 flex-shrink-0 text-violet-400 dark:text-violet-500' />
                  <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                    Motivo
                  </span>
                  <p className='text-[11px] text-gray-700 dark:text-gray-300'>
                    {negociacion.motivo_descuento}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* ─── BLOQUE 2: PLAN DE PAGOS ───── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.04 }}
        className='overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/50 dark:bg-gray-800/50'
      >
        {/* Header: título + balance inline + botón */}
        <div className='flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/40'>
          <div className='flex items-center gap-2'>
            <DollarSign className='h-4 w-4 text-gray-400' />
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
              Plan de Pagos
            </h3>
            <span className='text-[10px] text-gray-400'>
              ({fuentesPago.length})
            </span>
            {/* Balance badge inline (solo si balanceado) */}
            {fuentesPago.length > 0 && estaBalanceado ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'>
                <CheckCircle2 className='h-3 w-3' />
                Cubierto
              </span>
            ) : null}
          </div>
          {puedeDescuento || puedeAjustar ? (
            <div className='flex items-center gap-2'>
              {puedeDescuento && negociacion.estado === 'Activa' ? (
                <button
                  onClick={openDescuento}
                  className='inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-800/40 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/30'
                >
                  <Percent className='h-3.5 w-3.5' />
                  {descuento > 0 ? 'Modificar Descuento' : 'Aplicar Descuento'}
                </button>
              ) : null}
              {puedeAjustar ? (
                <button
                  onClick={openAjuste}
                  className='inline-flex items-center gap-1.5 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-[11px] font-semibold text-cyan-800 shadow-sm transition-colors hover:bg-cyan-100 hover:shadow dark:border-cyan-700/50 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-900/40'
                >
                  <SlidersHorizontal className='h-3.5 w-3.5' />
                  Ajustar Cierre Financiero
                </button>
              ) : null}
            </div>
          ) : (
            <span className='inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500'>
              <Lock className='h-3 w-3' />
              Solo lectura
            </span>
          )}
        </div>

        <div className='space-y-3 p-3'>
          {/* ⚠️ ALERTA URGENTE: Descuadre financiero */}
          {fuentesPago.length > 0 && !estaBalanceado ? (
            <div className='relative overflow-hidden rounded-lg border border-red-300 bg-gradient-to-r from-red-50 via-red-50 to-orange-50 dark:border-red-800/60 dark:from-red-950/40 dark:via-red-950/30 dark:to-orange-950/20'>
              <div className='absolute left-0 top-0 h-full w-1 bg-red-500' />
              <div className='flex items-center gap-3 px-4 py-2.5'>
                <div className='relative flex-shrink-0'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40'>
                    <AlertTriangle className='h-4 w-4 text-red-600 dark:text-red-400' />
                  </div>
                  <span className='absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-red-50 bg-red-500 dark:border-red-950'>
                    <span className='absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75' />
                  </span>
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-bold text-red-800 dark:text-red-300'>
                    Descuadre en Cierre Financiero — Atención Requerida
                  </p>
                  <p className='mt-0.5 text-[10px] text-red-700 dark:text-red-400'>
                    {diferencia > 0
                      ? `Faltan ${formatCurrency(diferencia)} para cubrir el valor total.`
                      : `Sobran ${formatCurrency(Math.abs(diferencia))} en las fuentes de pago.`}{' '}
                    Los registros de abonos permanecerán bloqueados hasta
                    resolver el descuadre.
                  </p>
                </div>
                {puedeAjustar ? (
                  <button
                    onClick={openAjuste}
                    className='flex-shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
                  >
                    Corregir ahora
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {fuentesPago.length === 0 ? (
            <p className='py-4 text-center text-xs text-gray-400 dark:text-gray-500'>
              {puedeAjustar
                ? 'Sin fuentes configuradas. Usa "Redistribuir" para agregarlas.'
                : 'Sin fuentes de pago configuradas.'}
            </p>
          ) : (
            <>
              {/* Docs pendientes banner — solo visible si puede ver/subir documentos */}
              {totalDocsPendientes > 0 && canVerDocumentos ? (
                <button
                  type='button'
                  onClick={onIrADocumentos}
                  className='group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-amber-300/70 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 text-left shadow-sm transition-all hover:border-amber-400 hover:shadow-md dark:border-amber-700/50 dark:from-amber-950/40 dark:to-orange-950/40 dark:hover:border-amber-600/70'
                >
                  {/* barra lateral de acento */}
                  <span className='absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-amber-400 to-orange-500' />
                  <AlertTriangle className='ml-1 h-4 w-4 flex-shrink-0 text-amber-500 dark:text-amber-400' />
                  <div className='flex flex-1 items-center gap-1.5 text-[11px]'>
                    <span className='font-bold text-amber-800 dark:text-amber-200'>
                      {totalDocsPendientes} doc
                      {totalDocsPendientes !== 1 ? 's' : ''} pendiente
                      {totalDocsPendientes !== 1 ? 's' : ''}
                    </span>
                    {totalDocsObligatoriosPendientes > 0 ? (
                      <span className='inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/50 dark:text-red-300'>
                        {totalDocsObligatoriosPendientes} oblig.
                      </span>
                    ) : null}
                    <span className='ml-auto text-amber-600 underline decoration-dotted group-hover:text-amber-700 dark:text-amber-400 dark:group-hover:text-amber-300'>
                      Ir a <strong>Documentos</strong>
                    </span>
                  </div>
                  <ArrowUpRight className='h-3.5 w-3.5 flex-shrink-0 text-amber-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-amber-400' />
                </button>
              ) : null}

              {/* Título de sección */}
              <p className='text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Distribución por Fuente
              </p>

              {/* Grid de fuentes — se adapta al número de fuentes */}
              <div
                className={`grid gap-2 ${
                  fuentesPago.length === 1
                    ? 'grid-cols-1'
                    : fuentesPago.length === 2
                      ? 'grid-cols-2'
                      : fuentesPago.length === 3
                        ? 'grid-cols-3'
                        : 'grid-cols-2'
                }`}
              >
                {fuentesPago.map(fuente => (
                  <FuenteMiniCard
                    key={fuente.id}
                    fuente={fuente}
                    valorVivienda={valorVivienda}
                    docsPendientes={pendientesPorFuente[fuente.id]}
                    colorToken={
                      tiposFuentes.find(t => t.nombre === fuente.tipo)?.color
                    }
                    cuotasExpandidas={cuotasExpandidas[fuente.id]}
                    onToggleCuotas={
                      esCreditoConstructora(fuente.tipo)
                        ? () => toggleCuotas(fuente.id)
                        : undefined
                    }
                    onEditarActa={
                      esAdminPermisos
                        ? () =>
                            setFuenteEditandoActa({
                              id: fuente.id,
                              tipo: fuente.tipo,
                              numeroReferencia: fuente.numero_referencia,
                              fechaActa: fuente.fecha_acta,
                            })
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* Cuotas de crédito constructora (full-width below grid) */}
              {creditoExpandido ? (
                <div className='rounded-xl border border-indigo-200/60 bg-indigo-50/30 p-3 dark:border-indigo-800/40 dark:bg-indigo-950/10'>
                  <CuotasCreditoTab
                    fuentePagoId={creditoExpandido.id}
                    negociacionId={negociacion.id}
                    montoFuente={creditoExpandido.monto_aprobado}
                    onPagoCuotaRegistrado={() => refetchFuentes()}
                    isAdmin={isAdmin}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </motion.div>

      {/* ─── NOTAS ───── */}
      {notasNeg ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
          className='flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/60 px-4 py-2.5 dark:border-amber-800/30 dark:bg-amber-950/20'
        >
          <FileText className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500' />
          <div className='min-w-0 flex-1'>
            <p className='mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300'>
              Notas
            </p>
            <p className='whitespace-pre-wrap text-xs text-amber-800 dark:text-amber-200'>
              {notasNeg}
            </p>
          </div>
        </motion.div>
      ) : null}

      {/* ─── BLOQUE 3: ABONOS RECIENTES ───── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08 }}
        className='overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/50 dark:bg-gray-800/50'
      >
        <div className='flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/40'>
          <div className='flex items-center gap-2'>
            <CreditCard className='h-4 w-4 text-gray-400' />
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
              Abonos recibidos
            </h3>
          </div>
          <div className='flex items-center gap-2'>
            {isLoadingAbonos ? (
              <RefreshCw className='h-3 w-3 animate-spin text-gray-300 dark:text-gray-600' />
            ) : null}
            {canVerAbonos ? (
              <button
                onClick={() =>
                  router.push(`/abonos?negociacion=${negociacion.id}`)
                }
                className='inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 transition-all hover:border-cyan-300 hover:bg-cyan-100 hover:shadow-sm dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/40'
              >
                <ArrowUpRight className='h-3.5 w-3.5' />
                Ir a Abonos
              </button>
            ) : null}
          </div>
        </div>
        {/* Banner de bloqueo si hay descuadre */}
        {fuentesPago.length > 0 && !estaBalanceado ? (
          <div className='flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 dark:border-red-900/40 dark:bg-red-950/30'>
            <Shield className='h-3.5 w-3.5 flex-shrink-0 text-red-500' />
            <p className='text-[10px] font-medium text-red-700 dark:text-red-400'>
              Registro de abonos bloqueado hasta corregir el descuadre
              financiero
            </p>
          </div>
        ) : null}
        <div className='p-3'>
          <AbonosRecientes
            abonos={abonosParaUI}
            totalAbonado={totalAbonado}
            negociacionId={negociacion.id}
            fuentesPago={fuentesPago}
            isLoading={isLoadingAbonos}
          />
        </div>
      </motion.div>

      {/* Modal: Redistribuir montos */}
      {puedeAjustar ? (
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

      {/* Modal: Aplicar/Modificar Descuento */}
      {puedeDescuento ? (
        <DescuentoModal
          isOpen={modalDescuentoOpen}
          onClose={closeDescuento}
          onGuardar={handleAplicarDescuento}
          isGuardando={isAplicandoDescuento}
          valorNegociado={negociacion.valor_negociado}
          descuentoActual={descuento}
          tipoDescuentoActual={negociacion.tipo_descuento}
          motivoDescuentoActual={negociacion.motivo_descuento}
        />
      ) : null}

      {/* Modal Admin: Editar abono */}
      {isAdmin && abonoEditando ? (
        <ModalEditarAbono
          isOpen={!!abonoEditando}
          abono={abonoEditando}
          onClose={() => setAbonoEditando(null)}
          onSuccess={() => {
            setAbonoEditando(null)
            refetchAbonos()
            refetchFuentes()
          }}
        />
      ) : null}

      {/* Modal: Marcar como Escriturada */}
      {modalEscriturarOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
          <div className='w-full max-w-sm rounded-2xl border border-violet-200 bg-white p-6 shadow-2xl dark:border-violet-800/40 dark:bg-gray-900'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30'>
                <Stamp className='h-5 w-5 text-violet-600 dark:text-violet-400' />
              </div>
              <div>
                <h3 className='text-sm font-bold text-gray-900 dark:text-white'>
                  Marcar como Escriturada
                </h3>
                <p className='text-[11px] text-gray-500 dark:text-gray-400'>
                  {vivienda
                    ? `Manzana ${vivienda.manzanas?.nombre} Casa ${vivienda.numero}`
                    : 'Vivienda asignada'}
                </p>
              </div>
            </div>
            <p className='mb-4 text-[12px] text-gray-600 dark:text-gray-300'>
              Esta acción indica que se firmaron las escrituras públicas. La
              vivienda pasará a estado{' '}
              <span className='font-semibold text-violet-600 dark:text-violet-400'>
                Escriturada
              </span>{' '}
              y ya no podrá trasladarse.
            </p>
            <label className='mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
              Fecha de escritura
            </label>
            <input
              type='date'
              value={fechaEscriturar}
              onChange={e => setFechaEscriturar(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className='mb-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            />
            <div className='flex gap-2'>
              <button
                onClick={() => {
                  setModalEscriturarOpen(false)
                  setFechaEscriturar('')
                }}
                disabled={guardandoEscriturar}
                className='flex-1 rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleMarcarEscriturada()}
                disabled={!fechaEscriturar || guardandoEscriturar}
                className='flex-1 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50'
              >
                {guardandoEscriturar ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal: Registrar Renuncia */}
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

      {/* Modal: Editar N° Acta (solo admin) */}
      {esAdminPermisos && fuenteEditandoActa ? (
        <EditarActaModal
          fuenteId={fuenteEditandoActa.id}
          tipoFuente={fuenteEditandoActa.tipo}
          numeroReferenciaInicial={fuenteEditandoActa.numeroReferencia}
          fechaActaInicial={fuenteEditandoActa.fechaActa}
          onClose={() => setFuenteEditandoActa(null)}
          onGuardado={() => refetchFuentes()}
        />
      ) : null}
    </div>
  )
}
