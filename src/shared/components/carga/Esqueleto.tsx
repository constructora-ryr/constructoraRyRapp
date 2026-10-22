/**
 * Piezas para armar skeletons (bloques con la forma del contenido mientras
 * carga). El brillo que barre es solo CSS (transform), como el Cargador, y
 * se apaga con "reducir movimiento".
 */

import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/helpers'

/** Bloque gris con brillo. El tamaño y la forma van en `className` */
export function Hueso({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative overflow-hidden rounded-lg bg-slate-200/80 dark:bg-slate-700/50',
        'after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent motion-safe:after:animate-cargar-brillo dark:after:via-white/10',
        className
      )}
    />
  )
}

/** Tarjeta blanca con el mismo borde y radio que las tarjetas reales */
export function TarjetaEsqueleto({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 sm:p-5',
        className
      )}
    >
      {children}
    </div>
  )
}

/** Contenedor accesible: anuncia "Cargando…" a lectores de pantalla */
export function ZonaEsqueleto({
  label,
  children,
  className,
}: {
  /** Lo que se está cargando, p.ej. "Cargando negociación" */
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div role='status' aria-busy='true' className={className}>
      <span className='sr-only'>{label}</span>
      {children}
    </div>
  )
}
