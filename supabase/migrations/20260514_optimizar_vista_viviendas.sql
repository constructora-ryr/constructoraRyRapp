-- =====================================================
-- MIGRACIÓN: Optimización vista_viviendas_completas
-- Fecha: 2026-05-14
-- Problemas corregidos:
--   1. JOIN a abonos_historial sin filtro estado='Activo'
--      → incluía abonos anulados → saldo incorrecto y query más lenta
--   2. Cálculos basados en valor_total (precio base vivienda)
--      en vez de valor_total_pagar (precio negociado real del cliente)
--   3. Vista no exponía valor_total_pagar → frontend necesitaba
--      una query extra a negociaciones por cada carga de la lista
-- Impacto esperado: reducir ~643ms a ~200ms en vista
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
  -- NUEVO: precio real que el cliente debe pagar (incluye descuentos/intereses)
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
  c.id AS cliente_id_data,
  c.nombres AS cliente_nombres,
  c.apellidos AS cliente_apellidos,
  c.telefono AS cliente_telefono,
  c.email AS cliente_email,

  -- Cálculos de abonos — SOLO estado='Activo' (fix: excluye anulados)
  COALESCE(SUM(ah.monto), 0) AS total_abonado,
  COUNT(ah.id) AS cantidad_abonos,

  -- Porcentaje basado en valor_total_pagar si existe, sino valor_total
  CASE
    WHEN COALESCE(neg.valor_total_pagar, v.valor_total) > 0 THEN
      ROUND(
        (COALESCE(SUM(ah.monto), 0) /
         COALESCE(neg.valor_total_pagar, v.valor_total) * 100)::numeric,
        2
      )
    ELSE 0
  END AS porcentaje_pagado,

  -- Saldo basado en valor_total_pagar si existe, sino valor_total
  GREATEST(
    COALESCE(neg.valor_total_pagar, v.valor_total) - COALESCE(SUM(ah.monto), 0),
    0
  ) AS saldo_pendiente

FROM viviendas v
LEFT JOIN manzanas m            ON v.manzana_id    = m.id
LEFT JOIN proyectos p           ON m.proyecto_id   = p.id
LEFT JOIN clientes c            ON v.cliente_id    = c.id
LEFT JOIN negociaciones neg     ON v.negociacion_id = neg.id
-- FIX: filtro estado='Activo' para excluir abonos anulados
LEFT JOIN abonos_historial ah   ON v.negociacion_id = ah.negociacion_id
                                AND ah.estado = 'Activo'

GROUP BY
  v.id, v.manzana_id, v.numero, v.estado, v.cliente_id, v.negociacion_id,
  v.lindero_norte, v.lindero_sur, v.lindero_oriente, v.lindero_occidente,
  v.matricula_inmobiliaria, v.nomenclatura, v.area, v.area_lote,
  v.area_construida, v.tipo_vivienda, v.certificado_tradicion_url,
  v.valor_base, v.es_esquinera, v.recargo_esquinera, v.gastos_notariales,
  v.valor_total, v.fecha_creacion, v.fecha_actualizacion,
  neg.valor_total_pagar,
  m.nombre, m.proyecto_id,
  p.nombre, p.estado,
  c.id, c.nombres, c.apellidos, c.telefono, c.email

ORDER BY v.fecha_creacion DESC;

-- Permisos
ALTER VIEW vista_viviendas_completas OWNER TO postgres;
GRANT SELECT ON vista_viviendas_completas TO authenticated;
GRANT SELECT ON vista_viviendas_completas TO anon;

COMMENT ON VIEW vista_viviendas_completas IS
'Vista optimizada de viviendas. Fix 2026-05-14: filtra abonos activos y usa valor_total_pagar como base de cálculo.';

-- =====================================================
-- ÍNDICE COMPUESTO — el más importante para el JOIN filtrado
-- abonos_historial(negociacion_id, estado) permite al motor
-- buscar solo los abonos activos de cada negociación en un solo scan
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_abonos_negociacion_estado
  ON abonos_historial(negociacion_id, estado);

-- Índice en negociaciones para el nuevo JOIN
CREATE INDEX IF NOT EXISTS idx_negociaciones_id_valor
  ON negociaciones(id, valor_total_pagar);
