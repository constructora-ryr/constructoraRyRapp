-- =====================================================
-- MIGRACIÓN: saldo_pendiente basado en fuentes de pago
-- Fecha: 2026-09-02
--
-- PROBLEMA:
--   saldo_pendiente se calculaba como valor_total_pagar − total_abonado.
--   Esto produce un valor distinto al de las fuentes pactadas cuando
--   SUM(fuentes.monto_aprobado) ≠ valor_total_pagar (ej: subsidio de $39M
--   sobre casa de $122M cuando las cuotas suman $122.000.022).
--
-- SOLUCIÓN:
--   La fuente de verdad son las fuentes de pago: lo que falta por recibir
--   es exactamente SUM(fuentes_pago.saldo_pendiente). Un subsidio de $39M
--   siempre entra por ese monto exacto — el posible excedente queda en
--   "Devolución Pendiente", que ya está manejado por la app.
--
-- FUNCIONES AFECTADAS:
--   1. update_negociaciones_totales()  — dispara al cambiar fuentes_pago
--   2. fn_recalcular_saldos_tras_anulacion() — dispara al anular un abono
--   3. calcular_valor_total_pagar()    — dispara al aplicar descuentos
--
-- IMPACTO EN BD:
--   Solo 2 negociaciones cambian su saldo_pendiente (verificado pre-migración).
--   El campo porcentaje_pagado NO cambia (sigue usando total_abonado / valor_total_pagar).
--   La lógica de marcar "Completada" sigue igual (saldo = 0 cuando todo está pagado).
-- =====================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. update_negociaciones_totales
--    Trigger AFTER en fuentes_pago — recalcula totales de la negociación
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_negociaciones_totales()
RETURNS TRIGGER AS $$
DECLARE
  v_negociacion_id UUID;
BEGIN
  v_negociacion_id := COALESCE(NEW.negociacion_id, OLD.negociacion_id);

  UPDATE public.negociaciones
  SET
    total_fuentes_pago = (
      SELECT COALESCE(SUM(COALESCE(capital_para_cierre, monto_aprobado)), 0)
      FROM public.fuentes_pago
      WHERE negociacion_id = v_negociacion_id
        AND estado = 'Activa'
    ),
    total_abonado = (
      SELECT COALESCE(SUM(
        LEAST(
          monto_recibido,
          COALESCE(capital_para_cierre, monto_aprobado)
        )
      ), 0)
      FROM public.fuentes_pago
      WHERE negociacion_id = v_negociacion_id
    ),
    -- Nueva fórmula: lo que falta recibir según las fuentes pactadas
    saldo_pendiente = (
      SELECT COALESCE(SUM(fp.saldo_pendiente), 0)
      FROM public.fuentes_pago fp
      WHERE fp.negociacion_id = v_negociacion_id
    ),
    porcentaje_pagado = (
      SELECT CASE
        WHEN n.valor_total_pagar > 0
        THEN LEAST(
          (COALESCE(SUM(LEAST(fp.monto_recibido, COALESCE(fp.capital_para_cierre, fp.monto_aprobado))), 0)
           / n.valor_total_pagar) * 100,
          100
        )
        ELSE 0
      END
      FROM public.negociaciones n
      LEFT JOIN public.fuentes_pago fp ON fp.negociacion_id = n.id
      WHERE n.id = v_negociacion_id
      GROUP BY n.id, n.valor_total_pagar
    )
  WHERE id = v_negociacion_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. fn_recalcular_saldos_tras_anulacion
--    Trigger AFTER en abonos_historial — recalcula al anular un abono
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_recalcular_saldos_tras_anulacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_nuevo_monto_recibido  NUMERIC;
  v_nuevo_total_abonado   NUMERIC;
  v_valor_total_pagar     NUMERIC;
BEGIN
  -- Paso 1: Recalcular fuente_pago (solo monto_recibido — columnas GENERATED se actualizan solas)
  SELECT COALESCE(SUM(monto), 0)
    INTO v_nuevo_monto_recibido
    FROM abonos_historial
   WHERE fuente_pago_id = NEW.fuente_pago_id
     AND estado = 'Activo';

  UPDATE fuentes_pago
     SET monto_recibido      = v_nuevo_monto_recibido,
         fecha_actualizacion = NOW()
   WHERE id = NEW.fuente_pago_id;

  -- Paso 2: Recalcular negociación
  SELECT COALESCE(SUM(ah.monto), 0)
    INTO v_nuevo_total_abonado
    FROM abonos_historial ah
    JOIN fuentes_pago fp ON fp.id = ah.fuente_pago_id
   WHERE fp.negociacion_id = NEW.negociacion_id
     AND ah.estado = 'Activo';

  SELECT valor_total_pagar
    INTO v_valor_total_pagar
    FROM negociaciones
   WHERE id = NEW.negociacion_id;

  UPDATE negociaciones
     SET total_abonado     = v_nuevo_total_abonado,
         -- Nueva fórmula: suma de saldos pendientes de cada fuente
         saldo_pendiente   = (
           SELECT COALESCE(SUM(fp2.saldo_pendiente), 0)
           FROM fuentes_pago fp2
           WHERE fp2.negociacion_id = NEW.negociacion_id
         ),
         porcentaje_pagado = CASE
           WHEN COALESCE(v_valor_total_pagar, 0) > 0
           THEN ROUND((v_nuevo_total_abonado / v_valor_total_pagar) * 100, 2)
           ELSE 0
         END,
         fecha_actualizacion = NOW()
   WHERE id = NEW.negociacion_id;

  RETURN NEW;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. calcular_valor_total_pagar
--    BEFORE trigger en negociaciones — recalcula al cambiar descuento
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calcular_valor_total_pagar()
RETURNS TRIGGER AS $$
DECLARE
  v_gastos   BIGINT := 0;
  v_recargo  BIGINT := 0;
  v_esquinera BOOLEAN := false;
  v_valor_neto DECIMAL(15,2);
BEGIN
  SELECT
    COALESCE(v.gastos_notariales, 0),
    COALESCE(v.recargo_esquinera, 0),
    COALESCE(v.es_esquinera, false)
  INTO v_gastos, v_recargo, v_esquinera
  FROM public.viviendas v
  WHERE v.id = NEW.vivienda_id;

  v_valor_neto := COALESCE(NEW.valor_negociado, 0) - COALESCE(NEW.descuento_aplicado, 0);

  IF v_esquinera THEN
    NEW.valor_total_pagar := v_valor_neto + v_gastos + v_recargo;
  ELSE
    NEW.valor_total_pagar := v_valor_neto + v_gastos;
  END IF;

  -- Nueva fórmula: suma de saldos pendientes de las fuentes pactadas
  -- (Si no hay fuentes aún — INSERT nuevo — queda en 0; update_negociaciones_totales
  --  lo corregirá cuando se agreguen las fuentes.)
  NEW.saldo_pendiente := (
    SELECT COALESCE(SUM(fp.saldo_pendiente), 0)
    FROM public.fuentes_pago fp
    WHERE fp.negociacion_id = NEW.id
  );

  NEW.porcentaje_pagado := CASE
    WHEN NEW.valor_total_pagar > 0
    THEN LEAST(
      (COALESCE(NEW.total_abonado, 0) / NEW.valor_total_pagar) * 100,
      100
    )
    ELSE 0
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Backfill: recalcular saldo_pendiente en todas las negociaciones activas
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE public.negociaciones n
SET saldo_pendiente = (
  SELECT COALESCE(SUM(fp.saldo_pendiente), 0)
  FROM public.fuentes_pago fp
  WHERE fp.negociacion_id = n.id
)
WHERE n.estado IN ('Activa', 'Completada');


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Verificación
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_inconsistentes INT;
BEGIN
  -- Verificar que no haya negociaciones Completadas con saldo_pendiente > 0
  SELECT COUNT(*) INTO v_inconsistentes
  FROM public.negociaciones
  WHERE estado = 'Completada'
    AND saldo_pendiente > 0;

  IF v_inconsistentes = 0 THEN
    RAISE NOTICE '✅ Migración OK: saldo_pendiente basado en fuentes. Sin inconsistencias en Completadas.';
  ELSE
    RAISE WARNING '⚠️ % negociaciones Completadas con saldo_pendiente > 0 — revisar.', v_inconsistentes;
  END IF;
END $$;
