-- =====================================================
-- BACKFILL: Rellenar usuario_registro en abonos_historial
-- Fecha: 2026-05-06
-- Motivo: La API route de registro de abonos no guardaba
--         usuario_registro al insertar. Se recupera desde
--         audit_log (tabla='abonos_historial', accion='CREATE').
-- =====================================================

-- Deshabilitar triggers durante el backfill para evitar que la cadena
-- financiera (actualizar_monto_recibido → update_negociaciones_totales →
-- negociaciones_audit_trigger) falle sin usuario autenticado.
ALTER TABLE abonos_historial DISABLE TRIGGER USER;

UPDATE abonos_historial ah
SET usuario_registro = al.usuario_id
FROM (
  SELECT DISTINCT ON (registro_id)
    registro_id,
    usuario_id
  FROM audit_log
  WHERE tabla    = 'abonos_historial'
    AND accion   = 'CREATE'
    AND usuario_id IS NOT NULL
  ORDER BY registro_id, fecha_evento ASC
) al
WHERE ah.id               = al.registro_id
  AND ah.usuario_registro IS NULL;

ALTER TABLE abonos_historial ENABLE TRIGGER USER;

-- Validación
DO $$
DECLARE
  actualizados INT;
  restantes    INT;
BEGIN
  SELECT COUNT(*) INTO actualizados
  FROM abonos_historial
  WHERE usuario_registro IS NOT NULL;

  SELECT COUNT(*) INTO restantes
  FROM abonos_historial
  WHERE usuario_registro IS NULL;

  RAISE NOTICE '✅ Abonos con usuario_registro: %', actualizados;
  RAISE NOTICE '⚠️  Abonos sin usuario_registro (sin registro en audit_log): %', restantes;
END $$;
