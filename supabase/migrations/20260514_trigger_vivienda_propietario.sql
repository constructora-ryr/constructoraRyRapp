-- =====================================================
-- TRIGGER: Sincronizar viviendas.estado y clientes.estado
--          con negociaciones.estado
-- Fecha: 2026-05-14
-- Lógica:
--   • negociación → 'Completada'
--       vivienda  → 'Propietario'
--       cliente   → 'Propietario'
--   • negociación → 'Activa'  (reversión por abono anulado)
--       vivienda  → 'Asignada'
--       cliente   → 'Activo'
-- =====================================================

CREATE OR REPLACE FUNCTION sync_estados_on_negociacion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Salir si no cambió el estado o no hay vivienda vinculada
  IF NEW.estado = OLD.estado THEN
    RETURN NEW;
  END IF;

  -- ── Negociación completada ──────────────────────────────────────
  IF NEW.estado = 'Completada' AND OLD.estado != 'Completada' THEN

    IF NEW.vivienda_id IS NOT NULL THEN
      UPDATE viviendas
      SET estado = 'Propietario'
      WHERE id = NEW.vivienda_id
        AND estado = 'Asignada';
    END IF;

    IF NEW.cliente_id IS NOT NULL THEN
      UPDATE clientes
      SET estado = 'Propietario'
      WHERE id = NEW.cliente_id
        AND estado != 'Propietario';
    END IF;

  -- ── Reversión: negociación vuelve a Activa ──────────────────────
  ELSIF NEW.estado = 'Activa' AND OLD.estado = 'Completada' THEN

    IF NEW.vivienda_id IS NOT NULL THEN
      UPDATE viviendas
      SET estado = 'Asignada'
      WHERE id = NEW.vivienda_id
        AND estado = 'Propietario';
    END IF;

    IF NEW.cliente_id IS NOT NULL THEN
      UPDATE clientes
      SET estado = 'Activo'
      WHERE id = NEW.cliente_id
        AND estado = 'Propietario';
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_estados_negociacion ON negociaciones;

CREATE TRIGGER trigger_sync_estados_negociacion
  AFTER UPDATE OF estado ON negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION sync_estados_on_negociacion();
