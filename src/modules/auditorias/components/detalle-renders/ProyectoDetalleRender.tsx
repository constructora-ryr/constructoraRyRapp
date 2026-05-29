/**
 * ProyectoDetalleRender - Renderizado de detalles de auditoría para módulo Proyectos
 *
 * ✅ Componente presentacional puro
 * ✅ < 150 líneas
 * ✅ Sin lógica compleja
 */

'use client'

import { motion } from 'framer-motion'
import { Building2, DollarSign, Home, MapPin, Phone, User } from 'lucide-react'

import { formatearDinero } from '../../utils/formatters'
import { InfoCard } from '../shared'

interface ProyectoDetalleRenderProps {
  metadata: Record<string, unknown>
}

interface ManzanaMeta {
  nombre?: string
  cantidad_viviendas?: number
  numero_viviendas?: number
}

export function ProyectoDetalleRender({
  metadata,
}: ProyectoDetalleRenderProps) {
  const get = (key: string, fallback = 'N/A'): string =>
    metadata[key] != null ? String(metadata[key]) : fallback

  const manzanas = (metadata.manzanas_detalle ?? []) as ManzanaMeta[]

  // Verificar si hay información adicional
  const hasAdditionalInfo =
    (metadata.proyecto_estado != null &&
      metadata.proyecto_estado !== 'en_planificacion') ||
    (metadata.proyecto_presupuesto != null &&
      Number(metadata.proyecto_presupuesto) > 0) ||
    (metadata.proyecto_responsable != null &&
      metadata.proyecto_responsable !== 'Constructora RyR') ||
    (metadata.proyecto_telefono != null &&
      metadata.proyecto_telefono !== '+57 300 000 0000') ||
    (metadata.proyecto_email != null &&
      metadata.proyecto_email !== 'info@ryrconstrucora.com')

  return (
    <div className='space-y-3'>
      {/* Header Principal */}
      <div className='rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-3 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30'>
        <div className='space-y-2'>
          {/* Nombre */}
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md'>
              <Building2 className='h-4 w-4 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <label className='block text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400'>
                Proyecto
              </label>
              <h3 className='truncate text-base font-bold text-gray-900 dark:text-white'>
                {get('proyecto_nombre')}
              </h3>
            </div>
          </div>

          {/* Ubicación */}
          <div className='flex items-center gap-2 border-t border-blue-200 pt-1.5 dark:border-blue-800'>
            <MapPin className='h-3.5 w-3.5 flex-shrink-0 text-red-500 dark:text-red-400' />
            <div className='min-w-0 flex-1'>
              <label className='text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Ubicación
              </label>
              <p className='truncate text-xs font-medium text-gray-900 dark:text-white'>
                {get('proyecto_ubicacion')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      {metadata.proyecto_descripcion != null && (
        <div className='space-y-1'>
          <label className='text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Descripción
          </label>
          <p className='line-clamp-2 rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs leading-snug text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300'>
            {get('proyecto_descripcion')}
          </p>
        </div>
      )}

      {/* Información Adicional */}
      {hasAdditionalInfo && (
        <div className='space-y-1.5'>
          <label className='text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Información Adicional
          </label>
          <div className='grid grid-cols-2 gap-2'>
            {metadata.proyecto_estado != null &&
              metadata.proyecto_estado !== 'en_planificacion' && (
                <div className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900/50'>
                  <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30'>
                    <span className='text-sm'>📊</span>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <label className='block text-[10px] text-gray-500 dark:text-gray-400'>
                      Estado
                    </label>
                    <span className='block truncate text-xs font-bold capitalize text-gray-900 dark:text-white'>
                      {get('proyecto_estado')}
                    </span>
                  </div>
                </div>
              )}

            {metadata.proyecto_presupuesto != null &&
              Number(metadata.proyecto_presupuesto) > 0 && (
                <InfoCard
                  icon={DollarSign}
                  label='Presupuesto'
                  value={
                    metadata.proyecto_presupuesto_formateado != null
                      ? get('proyecto_presupuesto_formateado')
                      : formatearDinero(Number(metadata.proyecto_presupuesto))
                  }
                  color='green'
                />
              )}

            {metadata.proyecto_responsable != null &&
              metadata.proyecto_responsable !== 'Constructora RyR' && (
                <InfoCard
                  icon={User}
                  label='Responsable'
                  value={get('proyecto_responsable')}
                  color='purple'
                />
              )}

            {metadata.proyecto_telefono != null &&
              metadata.proyecto_telefono !== '+57 300 000 0000' && (
                <InfoCard
                  icon={Phone}
                  label='Teléfono'
                  value={get('proyecto_telefono')}
                  color='cyan'
                />
              )}

            {metadata.proyecto_email != null &&
              metadata.proyecto_email !== 'info@ryrconstrucora.com' && (
                <div className='col-span-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900/50'>
                  <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-900/50'>
                    <span className='text-sm'>✉️</span>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <label className='block text-[10px] text-gray-500 dark:text-gray-400'>
                      Email
                    </label>
                    <span className='block truncate text-xs font-bold text-gray-900 dark:text-white'>
                      {get('proyecto_email')}
                    </span>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Manzanas */}
      {manzanas.length > 0 && (
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <label className='text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Manzanas
            </label>
            <div className='flex items-center gap-1.5'>
              <span className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                <Building2 className='h-3 w-3' />
                {metadata.total_manzanas != null
                  ? String(metadata.total_manzanas)
                  : manzanas.length}
              </span>
              <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                <Home className='h-3 w-3' />
                {metadata.total_viviendas_planificadas != null
                  ? String(metadata.total_viviendas_planificadas)
                  : 0}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
            {manzanas.map((manzana, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className='group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-2 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-900'
              >
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100' />
                <div className='relative z-10'>
                  <div className='mb-1.5 flex items-center justify-between'>
                    <h4 className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                      Mz. {String(manzana.nombre ?? '')}
                    </h4>
                    <span className='flex-shrink-0 text-base'>🏘️</span>
                  </div>
                  <div className='flex items-center justify-between rounded bg-white/50 px-1.5 py-1 dark:bg-gray-950/50'>
                    <span className='text-[10px] text-gray-600 dark:text-gray-400'>
                      Viviendas
                    </span>
                    <span className='text-sm font-bold text-blue-600 dark:text-blue-400'>
                      {manzana.numero_viviendas || 0}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
