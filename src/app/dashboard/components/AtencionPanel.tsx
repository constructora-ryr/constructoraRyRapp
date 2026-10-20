'use client'

import { memo, useState, type ElementType } from 'react'

import { motion } from 'framer-motion'
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react'

import Link from 'next/link'

import { construirURLCliente, getShortId } from '@/lib/utils/slug.utils'

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
  /** Detalle desplegable (p.ej. cada desembolso con su cliente) */
  filas?: Fila[]
  /** Cuántos hay en total (si son más que las filas mostradas) */
  totalFilas?: number
}

interface Fila {
  key: string
  titulo: string
  subtitulo: string
  monto: number
  href?: string
  /** Pestaña a abrir en la ficha del cliente (sessionStorage 'cliente-tab-intent') */
  tabIntent?: 'negociacion' | 'documentos' | 'historial'
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
    devolucionesPendientes,
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
      totalFilas: creditoMora.creditos,
      filas: (creditoMora.items ?? []).map(m => ({
        key: m.fuenteId,
        titulo: m.cliente ?? 'Cliente',
        subtitulo: `${m.diasAtraso} ${plural(m.diasAtraso, 'día')} de atraso`,
        monto: m.monto,
        href: permisos.abonos
          ? `/abonos/${getShortId(m.clienteId)}`
          : undefined,
      })),
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

  const devoluciones = devolucionesPendientes
  if (devoluciones && devoluciones.total > 0) {
    items.push({
      key: 'devoluciones',
      severidad: 'advertencia',
      titulo: 'Devoluciones a clientes',
      detalle: `${devoluciones.total} ${plural(devoluciones.total, 'cliente')} con dinero a favor`,
      monto: devoluciones.monto,
      totalFilas: devoluciones.total,
      filas: devoluciones.items.map(d => ({
        key: d.refId,
        titulo: d.cliente ?? 'Cliente',
        subtitulo: [
          d.vivienda && `Casa ${d.vivienda}`,
          d.origen === 'pago_excedente'
            ? 'Pagó de más'
            : 'Las fuentes superan el valor',
        ]
          .filter(Boolean)
          .join(' · '),
        monto: d.monto,
        // El aviso para registrar la devolución está en la pestaña Negociación
        href: permisos.clientes
          ? construirURLCliente({
              id: d.clienteId,
              nombre_completo: d.cliente ?? undefined,
            })
          : undefined,
        tabIntent: 'negociacion',
      })),
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
  const [abierto, setAbierto] = useState<string | null>(null)
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
            Sin mora, documentos vencidos ni devoluciones pendientes.
          </p>
        </div>
      ) : (
        <ul className='-mx-2 flex flex-col gap-1'>
          {items.map(item => {
            const sev = SEVERIDAD[item.severidad]
            const desplegable = (item.filas?.length ?? 0) > 0
            const expandido = desplegable && abierto === item.key
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
                {desplegable ? (
                  <ChevronDown
                    className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform dark:text-slate-500 ${expandido ? 'rotate-180' : ''}`}
                  />
                ) : (
                  item.href && (
                    <ChevronRight className='h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600' />
                  )
                )}
              </>
            )
            const cls =
              'group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors'
            const interactivo =
              'hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-700/40'
            const panelId = `atencion-${item.key}`
            return (
              <li key={item.key}>
                {desplegable ? (
                  <>
                    <button
                      type='button'
                      aria-expanded={expandido}
                      aria-controls={panelId}
                      onClick={() => setAbierto(expandido ? null : item.key)}
                      className={`${cls} ${interactivo} w-full text-left`}
                    >
                      {body}
                    </button>
                    {expandido && (
                      <div id={panelId} className='mb-2 ml-12 mr-2'>
                        <ul className='divide-y divide-slate-100 rounded-lg border border-slate-100 dark:divide-slate-700/60 dark:border-slate-700/60'>
                          {(item.filas ?? []).map(f => {
                            const filaBody = (
                              <>
                                <span className='min-w-0 flex-1'>
                                  <span className='block truncate text-sm text-slate-800 dark:text-slate-100'>
                                    {f.titulo}
                                  </span>
                                  <span className='block truncate text-xs text-slate-500 dark:text-slate-400'>
                                    {f.subtitulo}
                                  </span>
                                </span>
                                <span className='shrink-0 text-sm font-medium text-slate-900 dark:text-white'>
                                  {formatCOPCompact(f.monto)}
                                </span>
                                {f.href && (
                                  <ChevronRight className='h-4 w-4 shrink-0 text-slate-300 group-hover/fila:text-slate-500 dark:text-slate-600' />
                                )}
                              </>
                            )
                            const filaCls =
                              'group/fila flex items-center gap-3 px-3 py-2'
                            return (
                              <li key={f.key}>
                                {f.href ? (
                                  <Link
                                    href={f.href}
                                    onClick={() => {
                                      if (!f.tabIntent) return
                                      try {
                                        sessionStorage.setItem(
                                          'cliente-tab-intent',
                                          f.tabIntent
                                        )
                                      } catch {
                                        // sessionStorage no disponible: abre la ficha en su pestaña por defecto
                                      }
                                    }}
                                    className={`${filaCls} hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-700/40`}
                                  >
                                    {filaBody}
                                  </Link>
                                ) : (
                                  <div className={filaCls}>{filaBody}</div>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                        {item.href &&
                          (item.totalFilas ?? 0) >
                            (item.filas?.length ?? 0) && (
                            <Link
                              href={item.href}
                              className='mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                            >
                              Ver los {item.totalFilas} en Abonos
                              <ChevronRight className='h-3.5 w-3.5' />
                            </Link>
                          )}
                      </div>
                    )}
                  </>
                ) : item.href ? (
                  <Link href={item.href} className={`${cls} ${interactivo}`}>
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
