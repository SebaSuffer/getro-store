-- ============================================
-- Agregar cadena PLATA 925 por defecto a colgantes sin variaciones
-- ============================================
-- Este script:
-- 1. Busca todos los colgantes que no tienen variaciones
-- 2. Obtiene el precio de la cadena "PLATA 925" de la tabla chains
-- 3. Calcula el precio total (colgante + cadena) y lo redondea
-- 4. Crea una variación por defecto y la relación en pendant_chain_options

-- Función de redondeo (SQLite no tiene funciones personalizadas, así que usamos lógica inline)
-- Redondea a 500 o 990 según corresponda

-- PASO 1: Verificar que existe la cadena PLATA 925
SELECT id, brand, price FROM chains WHERE brand = 'PLATA 925';

-- Si no existe, crear la cadena PLATA 925 (ajustar precio según sea necesario)
INSERT OR IGNORE INTO chains (id, brand, name, price, stock, is_active, created_at, updated_at)
VALUES (
  'chain-plata-925-default',
  'PLATA 925',
  'Cadena Plata 925',
  20250, -- Precio de la cadena (ajustar según tu tabla)
  10,
  1,
  datetime('now'),
  datetime('now')
);

-- PASO 2: Agregar variación por defecto a colgantes sin variaciones
-- El precio_modifier será el precio de la cadena PLATA 925
-- El precio redondeado se calculará en el frontend o se puede calcular aquí
-- pero SQLite no tiene funciones personalizadas, así que guardamos el precio_modifier
-- y el precio redondeado se calcula en la aplicación

-- Insertar variaciones por defecto
INSERT INTO product_variations (
  id,
  product_id,
  chain_type,
  brand,
  thickness,
  length,
  price_modifier,
  stock,
  is_active,
  created_at,
  updated_at
)
SELECT
  'var-' || p.id || '-PLATA925-DEFAULT',
  p.id,
  'plata_925',
  'PLATA 925',
  NULL, -- No hay grosor específico en el nuevo sistema
  NULL, -- No hay largo específico en el nuevo sistema
  COALESCE((SELECT price FROM chains WHERE brand = 'PLATA 925' LIMIT 1), 20250), -- Precio de la cadena como modificador (default 20250 si no existe)
  p.stock, -- Stock del producto
  1,
  datetime('now'),
  datetime('now')
FROM
  products p
LEFT JOIN
  product_variations pv ON p.id = pv.product_id
WHERE
  p.category = 'Colgantes'
  AND pv.product_id IS NULL; -- Solo productos sin variaciones

-- PASO 3: Agregar relación en pendant_chain_options
INSERT OR IGNORE INTO pendant_chain_options (
  id,
  pendant_id,
  chain_brand,
  is_active,
  created_at,
  updated_at
)
SELECT
  'pco-' || p.id || '-plata-925',
  p.id,
  'PLATA 925',
  1,
  datetime('now'),
  datetime('now')
FROM
  products p
WHERE
  p.category = 'Colgantes'
  AND NOT EXISTS (
    SELECT 1 FROM pendant_chain_options pco 
    WHERE pco.pendant_id = p.id AND pco.chain_brand = 'PLATA 925'
  );

-- PASO 4: Verificar resultados
SELECT 
  p.id,
  p.name,
  p.price as precio_colgante,
  c.price as precio_cadena,
  (p.price + c.price) as suma_total,
  pv.price_modifier as precio_modificador,
  pv.id as variacion_id
FROM
  products p
INNER JOIN
  product_variations pv ON p.id = pv.product_id
INNER JOIN
  chains c ON c.brand = 'PLATA 925'
WHERE
  p.category = 'Colgantes'
  AND pv.brand = 'PLATA 925'
ORDER BY p.name;

