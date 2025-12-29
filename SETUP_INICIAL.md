# 🚀 Setup Inicial - GOTRA Joyería

## ✅ Checklist de Configuración

### 1. Variables de Entorno en Vercel

**IMPORTANTE:** El token en la imagen parece estar truncado. Copia el token COMPLETO desde Turso.

Ve a Vercel → Settings → Environment Variables y agrega:

```
TURSO_DATABASE_URL = libsql://joystore-sebasuffer.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN = [TOKEN COMPLETO DESDE TURSO]
```

**Ver archivo:** `VARIABLES_ENTORNO_VERCEL.txt` para copiar y pegar.

---

### 2. Configurar Base de Datos en Turso

1. Ve a tu base de datos en Turso
2. Ejecuta `turso/schema.sql` para crear las tablas
3. Ejecuta `turso/migrate-products.sql` para insertar los productos iniciales

**Archivos SQL:**
- `turso/schema.sql` - Crea las tablas
- `turso/migrate-products.sql` - Inserta 12 productos iniciales

---

### 3. Verificar Archivos Esenciales

✅ **Configuración:**
- `package.json` - Dependencias
- `astro.config.mjs` - Configuración de Astro
- `tsconfig.json` - TypeScript
- `tailwind.config.mjs` - Tailwind CSS
- `vercel.json` - Configuración de Vercel

✅ **Base de Datos:**
- `src/utils/turso.ts` - Cliente de Turso
- `turso/schema.sql` - Schema de BD
- `turso/migrate-products.sql` - Datos iniciales

✅ **API Routes:**
- `src/pages/api/products/index.ts` - GET todos los productos
- `src/pages/api/products/[id].ts` - GET/PUT/DELETE producto
- `src/pages/api/stock/[id].ts` - GET/PUT stock
- `src/pages/api/newsletter/subscribe.ts` - POST suscripción
- `src/pages/api/newsletter/subscribers.ts` - GET suscriptores
- `src/pages/api/orders/index.ts` - POST orden

✅ **Componentes:**
- `src/components/ProductLoader.tsx` - Carga productos en cliente
- `src/components/AdminPanel.tsx` - Panel de administración
- `src/data/products.ts` - Funciones de productos

---

### 4. Después del Deploy

1. Verifica que las variables de entorno estén configuradas
2. Revisa los logs en Vercel para ver si hay errores
3. Abre la consola del navegador (F12) y busca logs que empiecen con:
   - `[PRODUCT-LOADER]`
   - `[PRODUCTS-CLIENT]`
   - `[API-PRODUCTS-xxxxx]`

---

## 📝 Notas

- Los productos usan imágenes de Cloudinary
- El admin panel carga productos desde la API
- La página principal usa ProductLoader para cargar en el cliente
- Todos los logs están mejorados para debugging




