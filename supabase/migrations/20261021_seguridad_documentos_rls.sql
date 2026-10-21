-- =====================================================
-- MIGRACIÓN: endurecer permisos (RLS) del sistema de documentos
-- Fecha: 2026-10-21
--
-- PROBLEMAS (auditoría en producción):
--   1. categorias_documento tiene 13 políticas duplicadas/contradictorias.
--      "Users can update categories" (rol public, USING es_global = true)
--      deja a CUALQUIERA —incluido el rol anónimo, que tiene GRANT UPDATE—
--      modificar categorías globales y del sistema, y anula la regla de
--      "solo admins".
--   2. carpetas_documentos: cualquier usuario autenticado puede editar o
--      borrar cualquier carpeta (USING true), sin mirar su rol.
--   3. documentos_vivienda: la política extra "Usuarios autenticados pueden
--      actualizar documentos de viviendas" deja editar sin el permiso
--      documentos.editar (las políticas permisivas se suman con OR).
--
-- SOLUCIÓN (mismo comportamiento para quien hoy usa la app legítimamente):
--   - Categorías: ver = sistema/globales/propias; crear/editar = dueño o
--     quien tenga documentos.subir|editar (la pantalla de categorías pide
--     "subir"); borrar de sistema = solo admin; borrar propias = dueño o
--     documentos.eliminar. Todo TO authenticated (anon queda fuera).
--   - Carpetas: crear/editar = documentos.subir (lo que pide la UI),
--     borrar = documentos.subir|eliminar.
--   - Viviendas: se elimina la política extra; quedan dv_* con tiene_permiso.
--
-- tiene_permiso() lee el rol del JWT y da todo a Administrador.
-- es_admin() verifica Administrador activo en usuarios.
--
-- SEGURO: una transacción; si algo falla no queda nada aplicado.
-- =====================================================

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- ── Pre-chequeo: funciones requeridas ────────────────────────────────────────
DO $pre$
BEGIN
  IF to_regprocedure('public.tiene_permiso(uuid,text,text)') IS NULL
     OR to_regprocedure('public.es_admin(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Faltan tiene_permiso(uuid,text,text) o es_admin(uuid)';
  END IF;
END
$pre$;

-- ── 1. categorias_documento ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can create categories" ON public.categorias_documento;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias categorías" ON public.categorias_documento;
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias categorías" ON public.categorias_documento;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias categorías" ON public.categorias_documento;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias categorías" ON public.categorias_documento;
DROP POLICY IF EXISTS "Solo admins pueden eliminar categorías del sistema" ON public.categorias_documento;
DROP POLICY IF EXISTS "Solo admins pueden modificar categorías del sistema" ON public.categorias_documento;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categorias_documento;
DROP POLICY IF EXISTS "Users can update categories" ON public.categorias_documento;
DROP POLICY IF EXISTS "Users can view all categories" ON public.categorias_documento;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus categorías" ON public.categorias_documento;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus categorías no-sistema" ON public.categorias_documento;
DROP POLICY IF EXISTS "Usuarios pueden ver categorías del sistema" ON public.categorias_documento;

CREATE POLICY cat_select ON public.categorias_documento
  FOR SELECT TO authenticated
  USING (es_sistema OR es_global OR user_id = auth.uid());

CREATE POLICY cat_insert ON public.categorias_documento
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      es_sistema = false
      OR public.tiene_permiso(auth.uid(), 'documentos', 'subir')
      OR public.tiene_permiso(auth.uid(), 'documentos', 'editar')
    )
  );

CREATE POLICY cat_update ON public.categorias_documento
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.tiene_permiso(auth.uid(), 'documentos', 'subir')
    OR public.tiene_permiso(auth.uid(), 'documentos', 'editar')
  )
  WITH CHECK (
    (user_id = auth.uid() AND es_sistema = false)
    OR public.tiene_permiso(auth.uid(), 'documentos', 'subir')
    OR public.tiene_permiso(auth.uid(), 'documentos', 'editar')
  );

CREATE POLICY cat_delete ON public.categorias_documento
  FOR DELETE TO authenticated
  USING (
    CASE
      WHEN es_sistema THEN public.es_admin(auth.uid())
      ELSE user_id = auth.uid()
        OR public.tiene_permiso(auth.uid(), 'documentos', 'eliminar')
    END
  );

-- ── 2. carpetas_documentos ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear carpetas" ON public.carpetas_documentos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar carpetas" ON public.carpetas_documentos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar carpetas" ON public.carpetas_documentos;
-- "Usuarios autenticados pueden ver carpetas" (SELECT, authenticated) se conserva

CREATE POLICY car_insert ON public.carpetas_documentos
  FOR INSERT TO authenticated
  WITH CHECK (public.tiene_permiso(auth.uid(), 'documentos', 'subir'));

CREATE POLICY car_update ON public.carpetas_documentos
  FOR UPDATE TO authenticated
  USING (public.tiene_permiso(auth.uid(), 'documentos', 'subir'))
  WITH CHECK (public.tiene_permiso(auth.uid(), 'documentos', 'subir'));

CREATE POLICY car_delete ON public.carpetas_documentos
  FOR DELETE TO authenticated
  USING (
    public.tiene_permiso(auth.uid(), 'documentos', 'subir')
    OR public.tiene_permiso(auth.uid(), 'documentos', 'eliminar')
  );

-- ── 3. documentos_vivienda ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar documentos de viviendas" ON public.documentos_vivienda;

-- ── Verificación ─────────────────────────────────────────────────────────────
DO $verificar$
DECLARE
  n_cat int;
  n_car int;
  n_extra int;
BEGIN
  SELECT count(*) INTO n_cat FROM pg_policy
   WHERE polrelid = 'public.categorias_documento'::regclass;
  SELECT count(*) INTO n_car FROM pg_policy
   WHERE polrelid = 'public.carpetas_documentos'::regclass;
  SELECT count(*) INTO n_extra FROM pg_policy
   WHERE polrelid = 'public.documentos_vivienda'::regclass
     AND polname = 'Usuarios autenticados pueden actualizar documentos de viviendas';

  IF n_cat <> 4 OR n_car <> 4 OR n_extra <> 0 THEN
    RAISE EXCEPTION 'Verificación fallida: categorias=% (esperado 4), carpetas=% (esperado 4), extra vivienda=% (esperado 0)',
      n_cat, n_car, n_extra;
  END IF;
  RAISE NOTICE 'OK: categorias 4 políticas, carpetas 4 políticas, vivienda sin política extra';
END
$verificar$;

COMMIT;
