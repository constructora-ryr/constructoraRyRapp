'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  DollarSign,
  Edit2,
  Home,
  MapPin,
  MoreVertical,
  Trash2,
  UserPlus,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import type { Vivienda } from '@/modules/viviendas/types'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { formatCurrency } from '@/shared/utils'

import { EstadoBadge } from './EstadoBadge'

interface ViviendaHeaderProps {
  vivienda: Vivienda
  onEditar: () => void
  onEliminar: () => void
  onAsignarCliente: () => void
}

/**
 * Header principal de la vista de detalle de vivienda
 * Muestra información crítica con jerarquía visual clara
 */
export function ViviendaHeader({
  vivienda,
  onEditar,
  onEliminar,
  onAsignarCliente,
}: ViviendaHeaderProps) {
  const router = useRouter()
  const proyectoNombre = vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'
  const manzanaNombre = vivienda.manzanas?.nombre || '?'

  return (
    <>
      {/* Botón Volver */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button variant='ghost' onClick={() => router.back()} className='group'>
          <ArrowLeft className='mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1' />
          Volver
        </Button>
      </motion.div>

      {/* Header Hero con Gradiente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-6 shadow-2xl shadow-orange-500/20 dark:from-orange-700 dark:via-amber-700 dark:to-yellow-800'
      >
        {/* Pattern overlay */}
        <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />

        {/* Content con z-index superior */}
        <div className='relative z-10'>
          {/* Breadcrumb */}
          <div className='mb-4 flex items-center gap-2 text-sm text-orange-100 dark:text-orange-200'>
            <button
              onClick={() => router.push('/viviendas')}
              className='flex items-center gap-1 transition-colors hover:text-white'
            >
              <Home className='h-4 w-4' />
              <span>Viviendas</span>
            </button>
            <ChevronRight className='h-4 w-4' />
            <span className='font-medium text-white'>
              Manzana {manzanaNombre} - Casa {vivienda.numero}
            </span>
          </div>

          {/* Layout Principal */}
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              {/* NIVEL 1: Título HERO - 30px Bold */}
              <h1 className='mb-3 text-3xl font-bold text-white'>
                Manzana {manzanaNombre} - Casa {vivienda.numero}
              </h1>

              {/* NIVEL 2: Datos CRÍTICOS - 18px Semibold, Horizontal */}
              <div className='mb-4 flex flex-wrap items-center gap-6'>
                {/* Valor Total */}
                <div className='flex items-center gap-2'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
                    <DollarSign className='h-5 w-5 flex-shrink-0 text-white' />
                  </div>
                  <div>
                    <p className='text-xs text-orange-100 dark:text-orange-200'>
                      Valor Total
                    </p>
                    <p className='text-lg font-semibold text-white'>
                      {formatCurrency(
                        vivienda.valor_negociado || vivienda.valor_total
                      )}
                    </p>
                  </div>
                </div>

                {/* Área Total */}
                <div className='flex items-center gap-2'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
                    <Building2 className='h-5 w-5 flex-shrink-0 text-white' />
                  </div>
                  <div>
                    <p className='text-xs text-orange-100 dark:text-orange-200'>
                      Área Total
                    </p>
                    <p className='text-lg font-semibold text-white'>
                      {vivienda.area_construida || 'N/A'} m²
                    </p>
                  </div>
                </div>

                {/* Proyecto/Ubicación */}
                <div className='flex items-center gap-2'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
                    <MapPin className='h-5 w-5 flex-shrink-0 text-white' />
                  </div>
                  <div>
                    <p className='text-xs text-orange-100 dark:text-orange-200'>
                      Proyecto
                    </p>
                    <p className='text-lg font-semibold text-white'>
                      {proyectoNombre}
                    </p>
                  </div>
                </div>
              </div>

              {/* NIVEL 3: Badges de Estado */}
              <div className='flex flex-wrap items-center gap-2'>
                <EstadoBadge estado={vivienda.estado} />
                <span className='inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md'>
                  {vivienda.tipo_vivienda || 'Regular'}
                </span>
                {vivienda.es_esquinera && (
                  <span className='inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md'>
                    🏘️ Esquinera
                  </span>
                )}
              </div>
            </div>

            {/* Acciones - Arriba a la derecha */}
            <div className='ml-6 flex items-start gap-2'>
              {/* CTA Principal (si aplica) */}
              {vivienda.estado === 'Disponible' && (
                <motion.button
                  onClick={onAsignarCliente}
                  className='inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30'
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserPlus className='h-4 w-4' />
                  <span>Asignar Cliente</span>
                </motion.button>
              )}

              {/* Menú de Acciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='inline-flex items-center rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-white backdrop-blur-md transition-all hover:bg-white/30'>
                    <MoreVertical className='h-4 w-4' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={onEditar}>
                    <Edit2 className='mr-2 h-4 w-4' />
                    Editar Vivienda
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onEliminar}
                    className='text-red-600 dark:text-red-400'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
