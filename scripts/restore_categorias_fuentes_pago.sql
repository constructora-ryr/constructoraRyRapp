-- Categorías internas del módulo fuentes_pago (auto-generadas en dev)
INSERT INTO categorias_documento
  (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema, es_global, orden)
VALUES
  ('16a85165-7e17-428c-9e26-83d6fb55d43d', 'subsidios',            NULL, '#6B7280', 'FolderOpen', ARRAY['fuentes_pago'], true, true, 999),
  ('7a869d21-4816-4b38-98d7-9b60290597b9', 'otros',               NULL, '#6B7280', 'FolderOpen', ARRAY['fuentes_pago'], true, true, 999),
  ('9af30c2e-36ca-4b34-86a3-f237f84aef6e', 'Cartas de aprobación', NULL, '#6B7280', 'FolderOpen', ARRAY['fuentes_pago'], true, true, 999),
  ('eb4028c3-5055-453a-b238-4c2fbc4d2045', 'Subsidios',            NULL, '#6B7280', 'FolderOpen', ARRAY['fuentes_pago'], true, true, 999),
  ('985d5cb4-1e05-42ba-a2e7-729735c1a3d6', 'credito-hipotecario',  NULL, '#6B7280', 'FolderOpen', ARRAY['fuentes_pago'], true, true, 999)
ON CONFLICT (id) DO NOTHING;

SELECT count(*) AS total_sistema FROM categorias_documento WHERE es_sistema = true;
