-- Debug: verificar parte ESPECIFICO_FUENTE de la vista
SELECT
  fp.tipo AS fp_tipo,
  rfc.tipo_fuente AS rfc_tipo_fuente,
  rfc.titulo,
  rfc.alcance,
  rfc.activo,
  rfc.nivel_validacion,
  (fp.tipo::text = rfc.tipo_fuente) AS tipos_coinciden
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
LEFT JOIN requisitos_fuentes_pago_config rfc
  ON rfc.activo = true
  AND rfc.alcance = 'ESPECIFICO_FUENTE'
WHERE fp.estado = 'Activa';
