/**
 * A dónde ir después del login. Solo rutas internas de la app: evita que un
 * enlace como /login?redirectedFrom=https://sitio-falso.com mande al usuario
 * a otro sitio justo después de iniciar sesión (redirección abierta).
 */

const NO_VOLVER = ['/login', '/reset-password', '/auth/']

export function rutaDespuesDeLogin(destino: string | null | undefined): string {
  if (!destino) return '/'
  // Interna: empieza con una sola "/" (no "//dominio" ni "/\dominio")
  if (
    !destino.startsWith('/') ||
    destino.startsWith('//') ||
    destino.startsWith('/\\')
  )
    return '/'
  // Sin esquemas ni saltos de línea camuflados
  if (/[\r\n\t]/.test(destino) || /^\/[a-z]+:/i.test(destino)) return '/'
  if (NO_VOLVER.some(r => destino === r || destino.startsWith(r))) return '/'
  return destino
}
