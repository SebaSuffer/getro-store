# 🆕 Recrear Proyecto en Vercel - Guía Paso a Paso

## Por Qué Recrear

Si los webhooks no se están creando automáticamente, es mejor empezar desde cero con una configuración limpia.

## Pasos para Recrear el Proyecto

### Paso 1: Borrar el Proyecto Actual

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona el proyecto **"gotra-joy"**
3. Ve a **Settings** → **General**
4. Desplázate hasta la sección **"Delete Project"**
5. Haz clic en el botón rojo **"Delete Project"**
6. Confirma la eliminación (escribe el nombre del proyecto si te lo pide)

### Paso 2: Crear Nuevo Proyecto

1. En el Dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Selecciona **"Import Git Repository"**
3. Busca o selecciona **"SebaSuffer/gotra-joy"**
4. Haz clic en **"Import"**

### Paso 3: Configurar el Proyecto

En la pantalla de configuración:

1. **Project Name**: `gotra-joy` (o el nombre que prefieras)
2. **Framework Preset**: Debería detectar automáticamente **"Astro"**
3. **Root Directory**: Déjalo vacío (o `/` si está prellenado)
4. **Build Command**: Déjalo vacío (Astro lo detecta automáticamente)
5. **Output Directory**: Déjalo vacío
6. **Install Command**: Déjalo vacío (usa `npm install` por defecto)

### Paso 4: Configurar Variables de Entorno (Opcional por ahora)

Si tienes variables de entorno configuradas:
1. En la pantalla de configuración, haz clic en **"Environment Variables"**
2. Agrega las variables que necesites (por ahora puedes saltarte esto)
3. O agrégalas después en Settings → Environment Variables

### Paso 5: Deploy

1. Haz clic en **"Deploy"**
2. Espera a que termine el build
3. Una vez listo, el proyecto debería estar funcionando

### Paso 6: Verificar Webhook

Después del deploy:

1. Ve a GitHub: `https://github.com/SebaSuffer/gotra-joy/settings/hooks`
2. Deberías ver un webhook de Vercel creado automáticamente
3. Verifica que:
   - ✅ Esté activo (checkmark verde)
   - ✅ La URL contenga `vercel.com`
   - ✅ Los eventos estén configurados

### Paso 7: Probar Auto-Deploy

1. Haz un pequeño cambio en el código
2. Commit y push:
   ```bash
   git add .
   git commit -m "test: verificar auto-deploy después de recrear proyecto"
   git push origin main
   ```
3. Ve a Vercel → Deployments
4. Deberías ver un nuevo deployment iniciándose automáticamente

## Ventajas de Recrear

✅ Configuración limpia desde cero
✅ Webhooks se crean automáticamente
✅ Sin configuraciones antiguas que puedan causar problemas
✅ Todo funcionando correctamente desde el inicio

## Notas Importantes

- **No perderás nada**: El código está en GitHub, solo estás recreando el proyecto en Vercel
- **Dominios**: Si tienes un dominio personalizado configurado, tendrás que volver a configurarlo después
- **Variables de entorno**: Si las tenías, tendrás que agregarlas de nuevo (pero dijiste que no las usarás por ahora)

## Después de Recrear

Una vez que el proyecto esté recreado y funcionando:

1. Verifica que el sitio carga correctamente
2. Verifica que los webhooks están creados en GitHub
3. Haz un commit de prueba para confirmar que el auto-deploy funciona
4. Borra el proyecto "gotrajoy" (el que no funciona) para evitar confusión

