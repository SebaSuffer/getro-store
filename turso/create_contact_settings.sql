-- ============================================
-- Tabla para configuración de Contacto (email y teléfono)
-- ============================================

CREATE TABLE IF NOT EXISTS contact_settings (
  id TEXT PRIMARY KEY DEFAULT 'contact_001',
  email TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Valores iniciales (los actuales de la tienda)
INSERT OR IGNORE INTO contact_settings (
  id,
  email,
  phone,
  created_at,
  updated_at
) VALUES (
  'contact_001',
  'contacto.gotrachile@gmail.com',
  '+56 9 3069 3754',
  datetime('now'),
  datetime('now')
);
