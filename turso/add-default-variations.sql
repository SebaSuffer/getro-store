-- Script para añadir variaciones por defecto (plata 925) a todos los productos de categoría "Cadenas"
-- Esto crea una variación por defecto para cada cadena existente

INSERT INTO product_variations (id, product_id, chain_type, length, thickness, price_modifier, stock, is_active, created_at, updated_at)
SELECT 
  'var-' || p.id || '-plata-925',
  p.id,
  'plata_925',
  NULL, -- Largo pendiente
  NULL, -- Grosor pendiente
  0, -- Sin modificador de precio
  p.stock, -- Mismo stock que el producto
  1, -- Activa
  datetime('now'),
  datetime('now')
FROM products p
WHERE p.category = 'Cadenas'
AND NOT EXISTS (
  SELECT 1 FROM product_variations pv WHERE pv.product_id = p.id
);

-- NOTA: Las variaciones de oro se pueden añadir después desde el panel de administración
-- cuando estén listas para mostrarse. Por ahora solo plata 925 está activa.

