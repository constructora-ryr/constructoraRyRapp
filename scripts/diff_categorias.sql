-- Listar todas las categorias sistema con su ID, nombre y modulo
SELECT id, nombre, modulos_permitidos[1] AS modulo, orden
FROM categorias_documento
WHERE es_sistema = true
ORDER BY modulos_permitidos[1], orden;
