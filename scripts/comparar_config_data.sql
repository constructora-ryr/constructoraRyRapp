-- Conteo de datos de config (ejecutar en dev y prod y comparar)
SELECT 'permisos_rol'                    AS tabla, count(*) AS filas FROM permisos_rol
UNION ALL SELECT 'plantillas_requisitos_documentos', count(*) FROM plantillas_requisitos_documentos
UNION ALL SELECT 'entidades_financieras',            count(*) FROM entidades_financieras
UNION ALL SELECT 'configuracion_recargos',           count(*) FROM configuracion_recargos
UNION ALL SELECT 'tipos_fuentes_pago',               count(*) FROM tipos_fuentes_pago
UNION ALL SELECT 'fuentes_pago_requisitos_config',   count(*) FROM fuentes_pago_requisitos_config
UNION ALL SELECT 'req_fuentes_activos',              count(*) FROM requisitos_fuentes_pago_config WHERE activo = true
UNION ALL SELECT 'categorias_sistema',               count(*) FROM categorias_documento WHERE es_sistema = true
ORDER BY tabla;
