// =====================================================
// ESTILOS: Modal de Anulación de Abono
// Consistent with abonoDetalleStyles / ab-emerald theme
// =====================================================

export const modalAnularAbonoStyles = {
  // Overlay
  overlay:
    'fixed inset-0 z-[10001] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4',

  // Contenedor principal
  container:
    'relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden',

  // ─── Header ──────────────────────────────────────────────────────────────────
  header: {
    container:
      'flex items-center justify-between gap-3 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800 px-5 py-4',
    left: 'flex items-center gap-3',
    iconWrap:
      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm',
    title: 'text-base font-bold text-white',
    subtitle: 'text-xs text-red-100',
    btnClose:
      'flex h-8 w-8 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/30',
  },

  // ─── Body ─────────────────────────────────────────────────────────────────────
  body: 'p-5 space-y-4',

  // Info del abono (badge compacto)
  infoBadge:
    'flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-4 py-3',
  infoBadgeLabel:
    'text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500',
  infoBadgeValue: 'text-sm font-bold text-gray-900 dark:text-white',

  // Advertencia
  warningBox:
    'flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-4 py-3',
  warningText:
    'text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed',

  // ─── Formulario ───────────────────────────────────────────────────────────────
  form: {
    fieldGroup: 'space-y-1.5',
    label:
      'block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400',
    labelRequired: 'ml-0.5 text-red-500',
    select:
      'w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20',
    textarea:
      'w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white transition-all resize-none focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-500',
    charCount: 'text-right text-[10px] text-gray-400 dark:text-gray-500 mt-0.5',
    errorText: 'text-xs text-red-600 dark:text-red-400 mt-1',
  },

  // ─── Footer ───────────────────────────────────────────────────────────────────
  footer:
    'flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-5 py-4',
  btnCancel:
    'inline-flex items-center gap-1.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 transition-all hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
  btnConfirm:
    'inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:from-red-700 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60',

  // ─── Estado de éxito ──────────────────────────────────────────────────────────
  success: {
    container: 'p-6 text-center space-y-4',
    iconWrap:
      'mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40',
    title: 'text-lg font-bold text-gray-900 dark:text-white',
    subtitle: 'text-sm text-gray-500 dark:text-gray-400',
    btnNew:
      'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-700 hover:to-teal-700',
    btnClose:
      'inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-800',
  },
} as const
