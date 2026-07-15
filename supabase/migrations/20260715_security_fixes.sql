-- =====================================================
-- MIGRACIÓN DE SEGURIDAD — 2026-07-15
-- Basada en verificación directa del estado real de
-- la DB de producción (no en archivos de migración).
-- =====================================================


-- ─── 1. REVOKE exec_sql ─────────────────────────────
-- Verificado: anon y authenticated tienen EXECUTE = true.
-- La función es SECURITY DEFINER (corre como superuser).
-- Cualquier usuario autenticado puede ejecutar SQL arbitrario.
-- El permiso viene de PUBLIC (default al crear funciones en PostgreSQL).
-- Revocar de PUBLIC elimina el acceso para todos los roles que heredan de él
-- (anon, authenticated). Revocar de los roles individuales no es suficiente.
REVOKE EXECUTE ON FUNCTION exec_sql(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION exec_sql(TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION exec_sql(TEXT) FROM anon;
-- service_role mantiene acceso (uso legítimo server-side).


-- ─── 2. Usuarios RLS: impedir auto-desbloqueo ───────
-- Verificado: WITH CHECK solo restringe `rol`, no `estado`.
-- Un usuario bloqueado puede actualizarse a 'Activo' via API.
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_propio_perfil" ON usuarios;

CREATE POLICY "usuarios_pueden_actualizar_propio_perfil"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND rol    = (SELECT rol    FROM usuarios WHERE id = auth.uid())
    AND estado = (SELECT estado FROM usuarios WHERE id = auth.uid())
  );


-- ─── 3. comprobantes-abonos ──────────────────────────
-- SELECT: verificado como (bucket_id = 'comprobantes-abonos') sin más restricción.
-- Cualquier autenticado puede leer comprobantes de cualquier cliente.
DROP POLICY IF EXISTS "comprobantes_abonos_select" ON storage.objects;
CREATE POLICY "comprobantes_abonos_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'comprobantes-abonos'
  AND (
    -- Administrador activo
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
        AND rol = 'Administrador'::rol_usuario
        AND estado = 'Activo'::estado_usuario
    )
    OR
    -- Usuarios con permiso abonos.ver activos
    -- Nota: permisos_rol.rol es TEXT, usuarios.rol es enum rol_usuario → cast necesario
    EXISTS (
      SELECT 1 FROM permisos_rol pr
      JOIN usuarios u ON u.rol::text = pr.rol
      WHERE u.id = auth.uid()
        AND u.estado = 'Activo'::estado_usuario
        AND pr.modulo = 'abonos'
        AND pr.accion = 'ver'
        AND pr.permitido = true
    )
  )
);

-- DELETE: verificado como (bucket_id = 'comprobantes-abonos') sin más restricción.
-- Cualquier autenticado puede borrar comprobantes de otros usuarios.
DROP POLICY IF EXISTS "comprobantes_abonos_delete" ON storage.objects;
CREATE POLICY "comprobantes_abonos_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'comprobantes-abonos'
  AND EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid()
      AND rol = 'Administrador'
      AND estado = 'Activo'
  )
);


-- ─── 4. documentos-proyectos ────────────────────────
-- Verificado: existen DOS políticas DELETE:
--   "Allow authenticated deletes"    → cualquier autenticado (permisiva)
--   "Solo administradores pueden eliminar documentos de proyectos" → admin only
-- PostgreSQL evalúa las políticas con OR, por lo que la permisiva
-- anula la restrictiva. Eliminar la permisiva.
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
-- La política "Solo administradores pueden eliminar documentos de proyectos" queda activa.


-- ─── 5. renuncias-comprobantes ──────────────────────
-- Mismo problema que documentos-proyectos: DOS políticas DELETE.
--   "renuncias_comprobantes_delete"                  → cualquier autenticado
--   "Solo admins pueden eliminar de renuncias-comprobantes" → admin only
-- La permisiva anula la restrictiva.
DROP POLICY IF EXISTS "renuncias_comprobantes_delete" ON storage.objects;
-- La política "Solo admins pueden eliminar de renuncias-comprobantes" queda activa.


-- ─── 6. documentos-clientes ─────────────────────────
-- Verificado: "Usuarios autenticados pueden eliminar documentos de clientes"
-- permite a cualquier autenticado borrar documentos de cualquier cliente.
-- No existe política restrictiva paralela aquí.
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar documentos de clientes" ON storage.objects;
CREATE POLICY "documentos_clientes_delete_admin"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos-clientes'
  AND EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid()
      AND rol = 'Administrador'
      AND estado = 'Activo'
  )
);
