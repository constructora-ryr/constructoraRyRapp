/**
 * Rutas públicas de la aplicación (sin autenticación requerida).
 * Usadas en ConditionalSidebar y ConditionalLayout para ocultar
 * la UI de app autenticada.
 *
 * ⚠️ El middleware tiene su propia lista (puede diferir — incluye /update-password).
 */
export const PUBLIC_UI_ROUTES = [
  '/login',
  '/registro',
  '/reset-password',
  '/bienvenida',
] as const

/**
 * Verifica si un pathname corresponde a una ruta pública de UI.
 * Usa coincidencia exacta o prefijo con barra para evitar false positives
 * (ej: '/registro' no matchea '/registros').
 */
export function isPublicUIRoute(pathname: string): boolean {
  return PUBLIC_UI_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  )
}
