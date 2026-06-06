'use client'

import { motion } from 'framer-motion'
import { BarChart3, ChevronRight, Hash, LayoutDashboard } from 'lucide-react'

import { ProtectedLink } from '@/shared/components/ui/ProtectedLink'

import { reportesPageStyles as styles } from '../styles/reportes-page.styles'

interface ReportesHeaderProps {
  totalEntidades: number
}

export function ReportesHeader({ totalEntidades }: ReportesHeaderProps) {
  return (
    <motion.div
      {...styles.animations.header}
      className={styles.header.container}
    >
      {/* Pattern overlay */}
      <div className={styles.header.pattern} />

      {/* Content */}
      <div className={styles.header.content}>
        {/* Breadcrumb */}
        <div className='mb-3 flex items-center gap-1.5'>
          <LayoutDashboard className='h-3 w-3 text-indigo-200' />
          <ProtectedLink
            href='/dashboard'
            className='text-xs text-indigo-200 transition-colors hover:text-white'
          >
            Dashboard
          </ProtectedLink>
          <ChevronRight className='h-3 w-3 text-indigo-300/60' />
          <span className='text-xs font-semibold text-white'>Reportes</span>
        </div>

        <div className={styles.header.topRow}>
          {/* Left: Icon + Title */}
          <div className={styles.header.titleGroup}>
            <div className={styles.header.iconCircle}>
              <BarChart3 className={styles.header.icon} />
            </div>
            <div className={styles.header.titleWrapper}>
              <h1 className={styles.header.title}>Reportes y Análisis</h1>
              <p className={styles.header.subtitle}>
                Estadísticas del portafolio • Financiación por entidad
              </p>
            </div>
          </div>

          {/* Right: Badge */}
          <span className={styles.header.badge}>
            <Hash className={styles.header.badgeIcon} />
            {totalEntidades}{' '}
            {totalEntidades === 1 ? 'Entidad activa' : 'Entidades activas'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
