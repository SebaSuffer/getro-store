-- ============================================
-- QUERIES PARA VERIFICAR EL ESTADO DE LA BD
-- Ejecuta estas queries para verificar que todo esté bien
-- ============================================

-- QUERY 1: Verificar que la tabla products existe y tiene datos
SELECT COUNT(*) as total_productos FROM products;

-- QUERY 2: Ver productos existentes
SELECT id, name, category, price, stock FROM products LIMIT 5;

-- QUERY 3: Verificar si la tabla product_variations existe
SELECT name FROM sqlite_master WHERE type='table' AND name='product_variations';

-- QUERY 4: Si la tabla product_variations existe, ver su estructura
PRAGMA table_info(product_variations);

-- QUERY 5: Ver todas las tablas que existen
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- ============================================
-- Estas queries son SOLO de lectura, no modifican nada
-- ============================================

