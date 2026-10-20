-- =====================================================
-- MIGRACIÓN: get_dashboard_stats() v3
-- Fecha: 2026-10-20
--
-- Cambios sobre v2 (20261020_dashboard_stats_rpc_v2.sql):
--   alertas.devolucionesPendientes: dinero a favor de clientes por devolver,
--   con las mismas dos reglas que muestran el aviso "Devolución pendiente al
--   cliente" en la pestaña Negociación:
--     a) pago_excedente: abono registrado por encima del saldo
--        (pagos_excedentes.estado = 'pendiente')
--     b) excedente_fuentes: las fuentes activas (capital_para_cierre o
--        monto_aprobado) superan valor_total_pagar y la devolución no está
--        'procesada' (negociaciones Activa / Completada)
--   Se ignoran montos < $1.000 (residuos de redondeo).
--
-- desembolsosPendientes se sigue devolviendo para no romper el frontend
-- anterior, aunque el dashboard nuevo ya no lo muestra.
--
-- Misma firma y retorno (jsonb): CREATE OR REPLACE sin DROP.
-- SECURITY INVOKER: respeta RLS (pagos_excedentes solo para administradores).
--
-- Rollback: volver a ejecutar 20261020_dashboard_stats_rpc_v2.sql.
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
      ('audit_log', 'datos_nuevos'), ('audit_log', 'oculto'), ('audit_log', 'usuario_id'),
      ('negociaciones', 'fecha_completada'), ('negociaciones', 'cliente_id'), ('negociaciones', 'vivienda_id'),
      ('clientes', 'id'), ('clientes', 'nombre_completo'),
      ('fuentes_pago', 'entidad'), ('fuentes_pago', 'entidad_financiera_id'),
      ('entidades_financieras', 'id'), ('entidades_financieras', 'nombre'),
      ('viviendas', 'numero'), ('manzanas', 'nombre'),
      ('usuarios', 'id'), ('usuarios', 'nombres'), ('usuarios', 'apellidos'),
      ('pagos_excedentes', 'id'), ('pagos_excedentes', 'negociacion_id'),
      ('pagos_excedentes', 'monto_excedente'), ('pagos_excedentes', 'estado'),
      ('fuentes_pago', 'capital_para_cierre'), ('fuentes_pago', 'monto_aprobado'),
      ('fuentes_pago', 'estado_fuente'),
      ('negociaciones', 'valor_total_pagar'), ('negociaciones', 'valor_total'),
      ('negociaciones', 'excedente_devolucion_estado')
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

  -- ── Saldadas: negociaciones completadas (pagadas al 100%) ──────────────────
  saldadas AS (
    SELECT
      COUNT(*) FILTER (WHERE (n.fecha_completada AT TIME ZONE v_tz)::date >= v_inicio_mes) AS mes,
      COUNT(*) FILTER (WHERE (n.fecha_completada AT TIME ZONE v_tz)::date >= v_inicio_ant
                         AND (n.fecha_completada AT TIME ZONE v_tz)::date <  v_inicio_mes) AS mes_anterior
    FROM negociaciones n
    WHERE n.estado = 'Completada'
      AND n.fecha_completada >= (v_inicio_ant::timestamp AT TIME ZONE v_tz)
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
  mora_items AS (
    SELECT
      f.id                         AS fuente_id,
      n.cliente_id,
      c.nombre_completo            AS cliente,
      MAX(pc.dias_atraso)          AS dias_atraso,
      SUM(pc.deficit)              AS monto
    FROM vista_estado_periodos_credito pc
    JOIN fuentes_pago f    ON f.id = pc.fuente_pago_id AND f.estado = 'Activa'
    JOIN negociaciones n   ON n.id = f.negociacion_id  AND n.estado = 'Activa'
    LEFT JOIN clientes c   ON c.id = n.cliente_id
    WHERE pc.dias_atraso > 0
    GROUP BY f.id, n.cliente_id, c.nombre_completo
    ORDER BY MAX(pc.dias_atraso) DESC
    LIMIT 10
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
  desembolsos_items AS (
    SELECT
      f.id                                   AS fuente_id,
      n.cliente_id,
      c.nombre_completo                      AS cliente,
      COALESCE(t.nombre, f.tipo)             AS tipo,
      COALESCE(ef.nombre, f.entidad)         AS entidad,
      NULLIF(concat_ws(' ', m.nombre, v.numero), '') AS vivienda,
      f.saldo_pendiente                      AS monto
    FROM fuentes_pago f
    JOIN negociaciones n ON n.id = f.negociacion_id AND n.estado = 'Activa'
    JOIN tipos_fuentes_pago t
      ON t.id = f.tipo_fuente_id
      OR (f.tipo_fuente_id IS NULL AND t.nombre = f.tipo)
    LEFT JOIN clientes c               ON c.id = n.cliente_id
    LEFT JOIN entidades_financieras ef ON ef.id = f.entidad_financiera_id
    LEFT JOIN viviendas v              ON v.id = n.vivienda_id
    LEFT JOIN manzanas m               ON m.id = v.manzana_id
    WHERE f.estado = 'Activa'
      AND (t.requiere_entidad IS TRUE OR t.es_subsidio IS TRUE)
      AND f.saldo_pendiente > 0
    ORDER BY f.saldo_pendiente DESC
    LIMIT 10
  ),
  -- ── Devoluciones a clientes (mismas reglas que la pestaña Negociación) ─────
  devoluciones_items AS (
    -- a) Abonos registrados por encima del saldo
    SELECT
      pe.id                  AS ref_id,
      'pago_excedente'       AS origen,
      n.cliente_id,
      c.nombre_completo      AS cliente,
      NULLIF(concat_ws(' ', m.nombre, v.numero), '') AS vivienda,
      pe.monto_excedente     AS monto
    FROM pagos_excedentes pe
    JOIN negociaciones n   ON n.id = pe.negociacion_id
    LEFT JOIN clientes c   ON c.id = n.cliente_id
    LEFT JOIN viviendas v  ON v.id = n.vivienda_id
    LEFT JOIN manzanas m   ON m.id = v.manzana_id
    WHERE pe.estado = 'pendiente'
      AND pe.monto_excedente >= 1000

    UNION ALL

    -- b) Fuentes de pago que superan el valor a pagar
    SELECT
      n.id                   AS ref_id,
      'excedente_fuentes'    AS origen,
      n.cliente_id,
      c.nombre_completo      AS cliente,
      NULLIF(concat_ws(' ', m.nombre, v.numero), '') AS vivienda,
      SUM(COALESCE(f.capital_para_cierre, f.monto_aprobado, 0))
        - COALESCE(n.valor_total_pagar, n.valor_total, 0) AS monto
    FROM negociaciones n
    JOIN fuentes_pago f    ON f.negociacion_id = n.id AND f.estado_fuente = 'activa'
    LEFT JOIN clientes c   ON c.id = n.cliente_id
    LEFT JOIN viviendas v  ON v.id = n.vivienda_id
    LEFT JOIN manzanas m   ON m.id = v.manzana_id
    WHERE n.estado IN ('Activa', 'Completada')
      AND n.excedente_devolucion_estado IS DISTINCT FROM 'procesada'
    GROUP BY n.id, n.cliente_id, c.nombre_completo, m.nombre, v.numero,
             n.valor_total_pagar, n.valor_total
    HAVING SUM(COALESCE(f.capital_para_cierre, f.monto_aprobado, 0))
             - COALESCE(n.valor_total_pagar, n.valor_total, 0) >= 1000
  ),
  devoluciones AS (
    SELECT COUNT(*) AS total, COALESCE(SUM(monto), 0) AS monto
    FROM devoluciones_items
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
      -- Nombre real: "Nicolás Rodriguez" (primer nombre + primer apellido)
      COALESCE(
        NULLIF(btrim(concat_ws(' ',
          split_part(btrim(u.nombres), ' ', 1),
          split_part(btrim(u.apellidos), ' ', 1))), ''),
        NULLIF(al.usuario_nombres, ''),
        split_part(al.usuario_email, '@', 1)
      ) AS usuario,
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
    LEFT JOIN usuarios u ON u.id = al.usuario_id
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
      'ventasMesAnterior',  (SELECT mes_anterior FROM ventas),
      'saldadasMes',        (SELECT mes FROM saldadas),
      'saldadasMesAnterior', (SELECT mes_anterior FROM saldadas)
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
      'creditoMora', (
        SELECT jsonb_build_object(
          'creditos', creditos, 'monto', monto, 'maxDiasAtraso', max_dias,
          'items', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'fuenteId', fuente_id, 'clienteId', cliente_id, 'cliente', cliente,
              'diasAtraso', dias_atraso, 'monto', monto
            ) ORDER BY dias_atraso DESC) FROM mora_items
          ), '[]'::jsonb)
        ) FROM mora_credito
      ),
      'desembolsosPendientes', (
        SELECT jsonb_build_object(
          'total', total, 'monto', monto,
          'items', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'fuenteId', fuente_id, 'clienteId', cliente_id, 'cliente', cliente,
              'tipo', tipo, 'entidad', entidad, 'vivienda', vivienda, 'monto', monto
            ) ORDER BY monto DESC) FROM desembolsos_items
          ), '[]'::jsonb)
        ) FROM desembolsos
      ),
      'devolucionesPendientes', (
        SELECT jsonb_build_object(
          'total', total, 'monto', monto,
          'items', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'refId', ref_id, 'origen', origen, 'clienteId', cliente_id,
              'cliente', cliente, 'vivienda', vivienda, 'monto', monto
            ) ORDER BY monto DESC)
            FROM (SELECT * FROM devoluciones_items ORDER BY monto DESC LIMIT 10) top
          ), '[]'::jsonb)
        ) FROM devoluciones
      ),
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
  'v3: Estadísticas agregadas del dashboard (conteos, finanzas con saldadas, serie de recaudo 12m, alertas con detalle y devoluciones a clientes, actividad con nombre real). SECURITY INVOKER: respeta RLS.';

COMMIT;
