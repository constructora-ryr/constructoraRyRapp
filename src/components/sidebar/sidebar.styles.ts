/**
 * Variantes de animación compartidas del Sidebar
 */

export const sidebarAnimationVariants = {
  expanded: { width: 260 },
  collapsed: { width: 72 },
}

export const contentFadeVariants = {
  expanded: { opacity: 1, x: 0 },
  collapsed: { opacity: 0, x: -10 },
}

/**
 * Clases de Tailwind centralizadas del Sidebar
 */
export const sidebarStyles = {
  searchInput:
    'h-9 w-full rounded-xl border border-slate-200/70 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200/60 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-900',
}
