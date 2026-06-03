-- Inserta los 5 requisitos activos exactos de dev (IDs originales, usuario nullado)
INSERT INTO public.requisitos_fuentes_pago_config
  (id, tipo_fuente, paso_identificador, titulo, descripcion, instrucciones,
   nivel_validacion, tipo_documento_sugerido, categoria_documento, orden,
   activo, version, fecha_creacion, fecha_actualizacion,
   usuario_creacion, usuario_actualizacion, alcance, fuentes_aplicables)
VALUES
  (
    '343298ab-74ad-4dfa-ae51-74f8624d0491',
    'Crédito Hipotecario', 'carta_aprobacion_credito',
    'Carta de Aprobación de Crédito',
    'Carta emitida por el banco aprobando el crédito hipotecario del cliente',
    'Solicita al cliente la carta de aprobación del banco. Debe incluir monto aprobado y condiciones del crédito.',
    'DOCUMENTO_OBLIGATORIO', 'carta_aprobacion_credito', 'Cartas de aprobación',
    1, true, 1, NOW(), NOW(), NULL, NULL, 'ESPECIFICO_FUENTE', '{}'
  ),
  (
    '1f351679-f0b9-4c6e-b818-db20cc869f83',
    'COMPARTIDO', 'boleta_registro',
    'Boleta de Registro',
    'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente',
    NULL,
    'DOCUMENTO_OBLIGATORIO', NULL, NULL,
    2, true, 1, NOW(), NOW(), NULL, NULL,
    'COMPARTIDO_CLIENTE',
    '{"Crédito Hipotecario","Subsidio Mi Casa Ya","Subsidio Caja Compensación"}'
  ),
  (
    'ae933870-2916-4fb2-ab1c-ca07ed5caa82',
    'Subsidio Mi Casa Ya', 'carta_aprobacion_subsidio',
    'Carta de Aprobación del Subsidio',
    'Carta emitida por el Ministerio de Vivienda aprobando el subsidio Mi Casa Ya del cliente',
    'Solicita al cliente la carta de aprobación del subsidio emitida por el Ministerio de Vivienda.',
    'DOCUMENTO_OBLIGATORIO', 'Carta Aprobación', 'Subsidios',
    1, true, 1, NOW(), NOW(), NULL, NULL, 'ESPECIFICO_FUENTE', '{}'
  ),
  (
    '562535ce-43ec-461c-a08a-4cd8348bb4ba',
    'Subsidio Caja Compensación', 'carta_asignacion_subsidiocaja',
    'Carta de Asignación Subsidio Caja de Compensación',
    'Carta de Asignación de Subsidio de Caja de compensación',
    '',
    'DOCUMENTO_OBLIGATORIO', 'Carta de Asignación Subsidio Caja de Compensación', 'subsidios',
    1, true, 1, NOW(), NOW(), NULL, NULL, 'ESPECIFICO_FUENTE', '{}'
  ),
  (
    'd88bd609-1006-487d-b40e-849fb0c516a0',
    '["Subsidio Caja Compensación"]', 'carta_aprobacion_subsidio',
    'Carta de Aprobación Subsidio Caja de Compensación',
    'Carta emitida por la Caja de Compensación aprobando el subsidio de vivienda del cliente',
    'Solicita al cliente la carta de aprobación del subsidio emitida por la Caja de Compensación.',
    'DOCUMENTO_OBLIGATORIO', 'Carta Aprobación', 'Subsidios',
    3, true, 1, NOW(), NOW(), NULL, NULL, 'ESPECIFICO_FUENTE', '{}'
  )
ON CONFLICT (id) DO NOTHING;

SELECT tipo_fuente, paso_identificador, alcance, fuentes_aplicables
FROM requisitos_fuentes_pago_config
WHERE activo = true
ORDER BY tipo_fuente;
