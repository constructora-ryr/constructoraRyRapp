-- ============================================================
-- MIGRACIÓN: Gestión de sesiones activas por dispositivo
-- Fecha: 2026-08-27
--
-- Permite al usuario ver en qué dispositivos tiene sesión abierta
-- y cerrar sesiones remotamente desde su perfil.
--
-- ARQUITECTURA:
-- - sesiones_activas: una fila por sesión/dispositivo activo
-- - El middleware registra/actualiza la sesión en cada request
-- - Al revocar: marca revocada=true → middleware redirige a login
-- - session_token: hash SHA-256 del refresh_token (nunca el token raw)
-- ============================================================

BEGIN;

-- ============================================================
-- TABLA: sesiones_activas
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sesiones_activas (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token   TEXT        NOT NULL,          -- SHA-256 del refresh_token
  dispositivo     TEXT,                          -- "Windows 11", "iPhone", "macOS"
  navegador       TEXT,                          -- "Chrome 124", "Safari 17"
  ip              TEXT,                          -- IP del cliente
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  revocada        BOOLEAN     NOT NULL DEFAULT false,
  CONSTRAINT sesiones_activas_session_token_key UNIQUE (session_token)
);

-- Índices para búsquedas frecuentes del middleware
CREATE INDEX IF NOT EXISTS idx_sesiones_activas_user_id
  ON public.sesiones_activas (user_id);

CREATE INDEX IF NOT EXISTS idx_sesiones_activas_token
  ON public.sesiones_activas (session_token);

CREATE INDEX IF NOT EXISTS idx_sesiones_activas_revocada
  ON public.sesiones_activas (user_id, revocada)
  WHERE revocada = false;

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.sesiones_activas ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo ve y gestiona sus propias sesiones
CREATE POLICY "Ver propias sesiones"
  ON public.sesiones_activas FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- El middleware usa service_role para insertar/actualizar/revocar
-- Las operaciones de escritura se hacen desde API routes server-side
-- con service_role, por eso solo definimos SELECT para authenticated.

-- ============================================================
-- FUNCIÓN: limpiar sesiones antiguas (TTL 30 días)
-- Llamada desde la API de registro de sesión para evitar acumulación.
-- ============================================================

CREATE OR REPLACE FUNCTION public.limpiar_sesiones_antiguas(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.sesiones_activas
  WHERE user_id = p_user_id
    AND (
      revocada = true
      OR last_seen_at < now() - INTERVAL '30 days'
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.limpiar_sesiones_antiguas(UUID) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.limpiar_sesiones_antiguas(UUID) TO service_role;

COMMIT;
