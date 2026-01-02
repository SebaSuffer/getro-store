-- ============================================
-- Migración: Eliminar cadenas antiguas y crear nueva estructura
-- ============================================

-- PASO 1: Eliminar todas las cadenas de la tabla products
DELETE FROM products WHERE category = 'Cadenas';

-- PASO 2: Eliminar todas las variaciones relacionadas con cadenas
DELETE FROM product_variations 
WHERE product_id IN (
  SELECT id FROM products WHERE category = 'Cadenas'
);

-- PASO 3: Eliminar imágenes de productos de cadenas
DELETE FROM product_images 
WHERE product_id IN (
  SELECT id FROM products WHERE category = 'Cadenas'
);

-- PASO 4: Eliminar opciones de cadenas para colgantes (si existen)
DELETE FROM pendant_chain_options;

-- PASO 5: Eliminar todas las cadenas de la tabla chains (por si acaso ya existen)
DELETE FROM chains;

-- PASO 6: Insertar cadenas por marca (una cadena por marca)
-- Solo se usa la marca, sin nombre, grosor ni largo

INSERT INTO chains (id, brand, name, thickness, length, price, stock, image_url, image_alt, description, is_active) VALUES
-- CARTIER
('chain-cartier', 'CARTIER', 'CARTIER', NULL, NULL, 19990, 3, 
 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/cartier-3mm-60cm.jpg',
 'Cadena Cartier', 
 'Cadena Cartier de plata 925', 1),

-- TRADICIONAL
('chain-tradicional', 'TRADICIONAL', 'TRADICIONAL', NULL, NULL, 22990, 3,
 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/tradicional-3.6mm-50cm.jpg',
 'Cadena Tradicional',
 'Cadena Tradicional de plata 925', 1),

-- GRUMET
('chain-grumet', 'GRUMET', 'GRUMET', NULL, NULL, 21990, 2,
 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/grumet-3mm-60cm.jpg',
 'Cadena Grumet',
 'Cadena Grumet de plata 925', 1),

-- MARINA
('chain-marina', 'MARINA', 'MARINA', NULL, NULL, 21990, 3,
 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/marina.jpg',
 'Cadena Marina',
 'Cadena Marina de plata 925', 1),

-- PLATA 925 (variación por defecto)
('chain-plata-925', 'PLATA 925', 'PLATA 925', NULL, NULL, 20250, 10,
 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/plata-925-default.jpg',
 'Cadena Plata 925',
 'Cadena de plata 925 estándar', 1);

-- Verificar las cadenas insertadas
SELECT id, brand, name, price, stock FROM chains ORDER BY brand;

