-- ============================================
-- Tabla para almacenar cadenas con precio por marca
-- ============================================
-- Esta tabla almacena las cadenas disponibles con su precio estandarizado por marca
-- Solo hay una cadena por marca (un tamaño por marca)

CREATE TABLE IF NOT EXISTS chains (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL UNIQUE, -- Marca de la cadena (GUCCI, CARTIER, etc.)
  name TEXT NOT NULL, -- Nombre descriptivo (ej: "Cadena Cartier 3mm x 60cm")
  thickness TEXT, -- Grosor (ej: "3MM")
  length TEXT, -- Largo (ej: "60CM")
  price INTEGER NOT NULL DEFAULT 0, -- Precio estandarizado por marca
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  image_alt TEXT,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_chains_brand ON chains(brand);
CREATE INDEX IF NOT EXISTS idx_chains_active ON chains(is_active);

-- Tabla para relacionar qué cadenas están disponibles para cada colgante
CREATE TABLE IF NOT EXISTS pendant_chain_options (
  id TEXT PRIMARY KEY,
  pendant_id TEXT NOT NULL, -- ID del colgante (producto)
  chain_brand TEXT NOT NULL, -- Marca de la cadena disponible
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pendant_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (chain_brand) REFERENCES chains(brand) ON DELETE CASCADE,
  UNIQUE(pendant_id, chain_brand)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pendant_chain_pendant ON pendant_chain_options(pendant_id);
CREATE INDEX IF NOT EXISTS idx_pendant_chain_brand ON pendant_chain_options(chain_brand);
CREATE INDEX IF NOT EXISTS idx_pendant_chain_active ON pendant_chain_options(is_active);

