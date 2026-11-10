-- ============================================================================
-- Mi perfil: sesiones reales y funciones de la cuenta propia
-- ============================================================================
-- Sesiones: la app llevaba su propia lista (sesiones_activas) identificando
-- cada sesión con un hash del refresh token. Supabase rota ese token cada
-- vez que renueva el acceso, así que cada renovación creaba una fila nueva
-- (un usuario con 1 sesión real veía 33) y "cerrar sesión" marcaba filas
-- cuyo token ya había cambiado: el otro dispositivo seguía entrando.
--
-- Ahora se lee auth.sessions, la fuente de verdad de Supabase. El id de la
-- sesión viaja en el JWT (claim session_id) y no cambia al renovar. Borrar
-- la fila invalida sus refresh tokens (ON DELETE CASCADE): el dispositivo
-- queda fuera, y el middleware lo saca de inmediato con sesion_vigente().
--
-- Además: editar los datos propios, preferencias, verificar la contraseña
-- actual antes de cambiarla y ver la actividad propia en la auditoría.
--
-- Todas son SECURITY DEFINER y solo tocan filas de auth.uid().
-- La tabla vieja se borra en 20261110_perfil_sesiones_reales_limpieza.sql,
-- DESPUÉS de desplegar el código nuevo.
-- Se puede ejecutar más de una vez.
-- ============================================================================

-- ── Sesiones ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.mis_sesiones()
RETURNS TABLE (
  id uuid,
  creada timestamptz,
  ultima_actividad timestamptz,
  user_agent text,
  ip text,
  es_actual boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT s.id,
         s.created_at,
         -- refreshed_at no tiene zona: es UTC
         greatest(s.created_at, s.updated_at, s.refreshed_at AT TIME ZONE 'UTC'),
         s.user_agent,
         host(s.ip),
         s.id = nullif(auth.jwt() ->> 'session_id', '')::uuid
    FROM auth.sessions s
   WHERE s.user_id = auth.uid()
     AND (s.not_after IS NULL OR s.not_after > now())
   ORDER BY 3 DESC;
$$;

/** Cierra una sesión propia en otro dispositivo (la actual se cierra con logout) */
CREATE OR REPLACE FUNCTION public.cerrar_mi_sesion(p_sesion uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_borradas int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;
  IF p_sesion = nullif(auth.jwt() ->> 'session_id', '')::uuid THEN
    RAISE EXCEPTION 'Esta es tu sesión actual: ciérrala con "Cerrar sesión"';
  END IF;
  DELETE FROM auth.sessions WHERE id = p_sesion AND user_id = auth.uid();
  GET DIAGNOSTICS v_borradas = ROW_COUNT;
  RETURN v_borradas > 0;
END;
$$;

/** Cierra todas las sesiones propias menos la actual; devuelve cuántas */
CREATE OR REPLACE FUNCTION public.cerrar_mis_otras_sesiones()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_actual uuid := nullif(auth.jwt() ->> 'session_id', '')::uuid;
  v_borradas int;
BEGIN
  IF auth.uid() IS NULL OR v_actual IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;
  DELETE FROM auth.sessions WHERE user_id = auth.uid() AND id <> v_actual;
  GET DIAGNOSTICS v_borradas = ROW_COUNT;
  RETURN v_borradas;
END;
$$;

/**
 * ¿La sesión del JWT sigue existiendo? El middleware la consulta en cada
 * petición: si se cerró desde otro dispositivo, saca al usuario aunque su
 * JWT aún no haya vencido. Sin session_id en el token no se bloquea.
 */
CREATE OR REPLACE FUNCTION public.sesion_vigente()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT CASE
    WHEN nullif(auth.jwt() ->> 'session_id', '') IS NULL THEN true
    ELSE EXISTS (
      SELECT 1 FROM auth.sessions s
       WHERE s.id = (auth.jwt() ->> 'session_id')::uuid
         AND s.user_id = auth.uid()
    )
  END;
$$;

/** Inactivar o bloquear un usuario: cierra todas sus sesiones (solo service_role) */
CREATE OR REPLACE FUNCTION public.cerrar_sesiones_de_usuario(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_borradas int;
BEGIN
  DELETE FROM auth.sessions WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_borradas = ROW_COUNT;
  RETURN v_borradas;
END;
$$;

-- ── Datos propios ───────────────────────────────────────────────────────────

/** Nombres, apellidos y teléfono propios. Rol, estado y correo no se tocan */
CREATE OR REPLACE FUNCTION public.actualizar_mi_perfil(
  p_nombres text,
  p_apellidos text,
  p_telefono text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_nombres text := nullif(btrim(p_nombres), '');
  v_apellidos text := nullif(btrim(p_apellidos), '');
  v_telefono text := nullif(btrim(p_telefono), '');
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;
  IF v_nombres IS NULL OR v_apellidos IS NULL THEN
    RAISE EXCEPTION 'Nombres y apellidos son obligatorios';
  END IF;
  IF length(v_nombres) > 100 OR length(v_apellidos) > 100 THEN
    RAISE EXCEPTION 'Nombres y apellidos: máximo 100 caracteres';
  END IF;
  IF v_telefono IS NOT NULL AND v_telefono !~ '^[0-9 +()-]{7,20}$' THEN
    RAISE EXCEPTION 'El teléfono solo admite números, espacios y + ( ) -';
  END IF;

  UPDATE public.usuarios
     SET nombres = v_nombres,
         apellidos = v_apellidos,
         telefono = v_telefono
   WHERE id = auth.uid();
END;
$$;

/** Mezcla preferencias propias (tema, …) en usuarios.preferencias */
CREATE OR REPLACE FUNCTION public.guardar_mis_preferencias(p_preferencias jsonb)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_resultado jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;
  IF jsonb_typeof(p_preferencias) <> 'object' THEN
    RAISE EXCEPTION 'Preferencias inválidas';
  END IF;
  UPDATE public.usuarios
     SET preferencias = coalesce(preferencias, '{}'::jsonb) || p_preferencias
   WHERE id = auth.uid()
  RETURNING preferencias INTO v_resultado;
  RETURN v_resultado;
END;
$$;

/**
 * ¿La contraseña actual es correcta? Antes de cambiarla se pide la actual,
 * sin iniciar otra sesión. Una respuesta negativa tarda medio segundo para
 * frenar intentos en serie.
 */
CREATE OR REPLACE FUNCTION public.verificar_mi_contrasena(p_actual text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_ok boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;
  SELECT u.encrypted_password = extensions.crypt(p_actual, u.encrypted_password)
    INTO v_ok
    FROM auth.users u
   WHERE u.id = auth.uid();
  IF NOT coalesce(v_ok, false) THEN
    PERFORM pg_sleep(0.5);
  END IF;
  RETURN coalesce(v_ok, false);
END;
$$;

/** Lo último que hizo el usuario (la auditoría completa solo la ven admins) */
CREATE OR REPLACE FUNCTION public.mi_actividad(p_limite integer DEFAULT 30)
RETURNS SETOF public.auditoria
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT *
    FROM public.auditoria a
   WHERE a.usuario_id = auth.uid()
   ORDER BY a.fecha DESC
   LIMIT least(greatest(coalesce(p_limite, 30), 1), 100);
$$;

-- ── Permisos ────────────────────────────────────────────────────────────────

REVOKE ALL ON FUNCTION public.mis_sesiones() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cerrar_mi_sesion(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cerrar_mis_otras_sesiones() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.sesion_vigente() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cerrar_sesiones_de_usuario(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.actualizar_mi_perfil(text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.guardar_mis_preferencias(jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verificar_mi_contrasena(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mi_actividad(integer) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.mis_sesiones() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cerrar_mi_sesion(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cerrar_mis_otras_sesiones() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sesion_vigente() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cerrar_sesiones_de_usuario(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.actualizar_mi_perfil(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.guardar_mis_preferencias(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_mi_contrasena(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mi_actividad(integer) TO authenticated;

-- ── Verificación ────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_faltan text;
BEGIN
  SELECT string_agg(f, ', ') INTO v_faltan
    FROM unnest(ARRAY[
      'mis_sesiones', 'cerrar_mi_sesion', 'cerrar_mis_otras_sesiones',
      'sesion_vigente', 'cerrar_sesiones_de_usuario', 'actualizar_mi_perfil',
      'guardar_mis_preferencias', 'verificar_mi_contrasena', 'mi_actividad'
    ]) f
   WHERE NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = f);
  IF v_faltan IS NOT NULL THEN
    RAISE EXCEPTION 'Faltan funciones: %', v_faltan;
  END IF;
  IF has_function_privilege('authenticated', 'public.cerrar_sesiones_de_usuario(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'cerrar_sesiones_de_usuario no debe ser ejecutable por usuarios';
  END IF;
  RAISE NOTICE 'OK: funciones de Mi perfil creadas';
END $$;
