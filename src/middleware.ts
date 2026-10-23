import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

import type { NextFetchEvent, NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { debugLog, errorLog } from '@/lib/utils/logger'

// ============================================================
// HELPERS: Sesiones activas
// ============================================================

/** Parsea el User-Agent en strings legibles para humanos */
function parsearUserAgent(ua: string): {
  dispositivo: string
  navegador: string
} {
  // Navegador
  let navegador = 'Navegador desconocido'
  if (/Edg\//.test(ua)) navegador = 'Edge'
  else if (/OPR\//.test(ua)) navegador = 'Opera'
  else if (/Chrome\//.test(ua)) {
    const v = ua.match(/Chrome\/([\d]+)/)?.[1]
    navegador = `Chrome${v ? ' ' + v : ''}`
  } else if (/Firefox\//.test(ua)) {
    const v = ua.match(/Firefox\/([\d]+)/)?.[1]
    navegador = `Firefox${v ? ' ' + v : ''}`
  } else if (/Safari\//.test(ua)) {
    navegador = 'Safari'
  }

  // Dispositivo / OS
  let dispositivo = 'Dispositivo desconocido'
  if (/iPhone/.test(ua)) dispositivo = 'iPhone'
  else if (/iPad/.test(ua)) dispositivo = 'iPad'
  else if (/Android/.test(ua)) dispositivo = 'Android'
  else if (/Windows NT 10/.test(ua)) dispositivo = 'Windows 11/10'
  else if (/Windows NT/.test(ua)) dispositivo = 'Windows'
  else if (/Macintosh/.test(ua)) dispositivo = 'macOS'
  else if (/Linux/.test(ua)) dispositivo = 'Linux'

  return { dispositivo, navegador }
}

/** Genera un hash SHA-256 del refresh token para identificar la sesión */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Cliente Supabase con service_role para escrituras en sesiones_activas */
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars in middleware')
  return createSupabaseAdmin(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** Como createAdminClient, pero sin lanzar: sin service_role no se rastrean sesiones */
function crearAdminSeguro() {
  try {
    return createAdminClient()
  } catch (err) {
    errorLog('middleware-sesiones-activas', err as Error, {})
    return null
  }
}

type ClienteMiddleware = ReturnType<typeof createMiddlewareClient>
type ClienteAdmin = ReturnType<typeof createAdminClient>

/** Registra la sesión nueva o actualiza su última actividad */
async function registrarSesion(
  admin: ClienteAdmin,
  req: NextRequest,
  userId: string,
  tokenHash: string,
  existe: boolean
) {
  if (existe) {
    await admin
      .from('sesiones_activas')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('session_token', tokenHash)
    return
  }
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'desconocida'
  const { dispositivo, navegador } = parsearUserAgent(
    req.headers.get('user-agent') || ''
  )
  await admin
    .from('sesiones_activas')
    .upsert(
      { user_id: userId, session_token: tokenHash, dispositivo, navegador, ip },
      { onConflict: 'session_token' }
    )
  await admin.rpc('limpiar_sesiones_antiguas', { p_user_id: userId })
}

/** Permisos permitidos del rol como 'modulo.accion'; null si la consulta falla */
async function consultarPermisos(
  supabase: ClienteMiddleware,
  rol: string
): Promise<string[] | null> {
  const { data, error } = await supabase
    .from('permisos_rol')
    .select('modulo, accion')
    .eq('rol', rol)
    .eq('permitido', true)
  if (error) {
    // Si falla la consulta BD, se usa lo que haya en el JWT como último recurso
    debugLog('⚠️ Error consultando BD, usando JWT como fallback', {
      rol,
      error: error.message,
    })
    return null
  }
  return (data ?? []).map(p => `${p.modulo}.${p.accion}`)
}

/** Claims custom que escribe custom_access_token_hook (Edge: sin Buffer) */
function leerClaimsJwt(
  accessToken: string | undefined,
  pathname: string
): { rol: string; nombres: string; email: string; permisos: string[] } {
  const vacio = { rol: '', nombres: '', email: '', permisos: [] }
  const partes = accessToken?.split('.')
  if (partes?.length !== 3) return vacio
  try {
    let base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) base64 += '='
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(json)
    return {
      rol: payload.user_rol || '',
      nombres: payload.user_nombres || '',
      email: payload.user_email || '',
      permisos: (payload.user_permisos as string[]) || [],
    }
  } catch (error) {
    errorLog('middleware-jwt-decode', error as Error, { pathname })
    return vacio
  }
}

/** Precarga de <Link> (no es una visita real) */
function esPrefetch(req: NextRequest): boolean {
  return (
    req.headers.get('next-router-prefetch') === '1' ||
    req.headers.get('purpose') === 'prefetch'
  )
}

/** Cierra la sesión y redirige a /login conservando las cookies del signOut */
async function cerrarSesionYRedirigir(
  req: NextRequest,
  res: NextResponse,
  supabase: ClienteMiddleware,
  params: Record<string, string> = {}
) {
  await supabase.auth.signOut()
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/login'
  Object.entries(params).forEach(([k, v]) => redirectUrl.searchParams.set(k, v))
  const redirectRes = NextResponse.redirect(redirectUrl)
  res.cookies.getAll().forEach(c => redirectRes.cookies.set(c))
  return redirectRes
}

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
  // Registro de eventos de seguridad: los intentos fallidos ocurren sin sesión
  // (la ruta valida el tipo y limita por IP)
  '/api/auth/evento-seguridad',
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
    '/abonos/registrar': { modulo: 'abonos', accion: 'registrar' },
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

export async function middleware(req: NextRequest, event: NextFetchEvent) {
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
  // 2a. /login CON SESIÓN ACTIVA → Redirigir al dashboard
  // ============================================
  // Las rutas públicas pasan sin validación, pero /login es especial:
  // si el usuario ya tiene sesión válida, no tiene sentido mostrarle el login.

  if (pathname === '/login') {
    const tmpRes = NextResponse.next()
    const supabaseTmp = createMiddlewareClient(req, tmpRes)
    const {
      data: { user: existingUser },
    } = await supabaseTmp.auth.getUser()
    if (existingUser) {
      // Solo redirigir al dashboard si la cuenta está activa.
      // Si está Inactiva/Bloqueada, hacer signOut y mostrar el login
      // para evitar el redirect loop (estado inactivo → /login → / → loop).
      const { data: cuenta } = await supabaseTmp
        .from('usuarios')
        .select('estado')
        .eq('id', existingUser.id)
        .maybeSingle()

      if (cuenta?.estado === 'Activo') {
        return NextResponse.redirect(new URL('/', req.url))
      }

      // Cuenta inactiva o bloqueada: limpiar sesión y mostrar login.
      // signOut modifica tmpRes (están vinculados), así que devolver tmpRes
      // propaga la cookie borrada al navegador.
      await supabaseTmp.auth.signOut()
    }
    return tmpRes
  }

  // ============================================
  // 2b. OTRAS RUTAS PÚBLICAS → Permitir sin validación
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
    // 4b. CLAIMS DEL JWT (lectura local, sin red)
    // ============================================

    const {
      data: { session },
    } = await supabase.auth.getSession()
    const claims = leerClaimsJwt(session?.access_token, pathname)
    let rol = claims.rol // vacío si el hook no inyectó el claim
    const nombres = claims.nombres
    const email = claims.email || user.email || ''
    let permisosCache = claims.permisos

    // ============================================
    // 5. VERIFICACIONES EN PARALELO (un solo viaje a Supabase)
    // ============================================
    // - Estado de la cuenta: el JWT puede seguir vigente aunque el usuario
    //   esté Bloqueado/Inactivo; la BD es la fuente de verdad.
    // - Sesión revocada remotamente (sesiones_activas, con service_role).
    // - Permisos del rol: si no es Admin, la BD manda sobre el JWT para que
    //   los cambios de permisos apliquen de inmediato.

    const tokenHash = session?.refresh_token
      ? await hashToken(session.refresh_token)
      : null
    const adminSesiones = tokenHash ? crearAdminSeguro() : null

    const [cuentaRes, sesionRes, permisosRes] = await Promise.all([
      supabase
        .from('usuarios')
        .select('estado')
        .eq('id', user.id)
        .maybeSingle(),
      adminSesiones && tokenHash
        ? adminSesiones
            .from('sesiones_activas')
            .select('id, revocada')
            .eq('session_token', tokenHash)
            .maybeSingle()
        : null,
      rol && rol !== 'Administrador' ? consultarPermisos(supabase, rol) : null,
    ])

    if (cuentaRes.error) {
      // Si falla la consulta de estado, denegar acceso por seguridad (sin
      // cerrar la sesión: un corte momentáneo de Supabase no debe desloguear)
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }

    if (!cuentaRes.data || cuentaRes.data.estado !== 'Activo') {
      debugLog('🚫 Cuenta bloqueada o inactiva', {
        estado: cuentaRes.data?.estado,
        pathname,
      })
      return cerrarSesionYRedirigir(req, res, supabase)
    }

    if (sesionRes?.error) {
      errorLog(
        'middleware-sesiones-activas',
        new Error(sesionRes.error.message),
        {
          pathname,
        }
      )
    }
    const sesionData = sesionRes?.data ?? null

    if (sesionData?.revocada) {
      debugLog('🚫 Sesión revocada remotamente', { pathname })
      return cerrarSesionYRedirigir(req, res, supabase, { revocada: '1' })
    }

    // ============================================
    // 6. ESCRITURAS SECUNDARIAS (no bloquean la respuesta)
    // ============================================
    // Las precargas de enlaces (prefetch) no son visitas reales: no se anotan.

    if (!esPrefetch(req)) {
      if (adminSesiones && tokenHash) {
        event.waitUntil(
          registrarSesion(adminSesiones, req, user.id, tokenHash, !!sesionData)
        )
      }
      // Throttle en la BD: máx. 1 escritura por hora
      event.waitUntil(
        Promise.resolve(
          supabase.rpc('actualizar_ultimo_acceso_si_necesario', {
            p_user_id: user.id,
          })
        ).catch(() => undefined)
      )
    }

    // ============================================
    // 7. VERIFICAR PERMISOS PARA LA RUTA (JWT CACHE o FALLBACK BD)
    // ============================================

    if (permisosRes) permisosCache = permisosRes

    // Si el JWT no tiene el rol (hook no configurado en este entorno o JWT stale),
    // obtener el rol real desde la tabla usuarios como fuente de verdad.
    if (!rol) {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

      rol = userData?.rol || 'Vendedor'
      debugLog('⚠️ JWT sin user_rol, rol obtenido desde BD', { rol, pathname })

      if (rol !== 'Administrador') {
        permisosCache =
          (await consultarPermisos(supabase, rol)) ?? permisosCache
      }
    }

    const hasAccess = canAccessRoute(pathname, rol, permisosCache)

    if (!hasAccess) {
      // Sin permiso → rewrite a página 403 (URL del navegador no cambia)
      return NextResponse.rewrite(new URL('/acceso-denegado', req.url))
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
