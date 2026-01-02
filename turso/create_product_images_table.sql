-- Tabla para almacenar múltiples imágenes por producto
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_alt TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Migrar imagen principal existente a product_images
INSERT INTO product_images (id, product_id, image_url, image_alt, display_order, is_primary)
SELECT 
  'img-' || p.id || '-primary',
  p.id,
  p.image_url,
  p.image_alt,
  0,
  1
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(display_order);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(is_primary);

