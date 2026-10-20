-- =====================================================
-- ENSAYO (DRY-RUN) de 20261020_dashboard_stats_rpc.sql
--
-- Generado a partir de la migración: mismo SQL, pero al final ejecuta la
-- función con los datos reales y hace ROLLBACK. NO deja nada aplicado.
-- Ejecutar en el SQL Editor de prod (fnthbykvlhmtaiqyqtum). Resultado
-- esperado: "Pre-flight OK" y una fila con el JSON del dashboard.
-- =====================================================

-- =====================================================
-- MIGRACIÓN: RPC get_dashboard_stats()
-- Fecha: 2026-10-20
--
-- PROBLEMA:
--   El dashboard descargaba todos los proyectos, viviendas, clientes y abonos
--   del mes al navegador para contarlos en JS:
--   - PostgREST corta en 1.000 filas → conteos incorrectos al crecer.
--   - obtenerProyectos() devuelve viviendasVendidas = 0 siempre, así que las
--     barras de avance por proyecto mostraban 0%.
--   - El "inicio de mes" se calculaba en UTC, no en hora Colombia.
--
-- SOLUCIÓN:
--   Una sola función que devuelve todo agregado en JSON, más los datos nuevos
--   del dashboard (serie de recaudo, cartera, ventas, alertas, actividad).
--
-- SEGURIDAD:
--   SECURITY INVOKER → respeta RLS. Cada usuario solo agrega lo que ya puede
--   ver (p.ej. audit_log solo para administradores, abonos con permiso 'ver').
-- =====================================================

-- APLICACIÓN SEGURA EN PRODUCCIÓN:
--   - Solo crea una función nueva. No toca tablas, datos, triggers ni RLS.
--   - Todo va en una transacción: si algo falla, no queda nada aplicado.
--   - El Paso 0 valida contra el esquema REAL que existan todas las tablas,
--     vistas y columnas usadas; si falta algo, aborta con la lista exacta.
--   - Rollback: supabase/fixes/rollback_20261020_dashboard_stats_rpc.sql
-- =====================================================

BEGIN;

-- No esperar locks indefinidamente ni dejar la sesión colgada
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- ─────────────────────────────────────────────────────────────────────────────
-- Paso 0: Pre-flight — validar dependencias contra el esquema real
-- ─────────────────────────────────────────────────────────────────────────────
DO $preflight$
DECLARE
  v_faltantes text;
  v_existente text;
BEGIN
  WITH requeridas(tabla, columna) AS (
    VALUES
      ('proyectos', 'id'), ('proyectos', 'nombre'), ('proyectos', 'estado'),
      ('proyectos', 'fecha_creacion'), ('proyectos', 'archivado'),
      ('manzanas', 'id'), ('manzanas', 'proyecto_id'), ('manzanas', 'numero_viviendas'),
      ('viviendas', 'id'), ('viviendas', 'manzana_id'), ('viviendas', 'estado'),
      ('clientes', 'estado'),
      ('abonos_historial', 'monto'), ('abonos_historial', 'mora_incluida'),
      ('abonos_historial', 'estado'), ('abonos_historial', 'fecha_abono'),
      ('negociaciones', 'id'), ('negociaciones', 'estado'),
      ('negociaciones', 'saldo_pendiente'), ('negociaciones', 'fecha_negociacion'),
      ('negociaciones', 'negociacion_origen_id'),
      ('fuentes_pago', 'id'), ('fuentes_pago', 'negociacion_id'), ('fuentes_pago', 'estado'),
      ('fuentes_pago', 'tipo'), ('fuentes_pago', 'tipo_fuente_id'), ('fuentes_pago', 'saldo_pendiente'),
      ('tipos_fuentes_pago', 'id'), ('tipos_fuentes_pago', 'nombre'),
      ('tipos_fuentes_pago', 'requiere_entidad'), ('tipos_fuentes_pago', 'es_subsidio'),
      ('vista_estado_periodos_credito', 'fuente_pago_id'),
      ('vista_estado_periodos_credito', 'deficit'),
      ('vista_estado_periodos_credito', 'dias_atraso'),
      ('documentos_pendientes', 'estado'), ('documentos_pendientes', 'fecha_limite'),
      ('renuncias', 'estado'), ('renuncias', 'monto_a_devolver'),
      ('audit_log', 'id'), ('audit_log', 'modulo'), ('audit_log', 'accion'),
      ('audit_log', 'tabla'), ('audit_log', 'fecha_evento'), ('audit_log', 'usuario_nombres'),
      ('audit_log', 'usuario_email'), ('audit_log', 'metadata'),
      ('audit_log', 'datos_nuevos'), ('audit_log', 'oculto')
  )
  SELECT string_agg(r.tabla || '.' || r.columna, ', ' ORDER BY r.tabla, r.columna)
  INTO v_faltantes
  FROM requeridas r
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = r.tabla
      AND c.column_name = r.columna
  );

  IF v_faltantes IS NOT NULL THEN
    RAISE EXCEPTION 'ABORTADO: faltan columnas/tablas en este esquema: %', v_faltantes
      USING HINT = 'No se aplicó ningún cambio. Ajustar la función a este esquema antes de reintentar.';
  END IF;

  -- Si ya existe una función con ese nombre y otra firma/retorno, avisar
  SELECT string_agg(
           p.oid::regprocedure::text || ' → ' || pg_get_function_result(p.oid), '; ')
  INTO v_existente
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'get_dashboard_stats';

  IF v_existente IS NOT NULL THEN
    RAISE NOTICE 'Ya existe: % (será reemplazada si la firma coincide)', v_existente;
  END IF;

  RAISE NOTICE 'Pre-flight OK: todas las dependencias existen.';
END
$preflight$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Paso 1: Crear la función
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_tz            constant text := 'America/Bogota';
  v_hoy           date := (now() AT TIME ZONE v_tz)::date;
  v_inicio_mes    date := date_trunc('month', v_hoy)::date;
  v_inicio_ant    date := (date_trunc('month', v_hoy) - interval '1 month')::date;
  v_inicio_serie  date := (date_trunc('month', v_hoy) - interval '11 months')::date;
  v_result        jsonb;
BEGIN
  WITH
  -- ── Proyectos ──────────────────────────────────────────────────────────────
  proy AS (
    SELECT p.id, p.nombre, p.estado, p.fecha_creacion
    FROM proyectos p
    WHERE p.archivado IS NOT TRUE
  ),
  proy_viv AS (
    SELECT
      p.id,
      COALESCE((SELECT SUM(m.numero_viviendas) FROM manzanas m WHERE m.proyecto_id = p.id), 0) AS planeadas,
      COUNT(v.id)                                                   AS creadas,
      COUNT(v.id) FILTER (WHERE v.estado = 'Disponible')            AS disponibles,
      COUNT(v.id) FILTER (WHERE v.estado = 'Asignada')              AS asignadas,
      COUNT(v.id) FILTER (WHERE v.estado = 'Entregada')             AS entregadas,
      COUNT(v.id) FILTER (WHERE v.estado = 'Propietario')           AS propietario
    FROM proy p
    LEFT JOIN manzanas m  ON m.proyecto_id = p.id
    LEFT JOIN viviendas v ON v.manzana_id = m.id
    GROUP BY p.id
  ),

  -- ── Recaudo (capital, sin mora) por mes en hora Colombia ───────────────────
  abonos_mes AS (
    SELECT
      date_trunc('month', a.fecha_abono AT TIME ZONE v_tz)::date AS mes,
      SUM(a.monto - COALESCE(a.mora_incluida, 0))                AS total,
      COUNT(*)                                                   AS cantidad
    FROM abonos_historial a
    WHERE a.estado = 'Activo'
      AND a.fecha_abono >= (v_inicio_serie::timestamp AT TIME ZONE v_tz)
    GROUP BY 1
  ),
  serie AS (
    SELECT
      gs::date AS mes,
      COALESCE(am.total, 0)    AS total,
      COALESCE(am.cantidad, 0) AS cantidad
    FROM generate_series(v_inicio_serie, v_inicio_mes, interval '1 month') gs
    LEFT JOIN abonos_mes am ON am.mes = gs::date
  ),

  -- ── Ventas: negociaciones nuevas (traslados no cuentan como venta) ─────────
  ventas AS (
    SELECT
      COUNT(*) FILTER (WHERE (n.fecha_negociacion AT TIME ZONE v_tz)::date >= v_inicio_mes) AS mes,
      COUNT(*) FILTER (WHERE (n.fecha_negociacion AT TIME ZONE v_tz)::date >= v_inicio_ant
                         AND (n.fecha_negociacion AT TIME ZONE v_tz)::date <  v_inicio_mes) AS mes_anterior
    FROM negociaciones n
    WHERE n.negociacion_origen_id IS NULL
      AND n.fecha_negociacion >= (v_inicio_ant::timestamp AT TIME ZONE v_tz)
  ),

  -- ── Alertas ────────────────────────────────────────────────────────────────
  mora_credito AS (
    SELECT
      COUNT(DISTINCT pc.fuente_pago_id) AS creditos,
      COALESCE(SUM(pc.deficit), 0)      AS monto,
      COALESCE(MAX(pc.dias_atraso), 0)  AS max_dias
    FROM vista_estado_periodos_credito pc
    JOIN fuentes_pago f   ON f.id = pc.fuente_pago_id AND f.estado = 'Activa'
    JOIN negociaciones n  ON n.id = f.negociacion_id  AND n.estado = 'Activa'
    WHERE pc.dias_atraso > 0
  ),
  desembolsos AS (
    SELECT
      COUNT(*)                          AS total,
      COALESCE(SUM(f.saldo_pendiente), 0) AS monto
    FROM fuentes_pago f
    JOIN negociaciones n ON n.id = f.negociacion_id AND n.estado = 'Activa'
    JOIN tipos_fuentes_pago t
      ON t.id = f.tipo_fuente_id
      OR (f.tipo_fuente_id IS NULL AND t.nombre = f.tipo)
    -- Fuentes externas: bancos/cajas (requiere_entidad) y subsidios del
    -- gobierno (es_subsidio; p.ej. Mi Casa Ya no requiere entidad en prod)
    WHERE f.estado = 'Activa'
      AND (t.requiere_entidad IS TRUE OR t.es_subsidio IS TRUE)
      AND f.saldo_pendiente > 0
  ),
  docs_pend AS (
    SELECT
      COUNT(*)                                        AS total,
      COUNT(*) FILTER (WHERE d.fecha_limite < now())  AS vencidos
    FROM documentos_pendientes d
    WHERE d.estado IN ('Pendiente', 'Vencido')
  ),
  renuncias_pend AS (
    SELECT
      COUNT(*)                              AS total,
      COALESCE(SUM(r.monto_a_devolver), 0)  AS monto
    FROM renuncias r
    WHERE r.estado = 'Pendiente Devolución'
  ),

  -- ── Actividad reciente (RLS: solo administradores ven audit_log) ───────────
  actividad AS (
    SELECT
      al.id,
      al.modulo,
      al.accion,
      al.tabla,
      al.fecha_evento,
      COALESCE(NULLIF(al.usuario_nombres, ''), al.usuario_email) AS usuario,
      COALESCE(
        al.metadata ->> 'cliente_nombre',
        al.metadata ->> 'proyecto_nombre',
        al.metadata ->> 'titulo',
        al.datos_nuevos ->> 'nombre_completo'
      ) AS detalle,
      -- Solo si es número JSON: un texto no numérico no debe romper la función
      CASE WHEN jsonb_typeof(al.metadata -> 'abono_monto') = 'number'
           THEN (al.metadata ->> 'abono_monto')::numeric
      END AS monto
    FROM audit_log al
    WHERE al.oculto IS NOT TRUE
    ORDER BY al.fecha_evento DESC
    LIMIT 8
  )

  SELECT jsonb_build_object(
    'generadoEn', now(),

    'proyectos', jsonb_build_object(
      'total',           (SELECT COUNT(*) FROM proy),
      'activos',         (SELECT COUNT(*) FROM proy WHERE estado IN ('en_proceso', 'en_construccion')),
      'enPlanificacion', (SELECT COUNT(*) FROM proy WHERE estado = 'en_planificacion'),
      'pausados',        (SELECT COUNT(*) FROM proy WHERE estado = 'pausado'),
      'completados',     (SELECT COUNT(*) FROM proy WHERE estado = 'completado'),
      'list', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id',                p.id,
          'nombre',            p.nombre,
          'estado',            p.estado,
          'totalViviendas',    GREATEST(pv.planeadas, pv.creadas),
          'viviendasCreadas',  pv.creadas,
          'disponibles',       pv.disponibles,
          'asignadas',         pv.asignadas,
          'entregadas',        pv.entregadas,
          'propietario',       pv.propietario,
          -- "Vendidas" = no disponible (misma regla del filtro de viviendas)
          'viviendasVendidas', pv.asignadas + pv.entregadas + pv.propietario
        ) ORDER BY p.fecha_creacion DESC)
        FROM proy p JOIN proy_viv pv ON pv.id = p.id
      ), '[]'::jsonb)
    ),

    'viviendas', (
      SELECT jsonb_build_object(
        'total',       COUNT(*),
        'disponibles', COUNT(*) FILTER (WHERE estado = 'Disponible'),
        'asignadas',   COUNT(*) FILTER (WHERE estado = 'Asignada'),
        'entregadas',  COUNT(*) FILTER (WHERE estado = 'Entregada'),
        'propietario', COUNT(*) FILTER (WHERE estado = 'Propietario')
      )
      FROM viviendas
    ),

    'clientes', (
      SELECT jsonb_build_object(
        'total',        COUNT(*),
        'activos',      COUNT(*) FILTER (WHERE estado = 'Activo'),
        'interesados',  COUNT(*) FILTER (WHERE estado = 'Interesado'),
        'inactivos',    COUNT(*) FILTER (WHERE estado = 'Inactivo'),
        'renunciaron',  COUNT(*) FILTER (WHERE estado = 'Renunció'),
        'propietarios', COUNT(*) FILTER (WHERE estado = 'Propietario')
      )
      FROM clientes
    ),

    'finanzas', jsonb_build_object(
      'recaudoMes',         (SELECT total FROM serie WHERE mes = v_inicio_mes),
      'recaudoMesAnterior', (SELECT total FROM serie WHERE mes = v_inicio_ant),
      'abonosMes',          (SELECT cantidad FROM serie WHERE mes = v_inicio_mes),
      'carteraPendiente',   (SELECT COALESCE(SUM(saldo_pendiente), 0) FROM negociaciones WHERE estado = 'Activa'),
      'negociacionesActivas', (SELECT COUNT(*) FROM negociaciones WHERE estado = 'Activa'),
      'ventasMes',          (SELECT mes FROM ventas),
      'ventasMesAnterior',  (SELECT mes_anterior FROM ventas)
    ),

    'recaudoMensual', (
      SELECT jsonb_agg(jsonb_build_object(
        'mes',      to_char(mes, 'YYYY-MM'),
        'total',    total,
        'cantidad', cantidad
      ) ORDER BY mes)
      FROM serie
    ),

    'alertas', jsonb_build_object(
      'creditoMora', (SELECT jsonb_build_object('creditos', creditos, 'monto', monto, 'maxDiasAtraso', max_dias) FROM mora_credito),
      'desembolsosPendientes', (SELECT jsonb_build_object('total', total, 'monto', monto) FROM desembolsos),
      'documentosPendientes',  (SELECT jsonb_build_object('total', total, 'vencidos', vencidos) FROM docs_pend),
      'renunciasPendientes',   (SELECT jsonb_build_object('total', total, 'monto', monto) FROM renuncias_pend)
    ),

    'actividad', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id',      id,
        'modulo',  modulo,
        'accion',  accion,
        'tabla',   tabla,
        'fecha',   fecha_evento,
        'usuario', usuario,
        'detalle', detalle,
        'monto',   monto
      ) ORDER BY fecha_evento DESC)
      FROM actividad
    ), '[]'::jsonb)
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;

COMMENT ON FUNCTION public.get_dashboard_stats() IS
  'Estadísticas agregadas del dashboard (conteos, finanzas, serie de recaudo 12m, alertas, actividad). SECURITY INVOKER: respeta RLS.';

-- Ejecutar la función recién creada (dentro de la transacción)
SELECT jsonb_pretty(public.get_dashboard_stats() - 'actividad') AS resultado_dry_run;

ROLLBACK;
