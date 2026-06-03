-- Prepara prod para recibir dump exacto de config
-- ⚠️  NO usar CASCADE en requisitos_fuentes_pago_config — borra documentos_cliente
ALTER TABLE requisitos_fuentes_pago_config DISABLE TRIGGER trigger_validar_categoria_documento;
TRUNCATE TABLE fuentes_pago_requisitos_config;
DELETE FROM requisitos_fuentes_pago_config;
