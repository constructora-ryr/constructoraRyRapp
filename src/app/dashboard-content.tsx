'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Building2, DollarSign, Home, Users } from 'lucide-react'

import { useAuth } from '@/hooks/auth/useAuthQuery'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import type { Modulo } from '@/modules/usuarios/types'

import { AccesosRapidos } from './dashboard/components/AccesosRapidos'
import { ClientesCard } from './dashboard/components/ClientesCard'
import { DashboardHero } from './dashboard/components/DashboardHero'
import { KpiCard } from './dashboard/components/KpiCard'
import { ProyectosCard } from './dashboard/components/ProyectosCard'
import { ViviendasCard } from './dashboard/components/ViviendasCard'
import { MODULES_CONFIG } from './dashboard/config/modules.config'
import { useDashboardStats } from './dashboard/hooks/useDashboardStats'

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
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardContent(_props: DashboardContentProps) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { puede, isLoading: permLoading } = usePermisosQuery()
  const { perfil } = useAuth()

  const hora = new Date().getHours()
  const saludo =
    hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombre = perfil?.nombres?.split(' ')[0] || 'Usuario'
  const rol = perfil?.rol || ''
  const fechaHoy = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })

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

  const s = stats ?? {
    proyectos: { total: 0, activos: 0, completados: 0, list: [] },
    viviendas: {
      total: 0,
      disponibles: 0,
      asignadas: 0,
      entregadas: 0,
      propietario: 0,
    },
    clientes: {
      total: 0,
      activos: 0,
      interesados: 0,
      inactivos: 0,
      renunciaron: 0,
    },
    recaudoMes: 0,
  }

  const mesActual = new Date().toLocaleString('es-CO', { month: 'long' })
  const recaudoMillones = Math.round(s.recaudoMes / 1_000_000)

  const kpis = [
    {
      label: 'Proyectos',
      value: s.proyectos.activos,
      sub: `${s.proyectos.completados} finalizado${s.proyectos.completados !== 1 ? 's' : ''}`,
      icon: Building2,
      accentText: 'text-emerald-600 dark:text-emerald-400',
      sparkline: 'M0,20 Q15,5 30,15 T60,10 T100,18',
    },
    {
      label: 'Disponibles',
      value: s.viviendas.disponibles,
      sub: `de ${s.viviendas.total} unidades en total`,
      icon: Home,
      accentText: 'text-amber-600 dark:text-amber-400',
      sparkline: 'M0,15 Q10,25 25,10 T50,20 T100,12',
    },
    {
      label: 'Clientes',
      value: s.clientes.activos,
      sub: `${s.clientes.interesados} interesado${s.clientes.interesados !== 1 ? 's' : ''}`,
      icon: Users,
      accentText: 'text-cyan-600 dark:text-cyan-400',
      sparkline: 'M0,25 Q15,10 35,20 T70,5 T100,15',
    },
    {
      label: 'Recaudo',
      value: recaudoMillones,
      sub: `millones en ${mesActual}`,
      icon: DollarSign,
      accentText: 'text-violet-600 dark:text-violet-400',
      sparkline: 'M0,10 Q20,25 40,15 T75,25 T100,8',
    },
  ]

  return (
    <div className='custom-scrollbar min-h-full bg-slate-50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))] text-slate-900 transition-colors duration-300 selection:bg-slate-200 selection:text-slate-900 dark:bg-gray-900 dark:text-white dark:selection:bg-white/20 dark:selection:text-white'>
      {/* Noise Texture Overlay - optimized */}
      <div className='pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(200,200,200,0.02),transparent_50%)] opacity-[0.01] dark:opacity-[0.008]' />

      <div className='relative z-10 px-6 py-12 md:py-16 lg:py-24'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='mx-auto max-w-[1400px] space-y-12 lg:space-y-16'
        >
          <DashboardHero
            saludo={saludo}
            nombre={nombre}
            rol={rol}
            fechaHoy={fechaHoy}
          />

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
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
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
  )
}
