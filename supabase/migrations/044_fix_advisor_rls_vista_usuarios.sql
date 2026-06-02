-- ============================================================
-- MIGRACIÓN 044: Fix Supabase Advisor — RLS + vista_usuarios_completos
-- ============================================================
-- Problema 1 (CRITICAL): Policy Exists RLS Disabled
--   Las tablas clientes, fuentes_pago y manzanas tienen políticas RLS
--   definidas pero RLS no está habilitado, por lo que las políticas
--   no se aplican y cualquier usuario autenticado accede a todo.
--
-- Problema 2 (CRITICAL): Exposed Auth Users
--   vista_usuarios_completos hace JOIN directo con auth.users, lo que
--   expone columnas internas de auth al role "authenticated".
--   Fix: usar solo datos de la tabla pública "usuarios".
-- ============================================================

BEGIN;

-- ============================================================
-- 1. HABILITAR RLS EN TABLAS CON POLÍTICAS YA EXISTENTES
-- ============================================================

ALTER TABLE clientes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuentes_pago  ENABLE ROW LEVEL SECURITY;
ALTER TABLE manzanas      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. RECREAR vista_usuarios_completos SIN JOIN a auth.users
-- ============================================================
-- Los campos fecha_registro_auth y ultimo_login_auth se cubren con
-- fecha_creacion (de usuarios) y ultimo_acceso (actualizado por trigger)
-- que ya son datos propios de la tabla pública.

DROP VIEW IF EXISTS vista_usuarios_completos;

CREATE OR REPLACE VIEW vista_usuarios_completos AS
SELECT
  u.id,
  u.email,
  u.nombres,
  u.apellidos,
  u.nombres || ' ' || u.apellidos AS nombre_completo,
  u.telefono,
  u.rol,
  u.estado,
  u.avatar_url,
  u.ultimo_acceso,
  u.debe_cambiar_password,
  u.intentos_fallidos,
  u.bloqueado_hasta,
  u.fecha_creacion,
  u.fecha_actualizacion,
  creator.nombres || ' ' || creator.apellidos AS creado_por_nombre
FROM usuarios u
LEFT JOIN usuarios creator ON creator.id = u.creado_por;

COMMENT ON VIEW vista_usuarios_completos IS
  'Vista completa de usuarios con información de perfil y rol. '
  'No expone auth.users para evitar fuga de datos de autenticación interna.';

GRANT SELECT ON vista_usuarios_completos TO authenticated;

COMMIT;

-- ============================================================
-- DIAGNÓSTICO: otras tablas con políticas pero RLS deshabilitado
-- ============================================================
-- Ejecutar esto manualmente para ver si quedan tablas afectadas
-- después de aplicar esta migración:
--
-- SELECT schemaname, tablename
-- FROM pg_tables t
-- WHERE schemaname = 'public'
--   AND NOT rowsecurity
--   AND EXISTS (
--     SELECT 1 FROM pg_policies p
--     WHERE p.schemaname = t.schemaname
--       AND p.tablename = t.tablename
--   )
-- ORDER BY tablename;
