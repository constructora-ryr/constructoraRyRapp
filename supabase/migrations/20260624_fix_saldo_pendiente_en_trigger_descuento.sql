-- =====================================================
-- MIGRACIÓN: Actualizar saldo_pendiente inmediatamente al aplicar descuento
-- Fecha: 2026-06-24
--
-- PROBLEMA:
--   calcular_valor_total_pagar() BEFORE trigger actualiza valor_total_pagar
--   cuando cambia descuento_aplicado, PERO no recalcula saldo_pendiente ni
--   porcentaje_pagado. Estos sólo se actualizan cuando cambian las fuentes
--   de pago (update_negociaciones_totales). Resultado: tras aplicar un
--   descuento, la UI muestra saldo_pendiente y porcentaje_pagado obsoletos
--   hasta que se modifica alguna fuente.
--
-- SOLUCIÓN:
--   Agregar el cálculo de saldo_pendiente y porcentaje_pagado al final del
--   BEFORE trigger, usando NEW.total_abonado (sin cambios) y el
--   NEW.valor_total_pagar recién calculado.
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_valor_total_pagar()
RETURNS TRIGGER AS $$
DECLARE
  v_gastos BIGINT := 0;
  v_recargo BIGINT := 0;
  v_es_esquinera BOOLEAN := false;
  v_valor_neto DECIMAL(15,2);
BEGIN
  -- Obtener gastos y recargos de la vivienda vinculada
  SELECT
    COALESCE(v.gastos_notariales, 0),
    COALESCE(v.recargo_esquinera, 0),
    COALESCE(v.es_esquinera, false)
  INTO v_gastos, v_recargo, v_es_esquinera
  FROM public.viviendas v
  WHERE v.id = NEW.vivienda_id;

  -- Calcular neto negociado
  v_valor_neto := COALESCE(NEW.valor_negociado, 0) - COALESCE(NEW.descuento_aplicado, 0);

  -- Solo sumar recargo si la vivienda es esquinera
  IF v_es_esquinera THEN
    NEW.valor_total_pagar := v_valor_neto + v_gastos + v_recargo;
  ELSE
    NEW.valor_total_pagar := v_valor_neto + v_gastos;
  END IF;

  -- Recalcular saldo_pendiente y porcentaje_pagado de forma inmediata
  -- NEW.total_abonado ya refleja el valor actual (sin cambios en esta operación)
  NEW.saldo_pendiente := GREATEST(
    NEW.valor_total_pagar - COALESCE(NEW.total_abonado, 0),
    0
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

-- Los triggers existentes ya apuntan a esta función, no necesitan recrearse
-- (trigger_calcular_valor_total_pagar_insert y trigger_calcular_valor_total_pagar_update)

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ calcular_valor_total_pagar() actualizada: ahora recalcula saldo_pendiente y porcentaje_pagado inmediatamente al aplicar descuento.';
END $$;
