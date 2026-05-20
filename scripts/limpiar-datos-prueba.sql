-- ================================================================
-- LIMPIEZA COMPLETA DE DATOS DE PRUEBA — RyR Constructora
-- Incluye reset de secuencias para que los consecutivos empiecen en 1
-- ================================================================

-- 1. Trigger de proteccion de fuentes (se recrea al final)
DROP TRIGGER IF EXISTS trigger_prevent_delete_fuente_con_dinero ON fuentes_pago;

-- 2. Dependientes
DELETE FROM abonos_historial;
DELETE FROM cuotas_credito;
DELETE FROM creditos_constructora;
DELETE FROM fuentes_pago;
DELETE FROM negociaciones_versiones;
DELETE FROM negociaciones_historial;
DELETE FROM descuentos_negociacion;
DELETE FROM cliente_intereses;
DELETE FROM notas_historial_cliente;
DELETE FROM documentos_cliente;
DELETE FROM documentos_vivienda;
DELETE FROM carpetas_documentos;
DELETE FROM audit_log;
DELETE FROM audit_log_seguridad;
DELETE FROM renuncias;

-- 3. Core (romper FK circular viviendas <-> negociaciones primero)
UPDATE viviendas SET estado = 'Disponible', negociacion_id = NULL, cliente_id = NULL;
DELETE FROM negociaciones;
DELETE FROM viviendas;
DELETE FROM clientes;
DELETE FROM manzanas;
DELETE FROM proyectos;

-- 4. Resetear secuencias para que los consecutivos empiecen en 1
ALTER SEQUENCE seq_numero_recibo_global RESTART WITH 1;

-- 5. Recrear trigger de proteccion de fuentes
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
