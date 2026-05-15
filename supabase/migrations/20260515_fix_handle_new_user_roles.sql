-- ============================================================
-- FIX: handle_new_user + rol_usuario enum para invitaciones
-- Fecha: 2026-05-15
--
-- Problema: inviteUserByEmail() falla con "Database error saving
-- new user" porque la función handle_new_user intenta castear
-- 'Contabilidad' a rol_usuario, pero ese valor puede no existir
-- en el enum si la migración 042 no fue aplicada.
--
-- Solución: asegurar que el enum tenga los valores correctos y
-- que el trigger sea resiliente a valores desconocidos.
--
-- Idempotente: seguro correr varias veces.
-- ============================================================

-- ── Paso 1: Agregar valores al enum si no existen ───────────

DO $$ BEGIN
  ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'Contabilidad';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'rol_usuario no es ENUM o Contabilidad ya existe: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'Administrador de Obra';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'rol_usuario no es ENUM o Administrador de Obra ya existe: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'Gerencia';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'rol_usuario no es ENUM o Gerencia ya existe: %', SQLERRM;
END $$;

-- ── Paso 2: Recrear handle_new_user con SECURITY DEFINER ────
-- La función recibe rol como string desde raw_user_meta_data.
-- Si el valor no es un rol válido, usa 'Contabilidad' por defecto.
-- El bloque EXCEPTION asegura que nunca bloquee el INSERT en auth.users.

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_nombres     VARCHAR(100);
  v_apellidos   VARCHAR(100);
  v_rol_text    TEXT;
  v_rol         rol_usuario;
BEGIN
  v_nombres   := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nombres'),   ''), 'Usuario');
  v_apellidos := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'apellidos'), ''), 'Nuevo');
  v_rol_text  := COALESCE(NEW.raw_user_meta_data->>'rol', 'Contabilidad');

  -- Validar que el rol sea uno de los valores aceptados
  IF v_rol_text NOT IN ('Administrador', 'Contabilidad', 'Gerencia', 'Administrador de Obra') THEN
    v_rol_text := 'Contabilidad';
  END IF;

  v_rol := v_rol_text::rol_usuario;

  INSERT INTO public.usuarios (
    id,
    email,
    nombres,
    apellidos,
    rol,
    estado,
    debe_cambiar_password
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_nombres,
    v_apellidos,
    v_rol,
    'Activo'::estado_usuario,
    true
  )
  ON CONFLICT (id) DO NOTHING;  -- Si el perfil ya existe, no falla

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Registrar el error pero NO bloquear la creación del usuario en auth
  RAISE LOG 'handle_new_user: error creando perfil para % (id=%): %',
    NEW.email, NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Reasegurar ownership a postgres (BYPASSRLS) por si fue recreada por otro rol
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ── Paso 3: Asegurar que el trigger existe ──────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── Paso 4: Verificación ────────────────────────────────────

DO $$
DECLARE
  v_enum_vals  TEXT;
  v_fn_owner   TEXT;
  v_fn_secdef  BOOLEAN;
  v_trigger_ok BOOLEAN;
BEGIN
  -- Enum values
  SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
  INTO v_enum_vals
  FROM pg_enum
  WHERE enumtypid = 'public.rol_usuario'::regtype;

  -- Function owner + security definer
  SELECT rolname, prosecdef
  INTO v_fn_owner, v_fn_secdef
  FROM pg_proc p
  JOIN pg_roles r ON r.oid = p.proowner
  WHERE p.proname = 'handle_new_user'
    AND p.pronamespace = 'public'::regnamespace;

  -- Trigger exists
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_created'
      AND n.nspname = 'auth'
      AND c.relname = 'users'
  ) INTO v_trigger_ok;

  RAISE NOTICE '✅ rol_usuario enum values: %', v_enum_vals;
  RAISE NOTICE '✅ handle_new_user owner: %, SECURITY DEFINER: %', v_fn_owner, v_fn_secdef;
  RAISE NOTICE '✅ on_auth_user_created trigger exists: %', v_trigger_ok;

  IF NOT (v_enum_vals LIKE '%Contabilidad%' AND v_enum_vals LIKE '%Administrador de Obra%') THEN
    RAISE WARNING '⚠️ El enum rol_usuario no tiene todos los valores esperados';
  END IF;

  IF v_fn_owner <> 'postgres' THEN
    RAISE WARNING '⚠️ handle_new_user no es propiedad de postgres — BYPASSRLS puede no aplicar';
  END IF;

  IF NOT v_trigger_ok THEN
    RAISE EXCEPTION '❌ El trigger on_auth_user_created no existe';
  END IF;
END $$;
