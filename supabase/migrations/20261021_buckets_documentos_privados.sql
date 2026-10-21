-- =====================================================
-- MIGRACIÓN: buckets de documentos privados
-- Fecha: 2026-10-21
--
-- PROBLEMA: documentos-clientes (cédulas, escrituras, promesas…),
-- documentos-proyectos, documentos-viviendas y documentos-procesos están
-- marcados como PÚBLICOS: cualquiera con el enlace
-- /storage/v1/object/public/<bucket>/<ruta> descarga el archivo sin sesión.
--
-- POR QUÉ ES SEGURO HACERLOS PRIVADOS (verificado en prod el 2026-10-21):
--   - La app lee estos archivos solo con URLs firmadas (createSignedUrl /
--     download): visor, miniaturas, historial, comprobantes. El único uso de
--     getPublicUrl (certificado de vivienda) se corrigió en 0481f6c, ya
--     desplegado.
--   - Ninguna columna de ninguna tabla guarda URLs /object/public/.
--   - Cada bucket tiene política SELECT para usuarios autenticados, que es
--     lo que necesitan las URLs firmadas.
--
-- REVERSIBLE: UPDATE storage.buckets SET public = true WHERE id IN (...)
-- SEGURO: una transacción; si algo falla no queda nada aplicado.
-- =====================================================

BEGIN;

SET LOCAL lock_timeout = '5s';

-- ── Pre-chequeo: existen y cada uno tiene política de lectura ────────────────
DO $pre$
DECLARE
  b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['documentos-clientes','documentos-proyectos','documentos-viviendas','documentos-procesos'] LOOP
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = b) THEN
      RAISE EXCEPTION 'No existe el bucket %', b;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy
       WHERE polrelid = 'storage.objects'::regclass
         AND polcmd = 'r'
         AND pg_get_expr(polqual, polrelid) LIKE '%' || b || '%'
    ) THEN
      RAISE EXCEPTION 'El bucket % no tiene política SELECT: las URLs firmadas fallarían', b;
    END IF;
  END LOOP;
END
$pre$;

UPDATE storage.buckets
   SET public = false
 WHERE id IN (
   'documentos-clientes',
   'documentos-proyectos',
   'documentos-viviendas',
   'documentos-procesos'
 );

-- ── Verificación ─────────────────────────────────────────────────────────────
DO $verificar$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM storage.buckets
   WHERE id IN ('documentos-clientes','documentos-proyectos','documentos-viviendas','documentos-procesos')
     AND public = false;
  IF n <> 4 THEN
    RAISE EXCEPTION 'Verificación fallida: % de 4 buckets quedaron privados', n;
  END IF;
  RAISE NOTICE 'OK: los 4 buckets de documentos quedaron privados';
END
$verificar$;

COMMIT;
