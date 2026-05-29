import { EstadoProyecto } from '../types'

// Array de estados para filtros (incluyendo "Todos")
export const ESTADOS_PROYECTO = [
  { value: undefined as unknown as EstadoProyecto, label: 'Todos' },
  { value: 'en_proceso' as EstadoProyecto, label: 'En Proceso' },
  { value: 'en_construccion' as EstadoProyecto, label: 'En Construcción' },
  { value: 'completado' as EstadoProyecto, label: 'Completado' },
]

// Colores por estado (simplificados)
export const ESTADO_COLORS: Record<EstadoProyecto, string> = {
  en_proceso:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
  completado:
    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800',
  // Mantener compatibilidad con estados antiguos (migración)
  en_planificacion:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
  en_construccion:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
  pausado:
    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-200 dark:border-gray-800',
}

// Labels de estado (simplificados)
export const ESTADO_LABELS: Record<EstadoProyecto, string> = {
  en_proceso: 'En Proceso',
  completado: 'Completado',
  // Compatibilidad
  en_planificacion: 'En Proceso',
  en_construccion: 'En Proceso',
  pausado: 'En Proceso',
}

// Iconos por estado (simplificados)
export const ESTADO_ICONS: Record<EstadoProyecto, string> = {
  en_proceso: '🏗️',
  completado: '✅',
  // Compatibilidad
  en_planificacion: '🏗️',
  en_construccion: '🏗️',
  pausado: '🏗️',
}

// Valores por defecto para proyectos
export const PROYECTO_DEFAULTS = {
  presupuesto: 100000,
  diasEstimados: 365,
  responsable: 'Constructora RyR',
  telefono: '+57 123 456 7890',
  email: 'info@ryrconstrucora.com',
  precioBaseVivienda: 80000000,
  superficiePorVivienda: 120,
}

// Límites y validaciones
export const PROYECTO_LIMITES = {
  nombreMin: 3,
  nombreMax: 100,
  descripcionMin: 10,
  descripcionMax: 500,
  ubicacionMin: 5,
  ubicacionMax: 200,
  manzanasMin: 1,
  manzanasMax: 26,
  viviendasMin: 1,
  viviendasMax: 100,
}

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.6,
  },
  spring: {
    stiffness: 400,
    damping: 25,
  },
  transition: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 12,
  },
}

// Configuración de paginación
export const PAGINATION_CONFIG = {
  itemsPerPage: 12,
  maxVisiblePages: 5,
}
