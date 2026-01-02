-- ============================================
-- Encontrar Productos Duplicados
-- ============================================
-- Este script encuentra productos con el mismo nombre y tamaño
-- para que puedas revisarlos y eliminar los duplicados

-- Buscar productos duplicados por nombre (ignorando mayúsculas/minúsculas)
SELECT 
  LOWER(TRIM(name)) as nombre_normalizado,
  COUNT(*) as cantidad,
  GROUP_CONCAT(id, ', ') as ids,
  GROUP_CONCAT(name, ' | ') as nombres
FROM products
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY cantidad DESC, nombre_normalizado;

-- Mostrar detalles de los productos duplicados
-- (Reemplaza 'NOMBRE_DEL_PRODUCTO' con el nombre que encontraste arriba)
-- SELECT 
--   id,
--   name,
--   category,
--   price,
--   stock,
--   image_url,
--   created_at
-- FROM products
-- WHERE LOWER(TRIM(name)) = LOWER(TRIM('NOMBRE_DEL_PRODUCTO'))
-- ORDER BY created_at DESC;

-- ============================================
-- ELIMINAR DUPLICADOS (EJECUTAR CON CUIDADO)
-- ============================================
-- ⚠️ IMPORTANTE: Revisa los resultados antes de ejecutar esto
-- Este script elimina los productos duplicados, manteniendo solo el más reciente

-- Paso 1: Ver qué se eliminará
-- SELECT 
--   p1.id as id_a_eliminar,
--   p1.name,
--   p1.created_at as fecha_creacion,
--   p2.id as id_a_mantener,
--   p2.created_at as fecha_mantener
-- FROM products p1
-- INNER JOIN products p2 
--   ON LOWER(TRIM(p1.name)) = LOWER(TRIM(p2.name))
--   AND p1.id < p2.id  -- Mantener el más reciente (ID mayor)
-- ORDER BY p1.name, p1.created_at;

-- Paso 2: Eliminar duplicados (SOLO EJECUTAR DESPUÉS DE REVISAR)
-- DELETE FROM products
-- WHERE id IN (
--   SELECT p1.id
--   FROM products p1
--   INNER JOIN products p2 
--     ON LOWER(TRIM(p1.name)) = LOWER(TRIM(p2.name))
--     AND p1.id < p2.id  -- Mantener el más reciente
-- );

-- ============================================
-- Verificar productos de cadenas específicamente
-- ============================================
SELECT 
  id,
  name,
  category,
  price,
  stock,
  created_at
FROM products
WHERE category = 'Cadenas'
ORDER BY name, created_at;

