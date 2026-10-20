'use client'

import { MotionConfig, motion } from 'framer-motion'
import {
  AlertTriangle,
  DollarSign,
  Handshake,
  Home,
  Landmark,
} from 'lucide-react'

import { useAuth } from '@/hooks/auth/useAuthQuery'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import { formatCurrency } from '@/shared/utils/format'

import { ClientesCard } from './dashboard/components/ClientesCard'
import {
  DashboardHero,
  type HeroAction,
} from './dashboard/components/DashboardHero'
import { DevolucionesPanel } from './dashboard/components/DevolucionesPanel'
import { KpiCard, type KpiDelta } from './dashboard/components/KpiCard'
import { ProyectosCard } from './dashboard/components/ProyectosCard'
import { RecaudoChart } from './dashboard/components/RecaudoChart'
import { UltimosAbonos } from './dashboard/components/UltimosAbonos'
import {
  EMPTY_DASHBOARD_STATS,
  useDashboardStats,
} from './dashboard/hooks/useDashboardStats'
import {
  formatCOPCompact,
  getContextoFecha,
  pctChange,
} from './dashboard/utils/dashboard-format'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardContentProps {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  isAdmin: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Animation
// ─────────────────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 120, damping: 15 },
  },
}

// Clases completas para que Tailwind las detecte
const KPI_COLS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function deltaPct(
  actual: number,
  anterior: number,
  mesAnterior: string
): KpiDelta | undefined {
  const pct = pctChange(actual, anterior)
  if (pct === null) return undefined
  const redondeado = Math.round(pct)
  return {
    label: `${redondeado > 0 ? '+' : ''}${redondeado}% vs ${mesAnterior}`,
    direction: redondeado > 0 ? 'up' : redondeado < 0 ? 'down' : 'flat',
  }
}

function deltaAbs(
  actual: number,
  anterior: number,
  mesAnterior: string
): KpiDelta {
  const diff = actual - anterior
  return {
    label:
      diff === 0
        ? `igual que ${mesAnterior}`
        : `${diff > 0 ? '+' : ''}${diff} vs ${mesAnterior}`,
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardContent(_props: DashboardContentProps) {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useDashboardStats()
  const { puede, isLoading: permLoading } = usePermisosQuery()
  const { perfil } = useAuth()

  const { saludo, fechaHoy, mesActual, mesAnterior } = getContextoFecha()
  const nombre = perfil?.nombres?.split(' ')[0] || 'Usuario'
  const rol = perfil?.rol || ''

  const permisos = {
    proyectos: puede('proyectos', 'ver'),
    viviendas: puede('viviendas', 'ver'),
    clientes: puede('clientes', 'ver'),
    abonos: puede('abonos', 'ver'),
    negociaciones: puede('negociaciones', 'ver'),
    renuncias: puede('renuncias', 'ver'),
  }

  const heroActions: HeroAction[] = permLoading
    ? []
    : [
        ...(puede('abonos', 'crear')
          ? [
              {
                label: 'Registrar abono',
                href: '/abonos/registrar',
                primary: true,
              },
            ]
          : []),
        ...(puede('clientes', 'crear')
          ? [{ label: 'Nuevo cliente', href: '/clientes/nuevo' }]
          : []),
      ]

  const s = stats ?? EMPTY_DASHBOARD_STATS
  const f = s.finanzas
  const loading = statsLoading || permLoading

  const vendidas = s.viviendas.total - s.viviendas.disponibles
  const pctVendidas =
    s.viviendas.total > 0 ? Math.round((vendidas / s.viviendas.total) * 100) : 0

  // Cada KPI se muestra solo si el usuario puede ver su módulo: RLS devolvería
  // ceros y un "$0" engaña más que no mostrar la tarjeta.
  const kpis = [
    permisos.abonos && {
      label: `Recaudo de ${mesActual}`,
      value: f.recaudoMes,
      format: formatCOPCompact,
      delta: deltaPct(f.recaudoMes, f.recaudoMesAnterior, mesAnterior),
      sub: `${f.abonosMes} ${f.abonosMes === 1 ? 'abono' : 'abonos'} · ${formatCurrency(f.recaudoMes)}`,
      icon: DollarSign,
      accentText: 'text-violet-600 dark:text-violet-400',
      accentBg: 'bg-violet-50 dark:bg-violet-500/10',
      href: '/abonos',
    },
    permisos.negociaciones && {
      label: 'Cartera por cobrar',
      value: f.carteraPendiente,
      format: formatCOPCompact,
      sub: `en ${f.negociacionesActivas} ${f.negociacionesActivas === 1 ? 'negociación activa' : 'negociaciones activas'}`,
      icon: Landmark,
      accentText: 'text-pink-600 dark:text-pink-400',
      accentBg: 'bg-pink-50 dark:bg-pink-500/10',
      href: permisos.clientes ? '/clientes' : undefined,
    },
    permisos.negociaciones && {
      // Asignada = negociación nueva del mes (traslados no cuentan);
      // saldada = negociación completada (pagada al 100%) en el mes
      label: `Viviendas asignadas en ${mesActual}`,
      value: f.ventasMes,
      delta: deltaAbs(f.ventasMes, f.ventasMesAnterior, mesAnterior),
      sub: `${f.saldadasMes ?? 0} ${(f.saldadasMes ?? 0) === 1 ? 'saldada' : 'saldadas'} este mes`,
      icon: Handshake,
      accentText: 'text-pink-600 dark:text-pink-400',
      accentBg: 'bg-pink-50 dark:bg-pink-500/10',
      href: permisos.clientes ? '/clientes' : undefined,
    },
    permisos.viviendas && {
      label: 'Viviendas disponibles',
      value: s.viviendas.disponibles,
      sub: `de ${s.viviendas.total} creadas · ${pctVendidas}% vendido`,
      icon: Home,
      accentText: 'text-orange-600 dark:text-orange-400',
      accentBg: 'bg-orange-50 dark:bg-orange-500/10',
      href: '/viviendas',
    },
  ].filter((k): k is Exclude<typeof k, false> => Boolean(k))

  const mostrarAbonos = permisos.abonos

  return (
    <MotionConfig reducedMotion='user'>
      <div className='custom-scrollbar min-h-full bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-white'>
        <div className='px-4 py-6 sm:px-6 md:py-8 lg:py-10'>
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='mx-auto max-w-[1400px] space-y-4 lg:space-y-6'
          >
            <DashboardHero
              saludo={saludo}
              nombre={nombre}
              rol={rol}
              fechaHoy={fechaHoy}
              actions={heroActions}
            />

            {statsError && (
              <div className='flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'>
                <span className='flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4 shrink-0' />
                  No se pudieron cargar las estadísticas del dashboard.
                </span>
                <button
                  type='button'
                  onClick={() => refetchStats()}
                  className='font-medium underline-offset-2 hover:underline'
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* KPIs */}
            {kpis.length > 0 && (
              <motion.div
                variants={itemVariants}
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0 ${KPI_COLS[kpis.length]}`}
              >
                {kpis.map(kpi => (
                  <KpiCard key={kpi.label} {...kpi} loading={loading} />
                ))}
              </motion.div>
            )}

            {/* Recaudo + Devoluciones a clientes */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6 [&>*]:min-w-0'>
              {permisos.abonos && (
                <div className='lg:col-span-2'>
                  <RecaudoChart
                    loading={loading}
                    data={s.recaudoMensual}
                    canNavigate={permisos.abonos}
                  />
                </div>
              )}
              <div className={permisos.abonos ? '' : 'lg:col-span-3'}>
                <DevolucionesPanel
                  loading={loading}
                  alertas={s.alertas}
                  permisos={{
                    clientes: permisos.clientes,
                    renuncias: permisos.renuncias,
                  }}
                />
              </div>
            </div>

            {/* Inventario + Últimos abonos / Comercial */}
            {/* items-start: cada tarjeta ocupa solo su altura natural (sin estirarse
                para igualar a "Últimos abonos") */}
            <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-6 [&>*]:min-w-0'>
              <div
                className={`flex flex-col gap-4 lg:gap-6 ${mostrarAbonos ? 'lg:col-span-2' : 'lg:col-span-3'}`}
              >
                <ProyectosCard
                  loading={loading}
                  proyectos={s.proyectos}
                  canNavigate={permisos.proyectos}
                />
                <ClientesCard
                  loading={loading}
                  clientes={s.clientes}
                  canNavigate={permisos.clientes}
                />
              </div>
              {mostrarAbonos && (
                <UltimosAbonos
                  loading={loading}
                  abonos={s.ultimosAbonos ?? []}
                  canNavigate={permisos.abonos}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  )
}
