# 🔧 Solución: Imágenes No Se Cargan en Vercel

## Problema
Las imágenes de los productos no se están cargando en producción (Vercel), mostrando solo el texto del nombre del producto sobre un fondo blanco.

## Posibles Causas y Soluciones

### 1. Verificar que las imágenes estén en el repositorio

```bash
# Verificar que las imágenes estén rastreadas por Git
git ls-files public/images/ | wc -l

# Debería mostrar 51 archivos (o el número de imágenes que tienes)
```

**Si faltan imágenes:**
```bash
git add public/images/
git commit -m "Agregar imágenes faltantes"
git push
```

### 2. Verificar el Build en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Revisa los **Build Logs** de la última deployment
3. Busca errores relacionados con imágenes o archivos estáticos
4. Verifica que el build incluya la carpeta `public/images/`

### 3. Forzar un Rebuild

1. En Vercel Dashboard, ve a **Deployments**
2. Haz clic en los **3 puntos** del último deployment
3. Selecciona **Redeploy**
4. Esto forzará un nuevo build que debería incluir las imágenes

### 4. Verificar Rutas de Imágenes

Las rutas en el código deben ser:
- ✅ Correcto: `/images/DSC05016.jpg`
- ❌ Incorrecto: `images/DSC05016.jpg` (sin la barra inicial)
- ❌ Incorrecto: `./images/DSC05016.jpg`

### 5. Verificar Configuración de Vercel

El archivo `vercel.json` ya está configurado con headers para imágenes:
```json
{
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 6. Verificar en el Navegador

1. Abre tu sitio en Vercel
2. Abre las **DevTools** (F12)
3. Ve a la pestaña **Network**
4. Intenta cargar una página con productos
5. Busca las peticiones a `/images/...`
6. Verifica:
   - **Status Code**: Debe ser `200` (no `404`)
   - **URL**: Debe ser la URL completa de Vercel + `/images/...`

### 7. Solución Temporal: Usar CDN o Imágenes Externas

Si las imágenes siguen sin cargar, puedes:
1. Subir las imágenes a un servicio de CDN (Cloudinary, Imgix, etc.)
2. Actualizar las URLs en `src/data/products.ts` con las URLs del CDN

### 8. Verificar Tamaño de Archivos

Las imágenes muy grandes pueden causar problemas:
- **Recomendado**: Máximo 2MB por imagen
- **Optimizado**: Usar formato WebP cuando sea posible
- **Compresión**: Comprimir imágenes antes de subirlas

## Pasos Inmediatos a Seguir

1. ✅ **Verificar Build Logs en Vercel**
   - Busca errores relacionados con `public/images/`
   - Verifica que el build sea exitoso

2. ✅ **Forzar Redeploy**
   - Esto asegurará que las imágenes se incluyan en el build

3. ✅ **Verificar en el Navegador**
   - Abre DevTools → Network
   - Verifica las peticiones a imágenes
   - Revisa los errores 404 si los hay

4. ✅ **Verificar que las imágenes estén en Git**
   ```bash
   git ls-files public/images/ | head -10
   ```

## Si Nada Funciona

1. **Verificar configuración de Astro:**
   - Asegúrate de que `astro.config.mjs` tenga `output: 'server'`
   - Verifica que el adapter de Vercel esté configurado

2. **Contactar Soporte de Vercel:**
   - Si el problema persiste, puede ser un problema específico de Vercel
   - Proporciona los logs de build y los errores del navegador

3. **Alternativa: Usar modo híbrido:**
   - Cambiar a `output: 'hybrid'` en `astro.config.mjs`
   - Esto puede ayudar con archivos estáticos

## Notas

- Las imágenes en `public/` deberían copiarse automáticamente durante el build
- En desarrollo local, las imágenes deberían funcionar correctamente
- El problema suele estar en la configuración de producción (Vercel)

