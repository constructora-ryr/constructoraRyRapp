-- ============================================================
-- MIGRACIÓN 045: Fix completo Supabase Advisor — 25 issues
-- ============================================================
-- Fecha: 2026-05-29
--
-- PROBLEMA 1 (CRITICAL): vista_usuarios_completos expone auth.users
--   La migración 20260422_agregar_ultimo_login.sql reintrodujo el
--   LEFT JOIN a auth.users que fue removido en 044. La columna
--   ultimo_login ya vive en public.usuarios via trigger, por lo que
--   el JOIN a auth es innecesario y peligroso.
--
-- PROBLEMA 2 (CRITICAL): GRANT SELECT TO anon en vistas sensibles
--   vista_abonos_completos y vista_viviendas_completas tienen GRANT
--   al rol anon, exponiendo datos financieros e inmobiliarios a
--   usuarios NO autenticados (cualquier request sin JWT).
--
-- PROBLEMA 3 (HIGH): Tablas sin RLS
--   documentos_pendientes, negociaciones_historial y
--   tipos_fuente_plantillas tienen datos sensibles pero no tienen
--   ENABLE ROW LEVEL SECURITY ni políticas definidas.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. RECREAR vista_usuarios_completos SIN JOIN a auth.users
-- ============================================================
-- ultimo_login ya está en public.usuarios (agregado en 20260422).
-- Eliminar fecha_registro_auth y ultimo_login_auth que venían
-- de auth.users — no son necesarios para el funcionamiento de la app.

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
FROM usuarios u
LEFT JOIN usuarios creator ON creator.id = u.creado_por;

COMMENT ON VIEW vista_usuarios_completos IS
  'Vista de perfiles de usuario. No accede a auth.users para evitar '
  'exposición de datos internos de autenticación.';

GRANT SELECT ON vista_usuarios_completos TO authenticated;

-- ============================================================
-- 2. REVOCAR GRANT anon EN VISTAS CON DATOS SENSIBLES
-- ============================================================

REVOKE SELECT ON vista_abonos_completos   FROM anon;
REVOKE SELECT ON vista_viviendas_completas FROM anon;

-- ============================================================
-- 3. RLS PARA documentos_pendientes
-- ============================================================
-- Vinculada a clientes y fuentes_pago. Hereda permisos del módulo
-- 'clientes': solo usuarios autenticados con permiso pueden operar.

ALTER TABLE documentos_pendientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver documentos pendientes" ON documentos_pendientes;
DROP POLICY IF EXISTS "Usuarios pueden crear documentos pendientes" ON documentos_pendientes;
DROP POLICY IF EXISTS "Usuarios pueden editar documentos pendientes" ON documentos_pendientes;
DROP POLICY IF EXISTS "Usuarios pueden eliminar documentos pendientes" ON documentos_pendientes;

CREATE POLICY "Usuarios pueden ver documentos pendientes"
  ON documentos_pendientes FOR SELECT TO authenticated
  USING (tiene_permiso(auth.uid(), 'clientes', 'ver'));

CREATE POLICY "Usuarios pueden crear documentos pendientes"
  ON documentos_pendientes FOR INSERT TO authenticated
  WITH CHECK (tiene_permiso(auth.uid(), 'clientes', 'crear'));

CREATE POLICY "Usuarios pueden editar documentos pendientes"
  ON documentos_pendientes FOR UPDATE TO authenticated
  USING  (tiene_permiso(auth.uid(), 'clientes', 'editar'))
  WITH CHECK (tiene_permiso(auth.uid(), 'clientes', 'editar'));

CREATE POLICY "Usuarios pueden eliminar documentos pendientes"
  ON documentos_pendientes FOR DELETE TO authenticated
  USING (tiene_permiso(auth.uid(), 'clientes', 'eliminar'));

-- ============================================================
-- 4. RLS PARA negociaciones_historial
-- ============================================================
-- Audit trail de negociaciones. Lectura abierta a quienes puedan
-- ver clientes; escritura solo al sistema (triggers SECURITY DEFINER).
-- Eliminar/modificar historial requiere permiso de eliminar clientes.

ALTER TABLE negociaciones_historial ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver historial de negociaciones" ON negociaciones_historial;
DROP POLICY IF EXISTS "Sistema puede insertar historial de negociaciones" ON negociaciones_historial;
DROP POLICY IF EXISTS "Admins pueden eliminar historial de negociaciones" ON negociaciones_historial;

CREATE POLICY "Usuarios pueden ver historial de negociaciones"
  ON negociaciones_historial FOR SELECT TO authenticated
  USING (tiene_permiso(auth.uid(), 'clientes', 'ver'));

-- Los triggers de historial usan SECURITY DEFINER, pero la policy
-- cubre inserciones directas (ej: llamadas desde el cliente).
CREATE POLICY "Sistema puede insertar historial de negociaciones"
  ON negociaciones_historial FOR INSERT TO authenticated
  WITH CHECK (tiene_permiso(auth.uid(), 'clientes', 'editar'));

CREATE POLICY "Admins pueden eliminar historial de negociaciones"
  ON negociaciones_historial FOR DELETE TO authenticated
  USING (tiene_permiso(auth.uid(), 'clientes', 'eliminar'));

-- ============================================================
-- 5. RLS PARA tipos_fuente_plantillas
-- ============================================================
-- Tabla de configuración (mapeo tipo_fuente → plantilla_requisito).
-- Solo administración puede modificarla; todos los autenticados la leen.

ALTER TABLE tipos_fuente_plantillas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver tipos fuente plantillas" ON tipos_fuente_plantillas;
DROP POLICY IF EXISTS "Usuarios pueden gestionar tipos fuente plantillas" ON tipos_fuente_plantillas;

CREATE POLICY "Usuarios pueden ver tipos fuente plantillas"
  ON tipos_fuente_plantillas FOR SELECT TO authenticated
  USING (true);

-- Crear/editar/eliminar la configuración requiere permiso de proyecto
CREATE POLICY "Usuarios pueden gestionar tipos fuente plantillas"
  ON tipos_fuente_plantillas FOR ALL TO authenticated
  USING  (tiene_permiso(auth.uid(), 'proyectos', 'editar'))
  WITH CHECK (tiene_permiso(auth.uid(), 'proyectos', 'editar'));

COMMIT;

-- ============================================================
-- VERIFICACIÓN (ejecutar manualmente si se quiere confirmar)
-- ============================================================
-- Tablas que aún tengan políticas pero RLS deshabilitado:
--
-- SELECT schemaname, tablename
-- FROM pg_tables t
-- WHERE schemaname = 'public'
--   AND NOT rowsecurity
--   AND EXISTS (
--     SELECT 1 FROM pg_policies p
--     WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename
--   )
-- ORDER BY tablename;
--
-- Grants a anon en vistas sensibles (debe devolver 0 filas tras este fix):
--
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee = 'anon'
--   AND table_name IN ('vista_abonos_completos', 'vista_viviendas_completas');
