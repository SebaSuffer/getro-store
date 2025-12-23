# Configuración de Pasarelas de Pago

## Variables de Entorno Necesarias

Agrega estas variables en **Vercel Dashboard > Settings > Environment Variables**:

### Mercado Pago

1. Ve a [Mercado Pago Developers](https://www.mercadopago.cl/developers)
2. Crea una aplicación
3. Obtén tu **Access Token** (producción o test)
4. Agrega en Vercel:
   - `MERCADOPAGO_ACCESS_TOKEN` = Tu access token
   - `PUBLIC_MERCADOPAGO_PUBLIC_KEY` = Tu public key (opcional, para SDK frontend)

### Transbank (Webpay)

1. Ve a [Transbank Developers](https://www.transbankdevelopers.cl/)
2. Crea una cuenta de comercio
3. Obtén tus credenciales:
   - **API Key** (Tbk-Api-Key-Secret)
   - **Commerce Code** (Tbk-Api-Key-Id)
4. Agrega en Vercel:
   - `TRANSBANK_API_KEY` = Tu API Key Secret
   - `TRANSBANK_COMMERCE_CODE` = Tu Commerce Code
   - `TRANSBANK_ENVIRONMENT` = `integration` (para pruebas) o `production` (producción)

## Modo de Prueba

- **Mercado Pago**: Usa credenciales de test desde el panel de desarrolladores
- **Transbank**: Usa `TRANSBANK_ENVIRONMENT=integration` para pruebas

## Flujo de Pago

### Mercado Pago
1. Cliente selecciona Mercado Pago
2. Se crea una preferencia de pago
3. Cliente es redirigido a Mercado Pago
4. Después del pago, vuelve a `/orden-confirmada`

### Transbank
1. Cliente selecciona Transbank
2. Se crea una transacción
3. Cliente es redirigido a Webpay
4. Después del pago, vuelve a `/orden-confirmada`

### Transferencia Bancaria
1. Cliente selecciona Transferencia
2. Se guarda la orden
3. Cliente ve instrucciones de transferencia
4. Debes procesar manualmente la orden

## Importante

- Las API routes están en `src/pages/api/`
- El proyecto está configurado como `output: 'server'` para que funcionen las API routes
- Asegúrate de que las variables de entorno estén configuradas antes de hacer deploy




