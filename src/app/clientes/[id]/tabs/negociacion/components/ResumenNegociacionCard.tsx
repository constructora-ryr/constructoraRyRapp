'use client'

/**
 * Resumen de la negociación: vivienda, estado, fecha de inicio y acciones;
 * cifras (valor, intereses, descuento, abonado, por cobrar) con avance y el
 * estado de cuenta desplegable.
 */

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import {
  ArrowRightLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  FileX,
  HelpCircle,
  Home,
  MoreHorizontal,
  PauseCircle,
  Percent,
  PiggyBank,
  Stamp,
  Star,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatCOP } from '@/shared/components/list-page'
import { Tooltip } from '@/shared/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/utils/helpers'

import { CampoEditable } from './CampoEditable'

const ESTADO_NEG: Record<
  string,
  { label: string; icon: LucideIcon; badge: string }
> = {
  Activa: {
    label: 'Activa',
    icon: Clock,
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  Suspendida: {
    label: 'Suspendida',
    icon: PauseCircle,
    badge:
      'bg-amber-50 text-amber-700 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300',
  },
  Completada: {
    label: 'Pagada',
    icon: Star,
    badge:
      'bg-amber-50 text-amber-700 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300',
  },
  'Cerrada por Traslado': {
    label: 'Cerrada por traslado',
    icon: ArrowRightLeft,
    badge:
      'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300',
  },
}

function Cifra({
  icon: Icon,
  label,
  valor,
  gradient,
  texto = 'text-slate-900 dark:text-white',
  ayuda,
  children,
}: {
  icon: LucideIcon
  label: string
  valor: string
  gradient: string
  texto?: string
  ayuda?: string
  /** Línea secundaria debajo del valor */
  children?: ReactNode
}) {
  return (
    <div className='flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-700/60 dark:bg-slate-900/30'>
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
          gradient
        )}
      >
        <Icon className='h-5 w-5' />
      </span>
      <div className='min-w-0 flex-1'>
        <p className='flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
          {label}
          {ayuda && (
            <Tooltip content={ayuda} side='bottom'>
              <HelpCircle className='h-3 w-3 cursor-help text-amber-500' />
            </Tooltip>
          )}
        </p>
        <p
          className={cn(
            'text-lg font-black tabular-nums tracking-tight',
            texto
          )}
        >
          {valor}
        </p>
        {children}
      </div>
    </div>
  )
}

export interface ResumenNegociacionCardProps {
  proyecto: string
  codigoVivienda: string
  estado: string
  fechaInicio: string | null
  valorVivienda: number
  totalComprometido: number
  interesesTotales: number
  descuento: number
  pctDescuento: number
  tipoDescuento: string | null
  motivoDescuento: string | null
  valorEscritura: number
  totalAbonado: number
  saldo: number
  /** Deuda real si las fuentes superan el valor (excedente) */
  saldoReal: number
  diferencia: number
  pctPagado: number
  /** Permisos */
  esAdmin: boolean
  puedeEditarEscritura: boolean
  /** Acciones (undefined = no se muestran) */
  onTrasladar?: () => void
  onEscriturar?: () => void
  onRenunciar?: () => void
  onGuardarFechaInicio: (fecha: string) => Promise<void>
  onGuardarEscritura: (valor: number) => Promise<void>
  /** Estado de cuenta desplegable (lo arma la pestaña) */
  estadoDeCuenta: ReactNode
}

const btnAccion =
  'inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm sm:h-9'

export function ResumenNegociacionCard(p: ResumenNegociacionCardProps) {
  const est = ESTADO_NEG[p.estado] ?? ESTADO_NEG.Activa
  const EstIcono = est.icon
  const pagada = p.saldo <= 0 && p.pctPagado >= 100
  const conExcedente = p.diferencia < 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
    >
      {/* Encabezado */}
      <div className='flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-700/60 lg:flex-row lg:items-center'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'>
            <Home className='h-6 w-6' />
          </span>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-0.5 text-sm font-black text-orange-700 ring-1 ring-inset ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300'>
                <Home className='h-3.5 w-3.5' />
                {p.codigoVivienda || '—'}
              </span>
              <h3 className='flex items-center gap-1 text-base font-bold text-slate-900 dark:text-white'>
                <Building2 className='h-4 w-4 text-green-600 dark:text-green-400' />
                {p.proyecto}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset',
                  est.badge
                )}
              >
                <EstIcono
                  className={cn(
                    'h-3.5 w-3.5',
                    p.estado === 'Completada' && 'fill-current'
                  )}
                />
                {est.label}
              </span>
            </div>
            {p.fechaInicio && (
              <div className='mt-1.5'>
                <CampoEditable
                  editable={p.esAdmin}
                  tipo='date'
                  valorInicial={p.fechaInicio.substring(0, 10)}
                  ariaLabel='Fecha de inicio de la negociación'
                  chipClassName='bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-300'
                  onGuardar={v => p.onGuardarFechaInicio(String(v))}
                >
                  <CalendarDays className='h-3.5 w-3.5' />
                  Inicio: {formatDateForDisplay(p.fechaInicio)}
                </CampoEditable>
              </div>
            )}
          </div>
        </div>

        {(p.onTrasladar || p.onEscriturar || p.onRenunciar) && (
          <div className='flex flex-wrap items-center gap-2'>
            {p.onTrasladar && (
              <button
                type='button'
                onClick={p.onTrasladar}
                className={cn(
                  btnAccion,
                  'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300'
                )}
              >
                <ArrowRightLeft className='h-4 w-4' />
                Trasladar vivienda
              </button>
            )}
            {p.onEscriturar && (
              <button
                type='button'
                onClick={p.onEscriturar}
                className={cn(
                  btnAccion,
                  'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-800/50 dark:bg-violet-900/20 dark:text-violet-300'
                )}
              >
                <Stamp className='h-4 w-4' />
                Marcar escriturada
              </button>
            )}
            {p.onRenunciar && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type='button'
                    aria-label='Más acciones'
                    className='flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 data-[state=open]:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 sm:h-9 sm:w-9'
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-52'>
                  <DropdownMenuItem
                    onClick={p.onRenunciar}
                    className='text-red-600 focus:text-red-700 dark:text-red-400'
                  >
                    <FileX className='mr-2 h-4 w-4' />
                    Registrar renuncia
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Cifras */}
      <div className='space-y-4 p-4'>
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          <Cifra
            icon={Home}
            label={
              p.interesesTotales > 0 ? 'Precio vivienda' : 'Valor total a pagar'
            }
            valor={formatCOP(p.valorVivienda)}
            gradient='from-blue-500 to-indigo-600'
          >
            {p.interesesTotales > 0 ? (
              <p className='text-xs text-violet-600 dark:text-violet-400'>
                <TrendingUp className='mr-1 inline h-3 w-3' />
                Con intereses: {formatCOP(p.totalComprometido)}
              </p>
            ) : null}
            {p.valorVivienda > 0 && p.valorEscritura !== p.valorVivienda ? (
              <div className='mt-1'>
                <CampoEditable
                  editable={p.puedeEditarEscritura}
                  tipo='dinero'
                  valorInicial={
                    p.valorEscritura > 0 ? String(p.valorEscritura) : ''
                  }
                  ariaLabel='Valor en escritura pública'
                  chipClassName='bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300'
                  onGuardar={v => p.onGuardarEscritura(Number(v))}
                >
                  <FileText className='h-3 w-3' />
                  {p.valorEscritura > 0
                    ? `Escritura: ${formatCOP(p.valorEscritura)}`
                    : 'Sin valor de escritura'}
                </CampoEditable>
              </div>
            ) : null}
          </Cifra>

          {p.descuento > 0 ? (
            <Cifra
              icon={Percent}
              label='Descuento'
              valor={`−${formatCOP(p.descuento)}`}
              gradient='from-violet-500 to-fuchsia-600'
              texto='text-violet-600 dark:text-violet-400'
            >
              <p className='flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
                {p.pctDescuento > 0 && <span>{p.pctDescuento}% del valor</span>}
                {p.tipoDescuento && (
                  <span className='rounded-full bg-violet-100 px-1.5 py-px text-[10px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'>
                    {p.tipoDescuento}
                  </span>
                )}
              </p>
              {p.motivoDescuento && (
                // Texto cortado: el motivo completo en tooltip (cursor o foco,
                // y toque en celular); subrayado punteado = hay más detalle
                <Tooltip
                  side='bottom'
                  delayDuration={150}
                  content={
                    <span className='block max-w-xs whitespace-pre-line'>
                      {p.motivoDescuento}
                    </span>
                  }
                >
                  <button
                    type='button'
                    aria-label={`Motivo del descuento: ${p.motivoDescuento}`}
                    className='mt-0.5 block w-full cursor-help truncate text-left text-xs italic text-slate-500 underline decoration-slate-300 decoration-dotted underline-offset-4 outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-violet-300 dark:text-slate-400 dark:decoration-slate-600'
                  >
                    “{p.motivoDescuento}”
                  </button>
                </Tooltip>
              )}
            </Cifra>
          ) : null}

          <Cifra
            icon={PiggyBank}
            label='Abonado'
            valor={formatCOP(p.totalAbonado)}
            gradient='from-emerald-500 to-teal-600'
            texto='text-emerald-700 dark:text-emerald-400'
          >
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Total recibido
            </p>
          </Cifra>

          <Cifra
            icon={pagada ? CheckCircle2 : Wallet}
            label='Por cobrar'
            valor={formatCOP(conExcedente ? p.saldoReal : Math.max(p.saldo, 0))}
            gradient={
              pagada
                ? 'from-amber-400 to-orange-500'
                : 'from-amber-500 to-rose-500'
            }
            texto={
              pagada
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-rose-700 dark:text-rose-400'
            }
            ayuda={
              conExcedente
                ? `Las fuentes de pago suman ${formatCOP(Math.abs(p.diferencia))} más de lo que el cliente debe. El valor principal es la deuda real del cliente; el secundario es lo que aún falta por desembolsar de las fuentes. La diferencia es el excedente que se le devuelve.`
                : undefined
            }
          >
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {conExcedente
                ? `${formatCOP(Math.max(0, p.totalComprometido - p.totalAbonado))} por desembolsar`
                : pagada
                  ? 'Pagado completamente'
                  : 'Resta por pagar'}
            </p>
          </Cifra>
        </div>

        {/* Avance */}
        <div>
          <div className='mb-1.5 flex items-center justify-between text-xs'>
            <span className='font-semibold text-slate-600 dark:text-slate-300'>
              Avance de pago
            </span>
            <span
              className={cn(
                'font-black tabular-nums',
                pagada
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-cyan-700 dark:text-cyan-400'
              )}
            >
              {p.pctPagado.toFixed(1)}%
            </span>
          </div>
          <div className='h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60'>
            <motion.div
              className={cn(
                'h-full rounded-full bg-gradient-to-r',
                pagada
                  ? 'from-amber-400 to-orange-500'
                  : 'from-cyan-500 via-blue-500 to-indigo-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${p.pctPagado}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {p.estadoDeCuenta}
    </motion.section>
  )
}
