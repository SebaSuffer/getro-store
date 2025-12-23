# 📸 Guía Completa: Cloudinary + Vercel

## Parte 1: Configurar Cloudinary

### Paso 1: Crear Cuenta en Cloudinary

1. Ve a [https://cloudinary.com/](https://cloudinary.com/)
2. Haz clic en **"Sign Up for Free"**
3. Completa el formulario de registro
4. Verifica tu email

### Paso 2: Obtener Credenciales

1. Una vez dentro del dashboard, ve a **"API Keys"** (o Settings)
2. Encontrarás:
   - **Cloud Name**: `ddzoh72zv` (visible en el tag azul)
   - **API Key**: `537523844893242` (visible en la tabla)
   - **API Secret**: `xl5Ba5xinNaoDWfUyHxpCTLZwRk` (visible en la tabla)

3. **Tus credenciales:**
   - Cloud Name: `ddzoh72zv`
   - API Key: `537523844893242`
   - API Secret: `xl5Ba5xinNaoDWfUyHxpCTLZwRk` ⚠️ Manténlo privado

4. **Para el código solo necesitas el Cloud Name** - las URLs serán:
   ```
   https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/
   ```

### Paso 3: Subir Imágenes a Cloudinary

#### Opción A: Desde el Dashboard (Manual)

1. En el dashboard, ve a **"Media Library"**
2. Haz clic en **"Upload"**
3. Arrastra todas las imágenes de productos y logos
4. Espera a que se suban todas

#### Opción B: Desde la Terminal (Rápido)

```bash
# Instalar Cloudinary CLI (opcional)
npm install -g cloudinary-cli

# O usar el upload widget desde el dashboard
```

### Paso 4: Obtener URLs de las Imágenes

1. En **"Media Library"**, haz clic en cada imagen
2. En la parte inferior verás la **URL de la imagen**
3. La URL será algo como:
   ```
   https://res.cloudinary.com/tu-cloud-name/image/upload/v1234567890/dsc05016.jpg
   ```

4. **Copia todas las URLs** que necesites:
   - 12 imágenes de productos
   - 3 logos de pago
   - 1 imagen para hero (puede ser la misma que un producto)

### Paso 5: Optimizar URLs (Opcional pero Recomendado)

Cloudinary permite optimizar imágenes automáticamente:

**URL Base:**
```
https://res.cloudinary.com/tu-cloud-name/image/upload/
```

**URL Optimizada (recomendada):**
```
https://res.cloudinary.com/tu-cloud-name/image/upload/f_auto,q_auto,w_800/dsc05016.jpg
```

**Parámetros útiles:**
- `f_auto` - Formato automático (WebP si es compatible)
- `q_auto` - Calidad automática optimizada
- `w_800` - Ancho máximo 800px
- `c_limit` - Mantener proporción

## Parte 2: Actualizar Código con URLs de Cloudinary

### Paso 1: Actualizar `src/data/products.ts`

Reemplaza las rutas `/images/...` con las URLs de Cloudinary:

```typescript
// Antes:
image_url: '/images/dsc05016.jpg',

// Después (con tu Cloud Name):
image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/dsc05016.jpg',
```

### Paso 2: Actualizar Componentes

**`src/components/Hero.astro`:**
```astro
<img 
  src="https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/dsc05016.jpg"
  alt="Colección de joyas GOTRA"
/>
```

**`src/components/CategoriesSection.astro`:**
```typescript
const categoryImages: Record<string, string> = {
  'Cadenas': 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/dsc05016.jpg',
  'Pulseras': 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/dsc05015.jpg',
  'Anillos': 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/dsc05014.jpg',
  'Colgantes': 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/dsc05010.jpg',
  'Aros': 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/dsc05008.jpg',
  'Esclavas': 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/dsc05012.jpg',
};
```

**`src/components/PaymentMethods.astro`:**
```astro
<img src="https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/Transbank-1200px-logo.png" />
<img src="https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/Mercado-Pago-Logo.png" />
<img src="https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/transferencia-logo.png" />
```

### Paso 3: Crear Variable de Entorno (Opcional)

Para no repetir la URL base, puedes crear una variable:

**`src/utils/cloudinary.ts`:**
```typescript
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto';

export const getCloudinaryUrl = (imageName: string): string => {
  return `${CLOUDINARY_BASE_URL}/${imageName}`;
};
```

Luego usar:
```typescript
import { getCloudinaryUrl } from '../utils/cloudinary';
image_url: getCloudinaryUrl('dsc05016.jpg'),
```

## Parte 3: Configurar Vercel

### Paso 1: Variables de Entorno (Opcional)

Si usas variables de entorno para Cloudinary:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **Environment Variables**
3. Agrega (opcional, solo si necesitas subir imágenes desde el servidor):
   - `CLOUDINARY_CLOUD_NAME` = `ddzoh72zv`
   - `CLOUDINARY_API_KEY` = `537523844893242`
   - `CLOUDINARY_API_SECRET` = `xl5Ba5xinNaoDWfUyHxpCTLZwRk` ⚠️ Manténlo privado
   
   **Nota:** Si solo vas a usar URLs directas (no subir desde el código), NO necesitas estas variables.

### Paso 2: Redeploy

1. Después de actualizar el código con las URLs de Cloudinary
2. Haz commit y push a GitHub
3. Vercel hará deploy automáticamente
4. O haz **Redeploy** manual desde el dashboard

### Paso 3: Verificar

1. Abre tu sitio en Vercel
2. Abre DevTools (F12) → **Network**
3. Verifica que las imágenes se carguen desde Cloudinary
4. Deben aparecer como `res.cloudinary.com` en las peticiones

## Parte 4: Checklist Final

### Cloudinary
- [ ] Cuenta creada
- [ ] Credenciales copiadas (Cloud Name, API Key, API Secret)
- [ ] Todas las imágenes subidas
- [ ] URLs de todas las imágenes copiadas
- [ ] URLs optimizadas (con `f_auto,q_auto`)

### Código
- [ ] `src/data/products.ts` actualizado con URLs de Cloudinary
- [ ] `src/components/Hero.astro` actualizado
- [ ] `src/components/CategoriesSection.astro` actualizado
- [ ] `src/components/PaymentMethods.astro` actualizado
- [ ] Commit y push realizado

### Vercel
- [ ] Variables de entorno configuradas (si aplica)
- [ ] Redeploy realizado
- [ ] Imágenes cargando correctamente
- [ ] Verificado en DevTools → Network

## Notas Importantes

1. **Gratis hasta cierto límite**: Cloudinary tiene un plan gratuito generoso, pero revisa los límites
2. **CDN Global**: Las imágenes se servirán desde un CDN global, mejorando la velocidad
3. **Optimización Automática**: Cloudinary optimiza automáticamente las imágenes
4. **Backup**: Mantén las imágenes originales por si acaso

## Soporte

- [Documentación de Cloudinary](https://cloudinary.com/documentation)
- [Transformaciones de Imágenes](https://cloudinary.com/documentation/image_transformations)

