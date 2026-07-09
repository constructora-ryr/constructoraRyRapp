/**
 * 🎨 ESTILOS CENTRALIZADOS - ViviendasTabla
 * ✅ Colores naranja/ámbar (theming de Viviendas)
 * ✅ Diseño compacto y alineado
 * ✅ Dark mode completo
 */

export const viviendasTablaStyles = {
  // Icono de número de vivienda
  iconContainer:
    'w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20',
  iconSvg: 'w-4 h-4 text-white',

  // Contenedor de número + icono
  numero: {
    container: 'flex items-center gap-2',
    text: 'font-bold text-gray-900 dark:text-gray-100 text-xs whitespace-nowrap',
  },

  // Badge de estado
  badge: {
    base: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[10px] whitespace-nowrap',
    disponible:
      'bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/50 text-slate-600 dark:text-slate-400',
    asignada:
      'bg-blue-100 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800/50 text-blue-700 dark:text-blue-300',
    entregada:
      'bg-purple-100 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800/50 text-purple-700 dark:text-purple-300',
    propietario:
      'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300',
    default:
      'bg-gray-100 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300',
  },

  // Headers de columnas
  header: {
    wrapper: 'text-center',
  },

  // Contenedores de celdas
  cell: {
    center: 'flex justify-center',
    text: 'text-sm text-gray-700 dark:text-gray-300',
    textCompact: 'text-xs text-gray-700 dark:text-gray-300 truncate max-w-full',
  },

  // Proyecto (solo nombre ahora)
  proyecto: {
    nombre:
      'text-xs font-semibold text-gray-900 dark:text-gray-100 truncate max-w-full',
  },

  // Valor
  valor: {
    text: 'text-xs font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap',
  },

  // Barra de progreso de pagos
  progressBar: {
    container: 'flex items-center gap-1',
    track:
      'flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
    fill: 'h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all',
    label:
      'text-[9px] font-bold text-gray-600 dark:text-gray-400 min-w-[28px] text-right',
    // Estados deshabilitados (sin asignar)
    trackDisabled:
      'flex-1 h-1.5 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden opacity-50',
    fillDisabled: 'h-full bg-gray-400 dark:bg-gray-700 transition-all',
    labelDisabled:
      'text-[9px] font-bold text-gray-400 dark:text-gray-600 min-w-[28px] text-right',
  },

  // Acciones
  actions: {
    container: 'flex items-center justify-center gap-1',
    button: {
      base: 'group p-1 rounded-md transition-all hover:scale-105',
      view: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/50',
      edit: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50',
      delete:
        'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50',
    },
    icon: 'w-3 h-3',
  },
}
