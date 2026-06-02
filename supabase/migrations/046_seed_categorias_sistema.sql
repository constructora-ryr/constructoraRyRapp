-- ============================================================
-- MIGRACIÓN 046: Seed completo de categorías del sistema
-- Fecha: 2026-06-02
-- Descripción:
--   Inserta/actualiza todas las categorías del sistema con UUIDs fijos
--   para clientes, proyectos y viviendas. Idempotente — segura de
--   ejecutar en producción aunque no se hayan aplicado migraciones previas
--   de categorías.
-- ============================================================

-- ── 0. Schema: asegurar columnas opcionales existen ──────────────────────

ALTER TABLE categorias_documento
  ADD COLUMN IF NOT EXISTS es_sistema BOOLEAN DEFAULT false;

-- user_id debe ser nullable (categorías de sistema no pertenecen a un usuario)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categorias_documento'
      AND column_name = 'user_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE categorias_documento ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END;
$$;

-- ── 1. Eliminar constraints/índices que bloquean la inserción ─────────────

ALTER TABLE categorias_documento
  DROP CONSTRAINT IF EXISTS uk_categorias_documento_nombre CASCADE;

ALTER TABLE categorias_documento
  DROP CONSTRAINT IF EXISTS categorias_documento_nombre_key CASCADE;

DROP INDEX IF EXISTS idx_categorias_globales_nombre;
DROP INDEX IF EXISTS idx_categorias_usuario_modulo_nombre;
DROP INDEX IF EXISTS idx_categorias_sistema_nombre_modulo;

-- ── 2. Desactivar triggers de protección temporalmente ───────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_proteger_categoria_sistema'
      AND tgrelid = 'categorias_documento'::regclass
  ) THEN
    ALTER TABLE categorias_documento DISABLE TRIGGER trigger_proteger_categoria_sistema;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_proteger_categorias_sistema'
      AND tgrelid = 'categorias_documento'::regclass
  ) THEN
    ALTER TABLE categorias_documento DISABLE TRIGGER trigger_proteger_categorias_sistema;
  END IF;
END;
$$;

-- ── 3. Insertar/actualizar categorías de CLIENTES ────────────────────────

INSERT INTO categorias_documento
  (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema, es_global, orden)
VALUES
  ('b795b842-f035-42ce-9ab9-7fef2e1c5f24',
   'Documento de Identidad',
   'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación',
   'green', 'IdCard', ARRAY['clientes'], true, true, 1),

  ('bd49740e-d46d-43c8-973f-196f1418765c',
   'Certificado de Tradición',
   'Certificado de tradición y libertad, matrícula inmobiliaria, análisis de título, avalúo comercial, estudio de títulos',
   'yellow', 'BookMarked', ARRAY['clientes'], true, true, 2),

  ('c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a',
   'Promesa de Compraventa',
   'Promesa de compraventa (borrador y firmada), minuta borrador, contrato de reserva',
   'indigo', 'FilePen', ARRAY['clientes'], true, true, 3),

  ('4898e798-c188-4f02-bfcf-b2b15be48e34',
   'Carta de Aprobación',
   'Carta de aprobación crédito hipotecario, carta de asignación subsidio (Mi Casa Ya, Caja de Compensación), carta de ratificación',
   'cyan', 'BadgeCheck', ARRAY['clientes'], true, true, 4),

  ('d8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b',
   'Acta de Entrega',
   'Acta de entrega física del inmueble (borrador y firmada)',
   'teal', 'ClipboardCheck', ARRAY['clientes'], true, true, 5),

  ('a82ca714-b191-4976-a089-66c031ff1496',
   'Escritura Pública',
   'Escritura pública de compraventa protocolizada, hojas de escritura, minuta final',
   'pink', 'ScrollText', ARRAY['clientes'], true, true, 6),

  ('e9c3a4b5-6d7e-4f8a-ab9c-3d4e5f6a7b8c',
   'Documento de Desembolso',
   'Autorización de desembolso, cuenta de cobro, carta remisoria, certificación bancaria, formato de existencia',
   'sky', 'Landmark', ARRAY['clientes'], true, true, 7),

  ('f84ec757-2f11-4245-a487-5091176feec5',
   'Comprobante de Pago',
   'Boleta de registro, factura notarial, recibos de pago boleta fiscal, pago estudio de títulos, paz y salvos',
   'emerald', 'Receipt', ARRAY['clientes'], true, true, 8),

  ('f50f53d6-c1d8-4c42-9993-fddc2f8f5ade',
   'Otro Documento',
   'Fotos de vivienda, correspondencia, documentos varios',
   '#6B7280', 'FolderOpen', ARRAY['clientes'], true, true, 9)

ON CONFLICT (id) DO UPDATE SET
  nombre             = EXCLUDED.nombre,
  descripcion        = EXCLUDED.descripcion,
  color              = EXCLUDED.color,
  icono              = EXCLUDED.icono,
  modulos_permitidos = EXCLUDED.modulos_permitidos,
  es_sistema         = EXCLUDED.es_sistema,
  es_global          = EXCLUDED.es_global,
  orden              = EXCLUDED.orden;

-- ── 4. Insertar/actualizar categorías de PROYECTOS ───────────────────────

INSERT INTO categorias_documento
  (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema, es_global, orden)
VALUES
  ('06c57b7c-7d68-46f0-94ba-4065e00bbbf0',
   'Documentos Legales',
   'Boletas fiscales, matrículas, paz y salvos',
   '#8B5CF6', 'Scale', ARRAY['proyectos'], true, true, 1),

  ('a1d04cea-9aa3-4610-b0e0-aa4f89fe2ab5',
   'Documentos Técnicos',
   'Planos, diseños, memorias de cálculo',
   '#10B981', 'Compass', ARRAY['proyectos'], true, true, 2),

  ('d290c205-9187-46cd-a450-5463132efa07',
   'Facturas y Pagos',
   'Facturas prediales, comprobantes de pago, recibos',
   '#F59E0B', 'Receipt', ARRAY['proyectos'], true, true, 3),

  ('a32bef8e-7dc8-4bc1-bbca-16dfc6798779',
   'Permisos, Licencias y Certificados',
   'Licencias de construcción, urbanismo y certificados oficiales',
   '#EC4899', 'FileSignature', ARRAY['proyectos'], true, true, 4),

  ('347ad2e3-a452-4efd-bc32-4d0448123e25',
   'Otros Documentos',
   'Documentos generales y varios',
   '#6B7280', 'FolderOpen', ARRAY['proyectos'], true, true, 5)

ON CONFLICT (id) DO UPDATE SET
  nombre             = EXCLUDED.nombre,
  descripcion        = EXCLUDED.descripcion,
  color              = EXCLUDED.color,
  icono              = EXCLUDED.icono,
  modulos_permitidos = EXCLUDED.modulos_permitidos,
  es_sistema         = EXCLUDED.es_sistema,
  es_global          = EXCLUDED.es_global,
  orden              = EXCLUDED.orden;

-- ── 5. Insertar/actualizar categorías de VIVIENDAS ───────────────────────

INSERT INTO categorias_documento
  (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema, es_global, orden)
VALUES
  ('3a98c79d-25fc-40f7-b701-c6946995002d',
   'Avalúo Comercial',
   'Avalúos y valoraciones de la propiedad',
   '#EF4444', 'DollarSign', ARRAY['viviendas'], true, true, 1),

  ('e76ff8af-7ff6-4c44-8003-a2dc8eaf9967',
   'Certificado de Tradición',
   'Certificados de tradición y libertad de la propiedad',
   '#3B82F6', 'BookMarked', ARRAY['viviendas'], true, true, 2),

  ('00f70227-fb60-4737-a8ba-2071fcd82cdf',
   'Contrato de Promesa',
   'Contratos de promesa de compraventa',
   '#EC4899', 'FilePen', ARRAY['viviendas'], true, true, 3),

  ('9f5fec74-af8b-4105-a4fd-3f3df3568716',
   'Escritura Pública',
   'Escrituras de compraventa y documentos notariales',
   '#8B5CF6', 'ScrollText', ARRAY['viviendas'], true, true, 4),

  ('d57e28c2-1fdd-4020-879c-732684eaa4c8',
   'Foto de Progreso',
   'Fotografías del avance y estado de la obra',
   '#06B6D4', 'Camera', ARRAY['viviendas'], true, true, 5),

  ('992be01e-693f-4e7b-a583-5a45c125b113',
   'Licencia y Permiso',
   'Licencias de construcción y permisos municipales',
   '#F59E0B', 'Shield', ARRAY['viviendas'], true, true, 6),

  ('a619437b-4edb-49e9-8ead-27dc65da38a7',
   'Plano Arquitectónico',
   'Planos, diseños y renders de la vivienda',
   '#10B981', 'Ruler', ARRAY['viviendas'], true, true, 7),

  ('8d6e704b-ce42-44d2-816b-292f2026ad90',
   'Recibo de Servicios',
   'Recibos de servicios públicos y pagos',
   '#14B8A6', 'Receipt', ARRAY['viviendas'], true, true, 8)

ON CONFLICT (id) DO UPDATE SET
  nombre             = EXCLUDED.nombre,
  descripcion        = EXCLUDED.descripcion,
  color              = EXCLUDED.color,
  icono              = EXCLUDED.icono,
  modulos_permitidos = EXCLUDED.modulos_permitidos,
  es_sistema         = EXCLUDED.es_sistema,
  es_global          = EXCLUDED.es_global,
  orden              = EXCLUDED.orden;

-- ── 6. Re-habilitar triggers de protección ───────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_proteger_categoria_sistema'
      AND tgrelid = 'categorias_documento'::regclass
  ) THEN
    ALTER TABLE categorias_documento ENABLE TRIGGER trigger_proteger_categoria_sistema;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_proteger_categorias_sistema'
      AND tgrelid = 'categorias_documento'::regclass
  ) THEN
    ALTER TABLE categorias_documento ENABLE TRIGGER trigger_proteger_categorias_sistema;
  END IF;
END;
$$;

-- ── 7. Índice único correcto (mismo nombre permitido en módulos distintos) ─

CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_sistema_nombre_modulo
  ON categorias_documento (nombre, (modulos_permitidos[1]))
  WHERE es_sistema = true;

-- ── 8. RLS: actualizar policies ──────────────────────────────────────────

-- Lectura: cualquier usuario autenticado puede ver categorías globales/sistema
DROP POLICY IF EXISTS "Users can view own categories" ON categorias_documento;
DROP POLICY IF EXISTS "Users can view all categories" ON categorias_documento;

CREATE POLICY "Users can view all categories"
  ON categorias_documento FOR SELECT
  USING (es_global = true OR auth.uid() = user_id);

-- Inserción: solo el propio usuario (no aplica a categorías sistema sin user_id)
DROP POLICY IF EXISTS "Users can insert own categories" ON categorias_documento;
DROP POLICY IF EXISTS "Authenticated users can create categories" ON categorias_documento;

CREATE POLICY "Authenticated users can create categories"
  ON categorias_documento FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Actualización
DROP POLICY IF EXISTS "Users can update own categories" ON categorias_documento;
DROP POLICY IF EXISTS "Users can update categories" ON categorias_documento;

CREATE POLICY "Users can update categories"
  ON categorias_documento FOR UPDATE
  USING (es_global = true OR auth.uid() = user_id);

-- Eliminación: solo categorías no-sistema del propio usuario
DROP POLICY IF EXISTS "Users can delete own categories" ON categorias_documento;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus categorías no-sistema" ON categorias_documento;

CREATE POLICY "Usuarios pueden eliminar sus categorías no-sistema"
  ON categorias_documento FOR DELETE
  USING (user_id = auth.uid() AND es_sistema = false);

-- ── 9. Verificación final ─────────────────────────────────────────────────

DO $$
DECLARE
  n_clientes  integer;
  n_proyectos integer;
  n_viviendas integer;
BEGIN
  SELECT COUNT(*) INTO n_clientes  FROM categorias_documento WHERE es_sistema = true AND 'clientes'  = ANY(modulos_permitidos);
  SELECT COUNT(*) INTO n_proyectos FROM categorias_documento WHERE es_sistema = true AND 'proyectos' = ANY(modulos_permitidos);
  SELECT COUNT(*) INTO n_viviendas FROM categorias_documento WHERE es_sistema = true AND 'viviendas' = ANY(modulos_permitidos);

  RAISE NOTICE '✅ Categorías sistema: clientes=%, proyectos=%, viviendas=%',
    n_clientes, n_proyectos, n_viviendas;

  IF n_clientes  < 9 THEN RAISE WARNING '⚠️  Faltan categorías de clientes  (esperadas 9, encontradas %)',  n_clientes;  END IF;
  IF n_proyectos < 5 THEN RAISE WARNING '⚠️  Faltan categorías de proyectos (esperadas 5, encontradas %)', n_proyectos; END IF;
  IF n_viviendas < 8 THEN RAISE WARNING '⚠️  Faltan categorías de viviendas (esperadas 8, encontradas %)', n_viviendas; END IF;
END;
$$;
