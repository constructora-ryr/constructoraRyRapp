-- =====================================================
-- MIGRACIÓN: Sincronizar viviendas.estado con el estado real de negociaciones
-- Fecha: 2026-10-20
--
-- PROBLEMA 1: viviendas_estado_check no incluye 'Propietario' — constraint
--   definida en 002_actualizar_estados_viviendas.sql solo con 3 estados.
--   El código lo usa pero la DB lo rechazaba silenciosamente.
-- PROBLEMA 2: viviendas.estado muestra 'Disponible' y negociacion_id/cliente_id
--   son NULL para casas con negociaciones Completadas, porque el dato nunca
--   se sincronizó inversamente al cargar producción.
--
-- SOLUCIÓN:
--   1. Ampliar la constraint para incluir 'Propietario'
--   2. Backfill desde negociaciones (fuente de verdad) → viviendas
-- =====================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- Paso 0: Ampliar la constraint para incluir 'Propietario'
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.viviendas DROP CONSTRAINT IF EXISTS viviendas_estado_check;

ALTER TABLE public.viviendas
ADD CONSTRAINT viviendas_estado_check CHECK (
  estado IN ('Disponible', 'Asignada', 'Entregada', 'Propietario')
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Paso 1: Viviendas con negociación Completada → estado = 'Propietario'
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE public.viviendas v
SET
  estado         = 'Propietario',
  negociacion_id = n.id,
  cliente_id     = n.cliente_id
FROM (
  -- Si hay varias negociaciones por vivienda, tomar la más reciente Completada
  SELECT DISTINCT ON (vivienda_id)
    id, vivienda_id, cliente_id
  FROM public.negociaciones
  WHERE estado = 'Completada'
    AND vivienda_id IS NOT NULL
  ORDER BY vivienda_id, fecha_completada DESC NULLS LAST, fecha_creacion DESC
) n
WHERE v.id = n.vivienda_id
  AND v.estado != 'Propietario';

-- ─────────────────────────────────────────────────────────────────────────────
-- Paso 2: Viviendas con negociación Activa → estado = 'Asignada'
-- (Solo si no quedaron marcadas como Propietario en el paso anterior)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE public.viviendas v
SET
  estado         = 'Asignada',
  negociacion_id = n.id,
  cliente_id     = n.cliente_id
FROM (
  SELECT DISTINCT ON (vivienda_id)
    id, vivienda_id, cliente_id
  FROM public.negociaciones
  WHERE estado = 'Activa'
    AND vivienda_id IS NOT NULL
  ORDER BY vivienda_id, fecha_creacion DESC
) n
WHERE v.id = n.vivienda_id
  AND v.estado = 'Disponible';

COMMIT;


-- ─────────────────────────────────────────────────────────────────────────────
-- Verificación (ejecutar por separado para ver resultados)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  v.estado,
  COUNT(*) AS total,
  COUNT(v.negociacion_id) AS con_negociacion
FROM public.viviendas v
GROUP BY v.estado
ORDER BY v.estado;
