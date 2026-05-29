/**
 * ViviendaCardEntregada - Card completa con TODA la información
 * Muestra: Cliente, Proyecto, Información Legal, Estado 100% Pagada
 */

import { motion } from 'framer-motion'
import {
  Home,
  MapPin,
  Building2,
  User,
  Phone,
  Calendar,
  Hash,
  MapPinned,
  Edit,
  Eye,
  FileCheck,
  CheckCircle2,
} from 'lucide-react'

import { formatCurrency, formatDate } from '@/shared/utils'

import type { Vivienda } from '../../types'

interface ViviendaCardEntregadaProps {
  vivienda: Vivienda
  onVerDetalle?: () => void
  onVerAbonos?: () => void
  onEditar?: () => void
}

export function ViviendaCardEntregada({
  vivienda,
  onVerDetalle,
  onVerAbonos,
  onEditar,
}: ViviendaCardEntregadaProps) {
  const proyectoNombre = vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'
  const manzanaNombre = vivienda.manzanas?.nombre || '?'
  const cliente = vivienda.clientes

  return (
    <motion.div
      className='group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 dark:border-gray-700/50 dark:bg-gray-800/80'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Efecto de brillo sutil */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-green-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

      {/* HEADER */}
      <div className='relative z-10 p-5'>
        {/* Botones de acción (superior derecho) */}
        <div className='mb-3 flex items-start justify-end gap-1.5'>
          {onVerDetalle && (
            <button
              onClick={onVerDetalle}
              className='rounded-lg p-2 text-gray-600 transition-all hover:bg-purple-100 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-400'
              title='Ver detalle'
            >
              <Eye className='h-4 w-4' />
            </button>
          )}
          {onEditar && (
            <button
              onClick={onEditar}
              className='rounded-lg p-2 text-gray-600 transition-all hover:bg-purple-100 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-400'
              title='Editar'
            >
              <Edit className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* Icono + Título principal */}
        <div className='mb-3 flex items-start gap-4'>
          <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg'>
            <Home className='h-6 w-6 text-white' />
          </div>
          <div className='min-w-0 flex-1'>
            <h3 className='mb-1 truncate text-lg font-bold text-gray-900 dark:text-white'>
              Manzana {manzanaNombre} Casa {vivienda.numero}
            </h3>
            <p className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400'>
              <Building2 className='h-3.5 w-3.5' />
              {proyectoNombre}
            </p>
          </div>
          {/* Badge Estado Escriturada */}
          <span className='inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-2.5 py-1 text-xs font-bold text-white shadow-md shadow-violet-500/30'>
            <CheckCircle2 className='h-4 w-4' />
            ESCRITURADA
          </span>
        </div>

        {/* SECCIÓN: Cliente */}
        <div className='mb-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-4 dark:border-purple-700 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20'>
          <div className='mb-3 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg'>
              <User className='h-5 w-5 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <h4 className='truncate text-base font-black text-purple-900 dark:text-purple-100'>
                {cliente?.nombre_completo || 'Cliente no asignado'}
              </h4>
            </div>
          </div>
          <div className='flex flex-wrap gap-3'>
            {cliente?.telefono && (
              <div className='flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-3 py-1.5 dark:border-purple-700 dark:bg-gray-800'>
                <Phone className='h-3.5 w-3.5 text-purple-600 dark:text-purple-400' />
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
                  {cliente.telefono}
                </span>
              </div>
            )}
            {vivienda.fecha_entrega && (
              <div className='flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-3 py-1.5 dark:border-purple-700 dark:bg-gray-800'>
                <Calendar className='h-3.5 w-3.5 text-purple-600 dark:text-purple-400' />
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
                  {formatDate(vivienda.fecha_entrega)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN: Información Técnica (si existe) */}
        {(vivienda.matricula_inmobiliaria || vivienda.nomenclatura) && (
          <div className='mb-4 rounded-xl border-2 border-slate-200/50 bg-gradient-to-br from-slate-50 to-gray-50 p-4 dark:border-slate-700/50 dark:from-slate-900/20 dark:to-gray-900/20'>
            <div className='mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300'>
              <MapPin className='h-4 w-4' />
              Información Legal
            </div>
            <div className='grid grid-cols-2 gap-3'>
              {vivienda.matricula_inmobiliaria && (
                <div className='flex items-center gap-2'>
                  <div className='flex-shrink-0 rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/30'>
                    <Hash className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400'>
                      Matrícula
                    </p>
                    <p className='truncate font-mono text-xs font-bold text-gray-900 dark:text-white'>
                      {vivienda.matricula_inmobiliaria}
                    </p>
                  </div>
                </div>
              )}
              {vivienda.nomenclatura && (
                <div className='flex items-center gap-2'>
                  <div className='flex-shrink-0 rounded-lg bg-purple-100 p-1.5 dark:bg-purple-900/30'>
                    <MapPinned className='h-3.5 w-3.5 text-purple-600 dark:text-purple-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400'>
                      Nomenclatura
                    </p>
                    <p className='truncate text-xs font-bold text-gray-900 dark:text-white'>
                      {vivienda.nomenclatura}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN: Estado Completado */}
        <div className='mb-4 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 dark:border-green-700 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300'>
              <CheckCircle2 className='h-4 w-4' />
              Con Escritura
            </div>
          </div>

          {/* Estado de pago completo */}
          <div className='mb-3 rounded-lg border-2 border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 p-4 text-center dark:border-green-600 dark:from-green-900/30 dark:to-emerald-900/30'>
            <CheckCircle2 className='mx-auto mb-2 h-12 w-12 text-green-600 dark:text-green-400' />
            <p className='mb-1 text-sm font-black uppercase text-violet-700 dark:text-violet-300'>
              Con Escritura
            </p>
            <p className='text-xs font-semibold text-green-600 dark:text-green-400'>
              Completamente Cancelada
            </p>
          </div>

          {/* Valor total */}
          <div className='flex items-center justify-between rounded-lg border border-green-200 bg-white p-3 dark:border-green-700 dark:bg-gray-800'>
            <span className='text-xs font-semibold text-gray-600 dark:text-gray-300'>
              Valor Total:
            </span>
            <span className='text-base font-black text-gray-900 dark:text-white'>
              {formatCurrency(vivienda.valor_total)}
            </span>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className='flex items-center justify-between gap-2 border-t border-gray-200 pt-3 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            {onVerAbonos && (
              <button
                onClick={onVerAbonos}
                className='flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 transition-all hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
              >
                <FileCheck className='h-4 w-4' />
                Ver Abonos
              </button>
            )}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            <span className='inline-flex items-center gap-1.5'>
              <CheckCircle2 className='h-3.5 w-3.5 text-green-600 dark:text-green-400' />
              Proceso completado
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
