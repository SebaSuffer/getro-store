CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  image_alt TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO categories (id, name, image_url, image_alt, display_order) VALUES
('cat-cadenas', 'Cadenas', 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1/cadenas/cadena-cartier-3mm-60cm', 'Cadenas de plata', 1),
('cat-pulseras', 'Pulseras', 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458847/DSC05015_kiamyb.jpg', 'Pulseras de plata', 2),
('cat-anillos', 'Anillos', 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458847/DSC05014_tpyofl.jpg', 'Anillos de plata', 3),
('cat-colgantes', 'Colgantes', 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05010_zfxyxv.jpg', 'Colgantes de plata', 4),
('cat-aros', 'Aros', 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05008_clyhgx.jpg', 'Aros de plata', 5),
('cat-esclavas', 'Esclavas', 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05012_bbchhj.jpg', 'Esclavas de plata', 6);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);
