-- ============================================
-- SETUP COMPLETO DE VARIACIONES - EJECUTAR PASO A PASO
-- ============================================

-- PASO 1: Verificar si la tabla existe
-- Ejecuta esta query primero para ver si la tabla product_variations existe
SELECT name FROM sqlite_master WHERE type='table' AND name='product_variations';

-- RESULTADO:
-- Si retorna 'product_variations' → La tabla existe, ve al PASO 2
-- Si NO retorna nada → La tabla NO existe, ejecuta el PASO 1B

-- ============================================
-- PASO 1B: Crear la tabla (SOLO si no existe)
-- ============================================
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
-- PASO 2: Verificar estructura de la tabla
-- ============================================
PRAGMA table_info(product_variations);

-- Revisa los resultados:
-- Si ves una columna 'brand' → Ya está listo, ve al PASO 4
-- Si NO ves 'brand' → Ejecuta el PASO 3

-- ============================================
-- PASO 3: Añadir campo brand (SOLO si no existe)
-- ============================================
-- Ejecuta esta query SOLO si en el PASO 2 NO viste la columna 'brand'
ALTER TABLE product_variations ADD COLUMN brand TEXT;

-- ============================================
-- PASO 4: Crear índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_product_variations_product ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_active ON product_variations(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variations_brand ON product_variations(brand);

-- ============================================
-- PASO 5: Verificación final
-- ============================================
-- Verifica que todo esté correcto
PRAGMA table_info(product_variations);

-- Deberías ver estas columnas:
-- id, product_id, chain_type, brand, thickness, length, price_modifier, stock, is_active, created_at, updated_at

-- ============================================
-- ✅ LISTO! La tabla está configurada
-- ============================================

