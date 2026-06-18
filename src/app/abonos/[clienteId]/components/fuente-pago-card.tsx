'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  FileWarning,
  Hash,
  Landmark,
  Lock,
} from 'lucide-react'

import Link from 'next/link'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import type { FuentePagoConAbonos } from '@/modules/abonos/types'
import { CuotasCreditoTab } from '@/modules/fuentes-pago/components/CuotasCreditoTab'
import {
  esCreditoConstructora as checkCreditoConstructora,
  esCuotaInicial as checkCuotaInicial,
  esSubsidioCajaCompensacion as checkSubsidioCaja,
  esSubsidioMiCasaYa as checkSubsidioMCY,
} from '@/shared/constants/fuentes-pago.constants'

interface FuentePagoCardProps {
  fuente: FuentePagoConAbonos
  negociacionId: string
  clienteSlug?: string
  onRegistrarAbono: (fuente: FuentePagoConAbonos) => void
  onAbonoRegistrado?: () => void
  cuotasRefreshKey?: number
  index: number
  canCreate?: boolean
  validacion?: {
    puedeRegistrarAbono: boolean
    estaCompletamentePagada: boolean
    razonBloqueo?: string
    documentosObligatoriosPendientes?: number
    documentosPendientesNombres?: string[]
  }
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

const FUENTE_COLORS: Record<
  string,
  { accent: string; glow: string; bar: string; icon: string }
> = {
  'Crédito con la Constructora': {
    accent: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.28)',
    bar: 'from-violet-400 to-purple-400',
    icon: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  'Cuota Inicial': {
    accent: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.28)',
    bar: 'from-emerald-400 to-teal-400',
    icon: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  'Crédito Hipotecario': {
    accent: 'from-blue-500 to-indigo-600',
    glow: 'rgba(59,130,246,0.28)',
    bar: 'from-blue-400 to-indigo-400',
    icon: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  },
  'Subsidio Mi Casa Ya': {
    accent: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.28)',
    bar: 'from-violet-400 to-purple-400',
    icon: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  'Subsidio Caja Compensación': {
    accent: 'from-pink-500 to-rose-600',
    glow: 'rgba(236,72,153,0.28)',
    bar: 'from-pink-400 to-rose-400',
    icon: 'bg-gradient-to-br from-pink-500 to-rose-600',
  },
  Leasing: {
    accent: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.28)',
    bar: 'from-cyan-400 to-blue-400',
    icon: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  },
}

const getFuenteColors = (tipo: string) =>
  FUENTE_COLORS[tipo] ?? {
    accent: 'from-slate-500 to-gray-600',
    glow: 'rgba(100,116,139,0.22)',
    bar: 'from-slate-400 to-gray-400',
    icon: 'bg-gradient-to-br from-slate-500 to-gray-600',
  }

export function FuentePagoCard({
  fuente,
  negociacionId,
  onRegistrarAbono,
  onAbonoRegistrado,
  cuotasRefreshKey,
  index,
  canCreate,
  validacion,
  clienteSlug,
}: FuentePagoCardProps) {
  const completada = validacion?.estaCompletamentePagada ?? false
  const esDesembolsoUnico = fuente.permite_multiples_abonos === false
  const esCuotaInicial = checkCuotaInicial(fuente.tipo)
  const esCreditoConstructora = checkCreditoConstructora(fuente.tipo)
  const esSubsidio =
    checkSubsidioMCY(fuente.tipo) || checkSubsidioCaja(fuente.tipo)
  const yaDesembolsada = esDesembolsoUnico && fuente.monto_recibido > 0
  const docsPendientesObligatorios =
    validacion?.documentosObligatoriosPendientes ?? 0
  const docsPendientesNombres = validacion?.documentosPendientesNombres ?? []
  const bloqueadoPorDocs = docsPendientesObligatorios > 0
  // Descuadre financiero tiene mayor prioridad que docs
  const hayDescuadreFinanciero = !canCreate
  const pct =
    fuente.monto_aprobado > 0
      ? Math.min((fuente.monto_recibido / fuente.monto_aprobado) * 100, 100)
      : 0
  const puedeAbonar =
    canCreate &&
    (validacion?.puedeRegistrarAbono ?? true) &&
    !completada &&
    fuente.saldo_pendiente > 0 &&
    !bloqueadoPorDocs
  const colors = getFuenteColors(fuente.tipo)

  const [cuotasExpandidas, setCuotasExpandidas] = useState(false)

  // Textos semánticos por tipo de fuente
  const labelAprobado = esCuotaInicial
    ? 'Valor Pactado'
    : esCreditoConstructora
      ? 'Monto del Crédito'
      : 'Aprobado'
  const labelRecibido = esDesembolsoUnico ? 'Desembolsado' : 'Recibido'

  // Desglose crédito: capital vs intereses
  const capitalCredito = esCreditoConstructora
    ? (fuente.capital_para_cierre ?? fuente.monto_aprobado)
    : null
  const interesesCredito =
    esCreditoConstructora && capitalCredito !== null
      ? fuente.monto_aprobado - capitalCredito
      : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -2, boxShadow: `0 16px 40px ${colors.glow}` }}
      className='relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm backdrop-blur transition-all duration-300 dark:border-white/10 dark:bg-white/[0.07] dark:shadow-none'
    >
      {/* Franja de acento lateral */}
      <div
        className={`absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b ${colors.accent} rounded-l-2xl`}
      />

      {/* Glow hover */}
      <div
        className='duration-400 pointer-events-none absolute inset-0 opacity-0 transition-opacity hover:opacity-100'
        style={{
          background: `radial-gradient(ellipse 60% 80% at 0% 50%, ${colors.glow}, transparent 70%)`,
        }}
      />

      <div className='relative z-10 py-4 pl-5 pr-4'>
        {/* Encabezado */}
        <div className='mb-3 flex items-start justify-between gap-3'>
          <div className='flex items-center gap-2.5'>
            <div
              className={`h-9 w-9 rounded-xl ${colors.icon} flex flex-shrink-0 items-center justify-center shadow-lg`}
            >
              <CreditCard className='h-4 w-4 text-white' />
            </div>
            <div>
              <p className='text-sm font-bold leading-tight text-gray-900 dark:text-white'>
                {fuente.tipo}
              </p>
              {(fuente.entidad || fuente.numero_referencia) && (
                <div className='mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-white/45'>
                  {fuente.entidad && (
                    <span className='flex items-center gap-1'>
                      <Building2 className='h-3 w-3' />
                      {fuente.entidad}
                    </span>
                  )}
                  {fuente.entidad && fuente.numero_referencia && <span>·</span>}
                  {fuente.numero_referencia && (
                    <span className='flex items-center gap-1'>
                      {esSubsidio ? (
                        <>
                          No. Acta {fuente.numero_referencia}
                          {fuente.fecha_acta &&
                            ` del ${formatDateForDisplay(fuente.fecha_acta)}`}
                        </>
                      ) : (
                        <>
                          <Hash className='h-3 w-3' />
                          {fuente.numero_referencia}
                        </>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Badge completada / botón */}
          <div className='flex shrink-0 items-center gap-2'>
            {/* Descuadre financiero — máxima prioridad, aplica a todas las fuentes */}
            {hayDescuadreFinanciero &&
            !completada &&
            fuente.saldo_pendiente > 0 ? (
              <button
                disabled
                title='El cierre financiero tiene un descuadre. Corrígelo antes de registrar abonos.'
                className='inline-flex cursor-not-allowed select-none items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-400 opacity-90 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-500'
              >
                <Lock className='h-3.5 w-3.5' />
                {esDesembolsoUnico ? 'Registrar Desembolso' : '+ Abono'}
              </button>
            ) : /* Crédito constructora: toggle plan + botón abono independiente */
            esCreditoConstructora ? (
              <>
                {puedeAbonar ? (
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: `0 0 18px ${colors.glow}`,
                    }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onRegistrarAbono(fuente)}
                    className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r px-3 py-1.5 ${colors.accent} text-xs font-semibold text-white shadow-md`}
                  >
                    <CreditCard className='h-3.5 w-3.5' />+ Abono
                  </motion.button>
                ) : null}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setCuotasExpandidas(p => !p)}
                  className='inline-flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/25'
                >
                  {cuotasExpandidas ? (
                    <ChevronUp className='h-3.5 w-3.5' />
                  ) : (
                    <ChevronDown className='h-3.5 w-3.5' />
                  )}
                  {cuotasExpandidas ? 'Ocultar cuotas' : 'Ver cuotas'}
                </motion.button>
              </>
            ) : completada ? (
              <span className='inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300'>
                <BadgeCheck className='h-3.5 w-3.5' />
                {esDesembolsoUnico ? 'Desembolsado ✓' : 'Completada'}
              </span>
            ) : esDesembolsoUnico && yaDesembolsada ? (
              // Desembolso único ya registrado pero no marcado completada aún (edge case)
              <span className='inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-300'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                Desembolsado
              </span>
            ) : bloqueadoPorDocs && fuente.saldo_pendiente > 0 ? (
              // Bloqueado por documentos obligatorios pendientes
              <div className='flex flex-col items-end gap-1'>
                <button
                  disabled
                  title={`Faltan ${docsPendientesObligatorios} documento${docsPendientesObligatorios > 1 ? 's' : ''} obligatorio${docsPendientesObligatorios > 1 ? 's' : ''} para habilitar`}
                  className='inline-flex cursor-not-allowed select-none items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-400 opacity-80 dark:border-gray-600/50 dark:bg-gray-700/60 dark:text-gray-500'
                >
                  <Lock className='h-3.5 w-3.5' />
                  {esDesembolsoUnico ? 'Registrar Desembolso' : '+ Abono'}
                </button>
                <span className='flex items-center gap-1 text-[10px] font-semibold text-amber-500 dark:text-amber-400'>
                  <AlertTriangle className='h-3 w-3' />
                  {docsPendientesObligatorios} doc. obligatorio
                  {docsPendientesObligatorios > 1 ? 's' : ''} pendiente
                  {docsPendientesObligatorios > 1 ? 's' : ''}
                </span>
              </div>
            ) : esDesembolsoUnico && puedeAbonar ? (
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 0 18px ${colors.glow}`,
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onRegistrarAbono(fuente)}
                className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r px-3 py-1.5 ${colors.accent} text-xs font-semibold text-white shadow-md`}
              >
                <Landmark className='h-3.5 w-3.5' />
                Registrar Desembolso
              </motion.button>
            ) : puedeAbonar ? (
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 0 18px ${colors.glow}`,
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onRegistrarAbono(fuente)}
                className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r px-3 py-1.5 ${colors.accent} text-xs font-semibold text-white shadow-md`}
              >
                <CreditCard className='h-3.5 w-3.5' />+ Abono
              </motion.button>
            ) : null}
          </div>
        </div>

        {/* Desglose crédito: capital + intereses */}
        {esCreditoConstructora &&
        capitalCredito !== null &&
        interesesCredito !== null &&
        interesesCredito > 0 ? (
          <div className='mb-2 flex items-center gap-2 rounded-lg border border-violet-200/60 bg-violet-50/50 px-3 py-1.5 text-[11px] dark:border-violet-800/30 dark:bg-violet-900/10'>
            <span className='text-gray-500 dark:text-gray-400'>Capital:</span>
            <span className='font-semibold text-gray-800 dark:text-white'>
              {formatCurrency(capitalCredito)}
            </span>
            <span className='text-gray-300 dark:text-gray-600'>+</span>
            <span className='text-gray-500 dark:text-gray-400'>Intereses:</span>
            <span className='font-semibold text-violet-600 dark:text-violet-400'>
              {formatCurrency(interesesCredito)}
            </span>
          </div>
        ) : null}

        {/* Montos en 3 celdas */}
        <div className='mb-3 grid grid-cols-3 gap-2'>
          <div className='rounded-xl border border-gray-200 bg-gray-100 p-2.5 text-center dark:border-white/[0.07] dark:bg-white/[0.06]'>
            <p className='mb-0.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40'>
              {labelAprobado}
            </p>
            <p className='text-xs font-bold leading-tight text-gray-900 dark:text-white'>
              {formatCurrency(fuente.monto_aprobado)}
            </p>
          </div>
          <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-center dark:border-emerald-500/[0.15] dark:bg-emerald-500/[0.08]'>
            <p className='mb-0.5 text-[10px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400/60'>
              {labelRecibido}
            </p>
            <p className='text-xs font-bold leading-tight text-emerald-700 dark:text-emerald-300'>
              {formatCurrency(fuente.monto_recibido)}
            </p>
          </div>
          <div className='rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-center dark:border-amber-500/[0.12] dark:bg-amber-500/[0.07]'>
            <p className='mb-0.5 text-[10px] uppercase tracking-wider text-amber-500 dark:text-amber-400/60'>
              Pendiente
            </p>
            <p
              className={`text-xs font-bold leading-tight ${fuente.saldo_pendiente > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-gray-300 dark:text-white/30'}`}
            >
              {formatCurrency(fuente.saldo_pendiente)}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className='space-y-1'>
          <div className='h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10'>
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                duration: 0.9,
                ease: 'easeOut',
                delay: 0.2 + index * 0.07,
              }}
              style={{ boxShadow: `0 0 8px ${colors.glow}` }}
            />
          </div>
          <div className='flex justify-between'>
            <span className='text-[10px] text-gray-400 dark:text-white/30'>
              0%
            </span>
            <span
              className={`text-[10px] font-bold ${completada ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-white/60'}`}
            >
              {pct.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Franja de advertencia: documentos obligatorios pendientes
           Solo se muestra si NO hay descuadre financiero (que tiene prioridad) */}
      {bloqueadoPorDocs &&
        !hayDescuadreFinanciero &&
        fuente.saldo_pendiente > 0 && (
          <div className='space-y-2 border-t border-amber-200 bg-amber-50 px-5 py-3 dark:border-amber-500/[0.18] dark:bg-amber-500/[0.08]'>
            <div className='flex items-start gap-2'>
              <FileWarning className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 dark:text-amber-400' />
              <p className='text-xs font-medium leading-tight text-amber-700 dark:text-amber-300'>
                <span className='font-bold'>Acción bloqueada.</span> Debes
                aportar{' '}
                <span className='font-bold'>
                  {docsPendientesObligatorios} documento
                  {docsPendientesObligatorios > 1 ? 's' : ''} obligatorio
                  {docsPendientesObligatorios > 1 ? 's' : ''}
                </span>{' '}
                antes de registrar este
                {esDesembolsoUnico ? ' desembolso' : ' abono'}.
              </p>
            </div>

            {/* Lista de documentos pendientes */}
            {docsPendientesNombres.length > 0 && (
              <ul className='ml-6 space-y-0.5'>
                {docsPendientesNombres.map((nombre, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300'
                  >
                    <span className='h-1 w-1 flex-shrink-0 rounded-full bg-amber-500 dark:bg-amber-400' />
                    {nombre}
                  </li>
                ))}
              </ul>
            )}

            {/* Acceso directo a documentos del cliente */}
            {clienteSlug && (
              <Link
                href={`/clientes/${clienteSlug}`}
                onClick={() =>
                  sessionStorage.setItem('cliente-tab-intent', 'documentos')
                }
                className='inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 underline underline-offset-2 transition-colors hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200'
              >
                <ExternalLink className='h-3 w-3' />
                Ir a Documentos del cliente
              </Link>
            )}
          </div>
        )}
      {/* Plan de cuotas expandible (solo Crédito con la Constructora) */}
      {esCreditoConstructora && cuotasExpandidas ? (
        <div className='border-t border-violet-200 bg-violet-50/50 px-4 py-4 dark:border-violet-800/30 dark:bg-violet-900/5'>
          <CuotasCreditoTab
            fuentePagoId={fuente.id}
            negociacionId={negociacionId}
            montoFuente={fuente.monto_aprobado}
            onPagoCuotaRegistrado={onAbonoRegistrado}
            refreshKey={cuotasRefreshKey}
            readonly
          />
        </div>
      ) : null}
    </motion.div>
  )
}
