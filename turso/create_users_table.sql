-- ============================================
-- Tabla de usuarios para autenticación admin
-- ============================================
-- La contraseña se almacena como hash bcrypt.
-- El seed real se crea automáticamente en el primer login
-- (src/utils/auth-server.ts) con la clave inicial del admin.
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Verificación (no inserta hash placeholder aquí)
-- SELECT id, username, email, is_active, role FROM users;
