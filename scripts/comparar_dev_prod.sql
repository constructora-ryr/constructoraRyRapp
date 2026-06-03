-- ============================================================
-- COMPARACIÓN DEV vs PROD: Tablas, funciones, triggers, vistas
-- Ejecutar en PROD para detectar lo que falta vs dev
-- ============================================================

-- TABLAS: cuántas hay en cada schema
SELECT 'tablas' AS tipo, count(*) AS total
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- VISTAS
SELECT 'vistas' AS tipo, count(*) AS total
FROM information_schema.views
WHERE table_schema = 'public';

-- FUNCIONES
SELECT 'funciones' AS tipo, count(*) AS total
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- TRIGGERS activos
SELECT 'triggers_activos' AS tipo, count(*) AS total
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND NOT t.tgisinternal AND t.tgenabled = 'O';

-- TABLAS DE CONFIG con sus conteos (deben coincidir con dev)
SELECT table_name AS config_tabla, NULL AS filas
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
AND table_name IN (
  'requisitos_fuentes_pago_config',
  'fuentes_pago_requisitos_config',
  'permisos_rol',
  'plantillas_requisitos_documentos',
  'entidades_financieras',
  'configuracion_recargos',
  'tipos_fuentes_pago',
  'categorias_documento'
)
ORDER BY table_name;
