-- Agrega columna de descuento por producto (0-100)
ALTER TABLE products ADD COLUMN discount_percent INTEGER NOT NULL DEFAULT 0;

-- Verificación
SELECT id, name, price, discount_percent FROM products LIMIT 20;
