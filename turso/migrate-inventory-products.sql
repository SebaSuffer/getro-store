-- Migración de productos del inventario
-- Precios en CLP (sin puntos, como enteros)
-- Stock basado en "Cantidad en existencias"

-- CADENAS (MIS JOYAS)
INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('MJ31-010', 'Cadena Cartier 3mm x 60cm', 'Cadena Cartier de plata 925, 3mm de grosor y 60cm de largo. Diseño elegante y clásico.', 36345, 3, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/cadena-cartier-3mm-60cm', 'Cadena Cartier 3mm x 60cm', 'Cadenas', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('MJ31-092', 'Cadena Tradicional 3.6mm x 50cm', 'Cadena tradicional de plata 925, 3.6mm de grosor y 50cm de largo. Diseño versátil y atemporal.', 41800, 3, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/cadena-tradicional-3.6mm-50cm', 'Cadena Tradicional 3.6mm x 50cm', 'Cadenas', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('MJ31-056', 'Cadena Gucci Marina Reversible Martillada 4mm x 50cm', 'Cadena Gucci Marina de plata 925 con acabado reversible martillado, 4mm de grosor y 50cm de largo.', 39982, 3, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/cadena-gucci-marina-4mm-50cm', 'Cadena Gucci Marina Reversible Martillada 4mm x 50cm', 'Cadenas', 0, 0, datetime('now'), datetime('now'));

-- COLGANTES (DAGLAM) - Precios corregidos según inventario
INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP1189-00-00', 'Colgante Signo Peso Masculino', 'Colgante de plata 925 con diseño de signo peso masculino. Elegante y simbólico.', 3868, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-signo-peso-masculino', 'Colgante Signo Peso Masculino', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0997-00-00', 'Colgante Placa Graduación 20x15mm', 'Colgante de plata 925 en forma de placa para graduación, 20x15mm. Perfecto para personalizar.', 4038, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-placa-graduacion-20x15', 'Colgante Placa Graduación 20x15mm', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0618-00-00', 'Colgante Cruz Florenzada con Microcircones', 'Colgante de plata 925 con cruz florenzada decorada con microcircones. Diseño refinado y brillante.', 3528, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-cruz-florenzada-microcircones', 'Colgante Cruz Florenzada con Microcircones', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0321-00-00', 'Colgante Rombo Liso', 'Colgante de plata 925 en forma de rombo liso. Diseño minimalista y elegante.', 4038, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-rombo-liso', 'Colgante Rombo Liso', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0289-00-00', 'Colgante Micro Circon Cilindro', 'Colgante de plata 925 con microcircones en forma cilíndrica. Brillo excepcional.', 4123, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-micro-circon-cilindro', 'Colgante Micro Circon Cilindro', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0256-00-00', 'Colgante Diamante', 'Colgante de plata 925 con diseño de diamante. Clásico y sofisticado.', 4463, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-diamante', 'Colgante Diamante', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0245-00-00', 'Colgante Símbolo OM con Circon', 'Colgante de plata 925 con símbolo OM decorado con circones. Espiritual y elegante.', 4633, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-simbolo-om-circon', 'Colgante Símbolo OM con Circon', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0234-00-00', 'Colgante Placa de Graduación 12x15mm', 'Colgante de plata 925 en forma de placa para graduación, 12x15mm. Ideal para personalizar.', 4888, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-placa-graduacion-12x15', 'Colgante Placa de Graduación 12x15mm', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0223-00-00', 'Colgante Triángulo Ojo Horus', 'Colgante de plata 925 con diseño de triángulo y ojo de Horus. Místico y poderoso.', 4888, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-triangulo-ojo-horus', 'Colgante Triángulo Ojo Horus', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0212-00-00', 'Colgante Ángel con Alas Envejecido', 'Colgante de plata 925 con diseño de ángel con alas en acabado envejecido. Vintage y elegante.', 5313, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-angel-alas-envejecido', 'Colgante Ángel con Alas Envejecido', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0201-00-00', 'Colgante Círculo con Centro Cruz', 'Colgante de plata 925 con diseño de círculo y cruz en el centro. Simbólico y elegante.', 5398, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-circulo-centro-cruz', 'Colgante Círculo con Centro Cruz', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0190-00-00', 'Colgante Círculo y Microcircones', 'Colgante de plata 925 con diseño circular decorado con microcircones. Brillante y moderno.', 5398, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-circulo-microcircones', 'Colgante Círculo y Microcircones', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0179-00-00', 'Colgante Cruz Fleury 18x28mm', 'Colgante de plata 925 con cruz Fleury, 18x28mm. Diseño clásico y elegante.', 5568, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-cruz-fleury-18x28', 'Colgante Cruz Fleury 18x28mm', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0168-00-00', 'Colgante Alas Ángel Envejecido', 'Colgante de plata 925 con diseño de alas de ángel en acabado envejecido. Vintage y espiritual.', 5568, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-alas-angel-envejecido', 'Colgante Alas Ángel Envejecido', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0157-00-00', 'Colgante Cruz en Ichthys Envejecida', 'Colgante de plata 925 con cruz dentro de símbolo Ichthys en acabado envejecido. Simbólico y elegante.', 6333, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-cruz-ichthys-envejecida', 'Colgante Cruz en Ichthys Envejecida', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0146-00-00', 'Colgante Medalla Rosa de los Vientos', 'Colgante de plata 925 con diseño de rosa de los vientos. Náutico y elegante.', 3528, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-medalla-rosa-vientos', 'Colgante Medalla Rosa de los Vientos', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0135-00-00', 'Colgante Llave de la Vida 12x25', 'Colgante de plata 925 con diseño de llave de la vida egipcia, 12x25mm. Místico y poderoso.', 4123, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-llave-vida-12x25', 'Colgante Llave de la Vida 12x25', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0124-00-00', 'Colgante Llave de la Vida 18x35', 'Colgante de plata 925 con diseño de llave de la vida egipcia, 18x35mm. Místico y poderoso.', 4803, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-llave-vida-18x35', 'Colgante Llave de la Vida 18x35', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0113-00-00', 'Colgante Triangular con Círculo en Medio', 'Colgante de plata 925 con diseño triangular y círculo en el centro. Geométrico y moderno.', 5228, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-triangular-circulo-medio', 'Colgante Triangular con Círculo en Medio', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0102-00-00', 'Colgante Cruz Fleury 17x25mm', 'Colgante de plata 925 con cruz Fleury, 17x25mm. Diseño clásico y elegante.', 5058, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-cruz-fleury-17x25', 'Colgante Cruz Fleury 17x25mm', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0091-00-00', 'Colgante Espiral Reiki', 'Colgante de plata 925 con diseño de espiral Reiki. Espiritual y energético.', 5908, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-espiral-reiki', 'Colgante Espiral Reiki', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0080-00-00', 'Colgante Estrella Rosa de los Vientos', 'Colgante de plata 925 con diseño de estrella rosa de los vientos. Náutico y elegante.', 6418, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-estrella-rosa-vientos', 'Colgante Estrella Rosa de los Vientos', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0069-00-00', 'Colgante Cruz Negra', 'Colgante de plata 925 con diseño de cruz negra. Elegante y sobrio.', 7778, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-cruz-negra', 'Colgante Cruz Negra', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0058-00-00', 'Colgante Estrella de David', 'Colgante de plata 925 con diseño de estrella de David. Simbólico y elegante.', 7778, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-estrella-david', 'Colgante Estrella de David', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('PP0047-00-00', 'Colgante Cruz Tallada', 'Colgante de plata 925 con cruz tallada. Diseño artesanal y elegante.', 9733, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-cruz-tallada', 'Colgante Cruz Tallada', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured, created_at, updated_at) VALUES
('P10277-00-00', 'Colgante Paño Limpieza', 'Colgante de plata 925 con paño de limpieza incluido. Mantén tus joyas brillantes.', 1636, 1, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/colgantes/colgante-pano-limpieza', 'Colgante Paño Limpieza', 'Colgantes', 0, 0, datetime('now'), datetime('now'));

-- NOTA: Las imágenes URL son placeholders. Debes actualizarlas con las URLs reales de Cloudinary o tu servicio de imágenes.
-- NOTA: Los precios están basados en "VENTA UND" del inventario. Si hay discrepancias, ajusta según corresponda.
-- NOTA: El stock está basado en "Cantidad en existencias". Verifica y actualiza según el inventario real.

