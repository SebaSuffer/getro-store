-- ============================================
-- Agregar campo is_active a products
-- ============================================
-- Este campo permite mostrar/ocultar productos en la landing page
-- sin eliminarlos de la base de datos

-- Verificar si la columna ya existe
SELECT name FROM pragma_table_info('products') WHERE name = 'is_active';

-- Si no existe, agregarla
ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;

-- Crear índice para mejorar performance en filtros
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Actualizar todos los productos existentes para que estén activos por defecto
UPDATE products SET is_active = 1 WHERE is_active IS NULL;

-- Verificación
SELECT id, name, is_active FROM products LIMIT 5;

