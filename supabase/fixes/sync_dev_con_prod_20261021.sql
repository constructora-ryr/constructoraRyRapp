-- =====================================================
-- SINCRONIZAR DEV CON PROD — 2026-10-21
-- SOLO PARA DEV (pnqhzzbeiuriqsqzzxqs). NO ejecutar en producción.
--
-- Generado comparando el esquema real de ambas bases (columnas, funciones,
-- triggers, políticas, vistas, índices, restricciones, RLS). Trae a dev lo
-- que prod tiene más nuevo:
--   1. Columnas: abonos_historial.es_overpayment,
--      notas_historial_cliente.documento_vinculado_id,
--      renuncias.fecha_cancelacion / motivo_cancelacion / usuario_cancelacion
--   2. Renuncias: estado 'Cancelada' + check de motivo
--   3. Tabla sesiones_activas (+ índices, RLS, política) y
--      limpiar_sesiones_antiguas() (la usa el middleware al iniciar sesión)
--   4. Funciones con la versión de prod (saldo basado en fuentes, pagos
--      excedentes, rebalanceo que permite excedente, estados al completar)
--   5. vista_abonos_completos con fuente_pago_entidad
--   6. Política usuarios_pueden_actualizar_propio_perfil (no cambiar rol/estado)
--   7. RLS activado en clientes, fuentes_pago, manzanas, negociaciones,
--      proyectos y viviendas (en dev estaba desactivado)
--
-- NO se tocan (dev está adelantado y el código los usa; el arreglo va en prod):
--   - clientes_estado_check con 'Renunció'
--   - negociaciones_estado_check con 'Cerrada por Traslado'
--   - vista_usuarios_completos (dev tiene 2 columnas extra sin uso)
-- Diferencias solo de formato que se ignoran: uuid_generate_v4() vs
-- extensions.uuid_generate_v4() y checks de proyectos/viviendas/nivel_riesgo.
-- =====================================================

BEGIN;

SET LOCAL lock_timeout = '10s';

-- ── 1. Columnas ───────────────────────────────────────────────────────────────
ALTER TABLE public.abonos_historial
  ADD COLUMN IF NOT EXISTS es_overpayment boolean NOT NULL DEFAULT false;

ALTER TABLE public.notas_historial_cliente
  ADD COLUMN IF NOT EXISTS documento_vinculado_id uuid;
ALTER TABLE public.notas_historial_cliente
  DROP CONSTRAINT IF EXISTS notas_historial_cliente_documento_vinculado_id_fkey;
ALTER TABLE public.notas_historial_cliente
  ADD CONSTRAINT notas_historial_cliente_documento_vinculado_id_fkey
  FOREIGN KEY (documento_vinculado_id) REFERENCES public.documentos_cliente(id) ON DELETE SET NULL;

ALTER TABLE public.renuncias
  ADD COLUMN IF NOT EXISTS fecha_cancelacion timestamptz,
  ADD COLUMN IF NOT EXISTS motivo_cancelacion text,
  ADD COLUMN IF NOT EXISTS usuario_cancelacion uuid;
ALTER TABLE public.renuncias DROP CONSTRAINT IF EXISTS renuncias_usuario_cancelacion_fkey;
ALTER TABLE public.renuncias
  ADD CONSTRAINT renuncias_usuario_cancelacion_fkey
  FOREIGN KEY (usuario_cancelacion) REFERENCES auth.users(id);

-- ── 2. Renuncias: estado 'Cancelada' ─────────────────────────────────────────
ALTER TABLE public.renuncias DROP CONSTRAINT IF EXISTS renuncias_estado_check;
ALTER TABLE public.renuncias
  ADD CONSTRAINT renuncias_estado_check CHECK (((estado)::text = ANY (ARRAY[
    ('Pendiente Devolución'::character varying)::text,
    ('Cerrada'::character varying)::text,
    ('Cancelada'::character varying)::text])));
ALTER TABLE public.renuncias DROP CONSTRAINT IF EXISTS renuncias_cancelada_motivo_check;
ALTER TABLE public.renuncias
  ADD CONSTRAINT renuncias_cancelada_motivo_check CHECK ((((estado)::text <> 'Cancelada'::text)
    OR (((estado)::text = 'Cancelada'::text) AND (motivo_cancelacion IS NOT NULL))));

-- ── 3. sesiones_activas ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sesiones_activas (
  id            uuid        NOT NULL DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL,
  session_token text        NOT NULL,
  dispositivo   text,
  navegador     text,
  ip            text,
  revocada      boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sesiones_activas_pkey PRIMARY KEY (id),
  CONSTRAINT sesiones_activas_session_token_key UNIQUE (session_token),
  CONSTRAINT sesiones_activas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sesiones_activas_user_id ON public.sesiones_activas USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_activas_token ON public.sesiones_activas USING btree (session_token);
CREATE INDEX IF NOT EXISTS idx_sesiones_activas_revocada ON public.sesiones_activas USING btree (user_id, revocada) WHERE (revocada = false);
ALTER TABLE public.sesiones_activas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Ver propias sesiones" ON public.sesiones_activas;
CREATE POLICY "Ver propias sesiones" ON public.sesiones_activas
  AS PERMISSIVE FOR SELECT TO authenticated USING ((user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.limpiar_sesiones_antiguas(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.sesiones_activas
  WHERE user_id = p_user_id
    AND (
      revocada = true
      OR last_seen_at < now() - INTERVAL '30 days'
    );
END;
$function$;

-- ── 4. Funciones (versión de prod) ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.calcular_valor_total_pagar()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.sync_estados_on_negociacion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.estado = OLD.estado THEN
    RETURN NEW;
  END IF;

  -- ── Negociación completada ──────────────────────────────────────
  IF NEW.estado = 'Completada' AND OLD.estado != 'Completada' THEN

    IF NEW.vivienda_id IS NOT NULL THEN
      UPDATE viviendas
      SET estado = 'Propietario'
      WHERE id = NEW.vivienda_id
        AND estado IN ('Asignada', 'Entregada');
    END IF;

    IF NEW.cliente_id IS NOT NULL THEN
      UPDATE clientes
      SET estado = 'Propietario'
      WHERE id = NEW.cliente_id
        AND estado != 'Propietario';
    END IF;

  -- ── Reversión: negociación vuelve a Activa ──────────────────────
  ELSIF NEW.estado = 'Activa' AND OLD.estado = 'Completada' THEN

    IF NEW.vivienda_id IS NOT NULL THEN
      UPDATE viviendas
      SET estado = 'Asignada'
      WHERE id = NEW.vivienda_id
        AND estado = 'Propietario';
    END IF;

    IF NEW.cliente_id IS NOT NULL THEN
      UPDATE clientes
      SET estado = 'Activo'
      WHERE id = NEW.cliente_id
        AND estado = 'Propietario';
    END IF;

  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_negociaciones_totales()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.validar_abono_no_excede_saldo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  monto_aprobado_fuente  DECIMAL(15,2);
  monto_recibido_actual  DECIMAL(15,2);
  monto_principal_nuevo  DECIMAL(15,2);
  monto_principal_antiguo DECIMAL(15,2);
  nuevo_total            DECIMAL(15,2);
BEGIN
  -- Si está marcado como overpayment autorizado por admin, se permite sin restricción
  IF COALESCE(NEW.es_overpayment, false) THEN
    RETURN NEW;
  END IF;

  SELECT monto_aprobado, monto_recibido
  INTO monto_aprobado_fuente, monto_recibido_actual
  FROM public.fuentes_pago
  WHERE id = NEW.fuente_pago_id;

  monto_principal_nuevo := NEW.monto - COALESCE(NEW.mora_incluida, 0);

  IF TG_OP = 'UPDATE' THEN
    monto_principal_antiguo := OLD.monto - COALESCE(OLD.mora_incluida, 0);
    monto_recibido_actual := monto_recibido_actual - monto_principal_antiguo;
  END IF;

  nuevo_total := monto_recibido_actual + monto_principal_nuevo;

  IF nuevo_total > monto_aprobado_fuente THEN
    RAISE EXCEPTION
      'El abono excede el saldo pendiente. '
      'Monto aprobado: $%, Ya cobrado: $%, '
      'Principal del abono: $%, Saldo disponible: $%',
      monto_aprobado_fuente,
      monto_recibido_actual,
      monto_principal_nuevo,
      (monto_aprobado_fuente - monto_recibido_actual);
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.actualizar_monto_recibido_fuente()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  fuente_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    fuente_id := OLD.fuente_pago_id;
  ELSE
    fuente_id := NEW.fuente_pago_id;
  END IF;

  UPDATE public.fuentes_pago fp
  SET
    -- Capear en monto_aprobado para soportar overpayments: la fuente queda al 100%
    -- y el excedente se registra en pagos_excedentes
    monto_recibido = LEAST(
      (
        SELECT COALESCE(SUM(ah.monto - COALESCE(ah.mora_incluida, 0)), 0)
        FROM public.abonos_historial ah
        WHERE ah.fuente_pago_id = fuente_id
          AND ah.estado = 'Activo'
      ),
      fp.monto_aprobado
    ),
    mora_total_recibida = (
      SELECT COALESCE(SUM(COALESCE(ah.mora_incluida, 0)), 0)
      FROM public.abonos_historial ah
      WHERE ah.fuente_pago_id = fuente_id
        AND ah.estado = 'Activo'
    )
  WHERE fp.id = fuente_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_recalcular_saldos_tras_anulacion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$;

-- rebalancear_plan_financiero: solo bloquea déficit (el excedente se devuelve)
CREATE OR REPLACE FUNCTION public.rebalancear_plan_financiero(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- ── 5. vista_abonos_completos (agrega fuente_pago_entidad a mitad de lista) ──
DROP VIEW IF EXISTS public.vista_abonos_completos;
CREATE VIEW public.vista_abonos_completos AS
 SELECT ah.id,
    ah.numero_recibo,
    ah.negociacion_id,
    ah.fuente_pago_id,
    ah.monto,
    ah.fecha_abono,
    ah.metodo_pago,
    ah.numero_referencia,
    ah.comprobante_url,
    ah.notas,
    ah.fecha_creacion,
    ah.fecha_actualizacion,
    ah.usuario_registro,
    ah.estado,
    ah.motivo_categoria,
    ah.motivo_detalle,
    ah.anulado_por_id,
    ah.anulado_por_nombre,
    ah.fecha_anulacion,
        CASE
            WHEN (u.nombres IS NOT NULL) THEN TRIM(BOTH FROM (((u.nombres)::text || ' '::text) || (COALESCE(u.apellidos, ''::character varying))::text))
            ELSE NULL::text
        END AS registrado_por_nombre,
    n.cliente_id,
    c.nombres AS cliente_nombres,
    c.apellidos AS cliente_apellidos,
    c.numero_documento AS cliente_numero_documento,
    n.estado AS negociacion_estado,
    COALESCE(n.valor_total_pagar, n.valor_total, (0)::numeric) AS negociacion_valor_total,
    COALESCE(n.total_abonado, (0)::numeric) AS negociacion_total_abonado,
    COALESCE(n.saldo_pendiente, (0)::numeric) AS negociacion_saldo_pendiente,
    fp.tipo AS fuente_pago_tipo,
    fp.entidad AS fuente_pago_entidad,
    v.id AS vivienda_id,
    v.numero AS vivienda_numero,
    m.id AS manzana_id,
    m.nombre AS manzana_nombre,
    p.id AS proyecto_id,
    p.nombre AS proyecto_nombre
   FROM (((((((abonos_historial ah
     JOIN negociaciones n ON ((ah.negociacion_id = n.id)))
     JOIN clientes c ON ((n.cliente_id = c.id)))
     JOIN fuentes_pago fp ON ((ah.fuente_pago_id = fp.id)))
     LEFT JOIN viviendas v ON ((n.vivienda_id = v.id)))
     LEFT JOIN manzanas m ON ((v.manzana_id = m.id)))
     LEFT JOIN proyectos p ON ((m.proyecto_id = p.id)))
     LEFT JOIN usuarios u ON ((ah.usuario_registro = u.id)))
  ORDER BY ah.numero_recibo DESC;
GRANT SELECT ON public.vista_abonos_completos TO anon, authenticated, service_role;

-- ── 6. Política: el usuario edita su perfil sin cambiar su rol ni su estado ──
DROP POLICY IF EXISTS usuarios_pueden_actualizar_propio_perfil ON public.usuarios;
CREATE POLICY usuarios_pueden_actualizar_propio_perfil ON public.usuarios
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((id = auth.uid()))
  WITH CHECK (((id = auth.uid())
    AND (rol = ( SELECT usuarios_1.rol FROM usuarios usuarios_1 WHERE (usuarios_1.id = auth.uid())))
    AND (estado = ( SELECT usuarios_1.estado FROM usuarios usuarios_1 WHERE (usuarios_1.id = auth.uid())))));

-- ── 7. RLS como en prod ───────────────────────────────────────────────────────
ALTER TABLE public.clientes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuentes_pago  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manzanas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negociaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viviendas     ENABLE ROW LEVEL SECURITY;

COMMIT;
