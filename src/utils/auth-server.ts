import bcrypt from 'bcryptjs';
import { getTursoClient } from './turso';

const ADMIN_USERNAME = 'adminsgotra';
/** Contraseña inicial del admin (solo para seed si no hay hash válido) */
const DEFAULT_ADMIN_PASSWORD = '$Gotra23$';
const ADMIN_USER_ID = 'user-adminsgotra-001';
const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export type DbUser = {
  id: string;
  username: string;
  password_hash: string;
  email: string | null;
  is_active: number;
  role: string;
};

export const getMinPasswordLength = () => MIN_PASSWORD_LENGTH;

const ensureUsersTable = async (
  client: NonNullable<ReturnType<typeof getTursoClient>>
): Promise<void> => {
  await client.execute(`
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
    )
  `);

  await client.execute(
    'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)'
  );

  const existing = await client.execute({
    sql: 'SELECT id, password_hash FROM users WHERE username = ?',
    args: [ADMIN_USERNAME],
  });

  const needsSeed =
    existing.rows.length === 0 ||
    !isValidBcryptHash(String((existing.rows[0] as any).password_hash || ''));

  if (!needsSeed) return;

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, BCRYPT_ROUNDS);

  if (existing.rows.length === 0) {
    await client.execute({
      sql: `INSERT INTO users (id, username, password_hash, email, full_name, is_active, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, 'admin', datetime('now'), datetime('now'))`,
      args: [
        ADMIN_USER_ID,
        ADMIN_USERNAME,
        passwordHash,
        'admin@gotra.cl',
        'Administrador GOTRA',
      ],
    });
    return;
  }

  // Hash placeholder / inválido: sincronizar con la contraseña conocida del deploy
  await client.execute({
    sql: `UPDATE users
          SET password_hash = ?, updated_at = datetime('now')
          WHERE username = ?`,
    args: [passwordHash, ADMIN_USERNAME],
  });
};

const isValidBcryptHash = (hash: string): boolean => {
  return /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash);
};

export const getUserByUsername = async (
  username: string
): Promise<DbUser | null> => {
  const client = getTursoClient();
  if (!client) {
    throw new Error('Database not configured');
  }

  await ensureUsersTable(client);

  const result = await client.execute({
    sql: `SELECT id, username, password_hash, email, is_active, role
          FROM users WHERE username = ? LIMIT 1`,
    args: [username.trim()],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0] as any;
  return {
    id: row.id,
    username: row.username,
    password_hash: row.password_hash,
    email: row.email || null,
    is_active: Number(row.is_active),
    role: row.role || 'admin',
  };
};

export const verifyUserPassword = async (
  username: string,
  password: string
): Promise<DbUser | null> => {
  const user = await getUserByUsername(username);
  if (!user || !user.is_active) return null;

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) return null;

  return user;
};

export const updateLastLogin = async (userId: string): Promise<void> => {
  const client = getTursoClient();
  if (!client) return;

  await client.execute({
    sql: `UPDATE users SET last_login = datetime('now') WHERE id = ?`,
    args: [userId],
  });
};

export const changeUserPassword = async (
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: true } | { success: false; error: string }> => {
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    };
  }

  if (newPassword === currentPassword) {
    return {
      success: false,
      error: 'La nueva contraseña debe ser distinta a la actual',
    };
  }

  const user = await verifyUserPassword(username, currentPassword);
  if (!user) {
    return { success: false, error: 'La contraseña actual es incorrecta' };
  }

  const client = getTursoClient();
  if (!client) {
    return { success: false, error: 'Database not configured' };
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await client.execute({
    sql: `UPDATE users
          SET password_hash = ?, updated_at = datetime('now')
          WHERE id = ?`,
    args: [passwordHash, user.id],
  });

  return { success: true };
};
