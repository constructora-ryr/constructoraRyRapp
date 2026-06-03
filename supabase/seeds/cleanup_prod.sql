-- ============================================================
-- LIMPIEZA PROD: Elimina datos de negocio, conserva configuración
-- ============================================================
-- Ejecutar UNA SOLA VEZ después de restaurar el dump de dev.
-- Conserva (NO tocar):
--   permisos_rol, plantillas_requisitos_documentos,
--   entidades_financieras, configuracion_recargos, tipos_fuentes_pago,
--   fuentes_pago_requisitos_config, requisitos_fuentes_pago_config,
--   categorias_documento
-- ============================================================

TRUNCATE TABLE
  renuncias,
  abonos_historial,
  audit_log,
  audit_log_seguridad,
  negociaciones_versiones,
  negociaciones_historial,
  descuentos_negociacion,
  creditos_constructora,
  cuotas_credito,
  documentos_cliente,
  documentos_proyecto,
  documentos_vivienda,
  documento_reemplazos_admin,
  carpetas_documentos,
  notas_historial_cliente,
  cliente_intereses,
  fuentes_pago,
  negociaciones,
  clientes,
  viviendas,
  manzanas,
  proyectos,
  usuarios
CASCADE;

-- Verificación: estas tablas deben quedar en 0
SELECT 'clientes'      AS tabla, count(*) AS filas FROM clientes
UNION ALL SELECT 'negociaciones',  count(*) FROM negociaciones
UNION ALL SELECT 'proyectos',      count(*) FROM proyectos
UNION ALL SELECT 'viviendas',      count(*) FROM viviendas
UNION ALL SELECT 'usuarios',       count(*) FROM usuarios
UNION ALL SELECT 'abonos_historial', count(*) FROM abonos_historial

UNION ALL

-- Estas deben tener datos (config estática)
SELECT '--- CONFIG ---' AS tabla, NULL
UNION ALL SELECT 'permisos_rol',                    count(*) FROM permisos_rol
UNION ALL SELECT 'plantillas_requisitos_documentos', count(*) FROM plantillas_requisitos_documentos
UNION ALL SELECT 'entidades_financieras',            count(*) FROM entidades_financieras
UNION ALL SELECT 'configuracion_recargos',           count(*) FROM configuracion_recargos
UNION ALL SELECT 'tipos_fuentes_pago',               count(*) FROM tipos_fuentes_pago
UNION ALL SELECT 'fuentes_pago_requisitos_config',   count(*) FROM fuentes_pago_requisitos_config
UNION ALL SELECT 'requisitos_fuentes_pago_config',   count(*) FROM requisitos_fuentes_pago_config WHERE activo = true
UNION ALL SELECT 'categorias_documento',             count(*) FROM categorias_documento WHERE es_sistema = true;
