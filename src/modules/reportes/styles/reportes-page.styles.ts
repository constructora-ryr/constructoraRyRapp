/**
 * 🎨 ESTILOS CENTRALIZADOS - REPORTES (VISTA PRINCIPAL)
 *
 * Sistema de diseño compacto premium con glassmorphism.
 * Color principal: Índigo/Violeta/Púrpura (identidad analítica)
 *
 * Basado en: ESTANDAR-DISENO-VISUAL-MODULOS.md
 * Referencia: Módulo de Proyectos (compacto)
 */

export const reportesPageStyles = {
  // 🎯 CONTENEDOR PRINCIPAL
  container: {
    page: 'min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4',
  },

  // 🎨 HEADER HERO (compacto)
  header: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-700 dark:via-violet-700 dark:to-purple-800 p-6 shadow-2xl shadow-indigo-500/20',
    pattern:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10',
    topRow: 'flex items-center justify-between',
    titleGroup: 'flex items-center gap-3',
    iconCircle:
      'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    icon: 'w-6 h-6 text-white',
    titleWrapper: 'space-y-0.5',
    title: 'text-2xl font-bold text-white',
    subtitle: 'text-indigo-100 dark:text-indigo-200 text-xs',
    badge:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium',
    badgeIcon: 'w-3.5 h-3.5',
  },

  // 🎬 ANIMACIONES (Framer Motion)
  animations: {
    container: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.15 },
    },
    header: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.15 },
    },
  },
}
