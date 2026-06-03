-- ============================================================
-- RESTORE COMPLETO DE TABLAS DE CONFIG
-- Ejecutar después de cleanup_prod.sql para repoblar configuración
-- Generado desde dev el 2026-06-03
-- ============================================================

\echo '→ tipos_fuentes_pago'
TRUNCATE TABLE tipos_fuentes_pago CASCADE;
\i config_tipos_fuentes_pago.sql

\echo '→ entidades_financieras'
TRUNCATE TABLE entidades_financieras CASCADE;
\i config_entidades_financieras.sql

\echo '→ configuracion_recargos'
TRUNCATE TABLE configuracion_recargos CASCADE;
\i config_configuracion_recargos.sql

\echo '→ plantillas_requisitos_documentos'
TRUNCATE TABLE plantillas_requisitos_documentos CASCADE;
\i config_plantillas_requisitos_documentos.sql

\echo '→ permisos_rol'
TRUNCATE TABLE permisos_rol CASCADE;
\i config_permisos_rol.sql

\echo '→ fuentes_pago_requisitos_config'
TRUNCATE TABLE fuentes_pago_requisitos_config CASCADE;
\i config_fuentes_pago_requisitos_config.sql

\echo '→ requisitos_fuentes_pago_config'
-- DELETE en lugar de TRUNCATE CASCADE para no borrar documentos_cliente
DELETE FROM requisitos_fuentes_pago_config;
\i config_requisitos_fuentes_pago_config.sql

-- Verificación
SELECT 'tipos_fuentes_pago'                  AS tabla, count(*) AS filas FROM tipos_fuentes_pago
UNION ALL SELECT 'entidades_financieras',              count(*) FROM entidades_financieras
UNION ALL SELECT 'configuracion_recargos',             count(*) FROM configuracion_recargos
UNION ALL SELECT 'plantillas_requisitos_documentos',   count(*) FROM plantillas_requisitos_documentos
UNION ALL SELECT 'permisos_rol',                       count(*) FROM permisos_rol
UNION ALL SELECT 'fuentes_pago_requisitos_config',     count(*) FROM fuentes_pago_requisitos_config
UNION ALL SELECT 'requisitos_fuentes_pago_config',     count(*) FROM requisitos_fuentes_pago_config WHERE activo = true
ORDER BY tabla;
