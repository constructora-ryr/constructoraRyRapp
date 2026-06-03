/**
 * Estilos Centralizados - Historial Tab (Timeline de Ciclo de Vida)
 * Separación de responsabilidades: Solo clases de Tailwind
 */
import type { TipoEventoHistorial } from '@/modules/clientes/types/historial.types'

export const historialStyles = {
  // ========== CONTENEDOR PRINCIPAL ==========
  container: {
    root: 'space-y-4 py-4',
  },

  // ========== RESUMEN DEL CICLO DE VIDA ==========
  resumen: {
    wrapper:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 p-5 shadow-2xl shadow-cyan-500/20',
    overlay:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10',
    headerRow: 'flex items-center justify-between',
    titleGroup: 'flex items-center gap-3',
    iconBox:
      'flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm',
    icon: 'h-5 w-5 text-white',
    titleText: 'text-xl font-bold text-white',
    subtitle: 'text-xs text-cyan-100 dark:text-cyan-200',
    badge:
      'inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/30',
    badgeIcon: 'h-3.5 w-3.5',
    statsGrid: 'mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4',
    statCard:
      'rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm border border-white/10',
    statValue: 'text-lg font-bold text-white',
    statLabel: 'text-[10px] font-medium text-cyan-100 uppercase tracking-wide',
  },

  // ========== FILTROS ==========
  filtros: {
    wrapper:
      'sticky top-4 z-40 rounded-xl border border-gray-200/50 bg-white/90 p-3 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90',
    row: 'flex flex-wrap items-center gap-2',
    searchContainer: 'relative flex-1 min-w-[200px]',
    searchIcon:
      'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500',
    searchInput:
      'w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm transition-all placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-900/50',
    pillBase:
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border',
    pillActive:
      'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/50 dark:text-cyan-200 dark:border-cyan-700',
    pillInactive:
      'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700',
    pillIcon: 'h-3.5 w-3.5',
    clearButton:
      'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300',
    resultCount:
      'text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap',
    notaButton:
      'inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg',
  },

  // ========== TIMELINE ==========
  timeline: {
    container: 'relative pl-8',
    lineaVertical:
      'absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-300 via-cyan-200 to-transparent dark:from-cyan-700 dark:via-cyan-800',

    // Grupo por fecha
    grupoWrapper: 'relative mb-6',
    grupoFechaContainer:
      'sticky top-16 z-30 -ml-8 mb-3 flex items-center gap-2',
    grupoFechaPunto:
      'flex h-[30px] w-[30px] items-center justify-center rounded-full bg-cyan-500 shadow-md shadow-cyan-500/30',
    grupoFechaIcono: 'h-3.5 w-3.5 text-white',
    grupoFechaTexto:
      'rounded-lg bg-white/95 px-3 py-1 text-sm font-bold text-gray-900 shadow-sm backdrop-blur-sm dark:bg-gray-800/95 dark:text-white border border-gray-200/50 dark:border-gray-700/50',
    grupoFechaContador:
      'text-[10px] font-medium text-gray-400 dark:text-gray-500',
    grupoEventos: 'space-y-3',
  },

  // ========== EVENTO CARD ==========
  eventoCard: {
    wrapper: 'relative',
    punto:
      'absolute -left-[26px] top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-lg z-10',
    puntoIcon: 'h-4 w-4',
    card: 'group relative overflow-hidden rounded-xl border bg-white/90 shadow-md transition-all duration-300 hover:shadow-xl backdrop-blur-xl dark:bg-gray-800/90',
    barraLateral: 'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
    // Header del card
    headerRow: 'flex items-start justify-between gap-3',
    titulo: 'text-sm font-bold text-gray-900 dark:text-white',
    descripcion:
      'mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap',
    // Badge de acción
    accionBadge:
      'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
    // Hora
    horaContainer: 'flex items-center gap-1 text-[10px] text-gray-400',
    horaIcon: 'h-3 w-3',
    // Usuario
    usuarioRow:
      'mt-2 flex items-center gap-2 border-t border-gray-100 pt-2 dark:border-gray-700/50',
    usuarioIcon: 'h-3 w-3 text-gray-400 dark:text-gray-500',
    usuarioLabel: 'text-[10px] font-medium text-gray-400 dark:text-gray-500',
    usuarioName: 'text-[10px] font-semibold text-gray-700 dark:text-gray-300',
    usuarioRol: 'text-[10px] font-semibold text-cyan-600 dark:text-cyan-400',
    // Nota badge
    notaBadge:
      'inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    notaImportanteIndicator:
      'inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    // Botones de nota
    notaActions:
      'flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100',
    notaButton:
      'flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300',
    notaButtonIcon: 'h-3 w-3',
    // Botón ver detalles
    detallesButton:
      'mt-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:border-cyan-300 hover:bg-cyan-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/30',
    detallesButtonIcon: 'h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400',
  },

  // ========== MODAL DE DETALLE ==========
  modal: {
    overlay: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    backdrop: 'absolute inset-0 bg-black/60 backdrop-blur-sm',
    container:
      'relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900',
    header: 'px-6 py-4',
    headerRow: 'flex items-center justify-between',
    headerTitleGroup: 'flex items-center gap-3',
    headerIconBox:
      'flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm',
    headerIcon: 'h-5 w-5 text-white',
    headerTitle: 'text-lg font-bold text-white',
    headerSubtitle: 'text-sm text-cyan-100',
    headerCloseButton:
      'flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30',
    body: 'max-h-[60vh] overflow-y-auto p-6',
    // Sección de cambios
    cambioContainer:
      'rounded-lg border border-gray-200 p-3 dark:border-gray-700',
    cambioLabel:
      'text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
    cambioAnterior:
      'mt-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-800 line-through dark:border-red-800 dark:bg-red-950/30 dark:text-red-300',
    cambioNuevo:
      'mt-1 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300',
    // Para CREATE - datos iniciales
    datoRow:
      'flex items-start gap-2 border-b border-gray-100 py-2 last:border-0 dark:border-gray-800',
    datoLabel:
      'text-xs font-semibold text-gray-500 dark:text-gray-400 min-w-[120px] shrink-0',
    datoValue: 'text-sm font-medium text-gray-900 dark:text-white',
  },

  // ========== ESTADOS VACÍOS ==========
  empty: {
    container: 'p-6',
    sinResultados: 'py-8',
  },

  // ========== ANIMACIONES ==========
  animations: {
    fadeIn: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
    },
    cardHover: {
      whileHover: { x: 2, scale: 1.005 },
      transition: { type: 'tween', duration: 0.2, ease: 'easeOut' },
    },
  },
} as const

/**
 * Colores por tipo de evento (lookup para UI)
 */
export const coloresEvento = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    barraLateral: 'bg-blue-500',
    headerGradient: 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-950',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    barraLateral: 'bg-green-500',
    headerGradient:
      'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-950',
    icon: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
    barraLateral: 'bg-yellow-500',
    headerGradient:
      'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-950',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    barraLateral: 'bg-red-500',
    headerGradient: 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-950',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    barraLateral: 'bg-purple-500',
    headerGradient:
      'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-950',
    icon: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    barraLateral: 'bg-cyan-500',
    headerGradient: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-950',
    icon: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    barraLateral: 'bg-orange-500',
    headerGradient:
      'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    barraLateral: 'bg-gray-500',
    headerGradient: 'bg-gradient-to-r from-gray-600 via-slate-600 to-zinc-600',
  },
} as const

export type ColorEventoKey = keyof typeof coloresEvento

/**
 * Gradiente del header del modal según el MÓDULO de origen del evento.
 * Independiente del color semántico (verde=creación, rojo=eliminación)
 * que se usa en los puntos y bordes del timeline.
 *
 * Módulos y su paleta:
 *   Clientes      → cyan / azul / índigo
 *   Negociaciones → rosa / púrpura / índigo
 *   Abonos        → azul / índigo / púrpura
 *   Renuncias     → naranja oscuro / rojo / rosa (alerta)
 *   Documentos    → rojo / rosa / pink
 *   Intereses     → violeta / púrpura / índigo
 *   Notas/Genérico → gris / slate
 */
export const HEADER_GRADIENTS_POR_TIPO: Record<TipoEventoHistorial, string> = {
  // ── Módulo Clientes (cyan → azul → índigo) ──────────────────────────
  cliente_creado: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600',
  cliente_actualizado:
    'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600',
  cliente_eliminado:
    'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600',
  cliente_estado_cambiado:
    'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600',

  // ── Módulo Negociaciones (rosa → púrpura → índigo) ───────────────────
  negociacion_creada:
    'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600',
  negociacion_actualizada:
    'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600',
  negociacion_estado_cambiada:
    'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600',
  negociacion_completada:
    'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600',

  // ── Módulo Abonos (azul → índigo → púrpura) ──────────────────────────
  abono_registrado:
    'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600',
  abono_anulado: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600',

  // ── Módulo Renuncias (naranja → rojo → rosa, tono alarma) ─────────────
  renuncia_creada: 'bg-gradient-to-r from-orange-700 via-red-600 to-rose-600',
  renuncia_aprobada: 'bg-gradient-to-r from-orange-700 via-red-600 to-rose-600',
  renuncia_rechazada:
    'bg-gradient-to-r from-orange-700 via-red-600 to-rose-600',
  renuncia_devolucion_procesada:
    'bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600',

  // ── Módulo Documentos (rojo → rosa → pink) ────────────────────────────
  documento_subido: 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600',
  documento_actualizado:
    'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600',
  documento_eliminado: 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600',

  // ── Intereses (violeta → púrpura → índigo) ────────────────────────────
  interes_registrado:
    'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600',
  interes_actualizado:
    'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600',
  interes_descartado:
    'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600',

  // ── Notas y genérico (gris neutro) ────────────────────────────────────
  nota_manual: 'bg-gradient-to-r from-gray-600 via-slate-600 to-zinc-600',
  evento_generico: 'bg-gradient-to-r from-gray-600 via-slate-600 to-zinc-600',

  // ── Traslado de vivienda (esmeralda → teal) ───────────────────────────
  traslado_vivienda:
    'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600',

  // ── Negociación cerrada por traslado (naranja → ámbar) ────────────────
  negociacion_cerrada_traslado:
    'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600',

  // ── Negociación creada por traslado (gris — nunca se muestra en UI) ───
  negociacion_traslado_interna:
    'bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700',

  // ── Abono editado (azul → índigo → púrpura) ───────────────────────────
  abono_editado: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600',
}
