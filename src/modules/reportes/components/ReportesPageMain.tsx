'use client'

import { motion } from 'framer-motion'

import { useReporteFinanciacion } from '../hooks/useReporteFinanciacion'
import { reportesPageStyles as styles } from '../styles/reportes-page.styles'

import { ReporteFinanciacion } from './ReporteFinanciacion'
import { ReportesHeader } from './reportes-header'

interface ReportesPageMainProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

export function ReportesPageMain(_props: ReportesPageMainProps = {}) {
  const { data } = useReporteFinanciacion()

  return (
    <div className={styles.container.page}>
      <motion.div
        {...styles.animations.container}
        className={styles.container.content}
      >
        <ReportesHeader totalEntidades={data?.entidades.length ?? 0} />
        <ReporteFinanciacion />
      </motion.div>
    </div>
  )
}
