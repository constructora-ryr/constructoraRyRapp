/**
 * 📊 Estadísticas Premium de Clientes
 * Total como métrica héroe, resto como métricas secundarias
 */

'use client'

import { motion } from 'framer-motion'
import {
  Star,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react'

import {
  metricasClientesColors,
  clientesListaStyles as styles,
} from '../styles/clientes-lista.styles'

interface EstadisticasClientesProps {
  total: number
  interesados: number
  activos: number
  inactivos: number
  renunciaron: number
  propietarios?: number
}

const STATS_SECUNDARIAS = (
  interesados: number,
  activos: number,
  inactivos: number,
  renunciaron: number,
  propietarios: number
) => [
  {
    label: 'Interesados',
    value: interesados,
    icon: UserPlus,
    colors: metricasClientesColors.interesados,
  },
  {
    label: 'Activos',
    value: activos,
    icon: UserCheck,
    colors: metricasClientesColors.activos,
  },
  {
    label: 'Renunciaron',
    value: renunciaron,
    icon: UserMinus,
    colors: metricasClientesColors.renunciaron,
  },
  {
    label: 'Inactivos',
    value: inactivos,
    icon: UserX,
    colors: metricasClientesColors.inactivos,
  },
  {
    label: 'Propietarios',
    value: propietarios,
    icon: Star,
    colors: metricasClientesColors.propietarios,
  },
]

export function EstadisticasClientes({
  total,
  interesados,
  activos,
  inactivos,
  renunciaron,
  propietarios = 0,
}: EstadisticasClientesProps) {
  const secundarias = STATS_SECUNDARIAS(
    interesados,
    activos,
    inactivos,
    renunciaron,
    propietarios
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className='grid grid-cols-3 gap-3 sm:grid-cols-6'
    >
      {/* Total Clientes */}
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={styles.metricas.card}
      >
        <div
          className={`${styles.metricas.cardGlow} bg-gradient-to-br from-cyan-500/20 to-blue-500/20`}
        />
        <div className={styles.metricas.content}>
          <div
            className={`${styles.metricas.iconCircle} bg-gradient-to-br from-cyan-500 to-blue-600`}
          >
            <Users className={styles.metricas.icon} />
          </div>
          <div className={styles.metricas.textGroup}>
            <p
              className={`${styles.metricas.value} bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600`}
            >
              {total}
            </p>
            <p className={styles.metricas.label}>Total Clientes</p>
          </div>
        </div>
      </motion.div>

      {/* Métricas secundarias: misma altura pero más compactas */}
      {secundarias.map((stat, index) => (
        <motion.div
          key={stat.label}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ transitionDelay: `${(index + 1) * 0.05}s` }}
          className={styles.metricas.card}
        >
          <div
            className={`${styles.metricas.cardGlow} bg-gradient-to-br ${stat.colors.glowColor}`}
          />
          <div className={styles.metricas.content}>
            <div
              className={`${styles.metricas.iconCircle} bg-gradient-to-br ${stat.colors.gradient}`}
            >
              <stat.icon className={styles.metricas.icon} />
            </div>
            <div className={styles.metricas.textGroup}>
              <p
                className={`${styles.metricas.value} bg-gradient-to-br ${stat.colors.textGradient}`}
              >
                {stat.value}
              </p>
              <p className={styles.metricas.label}>{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
