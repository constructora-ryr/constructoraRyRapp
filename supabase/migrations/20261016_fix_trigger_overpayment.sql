-- Ajusta el trigger actualizar_monto_recibido_fuente para soportar overpayments.
-- Cuando un admin registra un abono que excede el saldo (es_overpayment = true),
-- el monto_recibido en fuentes_pago se capa en monto_aprobado para no violar el
-- CHECK constraint fuentes_pago_recibido_valido.
-- El excedente real queda registrado en la tabla pagos_excedentes.

CREATE OR REPLACE FUNCTION public.actualizar_monto_recibido_fuente()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  fuente_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    fuente_id := OLD.fuente_pago_id;
  ELSE
    fuente_id := NEW.fuente_pago_id;
  END IF;

  UPDATE public.fuentes_pago fp
  SET
    -- Capear en monto_aprobado para soportar overpayments: la fuente queda al 100%
    -- y el excedente se registra en pagos_excedentes
    monto_recibido = LEAST(
      (
        SELECT COALESCE(SUM(ah.monto - COALESCE(ah.mora_incluida, 0)), 0)
        FROM public.abonos_historial ah
        WHERE ah.fuente_pago_id = fuente_id
          AND ah.estado = 'Activo'
      ),
      fp.monto_aprobado
    ),
    mora_total_recibida = (
      SELECT COALESCE(SUM(COALESCE(ah.mora_incluida, 0)), 0)
      FROM public.abonos_historial ah
      WHERE ah.fuente_pago_id = fuente_id
        AND ah.estado = 'Activo'
    )
  WHERE fp.id = fuente_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;
