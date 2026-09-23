-- ============================================================
-- FIX: rebalancear_plan_financiero — permitir excedente de fuentes
-- Fecha: 2026-09-23
--
-- PROBLEMA:
--   Línea de validación usa ABS(), bloqueando tanto déficit como excedente.
--   El cliente (useCierreFinanciero.ts) permite excedente correctamente
--   (excedente = devolución al cliente), pero el servidor lo rechazaba.
--
-- CASO REAL:
--   Vivienda $122.000.000 · Cuota Inicial $12.476.000 + Crédito $115.100.000
--   = $127.576.000 total. Excedente $5.576.000 → válido (devolución).
--   El servidor rechazaba con "no coincide con el valor de la vivienda".
--
-- CORRECCIÓN QUIRÚRGICA:
--   ABS(diferencia) >= 1  →  diferencia >= 1
--   Solo bloquear DÉFICIT (fuentes < vivienda). Excedente es válido.
-- ============================================================

CREATE OR REPLACE FUNCTION public.rebalancear_plan_financiero(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $_$
DECLARE
  v_negociacion_id uuid;
  v_usuario_id uuid;
  v_motivo text;
  v_notas text;
  v_valor_vivienda numeric;
  v_cliente_id uuid;
  v_ajuste jsonb;
  v_nueva jsonb;
  v_ajuste_id uuid;
  v_ajuste_tipo text;
  v_ajuste_monto_original numeric;
  v_ajuste_monto_nuevo numeric;
  v_ajuste_entidad_original text;
  v_ajuste_entidad_nueva text;
  v_ajuste_eliminar boolean;
  v_nueva_tipo text;
  v_nueva_monto numeric;
  v_nueva_entidad text;
  v_tipo_fuente_id uuid;
  v_tipo_fuente_codigo text;
  v_permite_multiples boolean;
  v_requiere_entidad boolean;
  v_razon_invalidacion text;
  v_cambio_entidad boolean;
  v_aumento_monto boolean;
  v_monto_recibido_actual numeric;
  v_capital_para_cierre_actual numeric;
  v_total_resultante numeric := 0;
  v_ajustes_aplicados jsonb := '[]'::jsonb;
  v_nuevas_creadas jsonb := '[]'::jsonb;
  v_datos_anteriores jsonb;
  v_entidad_financiera_id uuid;
  -- Audit user info
  v_usuario_email text;
  v_usuario_rol text;
  v_usuario_nombres text;
BEGIN
  -- ── 0. Extraer parámetros ──────────────────────────────────
  v_negociacion_id := (p_payload->>'negociacion_id')::uuid;
  v_usuario_id     := (p_payload->>'usuario_id')::uuid;
  v_motivo         := p_payload->>'motivo';
  v_notas          := p_payload->>'notas';
  v_valor_vivienda := (p_payload->>'valor_vivienda')::numeric;
  v_cliente_id     := (p_payload->>'cliente_id')::uuid;

  -- Validar inputs obligatorios
  IF v_negociacion_id IS NULL THEN
    RAISE EXCEPTION 'negociacion_id es obligatorio';
  END IF;
  IF v_motivo IS NULL OR v_motivo = '' THEN
    RAISE EXCEPTION 'motivo es obligatorio';
  END IF;

  -- ── 0.1 Resolver datos del usuario para audit_log ──────────
  IF v_usuario_id IS NOT NULL THEN
    SELECT u.email, u.rol, u.nombres
    INTO v_usuario_email, v_usuario_rol, v_usuario_nombres
    FROM usuarios u
    WHERE u.id = v_usuario_id
    LIMIT 1;
  END IF;

  -- Fallback: si no se encontró o no se pasó usuario_id, usar auth.uid()
  IF v_usuario_email IS NULL THEN
    v_usuario_id := COALESCE(v_usuario_id, auth.uid());
    IF v_usuario_id IS NOT NULL THEN
      SELECT u.email, u.rol, u.nombres
      INTO v_usuario_email, v_usuario_rol, v_usuario_nombres
      FROM usuarios u
      WHERE u.id = v_usuario_id
      LIMIT 1;
    END IF;
  END IF;

  -- Último fallback
  v_usuario_email  := COALESCE(v_usuario_email, 'sistema@ryr.com');
  v_usuario_rol    := COALESCE(v_usuario_rol, 'Sistema');
  v_usuario_nombres := COALESCE(v_usuario_nombres, 'Sistema');

  -- ── 0.2 Snapshot previo para auditoría ─────────────────────
  SELECT jsonb_agg(jsonb_build_object(
    'id', fp.id,
    'tipo', fp.tipo,
    'monto_aprobado', fp.monto_aprobado,
    'entidad', fp.entidad
  ))
  INTO v_datos_anteriores
  FROM fuentes_pago fp
  WHERE fp.negociacion_id = v_negociacion_id
    AND fp.estado_fuente = 'activa';

  -- ── 1. Procesar AJUSTES a fuentes existentes ──────────────
  IF p_payload ? 'ajustes' AND jsonb_array_length(p_payload->'ajustes') > 0 THEN
    FOR v_ajuste IN SELECT * FROM jsonb_array_elements(p_payload->'ajustes')
    LOOP
      v_ajuste_id             := (v_ajuste->>'id')::uuid;
      v_ajuste_tipo           := v_ajuste->>'tipo';
      v_ajuste_monto_original := (v_ajuste->>'montoOriginal')::numeric;
      v_ajuste_monto_nuevo    := (v_ajuste->>'montoEditable')::numeric;
      v_ajuste_entidad_original := v_ajuste->>'entidad';
      v_ajuste_entidad_nueva  := v_ajuste->>'entidadEditable';
      v_ajuste_eliminar       := (v_ajuste->>'paraEliminar')::boolean;

      IF v_ajuste_eliminar THEN
        -- Validar: no permitir inactivar fuente con abonos recibidos
        SELECT COALESCE(fp.monto_recibido, 0) INTO v_monto_recibido_actual
        FROM fuentes_pago fp WHERE fp.id = v_ajuste_id;

        IF v_monto_recibido_actual > 0 THEN
          RAISE EXCEPTION 'No se puede eliminar la fuente "%" porque ya recibió $% en abonos',
            v_ajuste_tipo, v_monto_recibido_actual;
        END IF;

        -- Inactivar fuente
        UPDATE fuentes_pago
        SET estado_fuente = 'inactiva',
            estado = 'Inactiva',
            fecha_actualizacion = now()
        WHERE id = v_ajuste_id;

        -- FIX #6: Cancelar cuotas de crédito constructora huérfanas
        UPDATE cuotas_credito_constructora
        SET estado = 'cancelada',
            notas = COALESCE(notas, '') || ' [Cancelada por inactivación de fuente en rebalanceo]',
            updated_at = now()
        WHERE credito_id IN (
          SELECT cc.id FROM creditos_constructora cc
          WHERE cc.fuente_pago_id = v_ajuste_id
        )
        AND estado NOT IN ('pagada', 'cancelada');

        v_ajustes_aplicados := v_ajustes_aplicados || jsonb_build_object(
          'id', v_ajuste_id, 'tipo', v_ajuste_tipo, 'accion', 'eliminada',
          'monto_anterior', v_ajuste_monto_original,
          'entidad_anterior', v_ajuste_entidad_original
        );
      ELSE
        -- Detectar cambios que invalidan documentación
        v_cambio_entidad := v_ajuste_entidad_nueva IS DISTINCT FROM v_ajuste_entidad_original;
        v_aumento_monto  := v_ajuste_monto_nuevo > v_ajuste_monto_original;

        -- Verificar si tipo requiere entidad (desde BD, no hardcodeado)
        SELECT tf.requiere_entidad INTO v_requiere_entidad
        FROM tipos_fuentes_pago tf
        WHERE tf.nombre = v_ajuste_tipo AND tf.activo = true
        LIMIT 1;

        -- 1a. Invalidar documentos si hubo cambio relevante en fuente que requiere docs
        IF COALESCE(v_requiere_entidad, false) AND (v_cambio_entidad OR v_aumento_monto) THEN
          v_razon_invalidacion := CASE
            WHEN v_cambio_entidad AND v_aumento_monto THEN
              format('Invalidado: entidad cambió (%s → %s) y monto aumentó', v_ajuste_entidad_original, v_ajuste_entidad_nueva)
            WHEN v_cambio_entidad THEN
              format('Invalidado: entidad cambió (%s → %s)', v_ajuste_entidad_original, v_ajuste_entidad_nueva)
            ELSE
              format('Invalidado: monto aumentó de $%s a $%s', v_ajuste_monto_original::text, v_ajuste_monto_nuevo::text)
          END;

          UPDATE documentos_cliente
          SET estado = 'archivado',
              razon_obsolescencia = v_razon_invalidacion,
              fecha_obsolescencia = now()
          WHERE fuente_pago_relacionada = v_ajuste_id
            AND estado = 'activo';

          UPDATE fuentes_pago
          SET carta_asignacion_url = NULL
          WHERE id = v_ajuste_id;
        END IF;

        -- 1b. Actualizar monto/entidad si cambiaron
        IF v_ajuste_monto_nuevo IS DISTINCT FROM v_ajuste_monto_original
           OR v_cambio_entidad THEN

          -- Validar: monto no puede ser menor a lo ya recibido
          SELECT COALESCE(fp.monto_recibido, 0) INTO v_monto_recibido_actual
          FROM fuentes_pago fp WHERE fp.id = v_ajuste_id;

          IF v_ajuste_monto_nuevo < v_monto_recibido_actual THEN
            RAISE EXCEPTION 'El monto de "%" ($%) no puede ser menor a lo ya recibido ($%)',
              v_ajuste_tipo, v_ajuste_monto_nuevo, v_monto_recibido_actual;
          END IF;

          -- FIX #3: Resolver entidad_financiera_id cuando cambia la entidad
          v_entidad_financiera_id := NULL;
          IF v_cambio_entidad AND v_ajuste_entidad_nueva IS NOT NULL AND v_ajuste_entidad_nueva != '' THEN
            SELECT ef.id INTO v_entidad_financiera_id
            FROM entidades_financieras ef
            WHERE ef.nombre = v_ajuste_entidad_nueva AND ef.activo = true
            LIMIT 1;
          END IF;

          UPDATE fuentes_pago
          SET monto_aprobado = v_ajuste_monto_nuevo,
              entidad = CASE WHEN v_cambio_entidad THEN v_ajuste_entidad_nueva ELSE entidad END,
              entidad_financiera_id = CASE
                WHEN v_cambio_entidad THEN v_entidad_financiera_id
                ELSE entidad_financiera_id
              END,
              fecha_actualizacion = now()
          WHERE id = v_ajuste_id;

          v_ajustes_aplicados := v_ajustes_aplicados || jsonb_build_object(
            'id',               v_ajuste_id,
            'tipo',             v_ajuste_tipo,
            'accion',           'actualizada',
            'monto_anterior',   v_ajuste_monto_original,
            'monto_nuevo',      v_ajuste_monto_nuevo,
            'entidad_anterior', v_ajuste_entidad_original,
            'entidad_nueva',    v_ajuste_entidad_nueva,
            'cambio_entidad',   v_cambio_entidad
          );
        END IF;

        -- Sumar al total resultante usando capital_para_cierre si existe (créditos)
        SELECT fp.capital_para_cierre INTO v_capital_para_cierre_actual
        FROM fuentes_pago fp WHERE fp.id = v_ajuste_id;

        v_total_resultante := v_total_resultante + COALESCE(v_capital_para_cierre_actual, v_ajuste_monto_nuevo);
      END IF;
    END LOOP;
  END IF;

  -- ── 2. Crear NUEVAS fuentes ────────────────────────────────
  IF p_payload ? 'nuevas' AND jsonb_array_length(p_payload->'nuevas') > 0 THEN
    FOR v_nueva IN SELECT * FROM jsonb_array_elements(p_payload->'nuevas')
    LOOP
      v_nueva_tipo    := v_nueva->>'tipo';
      v_nueva_monto   := (v_nueva->>'monto')::numeric;
      v_nueva_entidad := v_nueva->>'entidad';

      -- Resolver tipo_fuente_id y codigo
      SELECT tf.id, tf.permite_multiples_abonos, tf.codigo
      INTO v_tipo_fuente_id, v_permite_multiples, v_tipo_fuente_codigo
      FROM tipos_fuentes_pago tf
      WHERE tf.nombre = v_nueva_tipo AND tf.activo = true
      LIMIT 1;

      IF v_tipo_fuente_id IS NULL THEN
        RAISE EXCEPTION 'Tipo de fuente no encontrado: %', v_nueva_tipo;
      END IF;

      -- FIX #2: Resolver entidad_financiera_id desde nombre de entidad
      v_entidad_financiera_id := NULL;
      IF v_nueva_entidad IS NOT NULL AND v_nueva_entidad != '' THEN
        SELECT ef.id INTO v_entidad_financiera_id
        FROM entidades_financieras ef
        WHERE ef.nombre = v_nueva_entidad AND ef.activo = true
        LIMIT 1;
      END IF;

      INSERT INTO fuentes_pago (
        negociacion_id, tipo, tipo_fuente_id, monto_aprobado,
        monto_recibido, entidad, entidad_financiera_id,
        permite_multiples_abonos,
        estado, estado_fuente, capital_para_cierre
      ) VALUES (
        v_negociacion_id, v_nueva_tipo, v_tipo_fuente_id, v_nueva_monto,
        0, NULLIF(v_nueva_entidad, ''), v_entidad_financiera_id,
        COALESCE(v_permite_multiples, false),
        'Activa', 'activa',
        CASE WHEN v_tipo_fuente_codigo = 'credito_constructora'
             THEN v_nueva_monto ELSE NULL END
      );

      v_total_resultante := v_total_resultante + v_nueva_monto;

      v_nuevas_creadas := v_nuevas_creadas || jsonb_build_object(
        'tipo', v_nueva_tipo, 'monto', v_nueva_monto, 'entidad', v_nueva_entidad
      );
    END LOOP;
  END IF;

  -- ── 2.1 Validar balance total server-side ─────────────────
  -- CORRECCIÓN: solo bloquear DÉFICIT (fuentes < vivienda).
  -- El excedente es válido — se devuelve al cliente como devolución.
  -- Antes: ABS(v_valor_vivienda - v_total_resultante) >= 1 → bloqueaba excedente también.
  IF v_valor_vivienda IS NOT NULL AND v_valor_vivienda > 0 THEN
    IF (v_valor_vivienda - v_total_resultante) >= 1 THEN
      RAISE EXCEPTION 'Las fuentes de pago ($%) no cubren el valor de la vivienda ($%). Faltan: $%',
        v_total_resultante, v_valor_vivienda, (v_valor_vivienda - v_total_resultante);
    END IF;
  END IF;

  -- ── 3. Audit log ───────────────────────────────────────────
  INSERT INTO audit_log (
    tabla, accion, registro_id,
    usuario_id, usuario_email, usuario_rol, usuario_nombres,
    datos_anteriores, datos_nuevos, metadata,
    modulo
  ) VALUES (
    'negociaciones', 'UPDATE', v_negociacion_id,
    v_usuario_id, v_usuario_email, v_usuario_rol, v_usuario_nombres,
    jsonb_build_object('fuentes', v_datos_anteriores),
    jsonb_build_object('ajustados', v_ajustes_aplicados, 'nuevas', v_nuevas_creadas),
    jsonb_build_object(
      'motivo',      v_motivo,
      'notas',       v_notas,
      'valor_vivienda', v_valor_vivienda,
      'accion_tipo', 'rebalanceo_plan_financiero',
      'cliente_id',  v_cliente_id
    ),
    'negociaciones'
  );

  -- ── 4. Retornar resultado ──────────────────────────────────
  RETURN jsonb_build_object(
    'success',           true,
    'total_resultante',  v_total_resultante,
    'ajustes_aplicados', jsonb_array_length(v_ajustes_aplicados),
    'nuevas_creadas',    jsonb_array_length(v_nuevas_creadas)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error',   SQLERRM
  );
END;
$_$;

GRANT EXECUTE ON FUNCTION public.rebalancear_plan_financiero(jsonb) TO authenticated;
