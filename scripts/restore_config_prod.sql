-- ============================================================
-- Restaurar tablas de configuración truncadas por cleanup_prod.sql
-- ============================================================

-- 1. fuentes_pago_requisitos_config
INSERT INTO fuentes_pago_requisitos_config
  (tipo_fuente, tipo_documento, es_obligatorio, orden, se_valida_en, descripcion, icono)
VALUES
  ('Crédito con la Constructora', 'Carta de Aprobación',  true,  1, 'creacion',   'Carta de aprobación emitida por la entidad financiera o institución',   'FileCheck'),
  ('Crédito con la Constructora', 'Boleta de Registro',   true,  2, 'desembolso', 'Boleta de registro de escritura pública ante notaría',                  'FileSignature'),
  ('Crédito con la Constructora', 'Solicitud Desembolso', false, 3, 'desembolso', 'Formato de solicitud de desembolso (opcional según entidad)',            'Send'),
  ('Crédito Hipotecario',         'Carta de Aprobación',  true,  1, 'creacion',   'Carta de aprobación emitida por la entidad bancaria',                   'FileCheck'),
  ('Crédito Hipotecario',         'Boleta de Registro',   true,  2, 'desembolso', 'Boleta de registro de escritura pública ante notaría',                  'FileSignature'),
  ('Crédito Hipotecario',         'Solicitud Desembolso', false, 3, 'desembolso', 'Formato de solicitud de desembolso del banco (opcional según entidad)', 'Send'),
  ('Subsidio Caja Compensación',  'Carta de Aprobación',  true,  1, 'creacion',   'Carta de aprobación emitida por la entidad financiera o institución',   'FileCheck'),
  ('Subsidio Caja Compensación',  'Boleta de Registro',   true,  2, 'desembolso', 'Boleta de registro de escritura pública ante notaría',                  'FileSignature'),
  ('Subsidio Caja Compensación',  'Solicitud Desembolso', false, 3, 'desembolso', 'Formato de solicitud de desembolso (opcional según entidad)',            'Send'),
  ('Subsidio Mi Casa Ya',         'Carta de Aprobación',  true,  1, 'creacion',   'Carta de aprobación del Ministerio de Vivienda',                        'FileCheck'),
  ('Subsidio Mi Casa Ya',         'Boleta de Registro',   true,  2, 'desembolso', 'Boleta de registro de escritura pública',                               'FileSignature'),
  ('Subsidio Mi Casa Ya',         'Solicitud Desembolso', false, 3, 'desembolso', 'Formato de solicitud de desembolso (opcional)',                         'Send')
ON CONFLICT (tipo_fuente, tipo_documento) DO NOTHING;

-- 2. requisitos_fuentes_pago_config (solo los activos relevantes)
INSERT INTO requisitos_fuentes_pago_config
  (tipo_fuente, paso_identificador, titulo, descripcion, instrucciones, nivel_validacion, tipo_documento_sugerido, categoria_documento, orden, activo, version)
VALUES
  (
    'Crédito Hipotecario', 'carta_aprobacion_credito',
    'Carta de Aprobación de Crédito',
    'Carta emitida por el banco aprobando el crédito hipotecario del cliente',
    'Solicita al cliente la carta de aprobación del banco. Debe incluir monto aprobado y condiciones del crédito.',
    'DOCUMENTO_OBLIGATORIO', 'carta_aprobacion_credito', 'Carta de Aprobación', 1, true, 1
  ),
  (
    'COMPARTIDO', 'boleta_registro',
    'Boleta de Registro',
    'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente',
    '',
    'DOCUMENTO_OBLIGATORIO', NULL, NULL, 2, true, 1
  ),
  (
    'Subsidio Mi Casa Ya', 'carta_aprobacion_subsidio',
    'Carta de Aprobación del Subsidio',
    'Carta emitida por el Ministerio de Vivienda aprobando el subsidio Mi Casa Ya del cliente',
    'Solicita al cliente la carta de aprobación del subsidio emitida por el Ministerio de Vivienda. Debe incluir monto aprobado y condiciones del subsidio.',
    'DOCUMENTO_OBLIGATORIO', 'Carta Aprobación', 'Carta de Aprobación', 1, true, 1
  ),
  (
    'Subsidio Caja Compensación', 'carta_asignacion_subsidiocaja',
    'Carta de Asignación Subsidio Caja de Compensación',
    'Carta de Asignación de Subsidio de Caja de compensación',
    '',
    'DOCUMENTO_OBLIGATORIO', 'Carta de Asignación Subsidio Caja de Compensación', 'Carta de Aprobación', 1, true, 1
  ),
  (
    'Subsidio Caja Compensación', 'carta_aprobacion_subsidio',
    'Carta de Aprobación Subsidio Caja de Compensación',
    'Carta emitida por la Caja de Compensación aprobando el subsidio de vivienda del cliente',
    'Solicita al cliente la carta de aprobación del subsidio emitida por la Caja de Compensación. Debe incluir monto aprobado y condiciones del subsidio.',
    'DOCUMENTO_OBLIGATORIO', 'Carta Aprobación', 'Carta de Aprobación', 3, true, 1
  )
ON CONFLICT (tipo_fuente, paso_identificador, version) DO NOTHING;

-- Verificación
SELECT 'fuentes_pago_requisitos_config' as tabla, count(*) as filas FROM fuentes_pago_requisitos_config
UNION ALL
SELECT 'requisitos_fuentes_pago_config (activos)', count(*) FROM requisitos_fuentes_pago_config WHERE activo = true;
