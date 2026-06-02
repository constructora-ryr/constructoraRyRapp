/**
 * Estilos centralizados — Asignar Vivienda V2
 * Paleta: cyan → blue → indigo (módulo Clientes)
 * Diseño vibrante con glassmorphism + gradientes
 */

export const styles = {
  // ──────────────────────────────
  // PAGE
  // ──────────────────────────────
  page: {
    wrapper:
      'min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50/30 to-blue-50/30 dark:from-gray-950 dark:via-cyan-950/20 dark:to-blue-950/20 pb-28',
    inner: 'max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8',
    accordionStack: 'space-y-3 mt-6',
  },

  // ──────────────────────────────
  // HEADER
  // ──────────────────────────────
  header: {
    wrapper:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 p-5 shadow-2xl shadow-cyan-500/20 mb-6',
    pattern:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    iconWrapper:
      'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0',
    icon: 'w-5 h-5 text-white',
    breadcrumb:
      'relative z-10 flex items-center gap-1.5 text-cyan-100 text-xs mb-3',
    breadcrumbSep: 'text-cyan-300/50',
    breadcrumbLink: 'hover:text-white transition-colors cursor-pointer',
    breadcrumbCurrent: 'text-white font-medium',
    titleRow: 'relative z-10 flex items-center gap-3',
    h1: 'text-xl font-bold text-white',
    subtitle: 'text-cyan-100 text-xs mt-0.5',
    stepBadge:
      'ml-auto shrink-0 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-2.5 py-1 rounded-full',
  },

  // ──────────────────────────────
  // ACCORDION
  // ──────────────────────────────
  accordion: {
    // Estado: expandido
    active: {
      wrapper:
        'border-2 border-cyan-500/40 bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg shadow-cyan-500/10 transition-all duration-200',
      header:
        'flex items-center justify-between px-4 py-3.5 cursor-pointer select-none',
      numberWrapper:
        'w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-3 shrink-0 shadow-lg shadow-cyan-500/30',
      number: 'text-white font-bold text-[10px]',
      title:
        'text-gray-900 dark:text-white text-sm font-semibold uppercase tracking-wide',
      chevron: 'w-4 h-4 text-gray-400 dark:text-gray-500',
      divider: 'border-t border-cyan-200/40 dark:border-cyan-800/40 mx-4',
      content: 'px-4 pb-5 pt-4',
    },
    // Estado: completado
    completed: {
      wrapper:
        'border-2 border-emerald-500/30 bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 cursor-pointer transition-all duration-200 shadow-sm',
      header: 'flex items-center gap-3 px-4 py-3.5 select-none',
      checkWrapper:
        'w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30',
      check: 'text-white',
      title:
        'text-gray-900 dark:text-white text-sm font-semibold uppercase tracking-wide',
      summary:
        'ml-auto text-gray-500 dark:text-gray-400 text-xs font-mono truncate max-w-[200px]',
    },
    // Estado: bloqueado
    locked: {
      wrapper:
        'border border-gray-200/50 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl opacity-50 cursor-not-allowed',
      header: 'flex items-center justify-between px-4 py-3.5 select-none',
      numberWrapper:
        'w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mr-3 shrink-0',
      number: 'text-gray-400 dark:text-gray-500 font-bold text-[10px]',
      title:
        'text-gray-400 dark:text-gray-500 text-sm font-semibold uppercase tracking-wide',
      lock: 'w-3.5 h-3.5 text-gray-400 dark:text-gray-500',
    },
  },

  // ──────────────────────────────
  // FORM / FIELDS
  // ──────────────────────────────
  field: {
    label:
      'block text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-semibold',
    labelSr: 'sr-only',
    labelWithIcon:
      'flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-semibold',
    labelIcon: 'w-3.5 h-3.5',
    input:
      'w-full bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all',
    inputMono:
      'w-full bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm font-[family-name:var(--font-jakarta)] tabular-nums placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all',
    select:
      'w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-white',
    textarea:
      'w-full bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none',
    error:
      'text-red-600 dark:text-red-400 text-xs flex items-center gap-1 mt-1.5',
    hint: 'text-gray-400 dark:text-gray-500 text-[10px] mt-1',
    prefix:
      'absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-mono pointer-events-none select-none',
    inputWithPrefix: 'pl-6',
    grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
    grid3: 'grid grid-cols-3 gap-2',
    selectWrapper: 'relative',
    selectArrow:
      'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    row: 'flex items-center justify-between py-3',
    divider: 'border-t border-gray-200 dark:border-gray-700 my-4',
  },

  // ──────────────────────────────
  // CLIENT CHIP (readonly)
  // ──────────────────────────────
  clientChip: {
    wrapper:
      'flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200/50 dark:border-cyan-800/40 rounded-xl px-4 py-3',
    iconWrapper:
      'w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/30',
    icon: 'w-4 h-4 text-white',
    label:
      'text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-0 block',
    value: 'text-gray-900 dark:text-white text-sm font-semibold',
  },

  // ──────────────────────────────
  // VALUE CHIPS (valor base, notariales, etc.)
  // ──────────────────────────────
  valueChip: {
    wrapper:
      'bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col gap-1',
    label:
      'text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400',
    value:
      'text-gray-900 dark:text-white text-sm font-[family-name:var(--font-jakarta)] tabular-nums font-bold',
    icon: 'w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0',
  },

  // ──────────────────────────────
  // TOTAL A CUBRIR
  // ──────────────────────────────
  totalRow: {
    wrapper:
      'flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200/50 dark:border-cyan-800/40 rounded-xl px-4 py-3 mt-3',
    label:
      'flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-600 dark:text-gray-300 font-semibold',
    labelIcon: 'w-4 h-4 text-cyan-500',
    value:
      'text-xl font-bold font-[family-name:var(--font-jakarta)] tabular-nums tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent',
  },

  // ──────────────────────────────
  // SWITCH
  // ──────────────────────────────
  switch: {
    track: (on: boolean) =>
      `relative w-10 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30' : 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'} shrink-0`,
    thumb: (on: boolean) =>
      `absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`,
  },

  // ──────────────────────────────
  // DESCUENTO TOGGLE
  // ──────────────────────────────
  discountToggle: {
    wrapper:
      'flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 rounded-xl px-4 py-3',
    left: 'flex items-center gap-3',
    iconWrapper:
      'w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30',
    icon: 'w-4 h-4 text-white',
    title: 'text-sm text-gray-900 dark:text-white font-medium',
    subtitle: 'text-xs text-gray-500 dark:text-gray-400 mt-0.5',
  },

  // ──────────────────────────────
  // SECCIÓN ② — FUENTES
  // ──────────────────────────────
  fuentes: {
    progressWrapper:
      'bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-3',
    progressLabel:
      'text-[11px] text-gray-500 dark:text-gray-400 font-[family-name:var(--font-jakarta)] tabular-nums',
    progressLabelRight:
      'text-[11px] text-cyan-600 dark:text-cyan-400 font-[family-name:var(--font-jakarta)] tabular-nums font-semibold',
    progressTrack:
      'mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden',
    progressFull:
      'h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500',
    progressPartial:
      'h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500',
    fuenteRow:
      'flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0',
    fuenteIconWrapper: (on: boolean) =>
      `w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${on ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30' : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`,
    fuenteIcon: (on: boolean) =>
      `w-4 h-4 transition-colors ${on ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`,
    fuenteNombreOff: 'text-gray-400 dark:text-gray-500 text-sm',
    fuenteNombreOn: 'text-gray-900 dark:text-white text-sm font-semibold',
    fuenteMontoOn:
      'ml-auto text-cyan-600 dark:text-cyan-400 text-sm font-[family-name:var(--font-jakarta)] tabular-nums font-bold',
    fuenteContent: 'ml-11 pb-2 pt-1 space-y-3',
    totalesBox:
      'bg-white dark:bg-gray-800/60 rounded-xl p-4 mt-3 border border-gray-200 dark:border-gray-700 shadow-sm',
    totalesRow: 'flex items-center justify-between py-1',
    totalesLabel:
      'text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1.5',
    totalesLabelIcon: 'w-3.5 h-3.5',
    totalesValue:
      'text-gray-900 dark:text-white text-sm font-[family-name:var(--font-jakarta)] tabular-nums font-semibold',
    totalesDivider: 'border-t border-gray-200 dark:border-gray-700 my-2',
    okMsg:
      'flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-1',
    errMsg:
      'flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-bold mt-1',
    okIcon: 'w-3.5 h-3.5',
    errIcon: 'w-3.5 h-3.5',
  },

  // ──────────────────────────────
  // SECCIÓN ③ — REVISIÓN
  // ──────────────────────────────
  revision: {
    infoCard:
      'bg-gray-50/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4',
    grid: 'grid grid-cols-2 gap-x-4 gap-y-3',
    label:
      'text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1',
    labelIcon: 'w-3 h-3',
    value: 'text-gray-900 dark:text-white text-sm font-medium mt-0.5',
    sep: 'border-t border-gray-200 dark:border-gray-700 my-3',
    sepDouble: 'border-t-2 border-gray-300 dark:border-gray-600 my-3',
    financialCard:
      'bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm',
    financialRow: 'flex items-center justify-between py-1',
    financialLabel:
      'text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1.5',
    financialLabelIcon: 'w-3.5 h-3.5',
    financialValue:
      'text-gray-900 dark:text-white text-sm font-[family-name:var(--font-jakarta)] tabular-nums',
    totalLabel:
      'text-gray-900 dark:text-white text-sm font-semibold flex items-center gap-1.5',
    totalValue:
      'text-lg font-bold font-[family-name:var(--font-jakarta)] tabular-nums tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent',
    descuento: 'text-amber-500',
    fuentesCard:
      'bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm',
    fuenteRow: 'flex items-center gap-2.5 py-1.5',
    fuenteDot:
      'w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shrink-0 shadow-sm shadow-cyan-500/40',
    fuenteNombre: 'text-gray-900 dark:text-white text-sm',
    fuenteMonto:
      'ml-auto text-gray-900 dark:text-white text-sm font-[family-name:var(--font-jakarta)] tabular-nums font-semibold',
    fuenteEntidad: 'text-gray-500 dark:text-gray-400 text-xs',
    editLink:
      'flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs hover:text-cyan-500 transition-colors mt-1',
    sectionTitle:
      'flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold mb-2',
    sectionTitleIcon: 'w-3.5 h-3.5',
    actionRow: 'flex items-center gap-3 mt-5',
    submitBtn:
      'flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/30',
    pdfBtn:
      'flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl px-4 py-2.5 text-sm w-full mt-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
    errorBanner:
      'flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-sm p-3.5 rounded-xl mb-3',
    errorIcon: 'w-4 h-4 shrink-0 mt-0.5',
  },

  // ──────────────────────────────
  // STATUS BAR
  // ──────────────────────────────
  statusBar: {
    wrapper:
      'fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-2xl shadow-gray-500/10',
    progressTrack: 'h-[3px] bg-gray-100 dark:bg-gray-800 w-full',
    progressFill:
      'h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500',
    inner:
      'flex items-center justify-between gap-4 px-4 py-3 md:px-6 max-w-2xl mx-auto',
    valueWrapper: 'flex flex-col',
    valueLabel:
      'text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400',
    valueAmount:
      'text-base font-bold font-[family-name:var(--font-jakarta)] tabular-nums text-gray-900 dark:text-white',
    continueBtn:
      'flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/30 shrink-0',
    cancelBtn:
      'text-gray-500 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white transition-colors shrink-0',
  },

  // ──────────────────────────────
  // DISCOUNT
  // ──────────────────────────────
  discount: {
    summaryRow:
      'flex items-center gap-2 mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 rounded-lg text-sm',
    original:
      'line-through text-gray-400 dark:text-gray-500 font-[family-name:var(--font-jakarta)] tabular-nums text-xs',
    arrow: 'text-gray-400 dark:text-gray-500 text-xs',
    final:
      'text-emerald-600 dark:text-emerald-400 font-bold font-[family-name:var(--font-jakarta)] tabular-nums',
    pct: 'ml-auto text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded',
  },

  // ──────────────────────────────
  // MISC
  // ──────────────────────────────
  datoBadge:
    'text-[10px] tracking-widest border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded uppercase ml-1.5',
  charCounter: 'text-[10px] text-gray-400 dark:text-gray-500 text-right mt-0.5',
  spinner:
    'w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin',
  loadingRow:
    'flex items-center gap-2 py-8 text-gray-400 dark:text-gray-500 text-xs justify-center',
} as const
