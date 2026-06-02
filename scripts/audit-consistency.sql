-- =====================================================
-- AUDITORIA DE CONSISTENCIA DE DATOS
-- =====================================================

-- 1. Negociaciones saldo=0 pero no Completadas
SELECT '1. NEG saldo=0 pero Activa' AS problema, id, estado, saldo_pendiente
FROM negociaciones
WHERE saldo_pendiente <= 0 AND estado = 'Activa';

-- 2. Viviendas Propietario sin negociacion Completada
SELECT '2. VIVIENDA Propietario sin neg Completada' AS problema, v.id, v.numero, v.estado, neg.estado AS neg_estado
FROM viviendas v
LEFT JOIN negociaciones neg ON v.negociacion_id = neg.id
WHERE v.estado = 'Propietario' AND (neg.estado IS NULL OR neg.estado != 'Completada');

-- 3. Clientes Propietario sin negociacion Completada
SELECT '3. CLIENTE Propietario sin neg Completada' AS problema, c.id, c.nombres, c.apellidos, c.estado, neg.estado AS neg_estado
FROM clientes c
LEFT JOIN negociaciones neg ON neg.cliente_id = c.id AND neg.estado = 'Completada'
WHERE c.estado = 'Propietario' AND neg.id IS NULL;

-- 4. Viviendas Asignada sin negociacion vinculada
SELECT '4. VIVIENDA Asignada sin negociacion' AS problema, v.id, v.numero, v.estado
FROM viviendas v
WHERE v.estado = 'Asignada' AND v.negociacion_id IS NULL;

-- 5. Negociaciones donde total_abonado no cuadra con suma real de abonos activos
SELECT '5. total_abonado desincronizado' AS problema,
  neg.id, neg.total_abonado AS total_en_neg,
  COALESCE(SUM(ah.monto), 0) AS suma_real,
  neg.total_abonado - COALESCE(SUM(ah.monto), 0) AS diferencia
FROM negociaciones neg
LEFT JOIN abonos_historial ah ON ah.negociacion_id = neg.id AND ah.estado = 'Activo'
GROUP BY neg.id, neg.total_abonado
HAVING ABS(neg.total_abonado - COALESCE(SUM(ah.monto), 0)) > 1;

-- 6. Viviendas con mas de una negociacion activa
SELECT '6. VIVIENDA con multiples neg Activas' AS problema, v.id, v.numero, COUNT(*) AS total_neg
FROM viviendas v
JOIN negociaciones neg ON neg.vivienda_id = v.id AND neg.estado = 'Activa'
GROUP BY v.id, v.numero
HAVING COUNT(*) > 1;

-- 7. Clientes con mas de una negociacion activa
SELECT '7. CLIENTE con multiples neg Activas' AS problema, c.id, c.nombres, c.apellidos, COUNT(*) AS total_neg
FROM clientes c
JOIN negociaciones neg ON neg.cliente_id = c.id AND neg.estado = 'Activa'
GROUP BY c.id, c.nombres, c.apellidos
HAVING COUNT(*) > 1;

-- 8. Negociaciones Activas cuyo cliente no existe
SELECT '8. NEG con cliente inexistente' AS problema, neg.id, neg.cliente_id, neg.estado
FROM negociaciones neg
LEFT JOIN clientes c ON c.id = neg.cliente_id
WHERE neg.estado = 'Activa' AND c.id IS NULL;

-- 9. Negociaciones Activas cuya vivienda no existe
SELECT '9. NEG con vivienda inexistente' AS problema, neg.id, neg.vivienda_id, neg.estado
FROM negociaciones neg
LEFT JOIN viviendas v ON v.id = neg.vivienda_id
WHERE neg.estado = 'Activa' AND v.id IS NULL;

-- 10. Viviendas Disponible con cliente o negociacion asignada (inconsistente)
SELECT '10. VIVIENDA Disponible con cliente asignado' AS problema, v.id, v.numero, v.estado, v.cliente_id, v.negociacion_id
FROM viviendas v
WHERE v.estado = 'Disponible' AND (v.cliente_id IS NOT NULL OR v.negociacion_id IS NOT NULL);
