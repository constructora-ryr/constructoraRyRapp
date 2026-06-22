'use client'

import { motion } from 'framer-motion'
import { Calendar, DollarSign, Receipt } from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'

import type { EstadisticasAbonos } from '../../hooks/useAbonosList'

import { abonosListaStyles as s } from './abonos-lista.styles'

interface AbonosListMetricasProps {
  estadisticas: EstadisticasAbonos
}

const METRICAS = (e: EstadisticasAbonos) =>
  [
    {
      label: 'Total Recaudado',
      value: formatCurrency(e.montoTotal),
      Icon: DollarSign,
    },
    {
      label: 'Total Recibos',
      value: e.totalAbonos.toString(),
      Icon: Receipt,
    },
    {
      label: 'Recaudado este Mes',
      value: formatCurrency(e.montoEsteMes),
      Icon: Calendar,
    },
  ] as const

export function AbonosListMetricas({ estadisticas }: AbonosListMetricasProps) {
  return (
    <div className={s.metricas.grid}>
      {METRICAS(estadisticas).map(({ label, value, Icon }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.02, y: -4 }}
          className={s.metricas.card}
        >
          <div className={s.metricas.cardGlow} />
          <div className='relative z-10 flex items-center gap-3'>
            <div className={s.metricas.iconCircle}>
              <Icon className='h-5 w-5 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className={s.metricas.value}>{value}</p>
              <p className={s.metricas.label}>{label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
