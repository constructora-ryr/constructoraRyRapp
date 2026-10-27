-- ============================================================================
-- Fechas de documentos siempre al mediodía (UTC)
-- ============================================================================
-- fecha_documento y fecha_vencimiento son fechas de calendario guardadas en
-- timestamptz. Al subir se guardaban a la medianoche UTC; en Colombia
-- (UTC-5) eso es el día ANTERIOR a las 7 p. m., y donde se convertía a hora
-- local se mostraba un día menos (p. ej. el Historial). El mediodía UTC cae
-- el mismo día en cualquier zona de América, como ya hace el resto de la app.
--
--   1. Trigger en las 3 tablas de documentos: normaliza al guardar, venga de
--      donde venga (subir, editar, nueva versión, restaurar).
--   2. Corrige los documentos existentes. La fecha (día) no cambia, solo la
--      hora. Se hace con los triggers apagados para no generar ediciones
--      falsas en la auditoría ni cambiar su fecha de actualización.
-- Se puede ejecutar más de una vez.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fecha_calendario_mediodia(p timestamptz)
RETURNS timestamptz LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN p IS NULL THEN NULL
              ELSE ((p AT TIME ZONE 'UTC')::date + time '12:00') AT TIME ZONE 'UTC' END
$$;

CREATE OR REPLACE FUNCTION public.normalizar_fechas_documento()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.fecha_documento := public.fecha_calendario_mediodia(NEW.fecha_documento);
  NEW.fecha_vencimiento := public.fecha_calendario_mediodia(NEW.fecha_vencimiento);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fechas_documento_mediodia ON public.documentos_cliente;
CREATE TRIGGER trg_fechas_documento_mediodia
  BEFORE INSERT OR UPDATE OF fecha_documento, fecha_vencimiento ON public.documentos_cliente
  FOR EACH ROW EXECUTE FUNCTION public.normalizar_fechas_documento();

DROP TRIGGER IF EXISTS trg_fechas_documento_mediodia ON public.documentos_proyecto;
CREATE TRIGGER trg_fechas_documento_mediodia
  BEFORE INSERT OR UPDATE OF fecha_documento, fecha_vencimiento ON public.documentos_proyecto
  FOR EACH ROW EXECUTE FUNCTION public.normalizar_fechas_documento();

DROP TRIGGER IF EXISTS trg_fechas_documento_mediodia ON public.documentos_vivienda;
CREATE TRIGGER trg_fechas_documento_mediodia
  BEFORE INSERT OR UPDATE OF fecha_documento, fecha_vencimiento ON public.documentos_vivienda
  FOR EACH ROW EXECUTE FUNCTION public.normalizar_fechas_documento();

-- ── Corrección de lo existente (sin disparar auditoría ni otros triggers) ──
ALTER TABLE public.documentos_cliente DISABLE TRIGGER USER;
UPDATE public.documentos_cliente
   SET fecha_documento = public.fecha_calendario_mediodia(fecha_documento),
       fecha_vencimiento = public.fecha_calendario_mediodia(fecha_vencimiento)
 WHERE fecha_documento IS DISTINCT FROM public.fecha_calendario_mediodia(fecha_documento)
    OR fecha_vencimiento IS DISTINCT FROM public.fecha_calendario_mediodia(fecha_vencimiento);
ALTER TABLE public.documentos_cliente ENABLE TRIGGER USER;

ALTER TABLE public.documentos_proyecto DISABLE TRIGGER USER;
UPDATE public.documentos_proyecto
   SET fecha_documento = public.fecha_calendario_mediodia(fecha_documento),
       fecha_vencimiento = public.fecha_calendario_mediodia(fecha_vencimiento)
 WHERE fecha_documento IS DISTINCT FROM public.fecha_calendario_mediodia(fecha_documento)
    OR fecha_vencimiento IS DISTINCT FROM public.fecha_calendario_mediodia(fecha_vencimiento);
ALTER TABLE public.documentos_proyecto ENABLE TRIGGER USER;

ALTER TABLE public.documentos_vivienda DISABLE TRIGGER USER;
UPDATE public.documentos_vivienda
   SET fecha_documento = public.fecha_calendario_mediodia(fecha_documento),
       fecha_vencimiento = public.fecha_calendario_mediodia(fecha_vencimiento)
 WHERE fecha_documento IS DISTINCT FROM public.fecha_calendario_mediodia(fecha_documento)
    OR fecha_vencimiento IS DISTINCT FROM public.fecha_calendario_mediodia(fecha_vencimiento);
ALTER TABLE public.documentos_vivienda ENABLE TRIGGER USER;

-- ── Verificación ────────────────────────────────────────────────────────────
DO $$
DECLARE
  fuera int;
  apagados int;
BEGIN
  SELECT count(*) INTO fuera FROM public.documentos_cliente
   WHERE (fecha_documento AT TIME ZONE 'UTC')::time <> '12:00'
      OR (fecha_vencimiento AT TIME ZONE 'UTC')::time <> '12:00';
  IF fuera > 0 THEN
    RAISE EXCEPTION 'Quedaron % documentos con hora distinta al mediodía', fuera;
  END IF;
  SELECT count(*) INTO apagados FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
   WHERE c.relname IN ('documentos_cliente', 'documentos_proyecto', 'documentos_vivienda')
     AND NOT t.tgisinternal AND t.tgenabled = 'D';
  IF apagados > 0 THEN
    RAISE EXCEPTION 'Quedaron % triggers apagados', apagados;
  END IF;
  RAISE NOTICE 'OK: fechas de documentos al mediodía y triggers activos';
END $$;
