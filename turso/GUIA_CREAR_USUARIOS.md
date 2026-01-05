# Guía para Crear Usuarios en Turso

## Opción 1: Usar la tabla de usuarios (Recomendado)

### Paso 1: Ejecutar el script de creación de tabla
```sql
-- Ejecutar: turso/create_users_table.sql
```

### Paso 2: Crear un nuevo usuario

Para crear un nuevo usuario, necesitas generar un hash bcrypt de la contraseña. Puedes usar:

**Opción A: Usar Node.js (en el proyecto)**
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('tu_password_aqui', 10);
console.log(hash);
```

**Opción B: Usar herramienta online**
- Visita: https://bcrypt-generator.com/
- Ingresa tu contraseña
- Copia el hash generado

**Opción C: Usar Python**
```python
import bcrypt
password = b"tu_password_aqui"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
print(hashed.decode())
```

### Paso 3: Insertar el usuario en la BD

```sql
INSERT INTO users (
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
  'user-username-001',  -- ID único
  'username',            -- Nombre de usuario
  'hash_bcrypt_aqui',    -- Hash de la contraseña
  'email@ejemplo.com',   -- Email (opcional)
  'Nombre Completo',     -- Nombre completo (opcional)
  1,                     -- 1 = activo, 0 = inactivo
  'admin',               -- 'admin' o 'editor'
  datetime('now'),
  datetime('now')
);
```

### Ejemplo: Crear usuario "testuser" con password "Test123$"

```sql
INSERT INTO users (
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
  'user-testuser-001',
  'testuser',
  '$2b$10$EJEMPLO_HASH_AQUI',  -- Reemplazar con hash real
  'test@gotra.cl',
  'Usuario de Prueba',
  1,
  'admin',
  datetime('now'),
  datetime('now')
);
```

## Opción 2: Modificar auth.ts (Método actual - Hardcodeado)

Si prefieres mantener el método actual (hardcodeado), edita `src/utils/auth.ts`:

```typescript
const AUTH_USER = 'adminsgotra';
const AUTH_PASSWORD = '$Gotra23$';
```

**Nota:** Este método es menos seguro y no escalable, pero más simple.

## Verificar usuarios existentes

```sql
SELECT id, username, email, is_active, role, created_at FROM users;
```

## Desactivar un usuario (sin eliminarlo)

```sql
UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE username = 'username';
```

## Eliminar un usuario

```sql
DELETE FROM users WHERE username = 'username';
```

## Cambiar contraseña de un usuario

1. Genera el nuevo hash bcrypt de la nueva contraseña
2. Ejecuta:

```sql
UPDATE users 
SET password_hash = 'nuevo_hash_aqui', 
    updated_at = datetime('now') 
WHERE username = 'username';
```

