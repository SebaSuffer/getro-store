-- ============================================
-- Insertar Cadenas desde la Tabla Excel
-- ============================================
-- Este script inserta las cadenas pre-hechas en el stock
-- con precio 0 para que el cliente las agregue después

-- Cadenas de la tabla Excel:
-- CARTIER 3MM X 60CM - $19.990 (MJ31-010)
-- TRADICIONAL 3.6MM X 50CM - $22.990 (MJ31-092)
-- GRUMET 3MM X 60 - $21.990 (MJ28-025)
-- MARINA - $21.990 (MJ31-056) - sin especificaciones completas en la tabla

-- Insertar cadenas como productos (precio 0, para que el cliente lo agregue después)
INSERT OR IGNORE INTO products (
  id,
  name,
  description,
  price,
  stock,
  category,
  image_url,
  image_alt,
  is_new,
  is_featured,
  created_at,
  updated_at
) VALUES
-- CARTIER 3MM X 60CM
('prod-cadena-cartier-3mm-60cm', 
 'Cadena Cartier 3mm x 60cm plata 925',
 'Cadena Cartier de plata 925, grosor 3mm, largo 60cm',
 0, -- Precio 0 para que el cliente lo agregue
 3,
 'Cadenas',
 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/cartier-3mm-60cm.jpg',
 'Cadena Cartier 3mm x 60cm',
 0,
 0,
 datetime('now'),
 datetime('now')),

-- TRADICIONAL 3.6MM X 50CM
('prod-cadena-tradicional-3.6mm-50cm',
 'Cadena Tradicional 3.6mm x 50cm plata 925',
 'Cadena Tradicional de plata 925, grosor 3.6mm, largo 50cm',
 0, -- Precio 0 para que el cliente lo agregue
 3,
 'Cadenas',
 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/tradicional-3.6mm-50cm.jpg',
 'Cadena Tradicional 3.6mm x 50cm',
 0,
 0,
 datetime('now'),
 datetime('now')),

-- GRUMET 3MM X 60CM
('prod-cadena-grumet-3mm-60cm',
 'Cadena Grumet 3mm x 60cm plata 925',
 'Cadena Grumet de plata 925, grosor 3mm, largo 60cm',
 0, -- Precio 0 para que el cliente lo agregue
 2,
 'Cadenas',
 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/grumet-3mm-60cm.jpg',
 'Cadena Grumet 3mm x 60cm',
 0,
 0,
 datetime('now'),
 datetime('now')),

-- MARINA (sin especificaciones completas)
('prod-cadena-marina',
 'Cadena Marina plata 925',
 'Cadena Marina de plata 925',
 0, -- Precio 0 para que el cliente lo agregue
 3,
 'Cadenas',
 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/marina.jpg',
 'Cadena Marina',
 0,
 0,
 datetime('now'),
 datetime('now'));

-- Verificar las cadenas insertadas
SELECT 
  id,
  name,
  category,
  price,
  stock
FROM products
WHERE category = 'Cadenas'
ORDER BY name;

