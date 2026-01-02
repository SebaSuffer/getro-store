-- Agregar columna display_price para almacenar el precio de exhibición redondeado
-- Si es NULL, se calculará automáticamente basado en price + price_modifier
ALTER TABLE products ADD COLUMN display_price INTEGER;

-- Actualizar productos existentes: si tienen variaciones, calcular display_price
-- Si no tienen variaciones, usar el precio base redondeado
UPDATE products 
SET display_price = CASE 
  WHEN EXISTS (
    SELECT 1 FROM product_variations pv 
    WHERE pv.product_id = products.id AND pv.is_active = 1
  ) THEN NULL -- Se calculará dinámicamente
  ELSE price -- Para productos sin variaciones, usar precio base
END;

