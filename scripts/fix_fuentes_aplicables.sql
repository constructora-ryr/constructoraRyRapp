UPDATE requisitos_fuentes_pago_config
SET fuentes_aplicables = ARRAY['Crédito Hipotecario','Subsidio Mi Casa Ya','Subsidio Caja Compensación']
WHERE tipo_fuente = 'COMPARTIDO' AND paso_identificador = 'boleta_registro';

SELECT tipo_fuente, paso_identificador, fuentes_aplicables
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente = 'COMPARTIDO';
