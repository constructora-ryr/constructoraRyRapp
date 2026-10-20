'use client'

import { MotionConfig, motion } from 'framer-motion'
import { AlertTriangle, Building2, DollarSign, Home, Users } from 'lucide-react'

import { useAuth } from '@/hooks/auth/useAuthQuery'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import type { Modulo } from '@/modules/usuarios/types'
import { formatCurrency } from '@/shared/utils/format'

import { AccesosRapidos } from './dashboard/components/AccesosRapidos'
import { ClientesCard } from './dashboard/components/ClientesCard'
import {
  DashboardHero,
  type HeroAction,
} from './dashboard/components/DashboardHero'
import { KpiCard, type KpiSubItem } from './dashboard/components/KpiCard'
import { ProyectosCard } from './dashboard/components/ProyectosCard'
import { ViviendasCard } from './dashboard/components/ViviendasCard'
import {
  CLIENTE_ESTADO_COLORS,
  PROYECTO_ESTADO_COLORS,
} from './dashboard/config/estados.colors'
import { MODULES_CONFIG } from './dashboard/config/modules.config'
import {
  EMPTY_DASHBOARD_STATS,
  useDashboardStats,
} from './dashboard/hooks/useDashboardStats'
import {
  formatCOPCompact,
  getContextoFecha,
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const plural = (n: number, singular: string, pluralForm = `${singular}s`) =>
  n === 1 ? singular : pluralForm

/** Sub-ítems solo para los conteos > 0 */
function buildSubItems(
  items: Array<{ count: number; label: string; dot: string }>
): KpiSubItem[] {
  return items
    .filter(i => i.count > 0)
    .map(i => ({ label: `${i.count} ${i.label}`, dot: i.dot }))
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

  const { saludo, fechaHoy, mesActual } = getContextoFecha()
  const nombre = perfil?.nombres?.split(' ')[0] || 'Usuario'
  const rol = perfil?.rol || ''

  const permisos: Record<Modulo, boolean> = {
    proyectos: puede('proyectos', 'ver'),
    viviendas: puede('viviendas', 'ver'),
    clientes: puede('clientes', 'ver'),
    abonos: puede('abonos', 'ver'),
    renuncias: puede('renuncias', 'ver'),
    usuarios: puede('usuarios', 'ver'),
    negociaciones: puede('negociaciones', 'ver'),
    documentos: puede('documentos', 'ver'),
    auditorias: puede('auditorias', 'ver'),
    reportes: puede('reportes', 'ver'),
    administracion: puede('administracion', 'ver'),
  }

  const accessibleModules = permLoading
    ? []
    : MODULES_CONFIG.filter(m => permisos[m.modulo])

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

  const p = s.proyectos
  const c = s.clientes
  const vendidas = s.viviendas.total - s.viviendas.disponibles
  const pctVendidas =
    s.viviendas.total > 0 ? Math.round((vendidas / s.viviendas.total) * 100) : 0

  const kpis = [
    {
      label: 'Proyectos',
      value: p.total,
      subItems: buildSubItems([
        {
          count: p.activos,
          label: PROYECTO_ESTADO_COLORS.enEjecucion.label,
          dot: PROYECTO_ESTADO_COLORS.enEjecucion.bg,
        },
        {
          count: p.enPlanificacion,
          label: PROYECTO_ESTADO_COLORS.enPlanificacion.label,
          dot: PROYECTO_ESTADO_COLORS.enPlanificacion.bg,
        },
        {
          count: p.pausados,
          label: plural(p.pausados, 'pausado'),
          dot: PROYECTO_ESTADO_COLORS.pausados.bg,
        },
        {
          count: p.completados,
          label: plural(p.completados, 'finalizado'),
          dot: PROYECTO_ESTADO_COLORS.completados.bg,
        },
      ]),
      icon: Building2,
      accentText: 'text-green-600 dark:text-green-400',
      accentBg: 'bg-green-50 dark:bg-green-500/10',
      href: permisos.proyectos ? '/proyectos' : undefined,
    },
    {
      label: 'Viviendas disponibles',
      value: s.viviendas.disponibles,
      sub: `de ${s.viviendas.total} unidades · ${pctVendidas}% vendido`,
      icon: Home,
      accentText: 'text-orange-600 dark:text-orange-400',
      accentBg: 'bg-orange-50 dark:bg-orange-500/10',
      href: permisos.viviendas ? '/viviendas' : undefined,
    },
    {
      label: 'Clientes',
      value: c.total,
      subItems: buildSubItems([
        {
          count: c.activos,
          label: plural(c.activos, 'activo'),
          dot: CLIENTE_ESTADO_COLORS.activos.bg,
        },
        {
          count: c.interesados,
          label: plural(c.interesados, 'interesado'),
          dot: CLIENTE_ESTADO_COLORS.interesados.bg,
        },
        {
          count: c.propietarios,
          label: plural(c.propietarios, 'propietario'),
          dot: CLIENTE_ESTADO_COLORS.propietarios.bg,
        },
      ]),
      icon: Users,
      accentText: 'text-cyan-600 dark:text-cyan-400',
      accentBg: 'bg-cyan-50 dark:bg-cyan-500/10',
      href: permisos.clientes ? '/clientes' : undefined,
    },
    {
      label: `Recaudo de ${mesActual}`,
      value: s.finanzas.recaudoMes,
      sub: `${formatCurrency(s.finanzas.recaudoMes)} COP`,
      format: formatCOPCompact,
      icon: DollarSign,
      accentText: 'text-violet-600 dark:text-violet-400',
      accentBg: 'bg-violet-50 dark:bg-violet-500/10',
      href: permisos.abonos ? '/abonos' : undefined,
    },
  ]

  return (
    <MotionConfig reducedMotion='user'>
      <div className='custom-scrollbar min-h-full bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-white'>
        <div className='px-4 py-6 sm:px-6 md:py-8 lg:py-10'>
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='mx-auto max-w-[1400px] space-y-6 lg:space-y-8'
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

            {/* KPI Cards */}
            <motion.div
              variants={itemVariants}
              className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
            >
              {kpis.map(kpi => (
                <KpiCard key={kpi.label} {...kpi} loading={statsLoading} />
              ))}
            </motion.div>

            {/* Bento Grid */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6'>
              <ProyectosCard
                loading={statsLoading}
                proyectos={s.proyectos}
                canNavigate={permisos.proyectos}
              />
              <ViviendasCard
                loading={statsLoading}
                viviendas={s.viviendas}
                canNavigate={permisos.viviendas}
              />
              <ClientesCard
                loading={statsLoading}
                clientes={s.clientes}
                canNavigate={permisos.clientes}
              />
            </div>

            <AccesosRapidos loading={permLoading} modules={accessibleModules} />
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  )
}
