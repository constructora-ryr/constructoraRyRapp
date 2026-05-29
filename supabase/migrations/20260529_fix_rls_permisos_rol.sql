-- Fix: Permitir a usuarios autenticados leer permisos_rol
-- Sin esta política, el sidebar aparece vacío para roles no-Administrador

DROP POLICY IF EXISTS "Usuarios autenticados pueden leer permisos" ON permisos_rol;

CREATE POLICY "Usuarios autenticados pueden leer permisos"
ON permisos_rol
FOR SELECT
TO authenticated
USING (true);
