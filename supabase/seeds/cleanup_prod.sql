-- ============================================================
-- LIMPIEZA PROD: Elimina datos de negocio, conserva configuración
-- ============================================================
-- Ejecutar UNA SOLA VEZ después de restaurar el dump de dev.
-- Conserva: permisos_rol, plantillas_requisitos_documentos,
--           entidades_financieras, configuracion_recargos, tipos_fuentes_pago
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
  fuentes_pago_requisitos_config,
  requisitos_fuentes_pago_config,
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
  usuarios,
  categorias_documento
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
UNION ALL SELECT 'tipos_fuentes_pago',               count(*) FROM tipos_fuentes_pago;
