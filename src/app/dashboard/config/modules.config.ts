import type { ElementType } from 'react'

import {
  Building2,
  CreditCard,
  FileX,
  Home,
  Settings,
  Users,
} from 'lucide-react'

import type { Modulo } from '@/modules/usuarios/types'

export interface ModuleConfig {
  title: string
  description: string
  href: string
  icon: ElementType
  modulo: Modulo
  glowColor: string
  iconColor: string
  iconBgColor: string
}

export const MODULES_CONFIG: ModuleConfig[] = [
  {
    title: 'Proyectos',
    description: 'Desarrollos inmobiliarios y obras en ejecución',
    href: '/proyectos',
    icon: Building2,
    modulo: 'proyectos',
    glowColor:
      'hover:border-emerald-400 hover:shadow-[0_8px_30px_-5px_rgba(16,185,129,0.15)] dark:group-hover:border-emerald-500/50 dark:group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBgColor:
      'bg-emerald-100 dark:bg-emerald-500/10 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20',
  },
  {
    title: 'Viviendas',
    description: 'Inventario de unidades y estado de cada lote',
    href: '/viviendas',
    icon: Home,
    modulo: 'viviendas',
    glowColor:
      'hover:border-orange-400 hover:shadow-[0_8px_30px_-5px_rgba(249,115,22,0.15)] dark:group-hover:border-orange-500/50 dark:group-hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]',
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBgColor:
      'bg-orange-100 dark:bg-orange-500/10 group-hover:bg-orange-200 dark:group-hover:bg-orange-500/20',
  },
  {
    title: 'Clientes',
    description: 'Base de prospectos y compradores activos',
    href: '/clientes',
    icon: Users,
    modulo: 'clientes',
    glowColor:
      'hover:border-cyan-400 hover:shadow-[0_8px_30px_-5px_rgba(6,182,212,0.15)] dark:group-hover:border-cyan-500/50 dark:group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    iconBgColor:
      'bg-cyan-100 dark:bg-cyan-500/10 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/20',
  },
  {
    title: 'Abonos',
    description: 'Registro y seguimiento de pagos recibidos',
    href: '/abonos',
    icon: CreditCard,
    modulo: 'abonos',
    glowColor:
      'hover:border-violet-400 hover:shadow-[0_8px_30px_-5px_rgba(139,92,246,0.15)] dark:group-hover:border-violet-500/50 dark:group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]',
    iconColor: 'text-violet-600 dark:text-violet-400',
    iconBgColor:
      'bg-violet-100 dark:bg-violet-500/10 group-hover:bg-violet-200 dark:group-hover:bg-violet-500/20',
  },
  {
    title: 'Renuncias',
    description: 'Cancelaciones y devoluciones de negociaciones',
    href: '/renuncias',
    icon: FileX,
    modulo: 'renuncias',
    glowColor:
      'hover:border-rose-400 hover:shadow-[0_8px_30px_-5px_rgba(244,63,94,0.15)] dark:group-hover:border-rose-500/50 dark:group-hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]',
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBgColor:
      'bg-rose-100 dark:bg-rose-500/10 group-hover:bg-rose-200 dark:group-hover:bg-rose-500/20',
  },
  {
    title: 'Usuarios',
    description: 'Control de accesos, roles y permisos del sistema',
    href: '/usuarios',
    icon: Settings,
    modulo: 'usuarios',
    glowColor:
      'hover:border-indigo-400 hover:shadow-[0_8px_30px_-5px_rgba(99,102,241,0.15)] dark:group-hover:border-indigo-500/50 dark:group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBgColor:
      'bg-indigo-100 dark:bg-indigo-500/10 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/20',
  },
]
