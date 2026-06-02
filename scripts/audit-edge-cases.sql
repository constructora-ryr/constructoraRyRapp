-- Caso 6: Negociaciones cerradas cuya vivienda NO tiene negociacion activa posterior
-- (si tiene otra activa, el estado Asignada es correcto)
SELECT 'Neg cerrada sin reemplazo y vivienda no Disponible' AS caso, neg.id, v.numero, v.estado, neg.estado AS neg_estado
FROM negociaciones neg
JOIN viviendas v ON v.id = neg.vivienda_id
WHERE neg.estado IN ('Cerrada por Renuncia', 'Cerrada por Traslado')
  AND v.estado != 'Disponible'
  AND NOT EXISTS (
    SELECT 1 FROM negociaciones n2
    WHERE n2.vivienda_id = v.id AND n2.estado IN ('Activa', 'Completada')
  );

-- Caso 7: Traslados donde el origen no quedo cerrado
SELECT 'Traslado sin origen cerrado' AS caso, neg.id, neg.estado, neg.negociacion_origen_id
FROM negociaciones neg
JOIN negociaciones origen ON origen.id = neg.negociacion_origen_id
WHERE origen.estado != 'Cerrada por Traslado';

-- Caso 8: Fuentes de pago sin negociacion
SELECT 'Fuente sin negociacion' AS caso, fp.id, fp.tipo, fp.monto_aprobado
FROM fuentes_pago fp
LEFT JOIN negociaciones neg ON neg.id = fp.negociacion_id
WHERE neg.id IS NULL;

-- Caso 9: Total abonado supera valor negociado
SELECT 'Abonado supera valor total' AS caso, neg.id, neg.valor_total_pagar, neg.total_abonado
FROM negociaciones neg
WHERE neg.total_abonado > neg.valor_total_pagar + 1000;

-- Caso 10: Fuentes con monto_recibido mayor que monto_aprobado
SELECT 'Fuente sobrepagada' AS caso, fp.id, fp.tipo, fp.monto_aprobado, fp.monto_recibido
FROM fuentes_pago fp
WHERE fp.monto_recibido > fp.monto_aprobado + 1000;
