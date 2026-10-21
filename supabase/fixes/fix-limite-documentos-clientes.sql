-- =====================================================
-- FIX: Alinear límite de tamaño de archivo del bucket
-- documentos-clientes con el límite validado en la app (50MB)
-- =====================================================

UPDATE storage.buckets
SET file_size_limit = 52428800 -- 50 MB
WHERE id = 'documentos-clientes';

-- Verificar el cambio
SELECT id, name, file_size_limit, file_size_limit / 1024 / 1024 AS limite_mb
FROM storage.buckets
WHERE id = 'documentos-clientes';
