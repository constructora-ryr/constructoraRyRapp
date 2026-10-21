/**
 * Indicador de carga único de la app: ícono del módulo en un recuadro con
 * degradado, anillo de color girando alrededor y texto legible con puntos.
 *
 * Solo CSS (transform/opacity): no depende de JavaScript para animar, así que
 * sigue fluido aunque la página esté ocupada cargando. Respeta
 * "reducir movimiento" del sistema.
 */

import type { CSSProperties } from 'react'

import { Loader2, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

import { COLORES_CARGA, type TemaCarga } from './carga-temas'

type Tamano = 'sm' | 'md' | 'lg'

const MEDIDAS: Record<
  Tamano,
  { caja: string; ficha: string; icono: string; texto: string; grosor: number }
> = {
  sm: {
    caja: 'h-12 w-12',
    ficha: 'h-8 w-8 rounded-lg',
    icono: 'h-4 w-4',
    texto: 'text-xs',
    grosor: 2.5,
  },
  md: {
    caja: 'h-[4.5rem] w-[4.5rem]',
    ficha: 'h-12 w-12 rounded-xl',
    icono: 'h-6 w-6',
    texto: 'text-sm',
    grosor: 3,
  },
  lg: {
    caja: 'h-24 w-24',
    ficha: 'h-16 w-16 rounded-2xl',
    icono: 'h-8 w-8',
    texto: 'text-base',
    grosor: 3.5,
  },
}

export interface CargadorProps {
  /** Color del módulo (por defecto el de la app) */
  modulo?: TemaCarga
  /** Ícono del módulo o de lo que se carga */
  icon?: LucideIcon
  /** Texto debajo, p.ej. "Cargando documentos" (sin puntos suspensivos) */
  label?: string
  tamano?: Tamano
  className?: string
}

export function Cargador({
  modulo = 'app',
  icon: Icon = Loader2,
  label,
  tamano = 'md',
  className,
}: CargadorProps) {
  const colores = COLORES_CARGA[modulo]
  // Los puntos animados reemplazan a los "..." del texto
  const texto = label?.replace(/[.…\s]+$/, '')
  const m = MEDIDAS[tamano]
  const [c1, c2] = colores.anillo
  // El ícono por defecto (Loader2) ya gira: no se anima doble
  const iconoGira = Icon === Loader2

  const estiloAnillo = {
    background: `conic-gradient(from 0deg, transparent 0deg, ${c1}33 90deg, ${c1} 220deg, ${c2} 360deg)`,
    WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${m.grosor}px), #000 calc(100% - ${m.grosor}px + 0.5px))`,
    mask: `radial-gradient(farthest-side, transparent calc(100% - ${m.grosor}px), #000 calc(100% - ${m.grosor}px + 0.5px))`,
  } satisfies CSSProperties

  return (
    <div
      role='status'
      aria-live='polite'
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        className
      )}
    >
      <div className={cn('relative flex items-center justify-center', m.caja)}>
        {/* Halo suave */}
        <span
          aria-hidden
          className={cn(
            'absolute inset-1 rounded-full bg-gradient-to-br opacity-25 blur-xl motion-safe:animate-pulse',
            colores.gradient
          )}
        />
        {/* Anillo con degradado girando */}
        <span
          aria-hidden
          className='absolute inset-0 rounded-full motion-safe:animate-spin motion-safe:[animation-duration:1.1s]'
          style={estiloAnillo}
        />
        {/* Ícono del módulo */}
        <span
          className={cn(
            'relative flex items-center justify-center bg-gradient-to-br text-white shadow-lg motion-safe:animate-cargar-respirar',
            m.ficha,
            colores.gradient,
            colores.sombra
          )}
        >
          <Icon
            aria-hidden
            className={cn(m.icono, iconoGira && 'motion-safe:animate-spin')}
            strokeWidth={2.25}
          />
        </span>
      </div>

      {texto ? (
        <p
          className={cn(
            'flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300',
            m.texto
          )}
        >
          {texto}
          <span aria-hidden className='ml-0.5 inline-flex gap-1'>
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className={cn(
                  'h-1 w-1 rounded-full bg-gradient-to-br motion-safe:animate-cargar-punto',
                  colores.gradient
                )}
                style={{ animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </span>
        </p>
      ) : (
        <span className='sr-only'>Cargando</span>
      )}
    </div>
  )
}
