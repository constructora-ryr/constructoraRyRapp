/**
 * ConfirmarCambiosModal.styles.ts — Estilos centralizados con theming dinámico
 * ✅ JIT-safe con Record maps (Tailwind ve clases literales)
 * ✅ Soporte para todos los módulos
 * ✅ Estados: idle, loading, success, error
 */

// ── Gradientes del header por módulo ─────────────────────────────
export const MODAL_GRADIENT: Record<string, string> = {
  proyectos:
    'from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800',
  viviendas:
    'from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-amber-800',
  clientes:
    'from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800',
  negociaciones: 'from-pink-600 via-purple-600 to-indigo-600',
  abonos:
    'from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800',
  documentos:
    'from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800',
  auditorias:
    'from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800',
  renuncias: 'from-gray-600 via-slate-600 to-zinc-600',
}

// ── Spinner (loading state) ──────────────────────────────────────
export const MODAL_SPINNER: Record<string, string> = {
  proyectos: 'text-green-500',
  viviendas: 'text-orange-500',
  clientes: 'text-cyan-500',
  negociaciones: 'text-pink-500',
  abonos: 'text-blue-500',
  documentos: 'text-red-500',
  auditorias: 'text-indigo-500',
  renuncias: 'text-gray-500',
}

export const MODAL_RING: Record<string, string> = {
  proyectos: 'border-green-500/30',
  viviendas: 'border-orange-500/30',
  clientes: 'border-cyan-500/30',
  negociaciones: 'border-pink-500/30',
  abonos: 'border-blue-500/30',
  documentos: 'border-red-500/30',
  auditorias: 'border-indigo-500/30',
  renuncias: 'border-gray-500/30',
}

export const MODAL_DOTS: Record<string, string> = {
  proyectos: 'bg-green-500',
  viviendas: 'bg-orange-500',
  clientes: 'bg-cyan-500',
  negociaciones: 'bg-pink-500',
  abonos: 'bg-blue-500',
  documentos: 'bg-red-500',
  auditorias: 'bg-indigo-500',
  renuncias: 'bg-gray-500',
}

// ── Success colors ───────────────────────────────────────────────
export const MODAL_SUCCESS_BG: Record<string, string> = {
  proyectos: 'from-green-500 to-emerald-500',
  viviendas: 'from-orange-500 to-amber-500',
  clientes: 'from-cyan-500 to-blue-500',
  negociaciones: 'from-pink-500 to-purple-500',
  abonos: 'from-blue-500 to-indigo-500',
  documentos: 'from-red-500 to-rose-500',
  auditorias: 'from-blue-500 to-indigo-500',
  renuncias: 'from-gray-500 to-slate-500',
}

export const MODAL_SUCCESS_GLOW: Record<string, string> = {
  proyectos: 'shadow-green-500/40',
  viviendas: 'shadow-orange-500/40',
  clientes: 'shadow-cyan-500/40',
  negociaciones: 'shadow-pink-500/40',
  abonos: 'shadow-blue-500/40',
  documentos: 'shadow-red-500/40',
  auditorias: 'shadow-blue-500/40',
  renuncias: 'shadow-gray-500/40',
}

// ── Confirm button gradient ──────────────────────────────────────
export const MODAL_BTN_CONFIRM: Record<string, string> = {
  proyectos:
    'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
  viviendas:
    'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700',
  clientes:
    'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700',
  negociaciones:
    'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700',
  abonos:
    'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
  documentos:
    'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700',
  auditorias:
    'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
  renuncias:
    'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700',
}

// ── Summary badge colors ─────────────────────────────────────────
export const MODAL_BADGE_BG: Record<string, string> = {
  proyectos:
    'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
  viviendas:
    'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
  clientes:
    'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800',
  negociaciones:
    'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800',
  abonos: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  documentos: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  auditorias:
    'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  renuncias:
    'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800',
}

export const MODAL_BADGE_TEXT: Record<string, string> = {
  proyectos: 'text-green-600 dark:text-green-400',
  viviendas: 'text-orange-600 dark:text-orange-400',
  clientes: 'text-cyan-600 dark:text-cyan-400',
  negociaciones: 'text-pink-600 dark:text-pink-400',
  abonos: 'text-blue-600 dark:text-blue-400',
  documentos: 'text-red-600 dark:text-red-400',
  auditorias: 'text-blue-600 dark:text-blue-400',
  renuncias: 'text-gray-600 dark:text-gray-400',
}

export const MODAL_BADGE_STRONG: Record<string, string> = {
  proyectos: 'text-green-700 dark:text-green-300',
  viviendas: 'text-orange-700 dark:text-orange-300',
  clientes: 'text-cyan-700 dark:text-cyan-300',
  negociaciones: 'text-pink-700 dark:text-pink-300',
  abonos: 'text-blue-700 dark:text-blue-300',
  documentos: 'text-red-700 dark:text-red-300',
  auditorias: 'text-blue-700 dark:text-blue-300',
  renuncias: 'text-gray-700 dark:text-gray-300',
}

// ── Category icon badge ──────────────────────────────────────────
export const MODAL_CAT_ICON_BG: Record<string, string> = {
  proyectos: 'from-green-500 to-emerald-600',
  viviendas: 'from-orange-500 to-amber-600',
  clientes: 'from-cyan-500 to-blue-600',
  negociaciones: 'from-pink-500 to-purple-600',
  abonos: 'from-blue-500 to-indigo-600',
  documentos: 'from-red-500 to-rose-600',
  auditorias: 'from-blue-500 to-indigo-600',
  renuncias: 'from-gray-500 to-slate-600',
}

// ── Redirect text ────────────────────────────────────────────────
export const MODAL_REDIRECT_TEXT: Record<string, string> = {
  proyectos: 'text-green-300',
  viviendas: 'text-orange-300',
  clientes: 'text-cyan-300',
  negociaciones: 'text-pink-300',
  abonos: 'text-blue-300',
  documentos: 'text-red-300',
  auditorias: 'text-blue-300',
  renuncias: 'text-gray-300',
}

// ── Framer Motion animations ─────────────────────────────────────
export const modalAnimations = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 },
  },
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
  stateTransition: {
    initial: { opacity: 0, scale: 0.9, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  successIcon: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 15,
      delay: 0.15,
    },
  },
  pulseRing: {
    animate: { scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
  spinnerRotate: {
    animate: { rotate: 360 },
    transition: { duration: 1.2, repeat: Infinity, ease: 'linear' as const },
  },
  loadingRingPulse: {
    animate: { scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
  dotBounce: (i: number) => ({
    animate: { y: [0, -6, 0] },
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.15,
      ease: 'easeInOut' as const,
    },
  }),
  fadeUp: (delay = 0) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.3 },
  }),
}

// ── Confetti particles (success state) ───────────────────────────
export const CONFETTI_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 160 - 80,
  y: -(Math.random() * 100 + 30),
  rotate: Math.random() * 360,
  scale: Math.random() * 0.5 + 0.5,
  delay: Math.random() * 0.3,
}))

export const CONFETTI_COLORS = [
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
  '#A78BFA',
  '#F97316',
  '#06B6D4',
]
