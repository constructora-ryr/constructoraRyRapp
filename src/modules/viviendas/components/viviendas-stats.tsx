'use client'

import { motion } from 'framer-motion'
import { CheckCircle, DoorOpen, Home, Key } from 'lucide-react'

import { viviendasStyles as styles } from '../styles/viviendas.styles'

export interface ViviendasStatsProps {
  total: number
  disponibles: number
  asignadas: number
  entregadas: number
  propietario: number
  valorTotal: number
}

export function ViviendasStats({
  total,
  disponibles,
  asignadas,
  entregadas,
  propietario,
  valorTotal: _valorTotal,
}: ViviendasStatsProps) {
  const metricas = [
    {
      icon: Home,
      label: 'Total Viviendas',
      value: total.toString(),
      gradient: 'from-orange-500 to-amber-600',
      shadow: 'shadow-orange-500/50',
    },
    {
      icon: CheckCircle,
      label: 'Disponibles',
      value: disponibles.toString(),
      gradient: 'from-green-500 to-emerald-600',
      shadow: 'shadow-green-500/50',
    },
    {
      icon: Key,
      label: 'Asignadas',
      value: asignadas.toString(),
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/50',
    },
    {
      icon: DoorOpen,
      label: 'Escrituradas',
      value: entregadas.toString(),
      gradient: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/50',
    },
    {
      icon: CheckCircle,
      label: 'Saldadas',
      value: propietario.toString(),
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/50',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={styles.metricas.grid}
    >
      {metricas.map((metrica, index) => {
        const Icon = metrica.icon
        return (
          <motion.div
            key={metrica.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: index * 0.03 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={styles.metricas.card}
          >
            <div className={styles.metricas.cardGlow} />
            <div className={styles.metricas.content}>
              <div
                className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metrica.gradient} ${metrica.shadow}`}
              >
                <Icon className={styles.metricas.icon} />
              </div>
              <div className={styles.metricas.textGroup}>
                <p className={`${styles.metricas.value} ${metrica.gradient}`}>
                  {metrica.value}
                </p>
                <p className={styles.metricas.label}>{metrica.label}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
