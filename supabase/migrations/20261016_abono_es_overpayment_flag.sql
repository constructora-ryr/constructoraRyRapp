-- Agrega columna es_overpayment a abonos_historial para permitir que el trigger
-- de validación respete los pagos excedentes autorizados por un admin.
-- El trigger trigger_validar_abono_no_excede_saldo bloqueaba estos inserts.

ALTER TABLE public.abonos_historial
  ADD COLUMN IF NOT EXISTS es_overpayment BOOLEAN NOT NULL DEFAULT false;

-- Modifica el trigger para saltarse la validación cuando es un overpayment autorizado
CREATE OR REPLACE FUNCTION public.validar_abono_no_excede_saldo()
RETURNS TRIGGER AS $$
DECLARE
  monto_aprobado_fuente  DECIMAL(15,2);
  monto_recibido_actual  DECIMAL(15,2);
  monto_principal_nuevo  DECIMAL(15,2);
  monto_principal_antiguo DECIMAL(15,2);
  nuevo_total            DECIMAL(15,2);
BEGIN
  -- Si está marcado como overpayment autorizado por admin, se permite sin restricción
  IF COALESCE(NEW.es_overpayment, false) THEN
    RETURN NEW;
  END IF;

  SELECT monto_aprobado, monto_recibido
  INTO monto_aprobado_fuente, monto_recibido_actual
  FROM public.fuentes_pago
  WHERE id = NEW.fuente_pago_id;

  monto_principal_nuevo := NEW.monto - COALESCE(NEW.mora_incluida, 0);

  IF TG_OP = 'UPDATE' THEN
    monto_principal_antiguo := OLD.monto - COALESCE(OLD.mora_incluida, 0);
    monto_recibido_actual := monto_recibido_actual - monto_principal_antiguo;
  END IF;

  nuevo_total := monto_recibido_actual + monto_principal_nuevo;

  IF nuevo_total > monto_aprobado_fuente THEN
    RAISE EXCEPTION
      'El abono excede el saldo pendiente. '
      'Monto aprobado: $%, Ya cobrado: $%, '
      'Principal del abono: $%, Saldo disponible: $%',
      monto_aprobado_fuente,
      monto_recibido_actual,
      monto_principal_nuevo,
      (monto_aprobado_fuente - monto_recibido_actual);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
