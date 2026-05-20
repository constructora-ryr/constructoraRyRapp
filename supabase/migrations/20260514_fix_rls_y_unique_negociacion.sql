-- =====================================================
-- FIX 1: Indice unico — impide doble negociacion activa por vivienda
-- =====================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_negociaciones_vivienda_activa
ON negociaciones (vivienda_id)
WHERE estado = 'Activa';

-- =====================================================
-- FIX 2: RLS clientes — eliminar politicas abiertas duplicadas
-- Las RBAC (tiene_permiso) ya existen y son las correctas
-- =====================================================
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver clientes"      ON clientes;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear clientes"    ON clientes;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar clientes" ON clientes;

-- =====================================================
-- FIX 3: RLS negociaciones — reemplazar politicas abiertas con RBAC
-- Roles y permisos relevantes:
--   SELECT : negociaciones.ver       (Contabilidad, Gerencia, Administrador)
--   INSERT : negociaciones.asignar   (solo Administrador)
--   UPDATE : negociaciones.ajustar   (Administrador)
--            O abonos.registrar      (Administrador de Obra — al completar pago)
--   DELETE : ninguno (negociaciones no se eliminan, solo se cierran)
-- =====================================================
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver negociaciones"        ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear negociaciones"      ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar negociaciones" ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar negociaciones"   ON negociaciones;

CREATE POLICY "negociaciones_select_rbac"
  ON negociaciones FOR SELECT
  USING (tiene_permiso(auth.uid(), 'negociaciones', 'ver'));

CREATE POLICY "negociaciones_insert_rbac"
  ON negociaciones FOR INSERT
  WITH CHECK (tiene_permiso(auth.uid(), 'negociaciones', 'asignar'));

-- UPDATE: ajustar (admin) o registrar abonos (Administrador de Obra completa negociacion al pagar)
CREATE POLICY "negociaciones_update_rbac"
  ON negociaciones FOR UPDATE
  USING (
    tiene_permiso(auth.uid(), 'negociaciones', 'ajustar')
    OR tiene_permiso(auth.uid(), 'abonos', 'registrar')
  );

-- DELETE: denegado para todos (negociaciones se cierran, no se eliminan)
-- Sin politica DELETE = acceso denegado por defecto con RLS activo
