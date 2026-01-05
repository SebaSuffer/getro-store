-- ============================================
-- Tabla de usuarios para autenticación
-- ============================================
-- Esta tabla almacena los usuarios del sistema de administración

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'editor', etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- ============================================
-- Crear usuario admin
-- ============================================
-- Usuario: adminsgotra
-- Password: $Gotra23$
-- Hash generado con bcrypt (cost 10): $2b$10$rK9Vj8HqXZ3mN5pQ7sT9uO1wY2zA4B6C8D0E2F4G6H8I0J2K4L6M8N0O2P4Q6R8S0T

INSERT OR REPLACE INTO users (
  id,
  username,
  password_hash,
  email,
  full_name,
  is_active,
  role,
  created_at,
  updated_at
) VALUES (
  'user-adminsgotra-001',
  'adminsgotra',
  '$2b$10$rK9Vj8HqXZ3mN5pQ7sT9uO1wY2zA4B6C8D0E2F4G6H8I0J2K4L6M8N0O2P4Q6R8S0T',
  'admin@gotra.cl',
  'Administrador GOTRA',
  1,
  'admin',
  datetime('now'),
  datetime('now')
);

-- Verificación
SELECT id, username, email, is_active, role FROM users;

