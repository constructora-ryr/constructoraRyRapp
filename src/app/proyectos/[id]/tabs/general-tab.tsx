'use client'

import { motion } from 'framer-motion'
import { Calendar, FileText, Home, MapPin, TrendingUp } from 'lucide-react'

import type { Proyecto } from '@/modules/proyectos/types'
import { formatDate } from '@/shared/utils/format'
import { cn } from '@/shared/utils/helpers'

import * as styles from '../proyecto-detalle.styles'

interface GeneralTabProps {
  proyecto: Proyecto
}

export function GeneralTab({ proyecto }: GeneralTabProps) {
  const totalCreadas = proyecto.manzanas.reduce(
    (acc, m) => acc + (m.viviendasCreadas ?? m.totalViviendas ?? 0),
    0
  )
  const totalDisponibles = proyecto.manzanas.reduce(
    (acc, m) => acc + (m.viviendasDisponibles ?? 0),
    0
  )
  const totalAsignadas = proyecto.manzanas.reduce(
    (acc, m) => acc + (m.viviendasAsignadas ?? 0),
    0
  )
  const totalVendidas = proyecto.manzanas.reduce(
    (acc, m) => acc + (m.viviendasVendidas ?? 0),
    0
  )
  const porcentajeVentas =
    totalCreadas > 0 ? Math.round((totalVendidas / totalCreadas) * 100) : 0

  return (
    <motion.div
      key='info'
      {...styles.animations.fadeInUp}
      className='space-y-3'
    >
      {/* Barra de Progreso Mejorada */}
      <motion.div
        {...styles.animations.fadeInUp}
        transition={{ delay: 0.1 }}
        className={styles.progressClasses.container}
      >
        <div className={styles.progressClasses.header}>
          <div className={styles.progressClasses.leftSection}>
            <div className={styles.progressClasses.iconContainer}>
              <TrendingUp className={styles.progressClasses.icon} />
            </div>
            <div className={styles.progressClasses.titleSection}>
              <p className={styles.progressClasses.title}>Progreso de Ventas</p>
              <p className={styles.progressClasses.subtitle}>
                Calculado según viviendas vendidas
              </p>
            </div>
          </div>
          <div className={styles.progressClasses.rightSection}>
            <p className={styles.progressClasses.percentage}>
              {porcentajeVentas}%
            </p>
            <p className={styles.progressClasses.percentageLabel}>Vendidas</p>
          </div>
        </div>

        {/* Barra con gradiente animado */}
        <div className={styles.progressClasses.bar}>
          <motion.div
            className={styles.progressClasses.barFill}
            initial={{ width: 0 }}
            animate={{ width: `${porcentajeVentas}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.1 }}
          >
            <div
              className={`${styles.progressClasses.shimmer} animate-shimmer`}
            ></div>
          </motion.div>
        </div>

        {/* Milestones */}
        <div className={styles.progressClasses.milestones}>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>
              {totalCreadas}
            </div>
            <div className={styles.progressClasses.milestoneLabel}>Creadas</div>
          </div>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>
              {totalDisponibles}
            </div>
            <div className={styles.progressClasses.milestoneLabel}>
              Disponibles
            </div>
          </div>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>
              {totalAsignadas}
            </div>
            <div className={styles.progressClasses.milestoneLabel}>
              Asignadas
            </div>
          </div>
          <div className={styles.progressClasses.milestone}>
            <div className={styles.progressClasses.milestoneValue}>
              {totalVendidas}
            </div>
            <div className={styles.progressClasses.milestoneLabel}>
              Vendidas
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cards de Información */}
      <div className='grid gap-3 lg:grid-cols-3'>
        {/* Descripción */}
        <motion.div
          {...styles.animations.fadeInLeft}
          className={styles.infoCardClasses.card}
        >
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.descripcion}`}
            >
              <FileText className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>
              Descripción del Proyecto
            </h3>
          </div>
          <div className={styles.infoCardClasses.content}>
            <p>{proyecto.descripcion}</p>
          </div>
        </motion.div>

        {/* Ubicación */}
        <motion.div
          {...styles.animations.fadeInLeft}
          transition={{ delay: 0.1 }}
          className={styles.infoCardClasses.card}
        >
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.ubicacion}`}
            >
              <MapPin className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>Ubicación</h3>
          </div>
          <div className={styles.infoCardClasses.content}>
            <div className={styles.infoCardClasses.row}>
              <MapPin className={styles.infoCardClasses.rowIcon} />
              <span>{proyecto.ubicacion}</span>
            </div>
          </div>
        </motion.div>

        {/* Cronograma */}
        <motion.div
          {...styles.animations.fadeInLeft}
          transition={{ delay: 0.2 }}
          className={styles.infoCardClasses.card}
        >
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.cronograma}`}
            >
              <Calendar className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>Cronograma</h3>
          </div>
          <div className={styles.infoCardClasses.content}>
            <div>
              <p className={styles.infoCardClasses.label}>Fecha de Inicio</p>
              <p className={styles.infoCardClasses.value}>
                {proyecto.fechaInicio
                  ? formatDate(proyecto.fechaInicio)
                  : 'No especificado'}
              </p>
            </div>
            <div className='mt-2'>
              <p className={styles.infoCardClasses.label}>
                Fecha de Finalización Estimada
              </p>
              <p className={styles.infoCardClasses.value}>
                {proyecto.fechaFinEstimada
                  ? formatDate(proyecto.fechaFinEstimada)
                  : 'No especificado'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Grid de Manzanas - Adaptativo según cantidad */}
      <div
        className={cn(
          'grid gap-3',
          // 1 manzana: Ocupa todo el ancho disponible
          proyecto.manzanas.length === 1 && 'grid-cols-1',
          // 2 manzanas: 2 columnas
          proyecto.manzanas.length === 2 && 'grid-cols-1 sm:grid-cols-2',
          // 3 manzanas: 3 columnas
          proyecto.manzanas.length === 3 &&
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          // 4 manzanas: 4 columnas en línea
          proyecto.manzanas.length === 4 &&
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          // 5 manzanas: 5 columnas en línea
          proyecto.manzanas.length === 5 &&
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
          // 6 manzanas: 2 filas de 3 (3+3)
          proyecto.manzanas.length === 6 &&
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          // 7-8 manzanas: 2 filas de 4 (4+3 o 4+4)
          (proyecto.manzanas.length === 7 || proyecto.manzanas.length === 8) &&
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
          // 9+ manzanas: Grid flexible de 3-5 columnas
          proyecto.manzanas.length >= 9 &&
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        )}
      >
        {proyecto.manzanas.map((manzana, index) => {
          const creadas = manzana.viviendasCreadas ?? 0
          const disponibles = manzana.viviendasDisponibles ?? 0
          const asignadas = manzana.viviendasAsignadas ?? 0
          const vendidas = manzana.viviendasVendidas ?? 0
          const porcentajeVendido =
            creadas > 0 ? Math.round((vendidas / creadas) * 100) : 0

          return (
            <motion.div
              key={manzana.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className='group relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 p-3 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80'
            >
              <div className='absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

              <div className='relative z-10'>
                {/* Header compacto */}
                <div className='mb-2 flex items-center gap-2'>
                  <div className='rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 shadow-lg shadow-green-500/50'>
                    <Home className='h-3.5 w-3.5 text-white' />
                  </div>
                  <h3 className='flex-1 truncate text-sm font-semibold text-gray-900 dark:text-white'>
                    Manzana {manzana.nombre}
                  </h3>
                </div>

                {/* Estadísticas de Viviendas - Compactas */}
                <div className='space-y-1.5 text-xs'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Creadas
                    </span>
                    <span className='font-bold text-gray-900 dark:text-white'>
                      {creadas}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Disponibles
                    </span>
                    <span className='font-medium text-blue-600 dark:text-blue-400'>
                      {disponibles}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Asignadas
                    </span>
                    <span className='font-medium text-orange-600 dark:text-orange-400'>
                      {asignadas}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Vendidas
                    </span>
                    <span className='font-medium text-green-600 dark:text-green-400'>
                      {vendidas}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso de ventas - Compacta */}
                <div className='mt-2'>
                  <div className='mb-1 flex justify-between text-[10px] text-gray-600 dark:text-gray-400'>
                    <span>Progreso</span>
                    <span className='font-semibold'>{porcentajeVendido}%</span>
                  </div>
                  <div className='h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentajeVendido}%` }}
                      transition={{
                        duration: 1,
                        ease: 'easeOut',
                        delay: index * 0.1 + 0.3,
                      }}
                      className='h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300'
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
