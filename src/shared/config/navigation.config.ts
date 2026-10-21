/**
 * ============================================
 * CONFIGURACIÓN: Navegación de la Aplicación
 * ============================================
 *
 * Define la estructura de navegación del sidebar.
 * Centraliza rutas, íconos, permisos y estilos.
 *
 * VENTAJAS:
 * - ✅ Configuración centralizada
 * - ✅ Fácil agregar/quitar módulos
 * - ✅ Reutilizable en móvil, breadcrumbs, etc.
 * - ✅ Testeable independientemente
 * - ✅ Type-safe con TypeScript
 */

import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  FileX,
  Home,
  LayoutList,
  Plus,
  Shield,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react'

import type { Accion, Modulo } from '@/modules/usuarios/types'

// ============================================
// CONSTANTS
// ============================================

export const PAPELERA_NAV_NAME = 'Papelera'

// ============================================
// TYPES
// ============================================

export interface NavigationSubItem {
  name: string
  href: string
  icon: LucideIcon
  description: string
  requiredPermission?: {
    modulo: Modulo
    accion: Accion
  }
}

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  color: string
  /** Fondo suave + color del ícono cuando el módulo no está activo */
  tint: string
  description: string
  /** Permiso requerido para ver este item */
  requiredPermission?: {
    modulo: Modulo
    accion: Accion
  }
  /** Solo visible para administradores */
  adminOnly?: boolean
  /** Sub-items desplegables en el sidebar */
  children?: NavigationSubItem[]
}

export interface NavigationGroup {
  title: string
  items: NavigationItem[]
}

// ============================================
// CONFIGURACIÓN DE NAVEGACIÓN
// ============================================

/**
 * Grupos de navegación del sidebar
 * Organizados por categorías lógicas
 */
export const navigationGroups: NavigationGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: BarChart3,
        color: 'from-blue-500 to-indigo-600',
        tint: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        description: 'Panel principal',
        // Dashboard no requiere permiso (accesible para todos)
      },
      {
        name: 'Proyectos',
        href: '/proyectos',
        icon: Building2,
        color: 'from-green-500 to-emerald-600',
        tint: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
        description: 'Gestión de proyectos',
        requiredPermission: { modulo: 'proyectos', accion: 'ver' },
        children: [
          {
            name: 'Nuevo Proyecto',
            href: '/proyectos/nuevo',
            icon: Plus,
            description: 'Crear proyecto',
            requiredPermission: { modulo: 'proyectos', accion: 'crear' },
          },
          {
            name: 'Ver Proyectos',
            href: '/proyectos',
            icon: LayoutList,
            description: 'Lista de proyectos',
            requiredPermission: { modulo: 'proyectos', accion: 'ver' },
          },
        ],
      },
      {
        name: 'Viviendas',
        href: '/viviendas',
        icon: Home,
        color: 'from-orange-500 to-amber-500',
        tint: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
        description: 'Administrar viviendas',
        requiredPermission: { modulo: 'viviendas', accion: 'ver' },
        children: [
          {
            name: 'Nueva Vivienda',
            href: '/viviendas/nueva',
            icon: Plus,
            description: 'Registrar vivienda',
            requiredPermission: { modulo: 'viviendas', accion: 'crear' },
          },
          {
            name: 'Ver Viviendas',
            href: '/viviendas',
            icon: LayoutList,
            description: 'Lista de viviendas',
            requiredPermission: { modulo: 'viviendas', accion: 'ver' },
          },
        ],
      },
    ],
  },
  {
    title: 'Clientes',
    items: [
      {
        name: 'Clientes',
        href: '/clientes',
        icon: Users,
        color: 'from-cyan-500 to-blue-600',
        tint: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
        description: 'Base de clientes',
        requiredPermission: { modulo: 'clientes', accion: 'ver' },
        children: [
          {
            name: 'Nuevo Cliente',
            href: '/clientes/nuevo',
            icon: Plus,
            description: 'Registrar cliente',
            requiredPermission: { modulo: 'clientes', accion: 'crear' },
          },
          {
            name: 'Ver Clientes',
            href: '/clientes',
            icon: LayoutList,
            description: 'Lista de clientes',
            requiredPermission: { modulo: 'clientes', accion: 'ver' },
          },
        ],
      },
      {
        name: 'Abonos',
        href: '/abonos',
        icon: CreditCard,
        color: 'from-violet-500 to-fuchsia-600',
        tint: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
        description: 'Gestión de pagos',
        requiredPermission: { modulo: 'abonos', accion: 'ver' },
        children: [
          {
            name: 'Registrar Abono',
            href: '/abonos/registrar',
            icon: Plus,
            description: 'Nuevo pago',
            requiredPermission: { modulo: 'abonos', accion: 'registrar' },
          },
          {
            name: 'Ver Abonos',
            href: '/abonos',
            icon: LayoutList,
            description: 'Historial de abonos',
            requiredPermission: { modulo: 'abonos', accion: 'ver' },
          },
        ],
      },
      {
        name: 'Renuncias',
        href: '/renuncias',
        icon: FileX,
        color: 'from-rose-500 to-red-600',
        tint: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        description: 'Cancelaciones',
        requiredPermission: { modulo: 'renuncias', accion: 'ver' },
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        name: 'Usuarios',
        href: '/usuarios',
        icon: UserCog,
        color: 'from-indigo-500 to-sky-500',
        tint: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
        description: 'Gestión de usuarios',
        requiredPermission: { modulo: 'usuarios', accion: 'ver' },
      },
      {
        name: 'Auditorías',
        href: '/auditorias',
        icon: Activity,
        color: 'from-teal-500 to-cyan-600',
        tint: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
        description: 'Registro de actividad',
        requiredPermission: { modulo: 'auditorias', accion: 'ver' },
      },
      {
        name: 'Papelera',
        href: '/documentos/eliminados',
        icon: Trash2,
        color: 'from-red-500 to-rose-600',
        tint: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
        description: 'Documentos eliminados',
        adminOnly: true,
      },
      {
        name: 'Administración',
        href: '/admin',
        icon: Shield,
        color: 'from-slate-600 to-slate-800',
        tint: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
        description: 'Panel admin',
        requiredPermission: { modulo: 'administracion', accion: 'ver' },
      },
      {
        name: 'Reportes',
        href: '/reportes',
        icon: FileText,
        color: 'from-sky-500 to-blue-600',
        tint: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
        description: 'Informes y análisis',
        requiredPermission: { modulo: 'reportes', accion: 'ver' },
      },
    ],
  },
]
