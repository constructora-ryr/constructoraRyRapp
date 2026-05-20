-- =====================================================
-- MIGRACIÓN v2: Eliminar GROUP BY de vista_viviendas_completas
-- Fecha: 2026-05-14
-- Problema: GROUP BY con 30 columnas + SUM() sobre abonos_historial
--   es la causa principal de lentitud (~800ms de ejecución real)
-- Solución: usar negociaciones.total_abonado y saldo_pendiente
--   (ya mantenidos por triggers de DB) — elimina el GROUP BY
--   y reemplaza el JOIN pesado por un subquery liviano solo para COUNT
-- =====================================================

DROP VIEW IF EXISTS vista_viviendas_completas;

CREATE VIEW vista_viviendas_completas AS
SELECT
  -- Datos de la vivienda
  v.id,
  v.manzana_id,
  v.numero,
  v.estado,
  v.cliente_id,
  v.negociacion_id,

  -- Linderos
  v.lindero_norte,
  v.lindero_sur,
  v.lindero_oriente,
  v.lindero_occidente,

  -- Información Legal
  v.matricula_inmobiliaria,
  v.nomenclatura,
  v.area,
  v.area_lote,
  v.area_construida,
  v.tipo_vivienda,
  v.certificado_tradicion_url,

  -- Información Financiera
  v.valor_base,
  v.es_esquinera,
  v.recargo_esquinera,
  v.gastos_notariales,
  v.valor_total,
  neg.valor_total_pagar,

  -- Auditoría
  v.fecha_creacion,
  v.fecha_actualizacion,

  -- Datos de la manzana
  m.nombre AS manzana_nombre,
  m.proyecto_id,

  -- Datos del proyecto
  p.nombre AS proyecto_nombre,
  p.estado AS proyecto_estado,

  -- Datos del cliente
  c.id     AS cliente_id_data,
  c.nombres    AS cliente_nombres,
  c.apellidos  AS cliente_apellidos,
  c.telefono   AS cliente_telefono,
  c.email      AS cliente_email,

  -- Valores pre-calculados de negociaciones (mantenidos por triggers)
  -- Sin GROUP BY ni SUM — solo lectura directa
  COALESCE(neg.total_abonado, 0) AS total_abonado,
  COALESCE(ab_count.cantidad, 0) AS cantidad_abonos,

  -- Porcentaje y saldo usando valor_total_pagar como base
  CASE
    WHEN COALESCE(neg.valor_total_pagar, v.valor_total) > 0 THEN
      ROUND(
        (COALESCE(neg.total_abonado, 0)::numeric /
         COALESCE(neg.valor_total_pagar, v.valor_total) * 100),
        2
      )
    ELSE 0
  END AS porcentaje_pagado,

  GREATEST(
    COALESCE(neg.saldo_pendiente, v.valor_total),
    0
  ) AS saldo_pendiente

FROM viviendas v
LEFT JOIN manzanas m        ON v.manzana_id     = m.id
LEFT JOIN proyectos p       ON m.proyecto_id    = p.id
LEFT JOIN clientes c        ON v.cliente_id     = c.id
LEFT JOIN negociaciones neg ON v.negociacion_id = neg.id
-- Subquery solo para COUNT — usa índice (negociacion_id, estado)
LEFT JOIN (
  SELECT negociacion_id, COUNT(*) AS cantidad
  FROM abonos_historial
  WHERE estado = 'Activo'
  GROUP BY negociacion_id
) ab_count ON v.negociacion_id = ab_count.negociacion_id

ORDER BY v.fecha_creacion DESC;

-- Permisos
ALTER VIEW vista_viviendas_completas OWNER TO postgres;
GRANT SELECT ON vista_viviendas_completas TO authenticated;
GRANT SELECT ON vista_viviendas_completas TO anon;

COMMENT ON VIEW vista_viviendas_completas IS
'Vista optimizada v2 (2026-05-14): sin GROUP BY, usa negociaciones.total_abonado (pre-calculado por triggers). Subquery solo para cantidad_abonos.';
