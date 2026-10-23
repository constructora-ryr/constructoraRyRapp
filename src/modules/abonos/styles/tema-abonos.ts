/**
 * Color del módulo Abonos para superficies grandes (banners, cabeceras de
 * tabla, encabezado del detalle, botón principal).
 *
 * En modo oscuro se baja 1–3 tonos: el violeta y sobre todo el fucsia en
 * tono 600 tienen tanta saturación que sobre el fondo casi negro se ven
 * "neón". Los acentos pequeños (textos, chips) ya tienen su variante dark.
 */
export const TEMA_ABONOS = {
  degradado:
    'from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-700 dark:via-purple-800 dark:to-fuchsia-900',
  /** Encabezado del detalle cuando el cliente ya es Propietario */
  degradadoPropietario:
    'from-amber-500 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-700 dark:to-amber-800',
  boton:
    'bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-violet-500/25 hover:shadow-violet-500/40 dark:from-violet-700 dark:to-fuchsia-800 dark:shadow-violet-950/40',
  icono:
    'bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-violet-500/25 dark:from-violet-600 dark:to-fuchsia-700 dark:shadow-violet-950/40',
} as const
