-- ============================================================
-- RPC: crear_negociacion_completa
--
-- Asigna una vivienda a un cliente en UNA sola transacción:
--   1. Valida permiso, renuncia pendiente, vivienda disponible y que el
--      cliente no tenga otra negociación activa (bloqueando la vivienda)
--   2. Crea la negociación en estado 'Activa'
--   3. Crea sus fuentes de pago y, para el crédito con la constructora,
--      el crédito y su calendario de cuotas (calculados en el cliente)
--   4. Marca la vivienda 'Asignada' y el cliente 'Activo'
-- Si cualquier paso falla no queda nada a medias.
--
-- Payload (jsonb):
--   { cliente_id, vivienda_id, valor_negociado, descuento_aplicado?,
--     tipo_descuento?, motivo_descuento?, valor_escritura_publica?, notas?,
--     fecha_negociacion?,
--     fuentes: [{ tipo, monto_aprobado, capital_para_cierre?, entidad?,
--       entidad_financiera_id?, numero_referencia?, fecha_acta?,
--       carta_asignacion_url?, permite_multiples_abonos,
--       credito?: { capital, tasa_mensual, num_cuotas, fecha_inicio,
--         valor_cuota, interes_total, monto_total, tasa_mora_diaria,
--         cuotas: [{ numero_cuota, fecha_vencimiento, valor_cuota }] } }] }
--
-- Devuelve la negociación creada (jsonb).
-- La auditoría la registran los triggers trg_auditoria de cada tabla.
-- ============================================================

CREATE OR REPLACE FUNCTION public.crear_negociacion_completa(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id    uuid := (p_payload->>'cliente_id')::uuid;
  v_vivienda_id   uuid := (p_payload->>'vivienda_id')::uuid;
  v_descuento     numeric := COALESCE((p_payload->>'descuento_aplicado')::numeric, 0);
  v_estado_viv    text;
  v_renuncia      text;
  v_negociacion   negociaciones%ROWTYPE;
  v_fuente        jsonb;
  v_fuente_id     uuid;
  v_credito       jsonb;
BEGIN
  -- ── Validaciones ───────────────────────────────────────────────────
  IF NOT tiene_permiso(auth.uid(), 'negociaciones', 'asignar') THEN
    RAISE EXCEPTION 'No tienes permiso para asignar viviendas.'
      USING ERRCODE = '42501';
  END IF;

  IF v_cliente_id IS NULL OR v_vivienda_id IS NULL THEN
    RAISE EXCEPTION 'Faltan el cliente o la vivienda.';
  END IF;

  IF COALESCE((p_payload->>'valor_negociado')::numeric, 0) <= 0 THEN
    RAISE EXCEPTION 'El valor de la vivienda debe ser mayor a cero.';
  END IF;

  SELECT r.consecutivo INTO v_renuncia
  FROM renuncias r
  WHERE r.cliente_id = v_cliente_id
    AND r.estado = 'Pendiente Devolución'
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION 'No se puede asignar: el cliente tiene la renuncia % con devolución pendiente.', v_renuncia;
  END IF;

  -- Bloquea la vivienda: dos asignaciones simultáneas no pueden ganarla ambas
  SELECT v.estado INTO v_estado_viv
  FROM viviendas v
  WHERE v.id = v_vivienda_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La vivienda no existe.';
  END IF;

  IF v_estado_viv <> 'Disponible' THEN
    RAISE EXCEPTION 'La vivienda ya no está disponible (estado: %). Regresa al paso 1 y elige otra.', v_estado_viv;
  END IF;

  IF EXISTS (
    SELECT 1 FROM negociaciones n
    WHERE n.vivienda_id = v_vivienda_id AND n.estado = 'Activa'
  ) THEN
    RAISE EXCEPTION 'La vivienda ya tiene una negociación activa. Regresa al paso 1 y elige otra.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM negociaciones n
    WHERE n.cliente_id = v_cliente_id
      AND n.estado IN ('Activa', 'Suspendida')
  ) THEN
    RAISE EXCEPTION 'Este cliente ya tiene una negociación activa. Cancela o completa la existente antes de crear una nueva.';
  END IF;

  -- ── 1. Negociación ─────────────────────────────────────────────────
  -- valor_total_pagar lo calcula el trigger calcular_valor_total_pagar
  INSERT INTO negociaciones (
    cliente_id, vivienda_id, valor_negociado, descuento_aplicado,
    tipo_descuento, motivo_descuento, valor_escritura_publica, notas,
    estado, fecha_negociacion
  ) VALUES (
    v_cliente_id,
    v_vivienda_id,
    (p_payload->>'valor_negociado')::numeric,
    v_descuento,
    CASE WHEN v_descuento > 0 THEN NULLIF(p_payload->>'tipo_descuento', '') END,
    CASE WHEN v_descuento > 0 THEN NULLIF(p_payload->>'motivo_descuento', '') END,
    (p_payload->>'valor_escritura_publica')::numeric,
    NULLIF(trim(p_payload->>'notas'), ''),
    'Activa',
    COALESCE((p_payload->>'fecha_negociacion')::timestamptz, now())
  )
  RETURNING * INTO v_negociacion;

  -- ── 2. Fuentes de pago (+ crédito y cuotas) ───────────────────────
  FOR v_fuente IN
    SELECT * FROM jsonb_array_elements(COALESCE(p_payload->'fuentes', '[]'::jsonb))
  LOOP
    INSERT INTO fuentes_pago (
      negociacion_id, tipo, tipo_fuente_id, monto_aprobado,
      capital_para_cierre, entidad, entidad_financiera_id, numero_referencia,
      fecha_acta, carta_asignacion_url, permite_multiples_abonos,
      estado, estado_fuente
    ) VALUES (
      v_negociacion.id,
      v_fuente->>'tipo',
      (SELECT t.id FROM tipos_fuentes_pago t WHERE t.nombre = v_fuente->>'tipo' LIMIT 1),
      (v_fuente->>'monto_aprobado')::numeric,
      (v_fuente->>'capital_para_cierre')::numeric,
      NULLIF(v_fuente->>'entidad', ''),
      NULLIF(v_fuente->>'entidad_financiera_id', '')::uuid,
      NULLIF(v_fuente->>'numero_referencia', ''),
      NULLIF(v_fuente->>'fecha_acta', '')::date,
      NULLIF(v_fuente->>'carta_asignacion_url', ''),
      COALESCE((v_fuente->>'permite_multiples_abonos')::boolean, false),
      'Activa',
      'activa'
    )
    RETURNING id INTO v_fuente_id;

    v_credito := v_fuente->'credito';
    CONTINUE WHEN v_credito IS NULL OR jsonb_typeof(v_credito) <> 'object';

    INSERT INTO creditos_constructora (
      fuente_pago_id, capital, tasa_mensual, num_cuotas, fecha_inicio,
      valor_cuota, interes_total, monto_total, tasa_mora_diaria
    ) VALUES (
      v_fuente_id,
      (v_credito->>'capital')::numeric,
      (v_credito->>'tasa_mensual')::numeric,
      (v_credito->>'num_cuotas')::int,
      (v_credito->>'fecha_inicio')::date,
      (v_credito->>'valor_cuota')::numeric,
      (v_credito->>'interes_total')::numeric,
      (v_credito->>'monto_total')::numeric,
      COALESCE((v_credito->>'tasa_mora_diaria')::numeric, 0.001)
    );

    -- La deuda total (capital + intereses) es lo aprobado; el capital es lo
    -- que cuenta para el cierre financiero
    UPDATE fuentes_pago
    SET monto_aprobado = (v_credito->>'monto_total')::numeric,
        capital_para_cierre = (v_credito->>'capital')::numeric
    WHERE id = v_fuente_id;

    INSERT INTO cuotas_credito (
      fuente_pago_id, numero_cuota, fecha_vencimiento, valor_cuota, version_plan
    )
    SELECT v_fuente_id,
           (c->>'numero_cuota')::int,
           (c->>'fecha_vencimiento')::date,
           (c->>'valor_cuota')::numeric,
           1
    FROM jsonb_array_elements(COALESCE(v_credito->'cuotas', '[]'::jsonb)) c;
  END LOOP;

  -- ── 3. Vivienda y cliente ──────────────────────────────────────────
  UPDATE viviendas
  SET estado = 'Asignada',
      cliente_id = v_cliente_id,
      negociacion_id = v_negociacion.id,
      fecha_asignacion = now()
  WHERE id = v_vivienda_id;

  UPDATE clientes SET estado = 'Activo' WHERE id = v_cliente_id;

  -- Releer: los triggers de fuentes actualizan totales de la negociación
  SELECT * INTO v_negociacion FROM negociaciones WHERE id = v_negociacion.id;
  RETURN to_jsonb(v_negociacion);
END;
$$;

REVOKE ALL ON FUNCTION public.crear_negociacion_completa(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crear_negociacion_completa(jsonb) TO authenticated;

COMMENT ON FUNCTION public.crear_negociacion_completa(jsonb) IS
  'Asigna vivienda a cliente de forma atómica: negociación, fuentes, crédito/cuotas, vivienda y cliente.';
