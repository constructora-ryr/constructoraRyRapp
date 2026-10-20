-- =====================================================
-- PRE-FLIGHT (SOLO LECTURA) para 20261020_dashboard_stats_rpc.sql
--
-- Ejecutar en producción ANTES de la migración. No modifica nada: corre en
-- una transacción READ ONLY y termina en ROLLBACK.
--
--   psql "$PROD_DATABASE_URL" -f supabase/fixes/preflight_20261020_dashboard_stats_rpc.sql
--
-- O pegar en el SQL Editor de Supabase (proyecto fnthbykvlhmtaiqyqtum).
-- =====================================================

BEGIN READ ONLY;

-- 1) Proyecto correcto
SELECT current_database() AS db, inet_server_addr() AS host, now() AS ahora;

-- 2) Dependencias: debe devolver 0 filas con estado 'FALTA'
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
SELECT r.tabla, r.columna,
       CASE WHEN c.column_name IS NULL THEN 'FALTA' ELSE c.udt_name END AS tipo
FROM requeridas r
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public' AND c.table_name = r.tabla AND c.column_name = r.columna
ORDER BY (c.column_name IS NULL) DESC, r.tabla, r.columna;

-- 3) ¿Ya existe una función con ese nombre?
SELECT p.oid::regprocedure AS firma, pg_get_function_result(p.oid) AS retorna
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'get_dashboard_stats';

-- 4) Valores de estado reales (la función filtra por estos literales)
SELECT 'proyectos' AS tabla, estado, COUNT(*) FROM proyectos GROUP BY 2
UNION ALL SELECT 'viviendas', estado, COUNT(*) FROM viviendas GROUP BY 2
UNION ALL SELECT 'clientes', estado, COUNT(*) FROM clientes GROUP BY 2
UNION ALL SELECT 'negociaciones', estado, COUNT(*) FROM negociaciones GROUP BY 2
UNION ALL SELECT 'abonos_historial', estado, COUNT(*) FROM abonos_historial GROUP BY 2
UNION ALL SELECT 'fuentes_pago', estado, COUNT(*) FROM fuentes_pago GROUP BY 2
UNION ALL SELECT 'documentos_pendientes', estado, COUNT(*) FROM documentos_pendientes GROUP BY 2
UNION ALL SELECT 'renuncias', estado, COUNT(*) FROM renuncias GROUP BY 2
ORDER BY 1, 2;

-- 5) Esquema completo de public (tablas y vistas con sus columnas)
SELECT c.table_name,
       t.table_type,
       string_agg(c.column_name || ' ' || c.udt_name
                  || CASE WHEN c.is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
                  ', ' ORDER BY c.ordinal_position) AS columnas
FROM information_schema.columns c
JOIN information_schema.tables t
  ON t.table_schema = c.table_schema AND t.table_name = c.table_name
WHERE c.table_schema = 'public'
GROUP BY c.table_name, t.table_type
ORDER BY c.table_name;

ROLLBACK;
