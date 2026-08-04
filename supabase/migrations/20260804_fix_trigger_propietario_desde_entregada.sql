-- =====================================================
-- FIX: sync_estados_on_negociacion no actualizaba vivienda
--      cuando su estado era 'Entregada' (Escriturada).
-- Problema: la condición AND estado = 'Asignada' excluía
--           viviendas Escrituradas, dejándolas atascadas.
-- Solución: aceptar 'Asignada' O 'Entregada' como estado
--           de origen para la transición a 'Propietario'.
-- =====================================================

CREATE OR REPLACE FUNCTION sync_estados_on_negociacion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.estado = OLD.estado THEN
    RETURN NEW;
  END IF;

  -- ── Negociación completada ──────────────────────────────────────
  IF NEW.estado = 'Completada' AND OLD.estado != 'Completada' THEN

    IF NEW.vivienda_id IS NOT NULL THEN
      UPDATE viviendas
      SET estado = 'Propietario'
      WHERE id = NEW.vivienda_id
        AND estado IN ('Asignada', 'Entregada');
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
