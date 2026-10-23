-- ============================================================================
-- Historial del cliente leído desde `auditoria` (fase en paralelo)
-- ============================================================================
-- `auditoria` (triggers) sabe QUÉ cambió; `audit_log` (escrito por la app)
-- guarda además el POR QUÉ: motivos de edición, foto de las fuentes al crear
-- la negociación, traslados, cierres… Para que `auditoria` sea la única
-- fuente sin perder nada:
--
--   1. Columna `contexto`: lo que la app agrega a cada evento.
--      · Históricos: copia fiel de audit_log (par exacto por tabla, registro
--        y fecha; verificado 1 a 1).
--      · Mientras la app siga escribiendo audit_log, un trigger puente copia
--        su metadata al evento de `auditoria` correspondiente.
--   2. Tabla `auditoria_ocultos`: eventos ocultos del historial (la tabla
--      `auditoria` solo la escriben triggers). El puente también sincroniza
--      ocultar/restaurar hecho sobre audit_log.
--   3. RPC obtener_historial_cliente_v2: mismo formato de salida que la
--      actual, para que la UI funcione sin cambios y se puedan comparar.
--
-- No modifica nada de lo que hoy se usa. Se puede ejecutar más de una vez.
-- ============================================================================

-- ── 1. Contexto y ocultos ───────────────────────────────────────────────────
ALTER TABLE public.auditoria ADD COLUMN IF NOT EXISTS contexto jsonb;

CREATE TABLE IF NOT EXISTS public.auditoria_ocultos (
  auditoria_id bigint PRIMARY KEY REFERENCES public.auditoria (id) ON DELETE CASCADE,
  ocultado_por uuid,
  fecha        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.auditoria_ocultos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.auditoria_ocultos FROM anon, authenticated;

-- Quita solo las claves de primer nivel en null (jsonb_strip_nulls también
-- borraría los null DENTRO de los datos, que son información)
CREATE OR REPLACE FUNCTION public.jsonb_sin_nulos_raiz(p jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_object_agg(k, v) FROM jsonb_each(p) AS e(k, v) WHERE v <> 'null'::jsonb
$$;

-- ── 2. Par en `auditoria` de un evento de audit_log ─────────────────────────
-- Exacto por fecha (históricos) o el más cercano en ±2 min con la misma tabla,
-- registro y acción (eventos en vivo: la app escribe audit_log segundos
-- después de que el trigger escribió `auditoria`).
CREATE OR REPLACE FUNCTION public.auditoria_par_audit_log(
  p_tabla text, p_registro uuid, p_accion text, p_fecha timestamptz, p_solo_sin_contexto boolean
) RETURNS bigint
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT a.id
    FROM auditoria a
   WHERE a.tabla = p_tabla
     AND a.registro_id IS NOT DISTINCT FROM p_registro
     AND a.accion = CASE p_accion WHEN 'CREATE' THEN 'CREAR' WHEN 'DELETE' THEN 'ELIMINAR' ELSE 'EDITAR' END
     AND a.fecha BETWEEN p_fecha - interval '2 minutes' AND p_fecha + interval '2 minutes'
     AND (NOT p_solo_sin_contexto OR a.contexto IS NULL)
   ORDER BY abs(extract(epoch FROM a.fecha - p_fecha))
   LIMIT 1
$$;

-- ── 3. Puente audit_log → auditoria (temporal, hasta retirar audit_log) ─────
CREATE OR REPLACE FUNCTION public.puente_audit_log_auditoria()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id  bigint;
  v_ctx record;
BEGIN
  BEGIN
    IF TG_OP = 'INSERT' THEN
      v_id := auditoria_par_audit_log(NEW.tabla, NEW.registro_id, NEW.accion, NEW.fecha_evento, true);

      IF v_id IS NOT NULL THEN
        UPDATE auditoria
           SET contexto = jsonb_sin_nulos_raiz(jsonb_build_object(
                 'metadata', NEW.metadata, 'modulo', NEW.modulo, 'accion', NEW.accion))
         WHERE id = v_id;
      ELSE
        -- Evento sin cambio de fila (o fuera de la ventana): se guarda tal cual
        SELECT * INTO v_ctx
          FROM auditoria_contexto(NEW.tabla, coalesce(NEW.datos_nuevos, NEW.datos_anteriores));
        INSERT INTO auditoria
          (fecha, usuario_id, usuario_nombre, usuario_email, origen, tabla, registro_id,
           accion, cambios, datos, etiqueta, cliente_id, contexto)
        VALUES
          (NEW.fecha_evento, NEW.usuario_id, nullif(NEW.usuario_nombres, ''), NEW.usuario_email,
           'app', NEW.tabla, NEW.registro_id,
           CASE NEW.accion WHEN 'CREATE' THEN 'CREAR' WHEN 'DELETE' THEN 'ELIMINAR' ELSE 'EDITAR' END,
           NEW.cambios_especificos,
           CASE NEW.accion WHEN 'CREATE' THEN NEW.datos_nuevos WHEN 'DELETE' THEN NEW.datos_anteriores END,
           v_ctx.etiqueta,
           coalesce(v_ctx.cliente_id, (NEW.metadata ->> 'cliente_id')::uuid),
           jsonb_sin_nulos_raiz(jsonb_build_object(
             'metadata', NEW.metadata, 'modulo', NEW.modulo, 'accion', NEW.accion,
             'datos_anteriores', NEW.datos_anteriores, 'datos_nuevos', NEW.datos_nuevos)));
      END IF;

    ELSIF NEW.oculto IS DISTINCT FROM OLD.oculto THEN
      v_id := auditoria_par_audit_log(NEW.tabla, NEW.registro_id, NEW.accion, NEW.fecha_evento, false);
      IF v_id IS NOT NULL THEN
        IF NEW.oculto THEN
          INSERT INTO auditoria_ocultos (auditoria_id, ocultado_por, fecha)
          VALUES (v_id, NEW.oculto_por, coalesce(NEW.oculto_en, now()))
          ON CONFLICT (auditoria_id) DO NOTHING;
        ELSE
          DELETE FROM auditoria_ocultos WHERE auditoria_id = v_id;
        END IF;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- El puente nunca debe impedir que la app registre su evento
    RAISE WARNING 'puente audit_log → auditoria: %', SQLERRM;
  END;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_puente_auditoria ON public.audit_log;
CREATE TRIGGER trg_puente_auditoria
  AFTER INSERT OR UPDATE OF oculto ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.puente_audit_log_auditoria();

-- ── 4. Relleno de lo existente ──────────────────────────────────────────────
-- Históricos: copia fiel (par exacto por tabla, registro y fecha). Se
-- conservan los null: un campo vacío en audit_log también es información.
UPDATE public.auditoria a
   SET contexto = jsonb_build_object(
         'metadata', l.metadata, 'modulo', l.modulo, 'accion', l.accion,
         'datos_anteriores', l.datos_anteriores, 'datos_nuevos', l.datos_nuevos,
         'cambios_especificos', l.cambios_especificos)
  FROM public.audit_log l
 WHERE a.origen = 'historico'
   AND a.contexto IS NULL
   AND l.tabla = a.tabla
   AND l.registro_id IS NOT DISTINCT FROM a.registro_id
   AND l.fecha_evento = a.fecha;

-- En vivo (desde que existe `auditoria`): metadata de la app
UPDATE public.auditoria a
   SET contexto = jsonb_sin_nulos_raiz(jsonb_build_object(
         'metadata', l.metadata, 'modulo', l.modulo, 'accion', l.accion))
  FROM public.audit_log l
 WHERE a.origen <> 'historico'
   AND a.contexto IS NULL
   AND a.id = public.auditoria_par_audit_log(l.tabla, l.registro_id, l.accion, l.fecha_evento, true)
   AND l.fecha_evento > (SELECT min(fecha) FROM public.auditoria WHERE origen <> 'historico') - interval '2 minutes';

-- Ocultos actuales
INSERT INTO public.auditoria_ocultos (auditoria_id, ocultado_por, fecha)
SELECT p.id, l.oculto_por, coalesce(l.oculto_en, now())
  FROM public.audit_log l
 CROSS JOIN LATERAL (
   SELECT public.auditoria_par_audit_log(l.tabla, l.registro_id, l.accion, l.fecha_evento, false) AS id
 ) p
 WHERE l.oculto AND p.id IS NOT NULL
ON CONFLICT (auditoria_id) DO NOTHING;

-- ── 5. RPC: historial del cliente desde `auditoria` ─────────────────────────
-- Misma salida que obtener_historial_cliente (audit_log) para que la UI la use
-- igual; mismo control de acceso y mismas tablas.
CREATE OR REPLACE FUNCTION public.obtener_historial_cliente_v2(
  p_cliente_id uuid, p_limit integer DEFAULT 200, p_incluir_ocultos boolean DEFAULT false
)
RETURNS TABLE(
  id text, tabla text, accion text, registro_id uuid, fecha_evento timestamptz,
  usuario_id uuid, usuario_email text, usuario_nombres text,
  datos_anteriores jsonb, datos_nuevos jsonb, cambios_especificos jsonb,
  metadata jsonb, modulo text, oculto boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    EXISTS (SELECT 1 FROM usuarios u
             WHERE u.id = auth.uid() AND u.rol::text = 'Administrador' AND u.estado = 'Activo')
    OR EXISTS (SELECT 1 FROM usuarios u
                 JOIN permisos_rol p ON p.rol = u.rol::text
                WHERE u.id = auth.uid() AND u.estado = 'Activo'
                  AND p.modulo = 'clientes' AND p.accion = 'ver_historial' AND p.permitido)
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH ev AS (
    SELECT a.*,
           (o.auditoria_id IS NOT NULL) AS es_oculto,
           -- Antes / después por campo a partir de `cambios`
           (SELECT jsonb_object_agg(k, v -> 'antes')   FROM jsonb_each(a.cambios) AS c(k, v)) AS c_antes,
           (SELECT jsonb_object_agg(k, v -> 'despues') FROM jsonb_each(a.cambios) AS c(k, v)) AS c_despues
      FROM auditoria a
      LEFT JOIN auditoria_ocultos o ON o.auditoria_id = a.id
     WHERE a.cliente_id = p_cliente_id
       AND a.tabla IN ('clientes', 'negociaciones', 'abonos_historial', 'renuncias',
                       'intereses', 'documentos_cliente')
       AND (p_incluir_ocultos OR o.auditoria_id IS NULL)
  )
  SELECT
    ev.id::text,
    ev.tabla,
    coalesce(
      ev.contexto ->> 'accion',
      CASE
        WHEN ev.tabla = 'abonos_historial' AND ev.cambios -> 'estado' ->> 'despues' = 'Anulado' THEN 'ANULAR'
        WHEN ev.accion = 'CREAR' THEN 'CREATE'
        WHEN ev.accion = 'ELIMINAR' THEN 'DELETE'
        ELSE 'UPDATE'
      END),
    ev.registro_id,
    ev.fecha,
    ev.usuario_id,
    ev.usuario_email,
    ev.usuario_nombre,
    coalesce(ev.contexto -> 'datos_anteriores',
             CASE WHEN ev.accion = 'ELIMINAR' THEN ev.datos ELSE ev.c_antes END),
    coalesce(ev.contexto -> 'datos_nuevos',
             CASE WHEN ev.accion = 'CREAR' THEN ev.datos ELSE ev.c_despues END),
    coalesce(ev.contexto -> 'cambios_especificos', ev.cambios),
    CASE WHEN jsonb_typeof(ev.contexto -> 'metadata') = 'object'
         THEN ev.contexto -> 'metadata' ELSE '{}'::jsonb END
      || jsonb_build_object('cliente_id', ev.cliente_id::text, 'etiqueta', ev.etiqueta),
    ev.contexto ->> 'modulo',
    ev.es_oculto
  FROM ev
  ORDER BY ev.fecha DESC
  LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.obtener_historial_cliente_v2(uuid, integer, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.obtener_historial_cliente_v2(uuid, integer, boolean) TO authenticated;
REVOKE ALL ON FUNCTION public.auditoria_par_audit_log(text, uuid, text, timestamptz, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.puente_audit_log_auditoria() FROM PUBLIC, anon, authenticated;

-- ── Verificación ────────────────────────────────────────────────────────────
DO $$
DECLARE
  sin_ctx int;
  ocultos_log int;
  ocultos_aud int;
BEGIN
  SELECT count(*) INTO sin_ctx FROM public.auditoria WHERE origen = 'historico' AND contexto IS NULL;
  IF sin_ctx > 0 THEN
    RAISE EXCEPTION 'Quedaron % eventos históricos sin contexto', sin_ctx;
  END IF;
  SELECT count(*) INTO ocultos_log FROM public.audit_log WHERE oculto;
  SELECT count(*) INTO ocultos_aud FROM public.auditoria_ocultos;
  IF ocultos_aud < ocultos_log THEN
    RAISE EXCEPTION 'Ocultos: % en audit_log, % en auditoria_ocultos', ocultos_log, ocultos_aud;
  END IF;
  RAISE NOTICE 'OK: históricos con contexto, % ocultos sincronizados', ocultos_aud;
END $$;
