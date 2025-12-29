-- Script para migrar productos iniciales a Turso
-- Ejecutar después de crear las tablas

-- Insertar productos desde src/data/products.ts
-- Estos son los productos iniciales que tienes actualmente

INSERT INTO products (id, name, description, price, stock, image_url, image_alt, category, is_new, is_featured) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Colgante Ala de Plata', 'Colgante elegante de plata sólida 925 con diseño de ala estilizada', 45990, 15, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458847/DSC05016_dwuz7c.jpg', 'Colgante Ala de Plata', 'Colgantes', 1, 1),
('550e8400-e29b-41d4-a716-446655440002', 'Colgante Corona de Plata', 'Colgante de plata sólida 925 con diseño de corona elegante', 35990, 12, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458847/DSC05015_kiamyb.jpg', 'Colgante Corona de Plata', 'Colgantes', 0, 1),
('550e8400-e29b-41d4-a716-446655440003', 'Colgante Cruz de Plata - Estilo Clásico', 'Colgante de plata sólida 925 con diseño de cruz clásica y elegante, perfecto para uso diario', 28990, 20, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458847/DSC05014_tpyofl.jpg', 'Colgante Cruz de Plata - Estilo Clásico', 'Colgantes', 1, 1),
('550e8400-e29b-41d4-a716-446655440004', 'Colgante Cuadrado con Círculo de Plata', 'Colgante de plata sólida 925 con diseño geométrico cuadrado y círculo central', 52990, 8, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05013_ls4kjv.jpg', 'Colgante Cuadrado con Círculo de Plata', 'Colgantes', 0, 1),
('550e8400-e29b-41d4-a716-446655440005', 'Colgante Ancla de Plata', 'Colgante de plata sólida 925 con diseño de ancla náutica, símbolo de estabilidad y esperanza', 37990, 10, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05012_bbchhj.jpg', 'Colgante Ancla de Plata', 'Colgantes', 0, 0),
('550e8400-e29b-41d4-a716-446655440006', 'Colgante Cruz Estilizada de Plata', 'Colgante de plata sólida 925 con diseño de cruz estilizada y efecto contrastante', 32990, 15, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05010_zfxyxv.jpg', 'Colgante Cruz Estilizada de Plata', 'Colgantes', 1, 0),
('550e8400-e29b-41d4-a716-446655440007', 'Colgante Cruz de Plata - Clásico', 'Colgante de plata sólida 925 con diseño de cruz clásica y elegante', 39990, 18, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05008_clyhgx.jpg', 'Colgante Cruz de Plata - Clásico', 'Colgantes', 1, 0),
('550e8400-e29b-41d4-a716-446655440008', 'Colgante Diamante de Plata', 'Colgante de plata sólida 925 con diseño de diamante facetado', 33990, 22, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05007_pbianr.jpg', 'Colgante Diamante de Plata', 'Colgantes', 0, 0),
('550e8400-e29b-41d4-a716-446655440009', 'Colgante Diamante de Plata - Estilo Moderno', 'Colgante de plata sólida 925 con diseño de diamante facetado en estilo moderno y brillante', 27990, 16, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05006_r56buj.jpg', 'Colgante Diamante de Plata - Estilo Moderno', 'Colgantes', 0, 0),
('550e8400-e29b-41d4-a716-446655440010', 'Colgante Árbol de la Vida de Plata', 'Colgante de plata sólida 925 con diseño del árbol de la vida, símbolo de crecimiento y conexión', 42990, 14, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05005_vz2ss2.jpg', 'Colgante Árbol de la Vida de Plata', 'Colgantes', 0, 0),
('550e8400-e29b-41d4-a716-446655440011', 'Colgante Cruz de Plata - Estilo Contemporáneo', 'Colgante de plata sólida 925 con diseño de cruz contemporánea y líneas estilizadas', 44990, 11, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05004_awkvea.jpg', 'Colgante Cruz de Plata - Estilo Contemporáneo', 'Colgantes', 1, 0),
('550e8400-e29b-41d4-a716-446655440012', 'Colgante Corazón de Plata', 'Colgante de plata sólida 925 con diseño de corazón elegante, perfecto como regalo de amor', 31990, 13, 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05003_n0s54y.jpg', 'Colgante Corazón de Plata', 'Colgantes', 0, 0);

-- Verificar que se insertaron correctamente
SELECT COUNT(*) as total_productos FROM products;
SELECT name, price, stock FROM products ORDER BY name;




