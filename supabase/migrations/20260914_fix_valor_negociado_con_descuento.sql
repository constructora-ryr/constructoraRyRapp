-- =====================================================
-- MIGRACIÓN: Corregir doble conteo en negociaciones con descuento
-- Fecha: 2026-09-14
--
-- PROBLEMA:
--   useAsignarViviendaV2.ts guardaba valor_negociado = valorBase + gastos + recargo - descuento
--   El trigger calcular_valor_total_pagar() sumaba gastos/recargo OTRA VEZ:
--     valor_total_pagar = (valor_negociado - descuento) + gastos → DOBLE CONTEO
--
-- La migración 2026-03-26 corrigió casos sin descuento.
-- Esta migración corrige casos CON descuento_aplicado > 0.
--
-- EJEMPLO (Julio Cesar Lenis Alarcon):
--   valor_base           = $123.000.000
--   gastos_notariales    = $5.000.000
--   descuento_aplicado   = $6.000.000
--   valor_negociado guardado = $128.000.000 (base + gastos, sin descuento = ERROR)
--   trigger calcula      = (128M - 6M) + 5M = $127.000.000 ❌
--   correcto             = (123M - 6M) + 5M = $122.000.000 ✓
--
-- CORRECCIÓN:
--   valor_negociado = vivienda.valor_base (el trigger suma gastos/recargo)
-- =====================================================

-- ─────────────────────────────────────────────────────
-- PASO 0: Diagnóstico — negociaciones afectadas
-- ─────────────────────────────────────────────────────
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT n.id) INTO v_count
  FROM public.negociaciones n
  JOIN public.viviendas v ON n.vivienda_id = v.id
  WHERE v.valor_base > 0
    AND v.valor_base < v.valor_total                       -- vivienda tiene extras
    AND n.valor_negociado > v.valor_base                   -- guardó más que solo la base
    AND n.descuento_aplicado > 0                           -- tiene descuento (los sin descuento ya se corrigieron)
    AND n.estado != 'Cerrada por Renuncia';

  RAISE NOTICE '📊 Negociaciones con descuento afectadas por doble conteo: %', v_count;
END $$;

-- ─────────────────────────────────────────────────────
-- PASO 1: Detalle de negociaciones a corregir
-- ─────────────────────────────────────────────────────
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT
      n.id,
      n.estado,
      n.valor_negociado AS valor_negociado_actual,
      v.valor_base AS valor_negociado_correcto,
      n.descuento_aplicado,
      n.valor_total_pagar AS valor_total_pagar_actual,
      (v.valor_base - n.descuento_aplicado + COALESCE(v.gastos_notariales, 0)
        + CASE WHEN COALESCE(v.es_esquinera, false) THEN COALESCE(v.recargo_esquinera, 0) ELSE 0 END
      ) AS valor_total_pagar_correcto,
      v.gastos_notariales
    FROM public.negociaciones n
    JOIN public.viviendas v ON n.vivienda_id = v.id
    WHERE v.valor_base > 0
      AND v.valor_base < v.valor_total
      AND n.valor_negociado > v.valor_base
      AND n.descuento_aplicado > 0
      AND n.estado != 'Cerrada por Renuncia'
    ORDER BY n.fecha_negociacion DESC
  LOOP
    RAISE NOTICE 'ID=%, estado=%, valor_negociado_actual=%, correcto=%, descuento=%, total_pagar_actual=%, correcto=%',
      rec.id, rec.estado, rec.valor_negociado_actual, rec.valor_negociado_correcto,
      rec.descuento_aplicado, rec.valor_total_pagar_actual, rec.valor_total_pagar_correcto;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────
-- PASO 2: Corregir valor_negociado → valor_base
-- El trigger BEFORE UPDATE recalcula valor_total_pagar automáticamente
-- ─────────────────────────────────────────────────────
UPDATE public.negociaciones n
SET valor_negociado = v.valor_base
FROM public.viviendas v
WHERE n.vivienda_id = v.id
  AND v.valor_base > 0
  AND v.valor_base < v.valor_total
  AND n.valor_negociado > v.valor_base
  AND n.descuento_aplicado > 0
  AND n.estado != 'Cerrada por Renuncia';

-- ─────────────────────────────────────────────────────
-- PASO 3: Verificación final
-- ─────────────────────────────────────────────────────
DO $$
DECLARE
  rec RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR rec IN
    SELECT
      n.id,
      n.estado,
      n.valor_negociado,
      n.descuento_aplicado,
      n.valor_total_pagar,
      n.saldo_pendiente,
      v.valor_base,
      v.gastos_notariales
    FROM public.negociaciones n
    JOIN public.viviendas v ON n.vivienda_id = v.id
    WHERE v.valor_base > 0
      AND n.valor_negociado = v.valor_base
      AND n.descuento_aplicado > 0
      AND n.estado != 'Cerrada por Renuncia'
    ORDER BY n.fecha_negociacion DESC
    LIMIT 10
  LOOP
    RAISE NOTICE '✅ ID=%, valor_negociado=%, descuento=%, valor_total_pagar=%, saldo=%',
      rec.id, rec.valor_negociado, rec.descuento_aplicado,
      rec.valor_total_pagar, rec.saldo_pendiente;
    v_count := v_count + 1;
  END LOOP;

  RAISE NOTICE '✅ Migración completada: % negociaciones verificadas', v_count;
END $$;
