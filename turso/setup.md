# 🗄️ Configuración de Turso para GOTRA

## Paso 1: Crear cuenta y base de datos en Turso

1. Ve a [Turso](https://turso.tech/) y crea una cuenta
2. Una vez dentro del dashboard, haz clic en **"Create Database"**
3. Configura:
   - **Database Name**: `gotra-joyeria`
   - **Region**: Elige la región más cercana (ej: `us-east-1`)
   - **Primary Region**: La misma región
4. Haz clic en **"Create"**

## Paso 2: Crear un token de acceso

1. En el dashboard de Turso, ve a **"Settings"** → **"Access Tokens"**
2. Haz clic en **"Create Token"**
3. Dale un nombre (ej: `gotra-production`)
4. **Copia el token** (solo se muestra una vez, guárdalo bien)

## Paso 3: Instalar Turso CLI

### Windows (PowerShell):
```powershell
powershell -c "irm get.turso.tech/install.ps1 | iex"
```

### macOS/Linux:
```bash
curl -sSfL https://get.turso.tech/install.sh | bash
```

## Paso 4: Autenticarse con Turso CLI

```bash
turso auth login
```

Te pedirá que abras un enlace en el navegador para autenticarte.

## Paso 5: Conectar a tu base de datos

```bash
turso db show gotra-joyeria
```

Esto te mostrará la información de tu base de datos, incluyendo la URL de conexión.

## Paso 6: Obtener la URL de conexión y token

```bash
turso db tokens create gotra-joyeria
```

Esto te dará un token específico para esta base de datos. Guárdalo.

Para obtener la URL:
```bash
turso db show gotra-joyeria --url
```

## Paso 7: Ejecutar el schema SQL

```bash
turso db shell gotra-joyeria < turso/schema.sql
```

O si prefieres hacerlo manualmente:
```bash
turso db shell gotra-joyeria
```

Y luego pega el contenido de `turso/schema.sql`

## Paso 8: Verificar que las tablas se crearon

```bash
turso db shell gotra-joyeria
```

Ejecuta:
```sql
.tables
```

Deberías ver:
- products
- stock_history
- orders
- newsletter_subscribers

## Paso 9: Configurar variables de entorno en Vercel

1. Ve a Vercel → Tu proyecto → **Settings** → **Environment Variables**
2. Agrega estas variables:

```
TURSO_DATABASE_URL=libsql://tu-database-url.turso.io
TURSO_AUTH_TOKEN=tu-token-aqui
```

**IMPORTANTE**: 
- Reemplaza `tu-database-url` con la URL real de tu base de datos
- Reemplaza `tu-token-aqui` con el token que obtuviste en el Paso 6
- Agrega estas variables para **Production**, **Preview** y **Development**

## Paso 10: Insertar productos iniciales

Una vez que el código esté listo, ejecuta el script de migración que crearemos para insertar los productos iniciales desde `src/data/products.ts` a la base de datos.

## Verificación

Para verificar que todo funciona:

```bash
turso db shell gotra-joyeria
```

Ejecuta:
```sql
SELECT COUNT(*) FROM products;
```

Debería mostrar 0 inicialmente (hasta que migres los datos).

## Comandos útiles

- Ver todas las bases de datos: `turso db list`
- Ver información de una BD: `turso db show gotra-joyeria`
- Abrir shell SQL: `turso db shell gotra-joyeria`
- Ver logs: `turso db logs gotra-joyeria`

