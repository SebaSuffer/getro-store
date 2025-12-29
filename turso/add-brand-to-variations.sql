-- Script para añadir el campo brand a la tabla product_variations si ya existe
-- Ejecutar este script si la tabla ya tiene datos

-- SQLite no soporta ALTER TABLE ADD COLUMN IF NOT EXISTS directamente
-- Necesitamos verificar si la columna existe primero
-- Si la columna ya existe, este script no hará nada

-- Crear tabla temporal con la nueva estructura
CREATE TABLE IF NOT EXISTS product_variations_new (
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

-- Copiar datos existentes (si hay)
INSERT INTO product_variations_new 
SELECT 
  id,
  product_id,
  chain_type,
  NULL as brand, -- Añadir brand como NULL para datos existentes
  thickness,
  length,
  price_modifier,
  stock,
  is_active,
  created_at,
  updated_at
FROM product_variations;

-- Eliminar tabla antigua
DROP TABLE product_variations;

-- Renombrar tabla nueva
ALTER TABLE product_variations_new RENAME TO product_variations;

-- Recrear índices
CREATE INDEX IF NOT EXISTS idx_product_variations_product ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_active ON product_variations(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variations_brand ON product_variations(brand);

