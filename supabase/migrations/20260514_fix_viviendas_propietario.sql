-- =====================================================
-- FIX: Sincronizar estado de viviendas con negociaciones completadas
-- Fecha: 2026-05-14
-- Problema: Al completar el pago de una negociación, el API Route
--   actualizaba clientes.estado → 'Propietario' pero NO viviendas.estado.
--   Las viviendas quedaban en 'Asignada' aunque la negociación fuera 'Completada'.
-- Solución: One-shot UPDATE para todas las viviendas afectadas.
-- =====================================================

UPDATE viviendas v
SET estado = 'Propietario'
FROM negociaciones neg
WHERE neg.vivienda_id = v.id
  AND neg.estado      = 'Completada'
  AND v.estado        = 'Asignada';

-- Verificar resultado
SELECT v.id, v.numero, m.nombre AS manzana, v.estado AS estado_nuevo
FROM viviendas v
JOIN manzanas m ON v.manzana_id = m.id
JOIN negociaciones neg ON neg.vivienda_id = v.id
WHERE neg.estado = 'Completada'
ORDER BY m.nombre, v.numero;
