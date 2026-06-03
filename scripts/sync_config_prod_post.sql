-- Re-habilita triggers después del dump
ALTER TABLE requisitos_fuentes_pago_config ENABLE TRIGGER ALL;

-- Verificación final
SELECT 'fuentes_pago_requisitos_config' AS tabla, count(*) AS filas FROM fuentes_pago_requisitos_config
UNION ALL
SELECT 'requisitos_fuentes_pago_config (activos)', count(*) FROM requisitos_fuentes_pago_config WHERE activo = true;
