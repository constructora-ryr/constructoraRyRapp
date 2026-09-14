-- ============================================================
-- MIGRACIÓN: Habilitar RLS en tablas pendientes + fix vista auth.users
-- Fecha: 2026-09-10
--
-- PROBLEMA 1: 6 tablas tienen políticas RLS definidas pero RLS no
--   está habilitado → los datos son accesibles con la anon key directamente.
--   Las políticas ya existen (migrations previas); solo falta activarlas.
--
-- PROBLEMA 2: vista_usuarios_completos aún referencia auth.users
--   (posiblemente la migración 045 no se ejecutó en producción, o fue
--   reintroducida por una migración posterior).
--
-- IMPACTO: Solo afecta acceso directo vía API con anon key.
--   El middleware Next.js sigue funcionando igual (usa service_role
--   o sesión autenticada con las políticas activas).
-- ============================================================

BEGIN;

-- ============================================================
-- 1. HABILITAR RLS EN LAS 6 TABLAS CON POLÍTICAS PENDIENTES
-- ============================================================

ALTER TABLE public.clientes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuentes_pago   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manzanas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negociaciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viviendas      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. RECREAR vista_usuarios_completos SIN JOIN a auth.users
-- ============================================================
-- La columna ultimo_login ya vive en public.usuarios desde
-- la migración 20260422. No se necesita acceder a auth.users.

DROP VIEW IF EXISTS vista_usuarios_completos;

CREATE VIEW vista_usuarios_completos AS
SELECT
  u.id,
  u.email,
  u.nombres,
  u.apellidos,
  (u.nombres || ' ' || u.apellidos) AS nombre_completo,
  u.telefono,
  u.rol,
  u.estado,
  u.avatar_url,
  u.ultimo_acceso,
  u.ultimo_login,
  u.debe_cambiar_password,
  u.intentos_fallidos,
  u.bloqueado_hasta,
  u.fecha_creacion,
  u.fecha_actualizacion,
  (creator.nombres || ' ' || creator.apellidos) AS creado_por_nombre
FROM public.usuarios u
LEFT JOIN public.usuarios creator ON creator.id = u.creado_por;

COMMENT ON VIEW vista_usuarios_completos IS
  'Vista de perfiles de usuario. No accede a auth.users.';

GRANT SELECT ON vista_usuarios_completos TO authenticated;

-- ============================================================
-- 3. VERIFICACIÓN
-- ============================================================

DO $$
DECLARE
  v_sin_rls INT;
  v_vista_auth INT;
BEGIN
  -- Tablas con políticas pero sin RLS (debe ser 0)
  SELECT COUNT(*) INTO v_sin_rls
  FROM pg_tables t
  WHERE schemaname = 'public'
    AND NOT rowsecurity
    AND tablename IN ('clientes','fuentes_pago','manzanas','negociaciones','proyectos','viviendas');

  -- Vistas que referencian auth.users (debe ser 0 para vista_usuarios_completos)
  SELECT COUNT(*) INTO v_vista_auth
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name = 'vista_usuarios_completos'
    AND view_definition ILIKE '%auth.users%';

  IF v_sin_rls = 0 AND v_vista_auth = 0 THEN
    RAISE NOTICE '✅ Migración OK: RLS habilitado en 6 tablas, vista sin auth.users.';
  ELSE
    RAISE WARNING '⚠️ Quedan % tablas sin RLS, % vistas con auth.users.', v_sin_rls, v_vista_auth;
  END IF;
END $$;

COMMIT;
