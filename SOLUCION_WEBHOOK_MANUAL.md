# 🔧 Solución: Webhook No Se Crea Automáticamente

## Problema

Después de desconectar y reconectar el repositorio en Vercel, el webhook no se crea automáticamente y los commits no generan deployments automáticos.

## Verificaciones Necesarias

### 1. Verificar que el Repositorio Esté Realmente Conectado

En Vercel → Settings → Git, deberías ver:
- ✅ **Repository**: `SebaSuffer/gotra-joy`
- ✅ **Production Branch**: `main`
- ✅ **Connected**: Debe mostrar "Connected X ago" (reciente)

Si ves botones para conectar GitHub/GitLab/Bitbucket, **NO está conectado**. Vuelve a conectar.

### 2. Verificar Permisos de Vercel en GitHub

1. Ve a GitHub → **Settings** → **Applications** → **Authorized OAuth Apps**
2. Busca **"Vercel"**
3. Verifica que tenga:
   - ✅ Acceso al repositorio `gotra-joy`
   - ✅ Permisos de **lectura y escritura**

**Si NO aparece Vercel o no tiene permisos:**
1. Ve a Vercel → **Settings** → **Integrations**
2. Busca **GitHub**
3. Si no está conectado, conéctalo
4. Si está conectado, haz clic en **"Configure"** o **"Re-authenticate"**
5. Asegúrate de darle acceso al repositorio `gotra-joy`

### 3. Verificar Integración de GitHub en Vercel

1. Ve a Vercel → **Settings** → **Integrations**
2. Busca **GitHub** en la lista
3. Verifica que esté **instalado** y **activo**
4. Si no está, instálalo desde ahí

## Solución: Crear Deploy Hook Manual

Si el webhook automático no se crea, puedes usar **Deploy Hooks** de Vercel:

### Paso 1: Crear Deploy Hook en Vercel

1. Ve a Vercel → Settings → **Git** → **Deploy Hooks**
2. Haz clic en **"Create Hook"**
3. Configura:
   - **Name**: `auto-deploy-main`
   - **Branch**: `main`
4. Haz clic en **"Create Hook"**
5. **Copia la URL del hook** (algo como: `https://api.vercel.com/v1/integrations/deploy/...`)

### Paso 2: Crear Webhook en GitHub

1. Ve a GitHub → `SebaSuffer/gotra-joy` → **Settings** → **Webhooks**
2. Haz clic en **"Add webhook"**
3. Configura:
   - **Payload URL**: Pega la URL del Deploy Hook que copiaste
   - **Content type**: `application/json`
   - **Secret**: Déjalo vacío (no es necesario para Deploy Hooks)
   - **Which events**: Selecciona **"Just the push event"**
4. Haz clic en **"Add webhook"**

### Paso 3: Probar

1. Haz un pequeño cambio en el código
2. Commit y push:
   ```bash
   git add .
   git commit -m "test: verificar deploy hook manual"
   git push origin main
   ```
3. Ve a Vercel → **Deployments**
4. Deberías ver un nuevo deployment iniciándose en 10-30 segundos

## Alternativa: Usar GitHub Actions

Si los Deploy Hooks no funcionan, puedes usar GitHub Actions:

### Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Configurar Secrets en GitHub:

1. Ve a GitHub → `SebaSuffer/gotra-joy` → **Settings** → **Secrets and variables** → **Actions**
2. Agrega estos secrets:
   - `VERCEL_TOKEN`: Obtén de Vercel → Settings → Tokens
   - `VERCEL_ORG_ID`: Obtén de Vercel → Settings → General → Team ID
   - `VERCEL_PROJECT_ID`: Obtén de Vercel → Settings → General → Project ID

## Verificar Estado Actual

- ✅ Último deployment: `475cab8` - "Agregar guía para recrear proyecto en Vercel"
- ❌ Commits pendientes:
  - `b08dd07` - "Corregir nombres de productos..."
  - `1f2b514` - "Agregar guía para solucionar webhook manual incorrecto"
- ⚠️ **Faltan 2 commits por desplegar**

## Recomendación

**Prueba primero el Deploy Hook manual** (Paso 1 y 2). Es la solución más simple y directa. Si eso no funciona, entonces usa GitHub Actions.

