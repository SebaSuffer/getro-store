# 🎯 Pasos Inmediatos - Turso

## Estado Actual
- ✅ Base de datos `joystore` creada
- ✅ Tabla `newsletter_subscribers` existe
- ⏳ Faltan tablas: `products`, `stock_history`, `orders`

## Paso 1: Ejecutar Schema SQL

En el dashboard de Turso:

1. Ve a tu base de datos `joystore`
2. Haz clic en **"SQL Console"** (arriba a la derecha)
3. Copia y pega el contenido de `turso/schema.sql`
4. Haz clic en **"Run"** o presiona `Ctrl+Enter`

**O usando CLI:**

```bash
turso db shell joystore < turso/schema.sql
```

## Paso 2: Verificar Tablas Creadas

En SQL Console, ejecuta:

```sql
.tables
```

Deberías ver:
- products
- stock_history
- orders
- newsletter_subscribers

## Paso 3: Insertar Productos Iniciales

En SQL Console, ejecuta el contenido de `turso/migrate-products.sql`:

```sql
-- Copia y pega todo el contenido de migrate-products.sql
```

O usando CLI:

```bash
turso db shell joystore < turso/migrate-products.sql
```

## Paso 4: Verificar Productos

```sql
SELECT COUNT(*) FROM products;
SELECT name, price, stock FROM products LIMIT 5;
```

Deberías ver 12 productos.

## Paso 5: Obtener Credenciales

En Turso Dashboard:
1. Ve a tu base de datos `joystore`
2. Haz clic en **"Connect"** o **"Settings"**
3. Copia la **Database URL** (algo como `libsql://xxx.turso.io`)
4. Crea un token: **"Tokens"** → **"Create Token"**
5. Copia el token

## Paso 6: Configurar en Vercel

1. Ve a Vercel → Tu proyecto → **Settings** → **Environment Variables**
2. Agrega:
   - `TURSO_DATABASE_URL` = tu Database URL
   - `TURSO_AUTH_TOKEN` = tu token
3. Aplica a: **Production**, **Preview**, **Development**

## Paso 7: Configurar Dominio (Opcional)

Si tienes un dominio personalizado, sigue las instrucciones en `CONFIGURAR_DOMINIO.md`.

## Listo para Código

Una vez completados estos pasos, avísame y te daré el código para conectar.

