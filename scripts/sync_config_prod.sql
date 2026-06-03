-- Prepara prod para recibir dump exacto de config
ALTER TABLE requisitos_fuentes_pago_config DISABLE TRIGGER ALL;
TRUNCATE TABLE fuentes_pago_requisitos_config CASCADE;
TRUNCATE TABLE requisitos_fuentes_pago_config CASCADE;
