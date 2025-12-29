-- ============================================
-- QUERIES SIMPLES PARA EJECUTAR PASO A PASO
-- Ejecuta cada query UNA POR UNA
-- ============================================

-- QUERY 1: Verificar si la tabla product_variations existe
SELECT name FROM sqlite_master WHERE type='table' AND name='product_variations';

-- Si la query anterior NO retorna nada, ejecuta la QUERY 2
-- Si SÍ retorna 'product_variations', salta a la QUERY 3

-- ============================================

-- QUERY 2: Crear la tabla product_variations (solo si no existe)
CREATE TABLE IF NOT EXISTS product_variations (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  chain_type TEXT NOT NULL DEFAULT 'plata_925',
  brand TEXT,
  thickness TEXT,
  length TEXT,
  price_modifier INTEGER DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================

-- QUERY 3: Verificar estructura actual de la tabla
PRAGMA table_info(product_variations);

-- Revisa los resultados. Si ves una columna llamada 'brand', ya está listo.
-- Si NO ves 'brand', ejecuta la QUERY 4

-- ============================================

-- QUERY 4: Añadir campo brand (solo si no existe)
-- Ejecuta esta query SOLO si en la QUERY 3 no viste la columna 'brand'
ALTER TABLE product_variations ADD COLUMN brand TEXT;

-- ============================================

-- QUERY 5: Crear índices (ejecuta siempre)
CREATE INDEX IF NOT EXISTS idx_product_variations_product ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_active ON product_variations(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variations_brand ON product_variations(brand);

-- ============================================

-- QUERY 6: Verificar que todo esté correcto
PRAGMA table_info(product_variations);

-- Deberías ver todas las columnas incluyendo: id, product_id, chain_type, brand, thickness, length, etc.

-- ============================================
-- ✅ LISTO! La tabla está configurada correctamente
-- ============================================

