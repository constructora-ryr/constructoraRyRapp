-- ============================================================================
-- Viviendas: valor por defecto del estado e índices sobrantes
-- ============================================================================
-- 1. El default era 'disponible' (minúscula) y el CHECK solo admite
--    'Disponible': una casa creada sin estado habría fallado.
-- 2. Índices sobrantes (uso en producción al 2026-10-27, entre paréntesis):
--    · idx_viviendas_cliente   = idx_viviendas_cliente_id  (0 vs 202)
--    · idx_viviendas_manzana   = idx_viviendas_manzana_id  (0 vs 25)
--    · idx_viviendas_inactivas: estado 'Inactiva', que el CHECK no permite (0)
--    Cada índice duplicado sigue cubierto por su gemelo. Menos índices =
--    escrituras más livianas.
-- Se puede ejecutar más de una vez.
-- ============================================================================

ALTER TABLE public.viviendas ALTER COLUMN estado SET DEFAULT 'Disponible';

DROP INDEX IF EXISTS public.idx_viviendas_cliente;
DROP INDEX IF EXISTS public.idx_viviendas_manzana;
DROP INDEX IF EXISTS public.idx_viviendas_inactivas;

-- Verificación
DO $$
BEGIN
  IF (SELECT column_default FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'viviendas'
         AND column_name = 'estado') NOT LIKE '''Disponible''%' THEN
    RAISE EXCEPTION 'El default de viviendas.estado no quedó en Disponible';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_viviendas_cliente_id')
     OR NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_viviendas_manzana_id') THEN
    RAISE EXCEPTION 'Falta un índice gemelo (cliente_id o manzana_id)';
  END IF;
  RAISE NOTICE 'OK: default Disponible e índices sobrantes eliminados';
END $$;
