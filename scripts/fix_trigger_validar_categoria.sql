-- Fix: agregar search_path al trigger para que encuentre public.categorias_documento
CREATE OR REPLACE FUNCTION public.validar_categoria_documento()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $function$
BEGIN
  IF NEW.categoria_documento IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.categorias_documento
    WHERE nombre = NEW.categoria_documento
  ) THEN
    RAISE EXCEPTION 'La categoría "%" no existe en el catálogo de categorías', NEW.categoria_documento;
  END IF;

  RETURN NEW;
END;
$function$;
