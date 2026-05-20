import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { debugLog, errorLog } from '@/lib/utils/logger'

/**
 * ============================================
 * MIDDLEWARE: Autenticación y Autorización
 * ============================================
 *
 * Intercepta TODAS las requests ANTES de llegar a las páginas.
 * Valida autenticación y permisos en el SERVIDOR.
 *
 * ARQUITECTURA:
 * 1. Rutas públicas → Pasan sin validación
 * 2. Assets estáticos → Pasan sin validación
 * 3. Verificar sesión → Si no hay, redirect a /login
 * 4. Verificar permisos → Si no tiene acceso, redirect a /dashboard
 * 5. Agregar headers con info de usuario → Para Server Components
 */

// ============================================
// CONFIGURACIÓN DE RUTAS
// ============================================

/** Rutas públicas que NO requieren autenticación */
const PUBLIC_ROUTES = [
  '/login',
  '/reset-password',
  '/update-password',
  '/auth/callback',
  '/bienvenida',
]

/**
 * Mapeo de rutas a módulo+acción de permisos
 * El middleware consultará permisos_rol en tiempo real
 * Si una ruta no está aquí, es accesible por todos los autenticados
 *
 * El orden importa: las rutas más específicas deben ir primero
 */
const ROUTE_TO_PERMISSION: Record<string, { modulo: string; accion: string }> =
  {
    // Sub-rutas específicas (deben ir ANTES que las rutas base)
    '/proyectos/nuevo': { modulo: 'proyectos', accion: 'crear' },
    '/viviendas/nueva': { modulo: 'viviendas', accion: 'crear' }, // ✅ era 'nuevo'
    '/clientes/nuevo': { modulo: 'clientes', accion: 'crear' },
    '/renuncias/nuevo': { modulo: 'renuncias', accion: 'crear' },
    '/abonos/nuevo': { modulo: 'abonos', accion: 'crear' },
    '/abonos/registrar': { modulo: 'abonos', accion: 'crear' }, // ✅ ruta real de registrar abono
    '/usuarios/nueva': { modulo: 'usuarios', accion: 'crear' },

    // Módulos principales (ver)
    '/viviendas': { modulo: 'viviendas', accion: 'ver' },
    '/clientes': { modulo: 'clientes', accion: 'ver' },
    '/proyectos': { modulo: 'proyectos', accion: 'ver' },
    '/negociaciones': { modulo: 'negociaciones', accion: 'ver' },
    '/documentos': { modulo: 'documentos', accion: 'ver' },

    // Módulos restringidos
    '/abonos': { modulo: 'abonos', accion: 'ver' },
    '/renuncias': { modulo: 'renuncias', accion: 'ver' },
    '/auditorias': { modulo: 'auditorias', accion: 'ver' },

    // Administración
    '/admin': { modulo: 'administracion', accion: 'ver' },
    '/usuarios': { modulo: 'usuarios', accion: 'ver' },
    '/reportes': { modulo: 'reportes', accion: 'ver' },
  }

// ============================================
// HELPERS
// ============================================

/** Verificar si una ruta es pública */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

/** Verificar si una ruta es un asset estático */
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon.svg') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/) !== null
  )
}

/** Verificar si el usuario tiene acceso a una ruta basado en cache de permisos en JWT */
function canAccessRoute(
  pathname: string,
  userRole: string,
  permisosCache: string[]
): boolean {
  // Administrador siempre tiene acceso (bypass)
  if (userRole === 'Administrador') {
    return true
  }

  // Detectar sub-rutas de edición dinámicas: /modulo/[slug]/editar
  // Ej: /proyectos/las-americas-2-.../editar → requiere proyectos.editar
  const editarMatch = pathname.match(
    /^\/(proyectos|viviendas|clientes|abonos|renuncias|usuarios)\/[^/]+\/editar/
  )
  if (editarMatch) {
    const modulo = editarMatch[1]
    const permisoRequerido = `${modulo}.editar`
    if (permisosCache.includes('*.*')) return true
    return permisosCache.includes(permisoRequerido)
  }

  // Detectar rutas de asignar/trasladar vivienda → requieren permiso de negociaciones
  // Ej: /clientes/[slug]/asignar-vivienda → negociaciones.asignar
  const asignarMatch = pathname.match(
    /^\/clientes\/[^/]+\/asignar-vivienda(-v2)?$/
  )
  if (asignarMatch) {
    if (permisosCache.includes('*.*')) return true
    return permisosCache.includes('negociaciones.asignar')
  }

  // Ej: /clientes/[slug]/traslado-vivienda → negociaciones.trasladar
  const trasladoMatch = pathname.match(/^\/clientes\/[^/]+\/traslado-vivienda$/)
  if (trasladoMatch) {
    if (permisosCache.includes('*.*')) return true
    return permisosCache.includes('negociaciones.trasladar')
  }

  // Buscar permiso por coincidencia de prefijo (rutas del mapa)
  for (const [route, permission] of Object.entries(ROUTE_TO_PERMISSION)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      // ✅ OPTIMIZACIÓN: Leer del cache del JWT (0ms, sin query)
      const permisoRequerido = `${permission.modulo}.${permission.accion}`

      // Wildcard para admin
      if (permisosCache.includes('*.*')) {
        return true
      }

      // Verificar permiso específico en cache
      const tienePermiso = permisosCache.includes(permisoRequerido)

      if (!tienePermiso) {
        debugLog('❌ Permiso denegado', {
          permiso: permisoRequerido,
          rol: userRole,
        })
      }

      return tienePermiso
    }
  }

  // Si no está en el mapa, es accesible por todos autenticados
  return true
}

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  debugLog('🔍 Middleware request', {
    pathname,
    cookies: req.cookies.getAll().length,
  })

  // ============================================
  // 1. ASSETS ESTÁTICOS → Permitir sin validación
  // ============================================

  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  // ============================================
  // 2. RUTAS PÚBLICAS → Permitir sin validación
  // ============================================

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // ============================================
  // 3. CREAR CLIENTE SUPABASE PARA MIDDLEWARE
  // ============================================

  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient(req, res)

    // ============================================
    // 4. VERIFICAR SESIÓN (SEGURO)
    // ============================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    debugLog('🔑 Auth check', {
      hasUser: !!user,
      email: user?.email,
    })

    if (!user || authError) {
      debugLog('❌ Sin sesión válida, redirigiendo a login', { pathname })

      // Sin sesión válida → Redirigir a login con URL de retorno
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'

      // Guardar ruta original para redirect después del login
      // Solo si no es la raíz
      if (pathname !== '/' && pathname !== '/login') {
        redirectUrl.searchParams.set('redirect', pathname)
      }

      return NextResponse.redirect(redirectUrl)
    }

    debugLog('✅ Usuario autenticado', { email: user.email, pathname })

    // ============================================
    // 5. SI ESTÁ EN /login CON SESIÓN → Permitir (el componente manejará la redirección)
    // ============================================

    // ✅ CORRECCIÓN: No redirigir desde middleware, dejar que useLogin maneje la navegación
    // Esto evita race conditions entre middleware y router.push()
    if (pathname === '/login') {
      debugLog(
        '🔀 Usuario autenticado en /login, permitiendo (componente redirigirá)'
      )
      return res // Permitir acceso, el componente de login manejará la navegación
    }

    // ============================================
    // 6. OBTENER ROL Y PERMISOS DEL JWT (EDGE RUNTIME COMPATIBLE)
    // ============================================

    let rol = 'Administrador de Obra'
    let nombres = ''
    let email = user.email || ''
    let permisosCache: string[] = [] // ✅ Cache de permisos desde JWT

    // Obtener sesión para acceder al JWT
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Decodificar JWT (compatible con Edge Runtime - sin Buffer)
    if (session?.access_token) {
      try {
        const parts = session.access_token.split('.')
        if (parts.length === 3) {
          // Decodificar base64 sin Buffer (Edge Runtime compatible)
          let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
          // Agregar padding si es necesario
          while (base64.length % 4) {
            base64 += '='
          }

          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          const payload = JSON.parse(jsonPayload)

          // Leer claims custom del payload
          rol = payload.user_rol || 'Administrador de Obra'
          nombres = payload.user_nombres || ''
          email = payload.user_email || user.email || ''

          // ✅ OPTIMIZACIÓN: Leer permisos del JWT claim user_permisos
          // Escrito por custom_access_token_hook en cada login
          // Fallback a [] si el token es previo al hook (se re-lee desde BD abajo)
          permisosCache = (payload.user_permisos as string[]) || []
        }
      } catch (error) {
        // Fallback a valores por defecto si falla decodificación
        errorLog('middleware-jwt-decode', error as Error, { pathname })
      }
    }

    // ============================================
    // 7. VERIFICAR PERMISOS PARA LA RUTA (JWT CACHE o FALLBACK BD)
    // ============================================

    // IMPORTANTE: El JWT puede estar obsoleto si se actualizaron permisos después del login.
    // Por eso SIEMPRE validamos contra BD para rutas protegidas, no solo si cache está vacío.
    // Esto asegura que cambios de permisos en admin sean efectivos inmediatamente.

    // Si el usuario no es Admin, siempre consultar BD como fuente de verdad
    // El JWT es solo una optimización para evitar queries frecuentes, pero NO es confiable
    if (rol !== 'Administrador') {
      try {
        const { data: permisosBD } = await supabase
          .from('permisos_rol')
          .select('modulo, accion')
          .eq('rol', rol)
          .eq('permitido', true)

        if (permisosBD && permisosBD.length > 0) {
          // ✅ SIEMPRE usar permisos de BD (no confiar en JWT stale)
          permisosCache = permisosBD.map(p => `${p.modulo}.${p.accion}`)
          debugLog('✅ Permisos validados desde BD (fuente de verdad)', {
            rol,
            count: permisosCache.length,
            pathname,
          })
        } else {
          // Si la BD retorna nada, usuario sin permisos
          permisosCache = []
          debugLog('⚠️ Usuario sin permisos registrados en BD', {
            rol,
            pathname,
          })
        }
      } catch (error) {
        // Si falla la consulta BD, FALLBACK a JWT como último recurso
        // No bloquear completamente, dejar que el usuario intente
        debugLog('⚠️ Error consultando BD, usando JWT como fallback', {
          rol,
          error: (error as Error).message,
        })
        // permisosCache ya tiene valores del JWT
      }
    }

    const hasAccess = canAccessRoute(pathname, rol, permisosCache)

    if (!hasAccess) {
      // Sin permiso → rewrite a página 403 (URL del navegador no cambia)
      return NextResponse.rewrite(new URL('/acceso-denegado', req.url))
    }

    // ============================================
    // 8. ACTUALIZAR ultimo_acceso (throttle: máx. 1 vez por hora)
    // ============================================
    // Solo actualiza si han pasado más de 60 minutos desde el último acceso.
    // Evita escrituras en cada request sin perder precisión útil.

    try {
      await supabase.rpc('actualizar_ultimo_acceso_si_necesario', {
        p_user_id: user.id,
      })
    } catch {
      // No bloquear la request si falla — es un dato secundario
    }

    // ============================================
    // 9. AGREGAR HEADERS CON INFO DE USUARIO
    // ============================================
    // IMPORTANTE: Headers solo aceptan ASCII, encodear caracteres especiales

    res.headers.set('x-user-id', user.id)
    res.headers.set('x-user-rol', encodeURIComponent(rol))
    res.headers.set('x-user-email', encodeURIComponent(email))
    res.headers.set('x-user-nombres', encodeURIComponent(nombres))

    return res
  } catch {
    // Si hay cualquier error, redirigir a login
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }
}

// ============================================
// CONFIGURACIÓN: QUÉ RUTAS INTERCEPTAR
// ============================================

export const config = {
  /*
   * Interceptar todas las rutas EXCEPTO:
   * - _next/static (archivos estáticos de Next.js)
   * - _next/image (optimización de imágenes)
   * - favicon.ico, robots.txt, etc.
   * - Archivos con extensiones de imagen/CSS/JS
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|acceso-denegado|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)).*)',
  ],
}
