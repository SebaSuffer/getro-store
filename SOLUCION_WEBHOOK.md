# 🔧 Solución: Webhook Manual Incorrecto

## Problema Identificado

Has añadido manualmente un webhook en GitHub con la URL `https://gotrajoy.vercel.app/catalogo`, pero esta **NO es la URL correcta** para webhooks de Vercel. Los webhooks de Vercel deben ser creados automáticamente por Vercel cuando conectas el repositorio.

## Solución: Eliminar Webhook Manual y Reconectar

### Paso 1: Eliminar el Webhook Manual Incorrecto

1. Ve a GitHub: `https://github.com/SebaSuffer/gotra-joy/settings/hooks`
2. Encuentra el webhook que creaste manualmente (el que tiene `https://gotrajoy.vercel.app/catalogo`)
3. Haz clic en **"Delete"** o **"Eliminar"**
4. Confirma la eliminación

### Paso 2: Verificar Permisos de Vercel en GitHub

1. Ve a GitHub → **Settings** → **Applications** → **Authorized OAuth Apps**
2. Busca **"Vercel"** en la lista
3. Verifica que tenga permisos de:
   - ✅ **Repository access** (acceso al repositorio)
   - ✅ **Read and write** (lectura y escritura)
4. Si no tiene los permisos correctos:
   - Haz clic en **"Revoke"** (revocar)
   - Luego reconecta desde Vercel

### Paso 3: Reconectar el Repositorio en Vercel

1. Ve a Vercel Dashboard → Proyecto **"gotrajoy"** (o el que estés usando)
2. Ve a **Settings** → **Git**
3. Haz clic en **"Disconnect"**
4. Espera 10-15 segundos
5. Haz clic en **"Connect Git Repository"**
6. Selecciona **"SebaSuffer/gotra-joy"**
7. Selecciona la rama **"main"** como producción
8. Haz clic en **"Deploy"**

### Paso 4: Verificar que el Webhook se Creó Correctamente

Después de reconectar, Vercel debería crear automáticamente el webhook. Para verificar:

1. Ve a GitHub: `https://github.com/SebaSuffer/gotra-joy/settings/hooks`
2. Deberías ver un webhook de Vercel con:
   - ✅ URL que contenga `api.vercel.com` o `vercel.com/webhooks`
   - ✅ Estado activo (checkmark verde)
   - ✅ Eventos: "Just the push event" o "push"
   - ✅ Última entrega reciente

### Paso 5: Probar el Auto-Deploy

1. Haz un pequeño cambio en el código (ej: un comentario)
2. Commit y push:
   ```bash
   git add .
   git commit -m "test: verificar auto-deploy después de reconectar"
   git push origin main
   ```
3. Ve a Vercel → **Deployments**
4. Deberías ver un nuevo deployment iniciándose automáticamente en 10-30 segundos

## Si el Webhook No Se Crea Automáticamente

Si después de reconectar el repositorio el webhook no aparece:

### Opción A: Verificar Integración de GitHub en Vercel

1. Ve a Vercel → **Settings** → **Integrations**
2. Verifica que GitHub esté conectado
3. Si no está, conéctalo desde ahí

### Opción B: Usar Deploy Hooks de Vercel (Alternativa)

Si los webhooks automáticos no funcionan, puedes usar Deploy Hooks:

1. Ve a Vercel → Settings → **Git** → **Deploy Hooks**
2. Crea un nuevo Deploy Hook
3. Copia la URL del hook
4. En GitHub, crea un webhook manual con:
   - **Payload URL**: La URL del Deploy Hook
   - **Content type**: `application/json`
   - **Events**: Solo "push"

### Opción C: Usar GitHub Actions

Como última alternativa, puedes usar GitHub Actions para desplegar automáticamente:

1. Crea `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to Vercel
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: amondnet/vercel-action@v25
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
             vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
   ```

## Recomendación

**La mejor solución es el Paso 3**: Reconectar el repositorio en Vercel. Esto debería crear el webhook automáticamente con la configuración correcta.

## Estado Actual

- ❌ Webhook manual con URL incorrecta: `https://gotrajoy.vercel.app/catalogo`
- ✅ Necesitas: Webhook automático de Vercel con URL de API correcta
- ⚠️ Último deployment: `475cab8` (hace 5m) - Falta el commit `b08dd07` (corrección de productos)

