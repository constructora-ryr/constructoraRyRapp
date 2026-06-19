-- ============================================================
-- MIGRACIÓN: audit_log — columna oculto para admins
-- Fecha: 2026-06-19
--
-- PROPÓSITO:
--   Permite a Administradores ocultar entradas del historial de
--   cliente desde la UI (ej: ediciones vacías de prueba) sin
--   borrar el registro físico — preserva la trazabilidad de auditoría.
--
-- COLUMNAS AGREGADAS:
--   oculto       — false por defecto; true = no aparece en la UI
--   oculto_por   — UUID del admin que lo ocultó
--   oculto_en    — timestamp de cuándo se ocultó
--
-- CAMBIO EN RPC:
--   obtener_historial_cliente ya filtra WHERE oculto = false.
-- ============================================================

BEGIN;

-- ── 1. Agregar columnas a audit_log ─────────────────────────
ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS oculto      BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS oculto_por  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS oculto_en   TIMESTAMPTZ;

-- Índice parcial: solo los registros ocultos (muy pocos; no afecta
-- queries normales que filtran oculto = false)
CREATE INDEX IF NOT EXISTS idx_audit_log_oculto
  ON audit_log (oculto)
  WHERE oculto = TRUE;

-- ── 2. Recrear RPC con filtro oculto = false ─────────────────
CREATE OR REPLACE FUNCTION obtener_historial_cliente(
  p_cliente_id UUID,
  p_limit      INT DEFAULT 200
)
RETURNS TABLE (
  id                  uuid,
  tabla               varchar,
  accion              varchar,
  registro_id         uuid,
  fecha_evento        timestamptz,
  usuario_id          uuid,
  usuario_email       varchar,
  usuario_nombres     varchar,
  datos_anteriores    jsonb,
  datos_nuevos        jsonb,
  cambios_especificos jsonb,
  metadata            jsonb,
  modulo              varchar
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ── Control de acceso ────────────────────────────────────
  IF NOT (
    EXISTS (
      SELECT 1
      FROM usuarios u
      WHERE u.id = auth.uid()
        AND u.rol::text = 'Administrador'
        AND u.estado = 'Activo'
    )
    OR
    EXISTS (
      SELECT 1
      FROM usuarios u
      JOIN permisos_rol p ON p.rol = u.rol::text
      WHERE u.id = auth.uid()
        AND u.estado = 'Activo'
        AND p.modulo  = 'clientes'
        AND p.accion  = 'ver_historial'
        AND p.permitido = true
    )
  ) THEN
    RETURN;
  END IF;

  -- ── Consulta (filtra oculto = false) ────────────────────
  RETURN QUERY
  SELECT
    al.id,
    al.tabla,
    al.accion,
    al.registro_id,
    al.fecha_evento,
    al.usuario_id,
    al.usuario_email,
    al.usuario_nombres,
    al.datos_anteriores,
    al.datos_nuevos,
    al.cambios_especificos,
    al.metadata,
    al.modulo
  FROM audit_log al
  WHERE
    al.oculto = FALSE
    AND (
      (al.tabla = 'clientes'          AND al.registro_id = p_cliente_id)
      OR (al.tabla = 'negociaciones'      AND al.metadata @> jsonb_build_object('cliente_id', p_cliente_id::text))
      OR (al.tabla = 'abonos_historial'   AND al.metadata @> jsonb_build_object('cliente_id', p_cliente_id::text))
      OR (al.tabla = 'renuncias'          AND al.metadata @> jsonb_build_object('cliente_id', p_cliente_id::text))
      OR (al.tabla = 'intereses'          AND al.metadata @> jsonb_build_object('cliente_id', p_cliente_id::text))
      OR (al.tabla = 'documentos_cliente' AND al.metadata @> jsonb_build_object('cliente_id', p_cliente_id::text))
    )
  ORDER BY al.fecha_evento DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION obtener_historial_cliente IS
'Retorna eventos de audit_log relacionados con un cliente (excluye oculto=true).
Requiere rol Administrador o permiso RBAC clientes.ver_historial.';

COMMIT;
