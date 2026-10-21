'use client'

import * as LucideIcons from 'lucide-react'

import { colorCategoria } from '../../utils/categoria-color'

interface CategoriaIconProps {
  icono: string
  /** Nombre ("red") o hex ("#8B5CF6"); sin color hereda el del texto */
  color?: string
  size?: number
  className?: string
}

export function CategoriaIcon({
  icono,
  color,
  size = 24,
  className = '',
}: CategoriaIconProps) {
  // Ícono de Lucide por nombre (Folder si no existe)
  const IconComponent =
    (
      LucideIcons as unknown as Record<
        string,
        React.ComponentType<{
          size?: number
          className?: string
          style?: React.CSSProperties
        }>
      >
    )[icono] || LucideIcons.Folder

  return (
    <IconComponent
      size={size}
      className={className}
      style={color ? { color: colorCategoria(color) } : undefined}
    />
  )
}
