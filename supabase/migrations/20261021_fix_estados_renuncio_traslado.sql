-- =====================================================
-- MIGRACIÓN: permitir 'Renunció' (clientes) y 'Cerrada por Traslado'
-- (negociaciones) en producción
-- Fecha: 2026-10-21
--
-- PROBLEMA (detectado comparando el esquema de prod con dev):
--   - registrar_renuncia_completa() hace UPDATE clientes SET estado = 'Renunció',
--     pero clientes_estado_check de prod no incluye 'Renunció'
--     → la primera renuncia que se registre en prod falla.
--   - El traslado de vivienda (020_traslado_vivienda.sql y
--     traslado-vivienda.service.ts) cierra la negociación origen con
--     'Cerrada por Traslado', que negociaciones_estado_check de prod no incluye
--     → el primer traslado en prod falla.
--   Dev ya tiene ambos valores; prod nunca recibió esa parte.
--
-- SOLUCIÓN: recrear los dos CHECK con la misma lista que dev. Solo AMPLÍA los
-- valores permitidos: ningún registro existente puede quedar inválido.
--
-- SEGURO EN PRODUCCIÓN: una transacción; si algo falla no queda nada aplicado.
-- Rollback: volver a crear los CHECK sin esos valores (no recomendado: rompe
-- renuncias y traslados).
-- =====================================================

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- ── clientes: + 'Renunció' ───────────────────────────────────────────────────
ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS clientes_estado_check;
ALTER TABLE public.clientes
  ADD CONSTRAINT clientes_estado_check CHECK (((estado)::text = ANY (ARRAY[
    ('Interesado'::character varying)::text,
    ('Activo'::character varying)::text,
    ('En Proceso de Renuncia'::character varying)::text,
    ('Renunció'::character varying)::text,
    ('Inactivo'::character varying)::text,
    ('Propietario'::character varying)::text])));

-- ── negociaciones: + 'Cerrada por Traslado' ──────────────────────────────────
ALTER TABLE public.negociaciones DROP CONSTRAINT IF EXISTS negociaciones_estado_check;
ALTER TABLE public.negociaciones
  ADD CONSTRAINT negociaciones_estado_check CHECK (((estado)::text = ANY (ARRAY[
    ('Activa'::character varying)::text,
    ('Suspendida'::character varying)::text,
    ('Cerrada por Renuncia'::character varying)::text,
    ('Cerrada por Traslado'::character varying)::text,
    ('Completada'::character varying)::text])));

-- Verificación: ambos valores quedan permitidos
DO $verificar$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.clientes'::regclass
      AND conname = 'clientes_estado_check'
      AND pg_get_constraintdef(oid) LIKE '%Renunció%'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.negociaciones'::regclass
      AND conname = 'negociaciones_estado_check'
      AND pg_get_constraintdef(oid) LIKE '%Cerrada por Traslado%'
  ) THEN
    RAISE EXCEPTION 'Verificación fallida: los CHECK no incluyen los nuevos estados';
  END IF;
  RAISE NOTICE 'OK: clientes admite Renunció y negociaciones admite Cerrada por Traslado';
END
$verificar$;

COMMIT;
