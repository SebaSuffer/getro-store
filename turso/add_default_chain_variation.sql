-- ============================================
-- Agregar variación por defecto de Cadena Plata 925
-- a todos los productos que no tengan variaciones
-- ============================================

-- Este script agrega una variación por defecto de "Cadena Plata 925"
-- a todos los productos de categoría Colgantes que no tengan variaciones

-- PRECIO BASE DE CADENA PLATA 925: $20.250 CLP
-- (Ajusta este valor según tu tabla de Excel)

-- Insertar variación por defecto solo para productos que:
-- 1. Son Colgantes
-- 2. No tienen ninguna variación existente
INSERT INTO product_variations (
  id,
  product_id,
  chain_type,
  brand,
  thickness,
  length,
  price_modifier,
  stock,
  is_active,
  created_at,
  updated_at
)
SELECT 
  'var-' || p.id || '-PLATA925-DEFAULT',
  p.id,
  'plata_925',
  'PLATA 925',
  '3.6MM',
  '50CM',
  20250, -- Precio de la cadena de plata 925 (ajusta según tu tabla)
  p.stock, -- Usar el stock del producto como stock inicial de la variación
  1,
  datetime('now'),
  datetime('now')
FROM products p
WHERE p.category = 'Colgantes'
  AND p.id NOT IN (
    SELECT DISTINCT product_id 
    FROM product_variations 
    WHERE product_id IS NOT NULL
  );

-- Verificar cuántas variaciones se insertaron
SELECT COUNT(*) as variaciones_insertadas
FROM product_variations
WHERE id LIKE '%-PLATA925-DEFAULT';

-- Mostrar los productos que ahora tienen la variación por defecto
SELECT 
  p.id,
  p.name,
  p.category,
  p.price as precio_dije,
  pv.price_modifier as precio_cadena,
  (p.price + pv.price_modifier) as precio_total
FROM products p
INNER JOIN product_variations pv ON p.id = pv.product_id
WHERE pv.id LIKE '%-PLATA925-DEFAULT';

