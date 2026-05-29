/**
 * ViviendaCardPagada - Card para viviendas con pago completo
 * Componente presentacional puro
 */

import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  FileCheck,
  FileSignature,
  FileText,
  Home,
  MapPin,
  Phone,
  User,
} from 'lucide-react'

import { ProgressBar } from '@/shared/components/ui'
import { formatArea, formatCurrency, formatDate } from '@/shared/utils'

import { viviendaCardExtendedStyles as styles } from '../../styles'
import type { Vivienda } from '../../types'

interface ViviendaCardPagadaProps {
  vivienda: Vivienda
  onVerAbonos?: () => void
  onGenerarEscritura?: () => void
  onEditar?: () => void
}

export function ViviendaCardPagada({
  vivienda,
  onVerAbonos,
  onGenerarEscritura,
  onEditar: _onEditar,
}: ViviendaCardPagadaProps) {
  const proyectoNombre = vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'
  const manzanaNombre = vivienda.manzanas?.nombre || '?'
  const cliente = vivienda.clientes

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* HEADER */}
      <div className={`${styles.header.base} ${styles.header.pagada}`}>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className={styles.headerTitle}>
              <Home className='h-5 w-5' />
              Manzana {manzanaNombre} Casa {vivienda.numero}
            </h3>
            <p className={styles.headerSubtitle}>
              <MapPin className='h-4 w-4' />
              {proyectoNombre}
            </p>
          </div>
          <span className={styles.estadoBadge.base}>✅ Saldada</span>
        </div>
      </div>

      {/* BODY - 2 COLUMNAS */}
      <div className={styles.body}>
        {/* SECCIÓN PROPIETARIO - FULL WIDTH */}
        <div
          className={`${styles.clienteSection.container} !border-emerald-200 !from-emerald-50 !to-green-50 dark:!border-emerald-700 dark:!from-emerald-900/20 dark:!to-green-900/20`}
        >
          <div className={styles.clienteSection.nombre}>
            <User className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
            {cliente?.nombre_completo || 'Propietario'}
          </div>
          <div className='mt-2 flex flex-wrap gap-3'>
            {cliente?.telefono && (
              <span className={styles.clienteSection.info}>
                <Phone className='h-4 w-4' />
                {cliente.telefono}
              </span>
            )}
            {vivienda.fecha_asignacion && (
              <span className={styles.clienteSection.info}>
                <Calendar className='h-4 w-4' />
                Asignada: {formatDate(vivienda.fecha_asignacion)}
              </span>
            )}
            {vivienda.fecha_pago_completo && (
              <span
                className={`${styles.clienteSection.info} font-semibold !text-emerald-700 dark:!text-emerald-300`}
              >
                <CheckCircle2 className='h-4 w-4' />
                Saldada: {formatDate(vivienda.fecha_pago_completo)}
              </span>
            )}
          </div>
        </div>

        {/* GRID 2 COLUMNAS */}
        <div className={styles.twoColumnGrid}>
          {/* COLUMNA 1: INFORMACIÓN BÁSICA */}
          <div className={styles.section.base}>
            <h4 className={styles.section.title}>
              <FileText className='h-4 w-4' />
              Detalles Técnicos
            </h4>
            <div className={styles.section.content}>
              {/* Tipo + Esquinera */}
              <div className='flex flex-wrap items-center gap-2'>
                <span
                  className={` ${styles.badge.base} ${
                    vivienda.tipo_vivienda === 'Irregular'
                      ? styles.badge.irregular
                      : styles.badge.regular
                  } `}
                >
                  {vivienda.tipo_vivienda || 'Regular'}
                </span>
                {vivienda.es_esquinera && (
                  <span
                    className={`${styles.badge.base} ${styles.badge.esquinera}`}
                  >
                    🏘️ Esquinera
                  </span>
                )}
              </div>

              {/* Matrícula */}
              {vivienda.matricula_inmobiliaria && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Matrícula:</span>
                  <span className={styles.infoValue}>
                    {vivienda.matricula_inmobiliaria}
                  </span>
                </div>
              )}

              {/* Nomenclatura */}
              {vivienda.nomenclatura && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Nomenclatura:</span>
                  <span className={styles.infoValue}>
                    {vivienda.nomenclatura}
                  </span>
                </div>
              )}

              {/* Áreas */}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Áreas:</span>
                <span className={styles.infoValue}>
                  {formatArea(vivienda.area_construida)}
                  {' / '}
                  {formatArea(vivienda.area_lote)}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: CONFIRMACIÓN DE PAGO */}
          <div className={styles.financialSection.container}>
            <div className={styles.pagadaConfirmation}>
              <div className={styles.pagadaIcon}>
                <CheckCircle2 className='h-6 w-6 text-white' />
              </div>
              <p className={styles.pagadaText}>SALDADA AL 100%</p>
              <p className='mt-1 text-sm text-white/90'>
                {formatCurrency(vivienda.valor_total)}
              </p>
            </div>

            {/* Barra de progreso completa */}
            <div className='mt-3'>
              <ProgressBar
                porcentaje={100}
                height='lg'
                variant='success'
                showPercentage={false}
              />
            </div>

            {/* Info adicional */}
            {vivienda.cantidad_abonos && vivienda.cantidad_abonos > 0 && (
              <p className='mt-2 text-center text-xs text-gray-600 dark:text-gray-400'>
                Saldada en {vivienda.cantidad_abonos} abono
                {vivienda.cantidad_abonos > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER - ACCIONES */}
      <div className={styles.footer}>
        <div className={styles.actionGroup}>
          {onVerAbonos && (
            <button
              onClick={onVerAbonos}
              className={styles.actionButton.secondary}
            >
              <FileCheck className='h-4 w-4' />
              Ver Abonos ({vivienda.cantidad_abonos || 0})
            </button>
          )}
          {onGenerarEscritura && (
            <button
              onClick={onGenerarEscritura}
              className={styles.actionButton.primary}
            >
              <FileSignature className='h-4 w-4' />
              Generar Escritura
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
