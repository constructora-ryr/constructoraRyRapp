'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Building2, Home } from 'lucide-react'

import Link from 'next/link'

import { getShortId } from '@/lib/utils/slug.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'

import {
  getAvatarGradient,
  seleccionClienteStyles as styles,
} from '../styles/seleccion-cliente.styles'
import { NegociacionConAbonos } from '../types'

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

// Colores semánticos según porcentaje de avance
function getProgressColor(pct: number) {
  if (pct >= 80)
    return {
      bar: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
    }
  if (pct >= 40)
    return { bar: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' }
  return { bar: 'bg-amber-400', text: 'text-amber-500 dark:text-amber-400' }
}

interface ClienteCardProps {
  negociacion: NegociacionConAbonos
}

export function ClienteCard({ negociacion }: ClienteCardProps) {
  const { cliente, vivienda, proyecto } = negociacion
  const nombreCompleto = formatNombreCompleto(
    `${cliente.nombres} ${cliente.apellidos}`
  )

  const totalAbonado = negociacion.total_abonado || 0
  const saldoPendiente = negociacion.saldo_pendiente || 0
  const porcentajePagado = negociacion.porcentaje_pagado || 0

  const progressColor = getProgressColor(porcentajePagado)

  const avatarGradient = getAvatarGradient(nombreCompleto)
  const initials = nombreCompleto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  const viviendaLabel = [
    vivienda.manzana?.nombre ? `Mz. ${vivienda.manzana.nombre}` : null,
    vivienda.numero ? `Casa No. ${vivienda.numero}` : 'Vivienda',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link href={`/abonos/${getShortId(cliente.id)}`}>
      <motion.div
        whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
        transition={{ duration: 0.1 }}
        className={styles.card.container}
      >
        {/* Avatar con iniciales */}
        <div
          className={`${styles.card.avatarCircle} bg-gradient-to-br ${avatarGradient}`}
        >
          <span className={styles.card.avatarInitials}>{initials}</span>
        </div>

        {/* Info principal */}
        <div className={styles.card.clienteInfo}>
          <p className={styles.card.clienteNombre}>{nombreCompleto}</p>
          <p className={styles.card.clienteCC}>CC {cliente.numero_documento}</p>
          <div className={styles.card.clienteUbicacion}>
            {proyecto ? (
              <>
                <Building2 className={styles.card.badgeIcon} />
                <span className='max-w-[10rem] truncate'>
                  {proyecto.nombre}
                </span>
                <span className={styles.card.ubicacionSep}>›</span>
              </>
            ) : null}
            <Home className={styles.card.badgeIcon} />
            <span>{viviendaLabel}</span>
          </div>
        </div>

        {/* Progress (sm+) */}
        <div className={styles.card.progressWrapper}>
          <div className={styles.card.progressBar}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(porcentajePagado, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${progressColor.bar}`}
            />
          </div>
          <span
            className={`${styles.card.progressPercent} ${progressColor.text}`}
          >
            {porcentajePagado.toFixed(0)}%
          </span>
        </div>

        {/* Financiero (lg+) */}
        <div className={styles.card.financieroSection}>
          <div className={styles.card.metricGroup}>
            <p className={styles.card.metricLabel}>Pagado</p>
            <p
              className={`${styles.card.metricValue} text-emerald-600 dark:text-emerald-400`}
            >
              {formatCOP(totalAbonado)}
            </p>
          </div>
          <div className={styles.card.metricGroup}>
            <p className={styles.card.metricLabel}>Pendiente</p>
            <p
              className={`${styles.card.metricValue} text-orange-500 dark:text-orange-400`}
            >
              {formatCOP(saldoPendiente)}
            </p>
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight className={styles.card.arrowIcon} />
      </motion.div>
    </Link>
  )
}
