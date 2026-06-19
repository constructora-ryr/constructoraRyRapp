-- ============================================================
-- MIGRACIÓN: obtener_historial_cliente — param p_incluir_ocultos
-- Fecha: 2026-06-20
--
-- PROPÓSITO:
--   Permite a Administradores ver los eventos ocultos pasando
--   p_incluir_ocultos = TRUE. También agrega la columna `oculto`
--   al resultado para que la UI sepa cuáles están ocultos.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION obtener_historial_cliente(
  p_cliente_id      UUID,
  p_limit           INT     DEFAULT 200,
  p_incluir_ocultos BOOLEAN DEFAULT FALSE
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
  modulo              varchar,
  oculto              boolean
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

  -- ── Consulta ─────────────────────────────────────────────
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
    al.modulo,
    al.oculto
  FROM audit_log al
  WHERE
    (p_incluir_ocultos OR al.oculto = FALSE)
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
'Retorna eventos de audit_log relacionados con un cliente.
p_incluir_ocultos=TRUE muestra también los eventos ocultos (solo admins).
Requiere rol Administrador o permiso RBAC clientes.ver_historial.';

COMMIT;
