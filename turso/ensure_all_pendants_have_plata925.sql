-- ============================================
-- Asegurar que TODOS los colgantes tengan PLATA 925
-- ============================================
-- Este script agrega PLATA 925 a todos los colgantes que no la tengan

-- PASO 1: Verificar que existe la cadena PLATA 925
INSERT OR IGNORE INTO chains (id, brand, name, thickness, length, price, stock, is_active, created_at, updated_at)
VALUES (
  'chain-plata-925',
  'PLATA 925',
  'PLATA 925',
  NULL,
  NULL,
  20250,
  10,
  1,
  datetime('now'),
  datetime('now')
);

-- PASO 2: Agregar PLATA 925 a todos los colgantes que no la tengan
INSERT OR IGNORE INTO pendant_chain_options (id, pendant_id, chain_brand, is_active, created_at, updated_at)
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

-- PASO 3: Verificar resultados
SELECT 
  p.id,
  p.name,
  COUNT(pco.chain_brand) as num_variaciones,
  GROUP_CONCAT(pco.chain_brand, ', ') as cadenas
FROM
  products p
LEFT JOIN
  pendant_chain_options pco ON p.id = pco.pendant_id AND pco.is_active = 1
WHERE
  p.category = 'Colgantes'
GROUP BY p.id, p.name
ORDER BY p.name;

