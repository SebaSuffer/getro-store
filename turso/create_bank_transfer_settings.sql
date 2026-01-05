-- ============================================
-- Tabla para configuración de Transferencia Bancaria
-- ============================================

CREATE TABLE IF NOT EXISTS bank_transfer_settings (
  id TEXT PRIMARY KEY DEFAULT 'bank_transfer_001',
  bank_name TEXT,
  account_type TEXT,
  account_number TEXT,
  rut TEXT,
  account_holder TEXT,
  email TEXT,
  is_enabled INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar registro inicial (deshabilitado)
INSERT OR IGNORE INTO bank_transfer_settings (
  id,
  bank_name,
  account_type,
  account_number,
  rut,
  account_holder,
  email,
  is_enabled,
  created_at,
  updated_at
) VALUES (
  'bank_transfer_001',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  datetime('now'),
  datetime('now')
);

