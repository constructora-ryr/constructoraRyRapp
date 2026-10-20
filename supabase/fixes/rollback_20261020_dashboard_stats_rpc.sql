-- =====================================================
-- ROLLBACK de 20261020_dashboard_stats_rpc.sql
--
-- Elimina únicamente la función get_dashboard_stats(). No toca datos.
-- OJO: el dashboard del frontend depende de esta función; si se hace
-- rollback, revertir también el commit del frontend o el dashboard mostrará
-- "No se pudieron cargar las estadísticas".
-- =====================================================

BEGIN;
DROP FUNCTION IF EXISTS public.get_dashboard_stats();
COMMIT;
