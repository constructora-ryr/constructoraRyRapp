'use client'

/**
 * Tarjeta de una fuente de pago en el detalle de abonos.
 * - Con saldo: cuánto ha entrado de lo pactado y cuánto falta, con la acción
 *   para registrar el abono o el desembolso. Si faltan documentos
 *   obligatorios, la acción de la tarjeta es subirlos.
 * - Completada: una fila compacta, para que destaque lo que falta.
 * El crédito con la constructora muestra capital + intereses y su plan de
 * cuotas desplegable.
 */

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  FileWarning,
  Hash,
  Landmark,
  Plus,
  Upload,
} from 'lucide-react'

import Link from 'next/link'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { fuenteVisual } from '@/modules/abonos/components/lista/fuente-visual'
import type { FuentePagoConAbonos } from '@/modules/abonos/types'
import { CuotasCreditoTab } from '@/modules/fuentes-pago/components/CuotasCreditoTab'
import { formatCOP } from '@/shared/components/list-page'
import {
  esCreditoConstructora as checkCreditoConstructora,
  esSubsidioCajaCompensacion as checkSubsidioCaja,
  esSubsidioMiCasaYa as checkSubsidioMCY,
} from '@/shared/constants/fuentes-pago.constants'
import { cn } from '@/shared/utils/helpers'

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

const plural = (n: number, uno: string, varios: string) =>
  `${n} ${n === 1 ? uno : varios}`

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
  const { icon: Icono, gradient, solid, text } = fuenteVisual(fuente.tipo)
  const [cuotasAbiertas, setCuotasAbiertas] = useState(false)

  const completada = validacion?.estaCompletamentePagada ?? false
  const esDesembolsoUnico = fuente.permite_multiples_abonos === false
  const esCreditoConstructora = checkCreditoConstructora(fuente.tipo)
  const esSubsidio =
    checkSubsidioMCY(fuente.tipo) || checkSubsidioCaja(fuente.tipo)
  const docsPendientes = validacion?.documentosObligatoriosPendientes ?? 0
  const docsNombres = validacion?.documentosPendientesNombres ?? []
  const bloqueadoPorDocs = docsPendientes > 0
  // Sin permiso para registrar = cierre financiero descuadrado (lo avisa la página)
  const hayDescuadre = !canCreate
  const conSaldo = fuente.saldo_pendiente > 0

  const pct =
    fuente.monto_aprobado > 0
      ? Math.min((fuente.monto_recibido / fuente.monto_aprobado) * 100, 100)
      : 0
  const puedeAbonar =
    canCreate &&
    (validacion?.puedeRegistrarAbono ?? true) &&
    !completada &&
    conSaldo &&
    !bloqueadoPorDocs

  const verboRecibido = esDesembolsoUnico ? 'desembolsado' : 'recibido'

  // Crédito con la constructora: capital vs intereses
  const capital = esCreditoConstructora
    ? (fuente.capital_para_cierre ?? fuente.monto_aprobado)
    : null
  const intereses =
    capital !== null ? Math.max(0, fuente.monto_aprobado - capital) : 0

  const irADocumentos = clienteSlug
    ? {
        href: `/clientes/${clienteSlug}`,
        onClick: () =>
          sessionStorage.setItem('cliente-tab-intent', 'documentos'),
      }
    : null

  const detalle = (
    <>
      {fuente.entidad ? (
        <span
          className={cn('inline-flex items-center gap-1 font-medium', text)}
        >
          <Building2 className='h-3 w-3' />
          {fuente.entidad}
        </span>
      ) : null}
      {fuente.numero_referencia ? (
        <span className='inline-flex items-center gap-1'>
          {esSubsidio ? (
            <>
              <CalendarDays className='h-3 w-3' />
              Acta {fuente.numero_referencia}
              {fuente.fecha_acta
                ? ` del ${formatDateForDisplay(fuente.fecha_acta)}`
                : ''}
            </>
          ) : (
            <>
              <Hash className='h-3 w-3' />
              {fuente.numero_referencia}
            </>
          )}
        </span>
      ) : null}
      {esCreditoConstructora && capital !== null && intereses > 0 ? (
        <span className='inline-flex items-center gap-1'>
          Capital{' '}
          <strong className='tabular-nums text-slate-700 dark:text-slate-200'>
            {formatCOP(capital)}
          </strong>{' '}
          + intereses{' '}
          <strong className='tabular-nums text-violet-700 dark:text-violet-300'>
            {formatCOP(intereses)}
          </strong>
        </span>
      ) : null}
    </>
  )
  const tieneDetalle =
    !!fuente.entidad ||
    !!fuente.numero_referencia ||
    (esCreditoConstructora && intereses > 0)

  const botonCuotas = esCreditoConstructora ? (
    <button
      type='button'
      onClick={() => setCuotasAbiertas(v => !v)}
      aria-expanded={cuotasAbiertas}
      className='inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/10'
    >
      <ChevronDown
        className={cn(
          'h-4 w-4 transition-transform',
          cuotasAbiertas && 'rotate-180'
        )}
      />
      {cuotasAbiertas ? 'Ocultar plan de cuotas' : 'Ver plan de cuotas'}
    </button>
  ) : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-800/60',
        completada
          ? 'border-slate-200/70 dark:border-slate-700/50'
          : 'border-slate-200/80 dark:border-slate-700/60'
      )}
    >
      {completada ? (
        /* ── Completada: fila compacta ── */
        <div className='flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5'>
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
              gradient
            )}
          >
            <Icono className='h-4 w-4' />
          </span>
          <div className='min-w-0 flex-1'>
            <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
              {fuente.tipo}
            </h3>
            {tieneDetalle ? (
              <p className='flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400'>
                {detalle}
              </p>
            ) : null}
          </div>
          {botonCuotas}
          <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'>
            <BadgeCheck className='h-4 w-4' />
            {esDesembolsoUnico ? 'Desembolsado' : 'Completada'} ·{' '}
            <span className='tabular-nums'>
              {formatCOP(fuente.monto_recibido)}
            </span>
          </span>
        </div>
      ) : (
        /* ── Con saldo: tarjeta completa ── */
        <>
          <span
            aria-hidden
            className={cn(
              'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
              gradient
            )}
          />
          <div className='p-4 sm:p-5'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div className='flex min-w-0 items-center gap-3'>
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
                    gradient
                  )}
                >
                  <Icono className='h-5 w-5' />
                </span>
                <div className='min-w-0'>
                  <h3 className='text-base font-bold leading-tight text-slate-900 dark:text-white'>
                    {fuente.tipo}
                  </h3>
                  {tieneDetalle ? (
                    <p className='mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400'>
                      {detalle}
                    </p>
                  ) : null}
                </div>
              </div>
              {puedeAbonar ? (
                <button
                  type='button'
                  onClick={() => onRegistrarAbono(fuente)}
                  className={cn(
                    'inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-auto sm:py-2',
                    gradient
                  )}
                >
                  {esDesembolsoUnico ? (
                    <Landmark className='h-4 w-4' />
                  ) : (
                    <Plus className='h-4 w-4' />
                  )}
                  {esDesembolsoUnico
                    ? 'Registrar desembolso'
                    : 'Registrar abono'}
                </button>
              ) : null}
            </div>

            {/* Avance: una sola línea con lo que entró y lo que falta */}
            <div className='mt-4'>
              <div className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1'>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  <span className='text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400'>
                    {formatCOP(fuente.monto_recibido)}
                  </span>{' '}
                  {verboRecibido} de{' '}
                  <span className='font-semibold tabular-nums text-slate-700 dark:text-slate-200'>
                    {formatCOP(fuente.monto_aprobado)}
                  </span>
                  <span className='mx-1.5 text-slate-300 dark:text-slate-600'>
                    ·
                  </span>
                  falta{' '}
                  <span className='font-bold tabular-nums text-amber-600 dark:text-amber-400'>
                    {formatCOP(fuente.saldo_pendiente)}
                  </span>
                </p>
                <span
                  className={cn(
                    'text-sm font-bold tabular-nums',
                    pct > 0
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {pct > 0 ? `${Math.floor(pct)}%` : 'Sin pagos'}
                </span>
              </div>
              <div className='mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60'>
                <motion.div
                  className={cn('h-full rounded-full', solid)}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeOut',
                    delay: 0.1 + index * 0.05,
                  }}
                />
              </div>
            </div>

            {botonCuotas ? <div className='mt-3'>{botonCuotas}</div> : null}
          </div>

          {/* Faltan documentos: subirlos es la acción de la tarjeta
              (si el cierre está descuadrado, lo avisa la página) */}
          {bloqueadoPorDocs && !hayDescuadre && conSaldo ? (
            <div className='flex flex-col gap-3 border-t border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/60 px-4 py-3 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/5 sm:flex-row sm:items-center sm:px-5'>
              <div className='flex min-w-0 flex-1 items-start gap-3'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'>
                  <FileWarning className='h-4 w-4' />
                </span>
                <div className='min-w-0'>
                  <p className='text-sm font-bold text-amber-950 dark:text-amber-100'>
                    Para registrar este
                    {esDesembolsoUnico ? ' desembolso' : ' abono'} faltan{' '}
                    {plural(
                      docsPendientes,
                      'documento obligatorio',
                      'documentos obligatorios'
                    )}
                  </p>
                  {docsNombres.length > 0 ? (
                    <ul className='mt-1.5 flex flex-wrap gap-1.5'>
                      {docsNombres.map(nombre => (
                        <li
                          key={nombre}
                          className='rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200 dark:bg-slate-900/50 dark:text-amber-200 dark:ring-amber-500/30'
                        >
                          {nombre}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
              {irADocumentos ? (
                <Link
                  href={irADocumentos.href}
                  onClick={irADocumentos.onClick}
                  className='inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:-translate-y-0.5 sm:w-auto sm:py-2'
                >
                  <Upload className='h-4 w-4' />
                  Subir documentos
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      )}

      <AnimatePresence initial={false}>
        {esCreditoConstructora && cuotasAbiertas ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className='overflow-hidden border-t border-violet-200 bg-violet-50/50 dark:border-violet-500/20 dark:bg-violet-500/5'
          >
            <div className='p-4'>
              <CuotasCreditoTab
                fuentePagoId={fuente.id}
                negociacionId={negociacionId}
                montoFuente={fuente.monto_aprobado}
                onPagoCuotaRegistrado={onAbonoRegistrado}
                refreshKey={cuotasRefreshKey}
                readonly
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  )
}
