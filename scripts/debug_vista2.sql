-- Verificar si hay documentos que ya completan el requisito (filtrando el pendiente)
SELECT dc.id, dc.tipo_documento, dc.requisito_config_id, dc.fuente_pago_relacionada, dc.estado
FROM documentos_cliente dc
JOIN fuentes_pago fp ON fp.id = dc.fuente_pago_relacionada
WHERE fp.estado = 'Activa';

-- Ver exactamente la vista sin el filtro dc.id IS NULL
SELECT
  fp.tipo AS fuente_tipo,
  rfc.titulo AS requisito,
  rfc.alcance,
  dc.id AS doc_id,
  dc.tipo_documento AS doc_tipo
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN requisitos_fuentes_pago_config rfc
  ON rfc.tipo_fuente = fp.tipo::text
  AND rfc.activo = true
  AND rfc.alcance = 'ESPECIFICO_FUENTE'
LEFT JOIN documentos_cliente dc
  ON dc.fuente_pago_relacionada = fp.id
  AND dc.cliente_id = n.cliente_id
  AND dc.estado = 'activo'
WHERE fp.estado = 'Activa';
