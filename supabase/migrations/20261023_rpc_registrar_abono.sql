-- ============================================================
-- RPC: registrar_abono
--
-- Registra un abono o desembolso en UNA sola transacción:
--   1. Valida permiso (abonos.registrar), negociación activa, fuente activa
--      de esa negociación, fecha, método, monto, saldo, cierre financiero
--      cuadrado y documentos obligatorios de la fuente al día.
--      Bloquea la fuente: dos pagos simultáneos no pueden pasar el saldo.
--   2. Inserta el abono (los triggers actualizan saldos de fuente y
--      negociación, y generan el número de recibo).
--   3. Si un Administrador confirmó un pago de más, registra la devolución
--      pendiente en pagos_excedentes.
--   4. Si la negociación quedó pagada, la marca Completada y deja vivienda
--      y cliente como Propietario.
-- Si cualquier paso falla no queda nada a medias.
--
-- Payload (jsonb):
--   { negociacion_id, fuente_pago_id, monto, mora_incluida?, fecha_abono
--     ('YYYY-MM-DD'), metodo_pago, numero_referencia?, notas?,
--     comprobante_path, es_overpayment? }
--
-- Devuelve: { abono, negociacion_completada, cliente_nombre,
--             fuente_antes: {monto_recibido, saldo_pendiente},
--             fuente_despues: {monto_recibido, saldo_pendiente} }
-- ============================================================

CREATE OR REPLACE FUNCTION public.registrar_abono(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_negociacion_id uuid := (p_payload->>'negociacion_id')::uuid;
  v_fuente_id      uuid := (p_payload->>'fuente_pago_id')::uuid;
  v_monto          numeric := (p_payload->>'monto')::numeric;
  v_mora           numeric := GREATEST(COALESCE((p_payload->>'mora_incluida')::numeric, 0), 0);
  v_fecha          date := NULLIF(p_payload->>'fecha_abono', '')::date;
  v_metodo         text := NULLIF(trim(p_payload->>'metodo_pago'), '');
  v_comprobante    text := NULLIF(trim(p_payload->>'comprobante_path'), '');
  v_pide_exceso    boolean := COALESCE((p_payload->>'es_overpayment')::boolean, false);
  v_hoy            date := (now() AT TIME ZONE 'America/Bogota')::date;
  v_es_admin       boolean := (auth.jwt() ->> 'user_rol') = 'Administrador';
  v_fuente         fuentes_pago%ROWTYPE;
  v_neg            negociaciones%ROWTYPE;
  v_principal      numeric;
  v_saldo          numeric;
  v_excede         boolean;
  v_faltante       numeric;
  v_docs           text;
  v_abono          abonos_historial%ROWTYPE;
  v_despues        fuentes_pago%ROWTYPE;
  v_completada     boolean := false;
  v_cliente_nombre text;
BEGIN
  -- ── Validaciones de entrada ────────────────────────────────────────
  IF NOT tiene_permiso(auth.uid(), 'abonos', 'registrar') THEN
    RAISE EXCEPTION 'No tienes permiso para registrar abonos.'
      USING ERRCODE = '42501';
  END IF;

  IF v_negociacion_id IS NULL OR v_fuente_id IS NULL OR v_fecha IS NULL OR v_metodo IS NULL THEN
    RAISE EXCEPTION 'Faltan campos obligatorios.';
  END IF;

  IF v_comprobante IS NULL THEN
    RAISE EXCEPTION 'El comprobante de pago es obligatorio.';
  END IF;

  IF v_monto IS NULL OR v_monto <= 0 THEN
    RAISE EXCEPTION 'El monto debe ser mayor a cero.';
  END IF;

  IF v_mora > v_monto THEN
    RAISE EXCEPTION 'La mora no puede ser mayor que el monto del pago.';
  END IF;

  IF v_fecha > v_hoy THEN
    RAISE EXCEPTION 'La fecha del pago no puede ser posterior a hoy.';
  END IF;

  -- ── Negociación y fuente (bloqueadas hasta terminar) ───────────────
  SELECT * INTO v_neg FROM negociaciones WHERE id = v_negociacion_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'La negociación no existe.';
  END IF;

  IF v_neg.estado <> 'Activa' THEN
    RAISE EXCEPTION 'No se puede registrar un pago en una negociación en estado "%".', v_neg.estado;
  END IF;

  IF v_neg.fecha_negociacion IS NOT NULL
     AND v_fecha < (v_neg.fecha_negociacion AT TIME ZONE 'America/Bogota')::date THEN
    RAISE EXCEPTION 'La fecha del pago no puede ser anterior al inicio de la negociación (%).',
      to_char((v_neg.fecha_negociacion AT TIME ZONE 'America/Bogota')::date, 'DD/MM/YYYY');
  END IF;

  SELECT * INTO v_fuente FROM fuentes_pago WHERE id = v_fuente_id FOR UPDATE;
  IF NOT FOUND OR v_fuente.negociacion_id <> v_negociacion_id THEN
    RAISE EXCEPTION 'La fuente de pago no pertenece a esta negociación.';
  END IF;

  IF v_fuente.estado_fuente <> 'activa' THEN
    RAISE EXCEPTION 'La fuente "%" no está activa.', v_fuente.tipo;
  END IF;

  -- ── Método y monto según el tipo de fuente ─────────────────────────
  IF v_fuente.permite_multiples_abonos = false THEN
    IF v_metodo = 'Efectivo' THEN
      RAISE EXCEPTION 'Los desembolsos de "%" no admiten pagos en efectivo.', v_fuente.tipo;
    END IF;
    IF v_monto <> v_fuente.monto_aprobado THEN
      -- Los subsidios se asignan; los créditos se aprueban
      RAISE EXCEPTION 'El desembolso de "%" debe ser exactamente el monto %.', v_fuente.tipo,
        CASE WHEN v_fuente.tipo ILIKE 'Subsidio%' THEN 'asignado' ELSE 'aprobado' END;
    END IF;
  END IF;

  v_principal := v_monto - v_mora;
  v_saldo := COALESCE(v_fuente.saldo_pendiente, 0);
  v_excede := v_principal > v_saldo;

  IF v_saldo <= 0 THEN
    RAISE EXCEPTION 'La fuente "%" ya está completamente pagada.', v_fuente.tipo;
  END IF;

  IF v_excede AND NOT (v_es_admin AND v_pide_exceso) THEN
    RAISE EXCEPTION 'El monto supera el saldo pendiente de la fuente (%).',
      to_char(v_saldo, 'FM$999G999G999G990');
  END IF;

  -- ── Cierre financiero: las fuentes deben cubrir el valor a pagar ───
  SELECT v_neg.valor_total_pagar - COALESCE(SUM(COALESCE(f.capital_para_cierre, f.monto_aprobado, 0)), 0)
  INTO v_faltante
  FROM fuentes_pago f
  WHERE f.negociacion_id = v_negociacion_id
    AND f.estado_fuente = 'activa';

  IF v_faltante > 1 THEN
    RAISE EXCEPTION 'Cierre financiero descuadrado: las fuentes de pago no cubren el valor total. Corrígelo antes de registrar pagos.';
  END IF;

  -- ── Documentos obligatorios que aplican a esta fuente ──────────────
  SELECT string_agg(DISTINCT v.tipo_documento, ', ')
  INTO v_docs
  FROM vista_documentos_pendientes_fuentes v
  WHERE v.cliente_id = v_neg.cliente_id
    AND v.nivel_validacion = 'DOCUMENTO_OBLIGATORIO'
    AND (
      (v.alcance = 'ESPECIFICO_FUENTE' AND v.fuente_pago_id = v_fuente_id)
      OR (v.alcance = 'COMPARTIDO_CLIENTE'
          AND (v.fuentes_aplicables IS NULL
               OR cardinality(v.fuentes_aplicables) = 0
               OR v_fuente.tipo = ANY (v.fuentes_aplicables)))
    );

  IF v_docs IS NOT NULL THEN
    RAISE EXCEPTION 'Faltan documentos obligatorios de esta fuente: %.', v_docs;
  END IF;

  -- ── 1. Abono ───────────────────────────────────────────────────────
  INSERT INTO abonos_historial (
    negociacion_id, fuente_pago_id, monto, mora_incluida, fecha_abono,
    metodo_pago, numero_referencia, comprobante_url, notas,
    usuario_registro, es_overpayment
  ) VALUES (
    v_negociacion_id,
    v_fuente_id,
    v_monto,
    v_mora,
    (v_fecha::text || ' 12:00:00+00')::timestamptz,
    v_metodo,
    NULLIF(trim(p_payload->>'numero_referencia'), ''),
    v_comprobante,
    NULLIF(trim(p_payload->>'notas'), ''),
    auth.uid(),
    v_excede
  )
  RETURNING * INTO v_abono;

  -- ── 2. Pago de más confirmado por Administrador ────────────────────
  IF v_excede THEN
    INSERT INTO pagos_excedentes (
      negociacion_id, abono_id, fuente_tipo, monto_pagado, monto_esperado,
      monto_excedente, created_by
    ) VALUES (
      v_negociacion_id, v_abono.id, v_fuente.tipo, v_principal, v_saldo,
      v_principal - v_saldo, auth.uid()
    );
  END IF;

  -- ── 3. ¿Quedó pagada la negociación? ───────────────────────────────
  SELECT * INTO v_despues FROM fuentes_pago WHERE id = v_fuente_id;
  SELECT * INTO v_neg FROM negociaciones WHERE id = v_negociacion_id;

  IF COALESCE(v_neg.saldo_pendiente, 1) <= 0 THEN
    UPDATE negociaciones
    SET estado = 'Completada',
        fecha_completada = (v_hoy::text || ' 12:00:00+00')::timestamptz
    WHERE id = v_negociacion_id;

    UPDATE viviendas SET estado = 'Propietario' WHERE id = v_neg.vivienda_id;

    UPDATE clientes SET estado = 'Propietario'
    WHERE id = v_neg.cliente_id
    RETURNING trim(nombres || ' ' || apellidos) INTO v_cliente_nombre;

    v_completada := true;
  END IF;

  RETURN jsonb_build_object(
    'abono', to_jsonb(v_abono),
    'negociacion_completada', v_completada,
    'cliente_nombre', v_cliente_nombre,
    'fuente_antes', jsonb_build_object(
      'monto_recibido', v_fuente.monto_recibido,
      'saldo_pendiente', v_fuente.saldo_pendiente),
    'fuente_despues', jsonb_build_object(
      'monto_recibido', v_despues.monto_recibido,
      'saldo_pendiente', v_despues.saldo_pendiente)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_abono(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_abono(jsonb) TO authenticated;

COMMENT ON FUNCTION public.registrar_abono(jsonb) IS
  'Registra abono/desembolso de forma atómica: validaciones, abono, excedente y cierre de la negociación.';
