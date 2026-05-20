-- ================================================================
-- MIGRACIÓN: numero_recibo de secuencia global a consecutivo anual
-- Formato: RYR-YYYY-NNN  (ej: RYR-2026-001)
-- Mismo patrón que generar_consecutivo_renuncia
-- ================================================================

-- 1. Eliminar vista dependiente, secuencia y trigger asociado
DROP TRIGGER IF EXISTS trigger_prevent_delete_fuente_con_dinero ON fuentes_pago;
DROP VIEW IF EXISTS vista_abonos_completos;
ALTER TABLE abonos_historial ALTER COLUMN numero_recibo TYPE TEXT USING numero_recibo::TEXT;
ALTER TABLE abonos_historial ALTER COLUMN numero_recibo DROP DEFAULT;
DROP SEQUENCE IF EXISTS seq_numero_recibo_global;

-- 2. Función generadora del consecutivo
CREATE OR REPLACE FUNCTION generar_numero_recibo_abono()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_year TEXT;
  v_seq  INT;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::TEXT;

  PERFORM pg_advisory_xact_lock(hashtext('abono_numero_recibo_' || v_year));

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(numero_recibo FROM 'RYR-\d{4}-(\d+)') AS INT)
  ), 0) + 1
  INTO v_seq
  FROM abonos_historial
  WHERE numero_recibo LIKE 'RYR-' || v_year || '-%';

  NEW.numero_recibo := 'RYR-' || v_year || '-' || LPAD(v_seq::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

-- 3. Trigger BEFORE INSERT
DROP TRIGGER IF EXISTS trg_generar_numero_recibo_abono ON abonos_historial;
CREATE TRIGGER trg_generar_numero_recibo_abono
  BEFORE INSERT ON abonos_historial
  FOR EACH ROW EXECUTE FUNCTION generar_numero_recibo_abono();

-- 4. Recrear trigger de protección de fuentes (que eliminamos arriba)
CREATE OR REPLACE FUNCTION prevent_delete_fuente_con_dinero()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.monto_recibido > 0 THEN
    RAISE EXCEPTION 'PROHIBIDO: No se puede eliminar una fuente de pago que ha recibido dinero. Marcarla como inactiva.'
      USING HINT = 'Debe marcar como inactiva en lugar de eliminar';
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_prevent_delete_fuente_con_dinero
  BEFORE DELETE ON fuentes_pago
  FOR EACH ROW EXECUTE FUNCTION prevent_delete_fuente_con_dinero();

-- 5. Recrear vista_abonos_completos (numero_recibo ahora es TEXT)
CREATE VIEW vista_abonos_completos AS
SELECT
  ah.id, ah.numero_recibo, ah.negociacion_id, ah.fuente_pago_id,
  ah.monto, ah.fecha_abono, ah.metodo_pago, ah.numero_referencia,
  ah.comprobante_url, ah.notas, ah.fecha_creacion, ah.fecha_actualizacion,
  ah.usuario_registro, ah.estado, ah.motivo_categoria, ah.motivo_detalle,
  ah.anulado_por_id, ah.anulado_por_nombre, ah.fecha_anulacion,
  CASE
    WHEN u.nombres IS NOT NULL
    THEN TRIM(u.nombres || ' ' || COALESCE(u.apellidos, ''))
    ELSE NULL
  END AS registrado_por_nombre,
  n.cliente_id,
  c.nombres  AS cliente_nombres,
  c.apellidos AS cliente_apellidos,
  c.numero_documento AS cliente_numero_documento,
  n.estado   AS negociacion_estado,
  COALESCE(n.valor_total_pagar, n.valor_total, 0) AS negociacion_valor_total,
  COALESCE(n.total_abonado,   0) AS negociacion_total_abonado,
  COALESCE(n.saldo_pendiente, 0) AS negociacion_saldo_pendiente,
  fp.tipo  AS fuente_pago_tipo,
  v.id     AS vivienda_id,
  v.numero AS vivienda_numero,
  m.id     AS manzana_id,
  m.nombre AS manzana_nombre,
  p.id     AS proyecto_id,
  p.nombre AS proyecto_nombre
FROM abonos_historial ah
JOIN  negociaciones n  ON ah.negociacion_id = n.id
JOIN  clientes c       ON n.cliente_id      = c.id
JOIN  fuentes_pago fp  ON ah.fuente_pago_id = fp.id
LEFT JOIN viviendas v  ON n.vivienda_id     = v.id
LEFT JOIN manzanas m   ON v.manzana_id      = m.id
LEFT JOIN proyectos p  ON m.proyecto_id     = p.id
LEFT JOIN usuarios u   ON ah.usuario_registro = u.id
ORDER BY ah.fecha_abono DESC;

GRANT SELECT ON vista_abonos_completos TO authenticated;
