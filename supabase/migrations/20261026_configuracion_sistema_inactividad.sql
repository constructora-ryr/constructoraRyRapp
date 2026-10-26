-- ============================================================================
-- Ajustes generales del sistema (clave → valor) + límite de inactividad
-- ============================================================================
-- Primer ajuste: minutos sin actividad tras los que se cierra la sesión.
-- Todos los usuarios con sesión lo leen (la app lo necesita); solo un
-- Administrador lo cambia. Los cambios quedan en `auditoria`.
-- Se puede ejecutar más de una vez.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.configuracion_sistema (
  clave           text PRIMARY KEY,
  valor           jsonb NOT NULL,
  descripcion     text,
  actualizado_por uuid,
  actualizado_en  timestamptz NOT NULL DEFAULT now(),
  -- 5 min a 8 h: menos es incómodo, más deja equipos desatendidos abiertos
  CONSTRAINT chk_inactividad_minutos CHECK (
    clave <> 'inactividad_minutos'
    OR (jsonb_typeof(valor) = 'number' AND (valor #>> '{}')::int BETWEEN 5 AND 480)
  )
);

ALTER TABLE public.configuracion_sistema ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios con sesión leen la configuración" ON public.configuracion_sistema;
CREATE POLICY "Usuarios con sesión leen la configuración" ON public.configuracion_sistema
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Administradores editan la configuración" ON public.configuracion_sistema;
CREATE POLICY "Administradores editan la configuración" ON public.configuracion_sistema
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.usuarios u
                  WHERE u.id = auth.uid() AND u.rol = 'Administrador'::rol_usuario
                    AND u.estado = 'Activo'::estado_usuario))
  WITH CHECK (EXISTS (SELECT 1 FROM public.usuarios u
                       WHERE u.id = auth.uid() AND u.rol = 'Administrador'::rol_usuario
                         AND u.estado = 'Activo'::estado_usuario));

REVOKE ALL ON public.configuracion_sistema FROM anon;
GRANT SELECT, UPDATE ON public.configuracion_sistema TO authenticated;

-- Quién y cuándo, sin depender de lo que envíe el navegador
CREATE OR REPLACE FUNCTION public.configuracion_sistema_sello()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.actualizado_por := auth.uid();
  NEW.actualizado_en := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_configuracion_sistema_sello ON public.configuracion_sistema;
CREATE TRIGGER trg_configuracion_sistema_sello
  BEFORE UPDATE ON public.configuracion_sistema
  FOR EACH ROW EXECUTE FUNCTION public.configuracion_sistema_sello();

DROP TRIGGER IF EXISTS trg_auditoria ON public.configuracion_sistema;
CREATE TRIGGER trg_auditoria
  AFTER INSERT OR UPDATE OR DELETE ON public.configuracion_sistema
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

INSERT INTO public.configuracion_sistema (clave, valor, descripcion)
VALUES ('inactividad_minutos', '60'::jsonb,
        'Minutos sin actividad tras los que se cierra la sesión')
ON CONFLICT (clave) DO NOTHING;
