# 🔧 Solución Definitiva: Imágenes en Vercel

## El Problema Real

El `config.json` generado por el adapter de Vercel tiene este orden de rutas:

```json
{
  "routes": [
    { "src": "^/_astro/(.*)$", ... },
    { "handle": "filesystem" },  // ← Debería servir archivos estáticos
    { "src": "/.*", "dest": "render" }  // ← PERO esto captura TODO antes
  ]
}
```

**El problema:** La ruta catch-all `"/.*"` captura las peticiones a `/images/` ANTES de que el filesystem handler pueda servir los archivos estáticos.

## Solución 1: Modificar vercel.json (Ya aplicado)

He agregado una ruta específica para `/images/` en `vercel.json` que se ejecuta antes del catch-all:

```json
{
  "routes": [
    {
      "src": "/images/(.*)",
      "dest": "/images/$1"
    }
  ]
}
```

Esto fuerza a Vercel a servir los archivos estáticos de `/images/` directamente.

## Solución 2: Verificar en Vercel Dashboard

### Cómo verificar que las rutas están correctas:

1. **Ve a Vercel Dashboard** → Tu proyecto
2. **Settings** → **Functions**
3. Busca la sección de **"Routes"** o **"Routing"**
4. Deberías ver las rutas configuradas

**O mejor aún:**

1. **Ve a Deployments** → Último deployment
2. **View Function Logs** o **View Build Logs**
3. Busca mensajes sobre `public/images/` o `static/images/`

## Solución 3: Usar un CDN (Más confiable)

Si las imágenes siguen sin cargar, la solución más práctica es usar un CDN:

### Opción A: Cloudinary (Gratis hasta cierto límite)

1. Crea cuenta en [Cloudinary](https://cloudinary.com/)
2. Sube las imágenes
3. Obtén las URLs públicas
4. Actualiza `src/data/products.ts` con las nuevas URLs

### Opción B: Imgix (Similar)

1. Crea cuenta en [Imgix](https://www.imgix.com/)
2. Sube las imágenes
3. Usa las URLs generadas

### Opción C: GitHub como CDN (Gratis)

1. Crea un repositorio público solo para imágenes
2. Sube las imágenes ahí
3. Usa las URLs raw de GitHub:
   ```
   https://raw.githubusercontent.com/tu-usuario/tu-repo/main/images/DSC05016.jpg
   ```

## Solución 4: Verificar Build Output

Para confirmar que las imágenes se están copiando:

1. **Haz build local:**
   ```bash
   npm run build
   ```

2. **Verifica que existan:**
   ```bash
   # Windows PowerShell
   Test-Path ".vercel/output/static/images/DSC05016.jpg"
   # Debería devolver True
   ```

3. **Cuenta las imágenes:**
   ```bash
   Get-ChildItem ".vercel/output/static/images" | Measure-Object | Select-Object -ExpandProperty Count
   # Debería mostrar 51
   ```

## Solución 5: Debug en Vercel

### Verificar en el navegador:

1. Abre tu sitio en Vercel
2. Abre DevTools (F12) → **Network**
3. Intenta acceder directamente a una imagen:
   ```
   https://tu-dominio.vercel.app/images/DSC05016.jpg
   ```
4. Verifica:
   - **Status Code**: Debe ser `200` (no `404`)
   - **Response Headers**: Debe incluir `Content-Type: image/jpeg`
   - **Size**: Debe mostrar el tamaño del archivo (no 0 bytes)

### Si sigue dando 404:

1. **Verifica la URL exacta** en el código
2. **Compara** con la URL que intentas acceder
3. **Revisa** si hay diferencias en mayúsculas/minúsculas

## Solución 6: Cambiar a Static Output (Último recurso)

Si nada funciona y no necesitas las rutas API en producción inmediatamente:

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'static', // Cambiar a static
  // adapter: vercel(), // Comentar el adapter
});
```

**⚠️ Esto deshabilitará las rutas API** (`/api/mercadopago/...`, `/api/transbank/...`)

## Recomendación Final

**Para producción, usa un CDN:**
- ✅ Más confiable
- ✅ Mejor rendimiento
- ✅ Optimización automática de imágenes
- ✅ No depende de la configuración de Vercel

**Para desarrollo rápido:**
- Usa la Solución 1 (modificar vercel.json) que ya aplicamos
- Haz redeploy
- Si funciona, perfecto
- Si no, migra a CDN

