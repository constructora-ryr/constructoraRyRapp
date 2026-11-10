-- ============================================================================
-- Mi perfil: borrar la lista de sesiones propia de la app
-- ============================================================================
-- EJECUTAR SOLO DESPUÉS de desplegar el código que usa auth.sessions
-- (20261110_perfil_sesiones_reales.sql). La versión anterior del middleware
-- escribe en sesiones_activas en cada petición.
-- Se puede ejecutar más de una vez.
-- ============================================================================

DROP FUNCTION IF EXISTS public.limpiar_sesiones_antiguas(uuid);
DROP TABLE IF EXISTS public.sesiones_activas;

DO $$
BEGIN
  IF to_regclass('public.sesiones_activas') IS NOT NULL THEN
    RAISE EXCEPTION 'sesiones_activas sigue existiendo';
  END IF;
  RAISE NOTICE 'OK: sesiones_activas eliminada';
END $$;
