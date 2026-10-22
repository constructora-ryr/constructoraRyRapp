-- ============================================================================
-- Auditoría independiente ("policía en las sombras")
-- ============================================================================
-- Tabla `auditoria` escrita SOLO por triggers de la base de datos:
--   - No se puede saltar (no depende de que cada pantalla llame un servicio)
--   - No se puede falsificar ni borrar (sin permisos de escritura para nadie)
--   - En ediciones guarda solo los campos cambiados: { campo: {antes, despues} }
--
-- Quién lo hizo:
--   - Peticiones con sesión: auth.uid()
--   - Rutas del servidor con service role: cabecera `x-auditoria-usuario`
--     (solo se acepta si la petición viene con service role)
--   - Funciones internas sin usuario: queda como 'sistema'
--
-- Si registrar falla, la operación del usuario NO se bloquea (RAISE WARNING).
-- `audit_log` sigue igual: lo usa el Historial del cliente.
-- ============================================================================

BEGIN;
SET LOCAL lock_timeout = '5s';

-- ── Tabla ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auditoria (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fecha           timestamptz NOT NULL DEFAULT now(),
  usuario_id      uuid,
  usuario_nombre  text,
  usuario_email   text,
  origen          text NOT NULL CHECK (origen IN ('app', 'servidor', 'sistema', 'historico')),
  tabla           text NOT NULL,
  registro_id     uuid,
  accion          text NOT NULL CHECK (accion IN ('CREAR', 'EDITAR', 'ELIMINAR')),
  cambios         jsonb,   -- EDITAR: { campo: { "antes": x, "despues": y } }
  datos           jsonb,   -- CREAR / ELIMINAR: la fila completa
  etiqueta        text,    -- Legible: "Abono RYR-0123 · Mz. A Casa 1 · Juan Pérez"
  cliente_id      uuid     -- Cliente relacionado (para enlazar y filtrar)
);

-- Por si la tabla ya existía sin estas columnas
ALTER TABLE public.auditoria ADD COLUMN IF NOT EXISTS etiqueta text;
ALTER TABLE public.auditoria ADD COLUMN IF NOT EXISTS cliente_id uuid;

CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON public.auditoria (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_cliente ON public.auditoria (cliente_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_registro ON public.auditoria (tabla, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.auditoria (usuario_id, fecha DESC);

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- Solo lectura, solo administradores. Sin políticas de escritura.
DROP POLICY IF EXISTS "Administradores leen la auditoría" ON public.auditoria;
CREATE POLICY "Administradores leen la auditoría" ON public.auditoria
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = auth.uid() AND u.rol = 'Administrador'::rol_usuario
  ));

REVOKE ALL ON public.auditoria FROM anon, authenticated;
GRANT SELECT ON public.auditoria TO authenticated;

-- ── Etiqueta legible y cliente relacionado de una fila ─────────────────────
-- Se calcula al registrar el evento: sigue siendo legible aunque luego el
-- registro se elimine.
CREATE OR REPLACE FUNCTION public.auditoria_contexto(
  p_tabla text, f jsonb, OUT etiqueta text, OUT cliente_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
#variable_conflict use_variable
DECLARE
  v_vivienda uuid;
BEGIN
  IF f IS NULL THEN
    RETURN;
  END IF;

  CASE p_tabla
    WHEN 'clientes' THEN
      cliente_id := (f ->> 'id')::uuid;
      etiqueta := trim(concat_ws(' ', f ->> 'nombres', f ->> 'apellidos'));
    WHEN 'abonos_historial' THEN
      SELECT n.cliente_id, n.vivienda_id INTO cliente_id, v_vivienda
        FROM negociaciones n WHERE n.id = (f ->> 'negociacion_id')::uuid;
      -- numero_recibo ya viene formateado (RYR-2026-223)
      etiqueta := concat_ws(' ', 'Abono ' || (f ->> 'numero_recibo'),
        '($' || replace(to_char((f ->> 'monto')::numeric, 'FM999,999,999,990'), ',', '.') || ')');
    WHEN 'fuentes_pago' THEN
      SELECT n.cliente_id, n.vivienda_id INTO cliente_id, v_vivienda
        FROM negociaciones n WHERE n.id = (f ->> 'negociacion_id')::uuid;
      etiqueta := concat_ws(' ', f ->> 'tipo', '(' || (f ->> 'entidad') || ')');
    WHEN 'negociaciones' THEN
      cliente_id := (f ->> 'cliente_id')::uuid;
      v_vivienda := (f ->> 'vivienda_id')::uuid;
      etiqueta := 'Negociación';
    WHEN 'renuncias' THEN
      cliente_id := (f ->> 'cliente_id')::uuid;
      v_vivienda := (f ->> 'vivienda_id')::uuid;
      etiqueta := 'Renuncia';
    WHEN 'documentos_cliente' THEN
      cliente_id := (f ->> 'cliente_id')::uuid;
      etiqueta := f ->> 'titulo';
    WHEN 'documentos_vivienda' THEN
      v_vivienda := (f ->> 'vivienda_id')::uuid;
      etiqueta := f ->> 'titulo';
    WHEN 'documentos_proyecto' THEN
      etiqueta := concat_ws(' · ', f ->> 'titulo',
        (SELECT p.nombre FROM proyectos p WHERE p.id = (f ->> 'proyecto_id')::uuid));
    WHEN 'viviendas' THEN
      v_vivienda := (f ->> 'id')::uuid;
      cliente_id := (f ->> 'cliente_id')::uuid;
      etiqueta := 'Casa ' || (f ->> 'numero');
    WHEN 'usuarios' THEN
      etiqueta := trim(concat_ws(' ', f ->> 'nombres', f ->> 'apellidos'))
        || ' (' || coalesce(f ->> 'email', '') || ')';
    WHEN 'permisos_rol' THEN
      etiqueta := concat_ws(' · ', f ->> 'rol', f ->> 'modulo', f ->> 'accion');
    WHEN 'proyectos' THEN
      etiqueta := f ->> 'nombre';
    WHEN 'manzanas' THEN
      etiqueta := concat_ws(' · ', 'Manzana ' || (f ->> 'nombre'),
        (SELECT p.nombre FROM proyectos p WHERE p.id = (f ->> 'proyecto_id')::uuid));
    WHEN 'configuracion_recargos' THEN
      etiqueta := f ->> 'nombre';
    ELSE
      NULL;
  END CASE;

  -- La casa con su manzana (en viviendas reemplaza al "Casa N" provisional)
  IF v_vivienda IS NOT NULL THEN
    etiqueta := concat_ws(' · ',
      CASE WHEN p_tabla = 'viviendas' THEN NULL ELSE etiqueta END,
      coalesce(
        (SELECT 'Mz. ' || m.nombre || ' Casa ' || v.numero
           FROM viviendas v JOIN manzanas m ON m.id = v.manzana_id
          WHERE v.id = v_vivienda),
        CASE WHEN p_tabla = 'viviendas' THEN etiqueta END
      ));
  END IF;

  IF cliente_id IS NOT NULL AND p_tabla <> 'clientes' THEN
    etiqueta := concat_ws(' · ', etiqueta,
      (SELECT trim(c.nombres || ' ' || c.apellidos) FROM clientes c WHERE c.id = cliente_id));
  END IF;

  etiqueta := nullif(trim(etiqueta), '');
END;
$$;

REVOKE ALL ON FUNCTION public.auditoria_contexto(text, jsonb) FROM PUBLIC, anon, authenticated;

-- ── Función del trigger ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.registrar_auditoria()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  -- Campos calculados o de control: cambian solos y no son acciones de nadie
  ignorar   text[] := ARRAY[
    'fecha_actualizacion', 'updated_at', 'ultimo_acceso', 'ultimo_login',
    'monto_recibido', 'saldo_pendiente', 'porcentaje_completado',
    'total_fuentes_pago', 'total_abonado', 'porcentaje_pagado', 'version_lock'
  ];
  v_actor   uuid;
  v_origen  text;
  v_nombre  text;
  v_email   text;
  v_antes   jsonb;
  v_despues jsonb;
  v_cambios jsonb;
  v_accion  text;
  v_ctx     record;
BEGIN
  BEGIN
    v_actor := auth.uid();
    IF v_actor IS NOT NULL THEN
      v_origen := 'app';
    ELSIF auth.role() = 'service_role' THEN
      v_actor := nullif(
        current_setting('request.headers', true)::json ->> 'x-auditoria-usuario',
        ''
      )::uuid;
      v_origen := CASE WHEN v_actor IS NULL THEN 'sistema' ELSE 'servidor' END;
    ELSE
      v_origen := 'sistema';
    END IF;

    IF v_actor IS NOT NULL THEN
      SELECT trim(coalesce(u.nombres, '') || ' ' || coalesce(u.apellidos, '')), u.email
        INTO v_nombre, v_email
        FROM public.usuarios u WHERE u.id = v_actor;
    END IF;

    IF TG_OP = 'INSERT' THEN
      v_accion := 'CREAR';
      v_despues := to_jsonb(NEW) - ignorar;
    ELSIF TG_OP = 'DELETE' THEN
      v_accion := 'ELIMINAR';
      v_antes := to_jsonb(OLD) - ignorar;
    ELSE
      v_accion := 'EDITAR';
      SELECT jsonb_object_agg(n.key, jsonb_build_object('antes', o.value, 'despues', n.value))
        INTO v_cambios
        FROM jsonb_each(to_jsonb(NEW) - ignorar) n
        JOIN jsonb_each(to_jsonb(OLD) - ignorar) o USING (key)
       WHERE n.value IS DISTINCT FROM o.value;
      IF v_cambios IS NULL THEN
        RETURN NULL;  -- solo cambiaron campos calculados
      END IF;
    END IF;

    SELECT * INTO v_ctx
      FROM public.auditoria_contexto(TG_TABLE_NAME, coalesce(to_jsonb(NEW), to_jsonb(OLD)));

    INSERT INTO public.auditoria
      (usuario_id, usuario_nombre, usuario_email, origen, tabla, registro_id,
       accion, cambios, datos, etiqueta, cliente_id)
    VALUES
      (v_actor, nullif(v_nombre, ''), v_email, v_origen, TG_TABLE_NAME,
       coalesce((v_despues ->> 'id'), (v_antes ->> 'id'), (to_jsonb(NEW) ->> 'id'))::uuid,
       v_accion, v_cambios, coalesce(v_despues, v_antes), v_ctx.etiqueta, v_ctx.cliente_id);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'auditoria: no se pudo registrar % en %: %', TG_OP, TG_TABLE_NAME, SQLERRM;
  END;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_auditoria() FROM PUBLIC, anon, authenticated;

-- ── Triggers en las tablas vigiladas ────────────────────────────────────────
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'abonos_historial', 'negociaciones', 'fuentes_pago', 'clientes', 'viviendas',
    'documentos_cliente', 'documentos_vivienda', 'documentos_proyecto',
    'renuncias', 'usuarios', 'permisos_rol', 'proyectos', 'manzanas',
    'configuracion_recargos'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_auditoria ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_auditoria AFTER INSERT OR UPDATE OR DELETE ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria()', t);
  END LOOP;
END $$;

-- ── audit_log (Historial del cliente): nadie sin sesión debe escribir ──────
REVOKE INSERT, UPDATE, DELETE ON public.audit_log FROM anon;

-- ── Copiar la historia de audit_log (una sola vez) ─────────────────────────
INSERT INTO public.auditoria
  (fecha, usuario_id, usuario_nombre, usuario_email, origen, tabla, registro_id, accion, cambios, datos)
SELECT
  l.fecha_evento,
  l.usuario_id,
  nullif(l.usuario_nombres, ''),
  l.usuario_email,
  'historico',
  l.tabla,
  l.registro_id,
  CASE l.accion WHEN 'CREATE' THEN 'CREAR' WHEN 'DELETE' THEN 'ELIMINAR' ELSE 'EDITAR' END,
  CASE WHEN l.accion NOT IN ('CREATE', 'DELETE') THEN (
    SELECT jsonb_object_agg(n.key, jsonb_build_object('antes', o.value, 'despues', n.value))
      FROM jsonb_each(coalesce(l.datos_nuevos, '{}'::jsonb)) n
      LEFT JOIN jsonb_each(coalesce(l.datos_anteriores, '{}'::jsonb)) o USING (key)
     WHERE n.value IS DISTINCT FROM o.value
  ) END,
  CASE l.accion WHEN 'CREATE' THEN l.datos_nuevos WHEN 'DELETE' THEN l.datos_anteriores END
FROM public.audit_log l
WHERE NOT EXISTS (SELECT 1 FROM public.auditoria a WHERE a.origen = 'historico')
ORDER BY l.fecha_evento;

-- Etiquetas de los eventos que no la tienen: con la fila guardada o, en las
-- ediciones históricas (sin fila), con la fila actual si todavía existe
CREATE OR REPLACE FUNCTION pg_temp.fila_actual(p_tabla text, p_id uuid)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE r jsonb;
BEGIN
  EXECUTE format('SELECT to_jsonb(t) FROM public.%I t WHERE t.id = $1', p_tabla)
    INTO r USING p_id;
  RETURN r;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END $$;

UPDATE public.auditoria a
   SET (etiqueta, cliente_id) = (
     SELECT c.etiqueta, c.cliente_id
       FROM public.auditoria_contexto(
              a.tabla, coalesce(a.datos, pg_temp.fila_actual(a.tabla, a.registro_id))) c)
 WHERE a.etiqueta IS NULL;

-- ── Verificación ────────────────────────────────────────────────────────────
DO $$
DECLARE
  n_triggers int;
BEGIN
  SELECT count(*) INTO n_triggers FROM pg_trigger WHERE tgname = 'trg_auditoria';
  IF n_triggers <> 14 THEN
    RAISE EXCEPTION 'Se esperaban 14 triggers de auditoría, hay %', n_triggers;
  END IF;
  IF has_table_privilege('anon', 'public.auditoria', 'insert')
     OR has_table_privilege('authenticated', 'public.auditoria', 'insert')
     OR has_table_privilege('authenticated', 'public.auditoria', 'update')
     OR has_table_privilege('authenticated', 'public.auditoria', 'delete') THEN
    RAISE EXCEPTION 'La auditoría quedó con permisos de escritura';
  END IF;
  IF has_table_privilege('anon', 'public.audit_log', 'insert') THEN
    RAISE EXCEPTION 'anon todavía puede escribir en audit_log';
  END IF;
  IF (SELECT count(*) FROM public.auditoria WHERE origen = 'historico')
     <> (SELECT count(*) FROM public.audit_log) THEN
    RAISE EXCEPTION 'La copia histórica no coincide con audit_log';
  END IF;
END $$;

COMMIT;
