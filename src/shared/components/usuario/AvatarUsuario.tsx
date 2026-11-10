/**
 * Avatar de una persona del equipo (quien subió, editó o registró algo).
 * El color sale de su ROL, igual que en Usuarios y en la barra lateral:
 * Administrador rojo, Gerencia violeta, Contabilidad celeste, Admin de obra
 * ámbar. Sin rol conocido (el sistema, usuarios antiguos) queda en gris.
 *
 * Los clientes no usan este avatar: tienen el suyo en cada módulo.
 */

import type { ReactNode } from 'react'

import { ROL_VISUAL } from '@/modules/usuarios/config/usuarios-visual'
import type { Rol } from '@/modules/usuarios/types'
import { cn } from '@/shared/utils/helpers'

const TAMANOS = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-sm',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-[4.5rem] w-[4.5rem] text-xl font-black shadow-lg',
} as const

const SIN_ROL = 'from-slate-400 to-slate-600'

/** "Nicolás Rodriguez" → "NR"; "ana@ryr.com" → "AR" */
export function inicialesDe(nombre: string): string {
  return (
    nombre
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase())
      .join('') || '?'
  )
}

/** Degradado del rol (bg-gradient-to-br + estas clases) */
export function degradadoRol(rol?: string | null): string {
  return (rol && ROL_VISUAL[rol as Rol]?.gradient) || SIN_ROL
}

interface AvatarUsuarioProps {
  nombre: string
  rol?: string | null
  /**
   * Si se tienen nombres y apellidos por separado: primera letra de cada uno
   * ("Nicolás Andrés" + "Rodríguez" → "NR"). Sin esto se toman las dos
   * primeras palabras del nombre.
   */
  iniciales?: string
  tamano?: keyof typeof TAMANOS
  /** Ej: atenuado para usuarios inactivos */
  className?: string
  /** Adornos encima (punto "en línea", corona de admin) */
  children?: ReactNode
}

export function AvatarUsuario({
  nombre,
  rol,
  iniciales,
  tamano = 'sm',
  className,
  children,
}: AvatarUsuarioProps) {
  return (
    <span
      aria-hidden
      title={rol ? `${nombre} · ${rol}` : nombre}
      className={cn(
        'relative flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm',
        degradadoRol(rol),
        TAMANOS[tamano],
        className
      )}
    >
      {iniciales || inicialesDe(nombre)}
      {children}
    </span>
  )
}
