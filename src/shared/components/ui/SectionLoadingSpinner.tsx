'use client'

/**
 * SectionLoadingSpinner — Premium animated loading state for sections, tabs,
 * pages, and modals. Replaces plain Loader2 + text patterns.
 *
 * Design: rotating ring + pulsing inner glow + optional icon + bouncing dots
 * + fading label. Based on the ContentLoadingState in AbonoDetallePreviewPanel.
 *
 * Usage:
 * ```tsx
 * <SectionLoadingSpinner
 *   label="Cargando cuotas..."
 *   moduleName="negociaciones"
 *   icon={CreditCard}
 * />
 * ```
 */

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import type { ModuleName } from '@/shared/config/module-themes'

// ── JIT-safe color maps (must be full class strings for Tailwind to scan) ─────

const RING_COLORS: Record<ModuleName, string> = {
  proyectos: 'border-t-green-400 border-r-emerald-500',
  viviendas: 'border-t-orange-400 border-r-amber-500',
  clientes: 'border-t-cyan-400 border-r-blue-500',
  negociaciones: 'border-t-pink-400 border-r-purple-500',
  abonos: 'border-t-emerald-400 border-r-teal-500',
  documentos: 'border-t-red-400 border-r-rose-500',
  auditorias: 'border-t-indigo-400 border-r-purple-500',
  renuncias: 'border-t-red-400 border-r-pink-500',
  usuarios: 'border-t-indigo-400 border-r-purple-500',
  papelera: 'border-t-slate-400 border-r-zinc-500',
}

const RING_BG: Record<ModuleName, string> = {
  proyectos: 'from-green-500/20 to-emerald-500/20',
  viviendas: 'from-orange-500/20 to-amber-500/20',
  clientes: 'from-cyan-500/20 to-blue-500/20',
  negociaciones: 'from-pink-500/20 to-purple-500/20',
  abonos: 'from-emerald-500/20 to-teal-500/20',
  documentos: 'from-red-500/20 to-rose-500/20',
  auditorias: 'from-indigo-500/20 to-purple-500/20',
  renuncias: 'from-red-500/20 to-pink-500/20',
  usuarios: 'from-indigo-500/20 to-purple-500/20',
  papelera: 'from-slate-500/20 to-zinc-500/20',
}

const ICON_BG: Record<ModuleName, string> = {
  proyectos: 'from-green-600 via-emerald-500 to-teal-500',
  viviendas: 'from-orange-600 via-amber-500 to-yellow-500',
  clientes: 'from-cyan-600 via-blue-600 to-indigo-600',
  negociaciones: 'from-pink-600 via-purple-600 to-indigo-600',
  abonos: 'from-emerald-600 via-emerald-500 to-teal-500',
  documentos: 'from-red-600 via-rose-500 to-pink-500',
  auditorias: 'from-indigo-600 via-purple-600 to-violet-600',
  renuncias: 'from-red-600 via-rose-600 to-pink-600',
  usuarios: 'from-indigo-600 via-purple-600 to-fuchsia-600',
  papelera: 'from-slate-600 via-zinc-600 to-stone-600',
}

const ICON_SHADOW: Record<ModuleName, string> = {
  proyectos: 'shadow-green-500/40',
  viviendas: 'shadow-orange-500/40',
  clientes: 'shadow-cyan-500/40',
  negociaciones: 'shadow-pink-500/40',
  abonos: 'shadow-emerald-500/40',
  documentos: 'shadow-red-500/40',
  auditorias: 'shadow-indigo-500/40',
  renuncias: 'shadow-red-500/40',
  usuarios: 'shadow-indigo-500/40',
  papelera: 'shadow-slate-500/40',
}

const DOT_COLOR: Record<ModuleName, string> = {
  proyectos: 'bg-green-400',
  viviendas: 'bg-orange-400',
  clientes: 'bg-cyan-400',
  negociaciones: 'bg-pink-400',
  abonos: 'bg-emerald-400',
  documentos: 'bg-red-400',
  auditorias: 'bg-indigo-400',
  renuncias: 'bg-red-400',
  usuarios: 'bg-indigo-400',
  papelera: 'bg-slate-400',
}

const LABEL_COLOR: Record<ModuleName, string> = {
  proyectos: 'text-green-400',
  viviendas: 'text-orange-400',
  clientes: 'text-cyan-400',
  negociaciones: 'text-pink-400',
  abonos: 'text-emerald-400',
  documentos: 'text-red-400',
  auditorias: 'text-indigo-400',
  renuncias: 'text-red-400',
  usuarios: 'text-indigo-400',
  papelera: 'text-slate-400',
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface SectionLoadingSpinnerProps {
  /** Text shown below the spinner dots */
  label: string
  /** Optional Lucide icon displayed inside the spinner ring */
  icon?: LucideIcon
  /** Module color palette — defaults to 'clientes' (cyan/blue) */
  moduleName?: ModuleName
  /**
   * Class applied to the root wrapper div.
   * Override to control positioning / padding.
   * Default: `flex flex-col items-center justify-center py-12 gap-6`
   */
  className?: string
}

// ── Component ──────────────────────────────────────────────────────────────────

export function SectionLoadingSpinner({
  label,
  icon: Icon,
  moduleName = 'clientes',
  className = 'flex flex-col items-center justify-center py-12 gap-6',
}: SectionLoadingSpinnerProps) {
  const ring = RING_COLORS[moduleName]
  const ringBg = RING_BG[moduleName]
  const iconBg = ICON_BG[moduleName]
  const iconShadow = ICON_SHADOW[moduleName]
  const dot = DOT_COLOR[moduleName]
  const labelColor = LABEL_COLOR[moduleName]

  return (
    <div className={className}>
      {/* ── Spinner ring ─────────────────────────────────────── */}
      <div className='relative'>
        {/* Rotating outer ring */}
        <motion.div
          className={`absolute inset-0 h-20 w-20 rounded-full border-[3px] border-transparent ${ring}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Pulsing inner glow */}
        <motion.div
          className={`h-17 w-17 absolute inset-1.5 rounded-full bg-gradient-to-br ${ringBg}`}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Icon container */}
        <motion.div
          className='relative flex h-20 w-20 items-center justify-center'
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-2xl ${iconBg} ${iconShadow}`}
          >
            {Icon ? (
              <Icon className='h-6 w-6 text-white' strokeWidth={2} />
            ) : (
              /* Fallback: subtle mini-ring when no icon provided */
              <div className='h-5 w-5 animate-spin rounded-full border-[3px] border-transparent border-t-white/80' />
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Bouncing dots ────────────────────────────────────── */}
      <div className='flex gap-2'>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${dot}`}
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* ── Fading label ─────────────────────────────────────── */}
      <motion.p
        className={`text-xs font-medium ${labelColor}`}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {label}
      </motion.p>
    </div>
  )
}
