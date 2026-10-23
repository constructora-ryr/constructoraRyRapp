-- ============================================================================
-- Estado civil: agregar Divorciado(a) y Separado(a)
-- ============================================================================
-- Solo agrega valores al enum; no cambia ni borra los existentes.
-- IF NOT EXISTS: se puede ejecutar más de una vez sin error.
-- ============================================================================

ALTER TYPE public.estado_civil_enum ADD VALUE IF NOT EXISTS 'Divorciado(a)';
ALTER TYPE public.estado_civil_enum ADD VALUE IF NOT EXISTS 'Separado(a)';

-- Verificación
DO $$
BEGIN
  IF (SELECT count(*) FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
       WHERE t.typname = 'estado_civil_enum'
         AND e.enumlabel IN ('Divorciado(a)', 'Separado(a)')) <> 2 THEN
    RAISE EXCEPTION 'Faltan valores en estado_civil_enum';
  END IF;
END $$;
