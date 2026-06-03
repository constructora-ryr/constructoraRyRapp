'use client'

/**
 * Suprime errores de consola conocidos y benignos que vienen de librerías externas.
 * Solo actúa en el browser — no tiene efecto en el servidor.
 *
 * Cuándo usar: errores que no podemos evitar porque vienen del interior del SDK
 * (antes de que nuestro código corra), pero que ya están manejados correctamente
 * en la aplicación.
 */
export function suppressKnownConsoleErrors() {
  if (typeof window === 'undefined') return

  // eslint-disable-next-line no-console
  const originalError = console.error.bind(console)

  // eslint-disable-next-line no-console
  console.error = (...args: unknown[]) => {
    const msg = args[0]

    // Supabase SDK lanza este error cuando el refresh token guardado en cookies
    // ya no es válido (sesión expirada). Nuestro auth context ya lo maneja
    // llamando signOut({ scope: 'local' }) vía TOKEN_REFRESH_FAILED.
    // El SDK llama console.error antes de que nuestros handlers corran.
    if (
      typeof msg === 'string' &&
      (msg.includes('Invalid Refresh Token') ||
        msg.includes('Refresh Token Not Found'))
    ) {
      return
    }

    // AuthApiError arrojado como objeto — mismo caso
    if (
      msg instanceof Error &&
      (msg.message.includes('Invalid Refresh Token') ||
        msg.message.includes('Refresh Token Not Found'))
    ) {
      return
    }

    originalError(...args)
  }
}
