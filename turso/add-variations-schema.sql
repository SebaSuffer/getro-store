-- Script para añadir la tabla de variaciones si la base de datos ya existe
-- Ejecutar este script si ya tienes datos en la base de datos

-- Crear tabla de variaciones de productos
CREATE TABLE IF NOT EXISTS product_variations (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  chain_type TEXT NOT NULL DEFAULT 'plata_925', -- 'plata_925', 'oro'
  length TEXT, -- Largo de la cadena (ej: '50cm', '60cm') - pendiente
  thickness TEXT, -- Grosor de la cadena (ej: '3mm', '4mm') - pendiente
  price_modifier INTEGER DEFAULT 0, -- Modificador de precio (puede ser positivo o negativo)
  stock INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1, -- Para ocultar variaciones no disponibles aún
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_product_variations_product ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_active ON product_variations(is_active);

