# ✅ Verificación de Variables de Entorno - gotra-joy

## Variables Requeridas para Producción

### 🔵 Mercado Pago

**⚠️ IMPORTANTE:** Estas deben ser las credenciales de **PRODUCCIÓN** del cliente, NO de prueba.

1. **MERCADOPAGO_ACCESS_TOKEN**
   - Tipo: Secret (Sensitive)
   - Valor: Token de acceso de producción (empieza con `APP_USR-...`)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - **Verificar:** Debe ser de PRODUCCIÓN, no de prueba/sandbox

2. **PUBLIC_MERCADOPAGO_PUBLIC_KEY** (Opcional)
   - Tipo: Public
   - Valor: Clave pública de producción (empieza con `APP_USR-...`)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - **Verificar:** Debe ser de PRODUCCIÓN, no de prueba

### 🔴 Transbank (Webpay)

**⚠️ IMPORTANTE:** Estas deben ser las credenciales de **PRODUCCIÓN** del cliente.

1. **TRANSBANK_API_KEY**
   - Tipo: Secret (Sensitive)
   - Valor: API Key Secret de producción
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - **Verificar:** Debe ser de PRODUCCIÓN, no de integración/prueba

2. **TRANSBANK_COMMERCE_CODE**
   - Tipo: Secret (Sensitive)
   - Valor: Código de comercio de producción (12 dígitos)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - **Verificar:** Debe ser de PRODUCCIÓN, no de integración/prueba

3. **TRANSBANK_ENVIRONMENT**
   - Tipo: Public
   - Valor: `production` (para producción) o `integration` (solo para pruebas)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - **Verificar:** Debe ser `production` para el sitio en vivo

## Cómo Verificar en Vercel

### Para el proyecto "gotra-joy" (el que funciona):

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona el proyecto **"gotra-joy"**
3. Ve a **Settings** → **Environment Variables**
4. Verifica que tengas estas 5 variables:
   - ✅ `MERCADOPAGO_ACCESS_TOKEN`
   - ✅ `PUBLIC_MERCADOPAGO_PUBLIC_KEY` (opcional)
   - ✅ `TRANSBANK_API_KEY`
   - ✅ `TRANSBANK_COMMERCE_CODE`
   - ✅ `TRANSBANK_ENVIRONMENT`

5. Para cada variable, verifica:
   - **Valor:** ¿Es de producción o de prueba?
   - **Environments:** ¿Está marcada para Production, Preview y Development?

## Diferencias entre Prueba y Producción

### Mercado Pago:
- **Prueba/Sandbox:**
  - Access Token empieza con `TEST-...`
  - Solo funciona con tarjetas de prueba
  - No procesa pagos reales
  
- **Producción:**
  - Access Token empieza con `APP_USR-...`
  - Procesa pagos reales
  - El dinero va a la cuenta del cliente

### Transbank:
- **Integración/Prueba:**
  - `TRANSBANK_ENVIRONMENT = 'integration'`
  - Commerce Code de prueba
  - Solo funciona con tarjetas de prueba
  
- **Producción:**
  - `TRANSBANK_ENVIRONMENT = 'production'`
  - Commerce Code de producción
  - Procesa pagos reales

## ⚠️ Problema Identificado

El proyecto **"gotrajoy"** (el que no funciona) tiene:
- ❌ Variables de entorno de **PRUEBA** de Mercado Libre
- ❌ Esto puede causar que los pagos no funcionen correctamente

El proyecto **"gotra-joy"** (el que funciona) debe tener:
- ✅ Variables de entorno de **PRODUCCIÓN**
- ✅ Credenciales del cliente (no tuyas)

## Acción Recomendada

1. **Verifica** que "gotra-joy" tenga las variables correctas (de producción)
2. **Borra** el proyecto "gotrajoy" para evitar confusión
3. **Confirma** que las credenciales son del cliente, no tuyas

## Nota Importante

Si las variables en "gotra-joy" también son de prueba, necesitarás:
1. Obtener las credenciales de producción del cliente
2. Actualizarlas en Vercel
3. Hacer un redeploy para que los cambios surtan efecto

