'use client'

import { memo, type ElementType } from 'react'

import { motion } from 'framer-motion'
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
} from 'lucide-react'

import Link from 'next/link'

import type { DashboardStatsData } from '../hooks/useDashboardStats'
import { formatCOPCompact } from '../utils/dashboard-format'

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

type Severidad = 'critico' | 'advertencia' | 'info'

// Colores de estado reservados: siempre van con ícono + etiqueta
const SEVERIDAD: Record<
  Severidad,
  { icon: ElementType; label: string; tile: string; chip: string }
> = {
  critico: {
    icon: AlertOctagon,
    label: 'Urgente',
    tile: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    chip: 'text-rose-700 dark:text-rose-300',
  },
  advertencia: {
    icon: AlertTriangle,
    label: 'Revisar',
    tile: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    chip: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    icon: Clock,
    label: 'En espera',
    tile: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    chip: 'text-sky-700 dark:text-sky-300',
  },
}

const ORDEN: Severidad[] = ['critico', 'advertencia', 'info']

interface Item {
  key: string
  severidad: Severidad
  titulo: string
  detalle: string
  monto?: number
  href?: string
}

const plural = (n: number, s: string, p = `${s}s`) => (n === 1 ? s : p)

export interface AtencionPermisos {
  abonos: boolean
  clientes: boolean
  renuncias: boolean
}

interface AtencionPanelProps {
  loading: boolean
  alertas: DashboardStatsData['alertas']
  permisos: AtencionPermisos
}

function buildItems(
  {
    creditoMora,
    documentosPendientes,
    renunciasPendientes,
    desembolsosPendientes,
  }: DashboardStatsData['alertas'],
  permisos: AtencionPermisos
): Item[] {
  const items: Item[] = []

  if (creditoMora.creditos > 0) {
    items.push({
      key: 'mora',
      severidad: 'critico',
      titulo: 'Crédito con la constructora en mora',
      detalle: `${creditoMora.creditos} ${plural(creditoMora.creditos, 'crédito')} · hasta ${creditoMora.maxDiasAtraso} días de atraso`,
      monto: creditoMora.monto,
      href: permisos.abonos ? '/abonos' : undefined,
    })
  }

  if (documentosPendientes.total > 0) {
    const { total, vencidos } = documentosPendientes
    items.push({
      key: 'documentos',
      severidad: vencidos > 0 ? 'critico' : 'advertencia',
      titulo: vencidos > 0 ? 'Documentos vencidos' : 'Documentos pendientes',
      detalle:
        vencidos > 0
          ? `${vencidos} ${plural(vencidos, 'vencido')} de ${total} ${plural(total, 'pendiente')}`
          : `${total} ${plural(total, 'documento')} por recibir`,
      href: permisos.clientes ? '/clientes' : undefined,
    })
  }

  if (renunciasPendientes.total > 0) {
    items.push({
      key: 'renuncias',
      severidad: 'advertencia',
      titulo: 'Devoluciones por renuncia',
      detalle: `${renunciasPendientes.total} ${plural(renunciasPendientes.total, 'renuncia')} pendiente${renunciasPendientes.total === 1 ? '' : 's'} de devolución`,
      monto: renunciasPendientes.monto,
      href: permisos.renuncias ? '/renuncias' : undefined,
    })
  }

  if (desembolsosPendientes.total > 0) {
    items.push({
      key: 'desembolsos',
      severidad: 'info',
      titulo: 'Desembolsos por recibir',
      detalle: `${desembolsosPendientes.total} ${plural(desembolsosPendientes.total, 'fuente')} de bancos, cajas y subsidios`,
      monto: desembolsosPendientes.monto,
      href: permisos.abonos ? '/abonos' : undefined,
    })
  }

  return items.sort(
    (a, b) => ORDEN.indexOf(a.severidad) - ORDEN.indexOf(b.severidad)
  )
}

function AtencionPanelComponent({
  loading,
  alertas,
  permisos,
}: AtencionPanelProps) {
  const items = buildItems(alertas, permisos)
  const urgentes = items.filter(i => i.severidad === 'critico').length

  return (
    <motion.section
      variants={itemVariants}
      aria-labelledby='atencion-title'
      className='flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none'
    >
      <div className='mb-5'>
        <h2
          id='atencion-title'
          className='text-lg font-medium text-slate-900 dark:text-white'
        >
          Requiere atención
        </h2>
        <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
          {loading
            ? 'Revisando pendientes…'
            : items.length === 0
              ? 'Sin pendientes por ahora'
              : urgentes > 0
                ? `${urgentes} ${plural(urgentes, 'asunto urgente', 'asuntos urgentes')} · ${items.length} en total`
                : `${items.length} ${plural(items.length, 'pendiente')}`}
        </p>
      </div>

      {loading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/50'
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center rounded-xl bg-emerald-50/60 px-4 py-8 text-center dark:bg-emerald-500/5'>
          <CheckCircle2 className='mb-2 h-8 w-8 text-emerald-500' />
          <p className='text-sm font-medium text-slate-800 dark:text-slate-100'>
            Todo al día
          </p>
          <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
            Sin mora, documentos vencidos, devoluciones ni desembolsos
            pendientes.
          </p>
        </div>
      ) : (
        <ul className='-mx-2 flex flex-col gap-1'>
          {items.map(item => {
            const sev = SEVERIDAD[item.severidad]
            const body = (
              <>
                <span className={`mt-0.5 shrink-0 rounded-lg p-2 ${sev.tile}`}>
                  <sev.icon className='h-4 w-4' aria-hidden />
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='flex items-center gap-2'>
                    <span className='truncate text-sm font-medium text-slate-900 dark:text-white'>
                      {item.titulo}
                    </span>
                  </span>
                  <span className='mt-0.5 block text-xs text-slate-500 dark:text-slate-400'>
                    <span className={`font-medium ${sev.chip}`}>
                      {sev.label}
                    </span>{' '}
                    · {item.detalle}
                  </span>
                </span>
                {item.monto !== undefined && item.monto > 0 && (
                  <span className='shrink-0 text-sm font-semibold text-slate-900 dark:text-white'>
                    {formatCOPCompact(item.monto)}
                  </span>
                )}
                {item.href && (
                  <ChevronRight className='h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600' />
                )}
              </>
            )
            const cls =
              'group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors'
            return (
              <li key={item.key}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`${cls} hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-700/40`}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </motion.section>
  )
}

export const AtencionPanel = memo(AtencionPanelComponent)
