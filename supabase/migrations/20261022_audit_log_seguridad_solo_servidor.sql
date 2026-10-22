-- ============================================================================
-- audit_log_seguridad: solo el servidor puede escribir
-- ============================================================================
-- Antes: política INSERT para PUBLIC con WITH CHECK (true) + GRANT INSERT a
-- anon/authenticated → cualquiera con la clave pública podía insertar eventos
-- falsos (p.ej. un "login_exitoso" de otra persona).
--
-- Ahora: los eventos los registra /api/auth/evento-seguridad con la service
-- role (que no pasa por RLS). Se quita la política de inserción y el permiso
-- INSERT a anon y authenticated. La lectura no cambia.
--
-- Orden: desplegar primero el código que usa la ruta API, luego este SQL.
-- ============================================================================

BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.audit_log_seguridad'::regclass
      AND polname = 'Solo el sistema puede insertar logs de auditoría'
  ) THEN
    RAISE NOTICE 'La política de inserción ya no existe (nada que quitar)';
  END IF;
END $$;

DROP POLICY IF EXISTS "Solo el sistema puede insertar logs de auditoría"
  ON public.audit_log_seguridad;

REVOKE INSERT ON public.audit_log_seguridad FROM anon, authenticated;

DO $$
BEGIN
  IF has_table_privilege('anon', 'public.audit_log_seguridad', 'insert')
     OR has_table_privilege('authenticated', 'public.audit_log_seguridad', 'insert') THEN
    RAISE EXCEPTION 'anon/authenticated todavía pueden insertar';
  END IF;
  IF NOT has_table_privilege('service_role', 'public.audit_log_seguridad', 'insert') THEN
    RAISE EXCEPTION 'service_role perdió el permiso de inserción';
  END IF;
  IF NOT has_table_privilege('authenticated', 'public.audit_log_seguridad', 'select') THEN
    RAISE EXCEPTION 'authenticated perdió la lectura';
  END IF;
END $$;

COMMIT;
