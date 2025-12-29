-- ============================================
-- VERIFICAR PRODUCTOS TIPO CADENAS
-- ============================================

-- Ver todos los productos tipo "Cadenas"
SELECT id, name, category, price, stock 
FROM products 
WHERE category = 'Cadenas';

-- Si no hay productos tipo "Cadenas", necesitas crearlos desde el admin panel

