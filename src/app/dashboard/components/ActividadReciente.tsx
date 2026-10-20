'use client'

import { memo, type ElementType } from 'react'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Building2,
  CreditCard,
  FileText,
  FileX,
  Handshake,
  Home,
  Users,
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

type Evento = DashboardStatsData['actividad'][number]

// Colores por módulo (module-themes): proyectos verde, clientes cian,
// viviendas naranja, abonos violeta, negociaciones rosa, renuncias rojo
const ICONO_TABLA: Record<string, { icon: ElementType; cls: string }> = {
  abonos_historial: {
    icon: CreditCard,
    cls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  },
  documentos_cliente: {
    icon: FileText,
    cls: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  },
  clientes: {
    icon: Users,
    cls: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  },
  negociaciones: {
    icon: Handshake,
    cls: 'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400',
  },
  proyectos: {
    icon: Building2,
    cls: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  },
  viviendas: {
    icon: Home,
    cls: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
  },
  renuncias: {
    icon: FileX,
    cls: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  },
}

const ICONO_DEFAULT = {
  icon: Activity,
  cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

const VERBO: Record<string, string> = {
  CREATE: 'creó',
  UPDATE: 'actualizó',
  DELETE: 'eliminó',
  ANULAR: 'anuló',
}

const OBJETO: Record<string, string> = {
  abonos_historial: 'un abono',
  documentos_cliente: 'un documento',
  clientes: 'un cliente',
  negociaciones: 'una negociación',
  proyectos: 'un proyecto',
  viviendas: 'una vivienda',
  renuncias: 'una renuncia',
}

function describir(e: Evento): string {
  if (e.tabla === 'abonos_historial' && e.accion === 'CREATE') {
    return 'registró un abono'
  }
  if (e.tabla === 'documentos_cliente' && e.accion === 'CREATE') {
    return 'subió un documento'
  }
  const verbo = VERBO[e.accion] ?? e.accion.toLowerCase()
  const objeto = OBJETO[e.tabla] ?? `un registro de ${e.modulo ?? e.tabla}`
  return `${verbo} ${objeto}`
}

function nombreCorto(usuario: string | null): string {
  if (!usuario) return 'Alguien'
  if (usuario.includes('@')) return usuario.split('@')[0]
  return usuario.split(' ')[0]
}

interface ActividadRecienteProps {
  loading: boolean
  actividad: DashboardStatsData['actividad']
  canNavigate: boolean
}

function ActividadRecienteComponent({
  loading,
  actividad,
  canNavigate,
}: ActividadRecienteProps) {
  return (
    <motion.section
      variants={itemVariants}
      aria-labelledby='actividad-title'
      className='flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none'
    >
      <div className='mb-5 flex items-start justify-between gap-3'>
        <div>
          <h2
            id='actividad-title'
            className='text-lg font-medium text-slate-900 dark:text-white'
          >
            Actividad reciente
          </h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            Últimos movimientos del equipo
          </p>
        </div>
        {canNavigate && (
          <Link
            href='/auditorias'
            className='flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          >
            Auditoría <ArrowRight className='h-4 w-4' />
          </Link>
        )}
      </div>

      {loading ? (
        <div className='space-y-4'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className='flex gap-3'>
              <div className='h-8 w-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700/50' />
              <div className='flex-1 space-y-2'>
                <div className='h-3 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-700/50' />
                <div className='h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-700/50' />
              </div>
            </div>
          ))}
        </div>
      ) : actividad.length === 0 ? (
        <p className='py-6 text-center text-sm text-slate-400 dark:text-slate-500'>
          Sin actividad registrada
        </p>
      ) : (
        <ol className='relative space-y-4'>
          {/* Línea de tiempo */}
          <span
            aria-hidden
            className='absolute bottom-2 left-4 top-2 w-px bg-slate-100 dark:bg-slate-700/60'
          />
          {actividad.map(e => {
            const { icon: Icon, cls } = ICONO_TABLA[e.tabla] ?? ICONO_DEFAULT
            const fecha = new Date(e.fecha)
            return (
              <li key={e.id} className='relative flex gap-3'>
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-4 ring-white dark:ring-slate-800 ${cls}`}
                >
                  <Icon className='h-4 w-4' aria-hidden />
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm text-slate-700 dark:text-slate-200'>
                    <span className='font-medium capitalize text-slate-900 dark:text-white'>
                      {nombreCorto(e.usuario)}
                    </span>{' '}
                    {describir(e)}
                    {e.monto ? (
                      <span className='font-medium text-slate-900 dark:text-white'>
                        {' '}
                        · {formatCOPCompact(e.monto)}
                      </span>
                    ) : null}
                  </p>
                  <p className='mt-0.5 flex gap-1.5 text-xs text-slate-500 dark:text-slate-400'>
                    {e.detalle && (
                      <>
                        <span className='truncate'>{e.detalle}</span>
                        <span aria-hidden>·</span>
                      </>
                    )}
                    <time
                      dateTime={e.fecha}
                      title={fecha.toLocaleString('es-CO')}
                      className='shrink-0'
                    >
                      {formatDistanceToNow(fecha, {
                        addSuffix: true,
                        locale: es,
                      })}
                    </time>
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </motion.section>
  )
}

export const ActividadReciente = memo(ActividadRecienteComponent)
