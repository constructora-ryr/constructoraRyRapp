-- =====================================================
-- MIGRACIÓN: Corregir saldo_pendiente cuando excedente fue devuelto
-- Fecha: 2026-08-14
--
-- PROBLEMA:
--   Al registrar la devolución del excedente, el API solo actualizaba los
--   campos excedente_devolucion_*. El campo saldo_pendiente quedaba negativo
--   (ej: -$7.205.000) porque el trigger de abonos calcula
--   saldo_pendiente = valor_total_pagar - total_abonado sin clamping.
--
-- SOLUCIÓN:
--   1. Backfill: poner saldo_pendiente = 0 donde el excedente ya fue devuelto
--   2. El API ahora incluye saldo_pendiente = 0 en el updatePayload (fix de código)
-- =====================================================

-- 1. Corregir registros existentes donde el excedente fue procesado
--    pero saldo_pendiente sigue negativo
UPDATE public.negociaciones
SET saldo_pendiente = 0
WHERE excedente_devolucion_estado = 'procesada'
  AND saldo_pendiente < 0;

-- Verificación
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.negociaciones
  WHERE excedente_devolucion_estado = 'procesada'
    AND saldo_pendiente < 0;

  IF v_count = 0 THEN
    RAISE NOTICE '✅ Todos los saldo_pendiente con excedente procesado están en 0.';
  ELSE
    RAISE WARNING '⚠️ Quedan % registros con saldo_pendiente negativo y excedente procesado.', v_count;
  END IF;
END $$;
