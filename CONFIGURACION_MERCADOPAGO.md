# Configuración de Mercado Pago

Esta guía te ayudará a configurar Mercado Pago como pasarela de pago en tu tienda.

## Variables de Entorno Requeridas

Necesitas configurar **2 variables de entorno** en Vercel:

### 1. `MERCADOPAGO_ACCESS_TOKEN` (Privada - Servidor)
- **Tipo:** Variable privada (no expuesta al cliente)
- **Descripción:** Token de acceso de Mercado Pago para autenticación en la API
- **Dónde se usa:** En el servidor (`/api/mercadopago/create-preference.ts`) para crear preferencias de pago

### 2. `PUBLIC_MERCADOPAGO_PUBLIC_KEY` (Pública - Cliente)
- **Tipo:** Variable pública (expuesta al cliente)
- **Descripción:** Clave pública de Mercado Pago para inicializar el SDK en el navegador
- **Dónde se usa:** En el cliente (`src/utils/payment.ts`) para inicializar el SDK de Mercado Pago

## Cómo Obtener las Credenciales

### Paso 1: Crear una Cuenta en Mercado Pago

1. Ve a [https://www.mercadopago.cl](https://www.mercadopago.cl)
2. Crea una cuenta o inicia sesión
3. Completa la verificación de tu cuenta (requerido para recibir pagos)

### Paso 2: Acceder a las Credenciales

1. Inicia sesión en tu cuenta de Mercado Pago
2. Ve a **Desarrolladores** → **Tus integraciones**
3. Crea una nueva aplicación o selecciona una existente
4. En la sección **Credenciales de producción** o **Credenciales de prueba**, encontrarás:

   - **Access Token** → Esta es tu `MERCADOPAGO_ACCESS_TOKEN`
   - **Public Key** → Esta es tu `PUBLIC_MERCADOPAGO_PUBLIC_KEY`

### Paso 3: Modo Prueba vs Producción

#### Modo Prueba (Sandbox)
- Usa las **Credenciales de prueba**
- Permite probar pagos sin usar dinero real
- Los pagos de prueba se procesan con tarjetas de prueba
- URL de pago: `sandbox_init_point`

#### Modo Producción
- Usa las **Credenciales de producción**
- Procesa pagos reales con dinero real
- Requiere cuenta verificada
- URL de pago: `init_point`

**Recomendación:** Empieza con modo prueba para probar la integración antes de activar pagos reales.

## Configuración en Vercel

### Paso 1: Agregar Variables de Entorno

1. Ve a tu proyecto en [Vercel](https://vercel.com)
2. Navega a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

   ```
   MERCADOPAGO_ACCESS_TOKEN = [Tu Access Token]
   PUBLIC_MERCADOPAGO_PUBLIC_KEY = [Tu Public Key]
   ```

### Paso 2: Verificar que las Variables Estén Configuradas

- `MERCADOPAGO_ACCESS_TOKEN` debe ser **privada** (no marcada como pública)
- `PUBLIC_MERCADOPAGO_PUBLIC_KEY` debe tener el prefijo `PUBLIC_` (automáticamente pública en Vercel)

### Paso 3: Redesplegar

Después de agregar las variables, **redesplega** tu aplicación para que los cambios surtan efecto.

## Verificación de la Configuración

### Prueba en Modo Sandbox

1. Usa las credenciales de prueba
2. En el checkout, selecciona "Mercado Pago"
3. Deberías ser redirigido a la página de pago de Mercado Pago
4. Usa las tarjetas de prueba de Mercado Pago:
   - **Aprobada:** `5031 7557 3453 0604` (CVV: 123)
   - **Rechazada:** `5031 4332 1540 6351` (CVV: 123)

### Verificar en Producción

1. Usa las credenciales de producción
2. Realiza una compra de prueba con una tarjeta real
3. Verifica que el pago se procese correctamente

## Flujo de Pago

1. **Cliente completa el formulario de checkout**
2. **Se crea la orden** en la base de datos (estado: `pending`)
3. **Se crea la preferencia de pago** en Mercado Pago
4. **Cliente es redirigido** a Mercado Pago para completar el pago
5. **Después del pago**, Mercado Pago redirige al cliente a:
   - **Éxito:** `/orden-confirmada?id=ORD-XXXX&status=approved`
   - **Pendiente:** `/orden-confirmada?id=ORD-XXXX&status=pending`
   - **Fallo:** `/checkout?error=payment_failed`

## Solución de Problemas

### Error: "MercadoPago no configurado"
- **Causa:** La variable `MERCADOPAGO_ACCESS_TOKEN` no está configurada
- **Solución:** Verifica que la variable esté agregada en Vercel y que hayas redesplegado

### Error: "Error al crear preferencia de pago"
- **Causa:** Token de acceso inválido o credenciales incorrectas
- **Solución:** Verifica que estés usando las credenciales correctas (prueba vs producción)

### No se redirige a Mercado Pago
- **Causa:** La variable `PUBLIC_MERCADOPAGO_PUBLIC_KEY` no está configurada
- **Solución:** Verifica que la variable pública esté configurada con el prefijo `PUBLIC_`

### El pago se procesa pero no se actualiza la orden
- **Causa:** Falta implementar webhooks de Mercado Pago
- **Solución:** Implementa webhooks para recibir notificaciones de pago (opcional, pero recomendado)

## Webhooks (Opcional pero Recomendado)

Para recibir notificaciones automáticas cuando se procesa un pago, puedes configurar webhooks:

1. En Mercado Pago, ve a **Webhooks**
2. Configura la URL: `https://tu-dominio.com/api/mercadopago/webhook`
3. Implementa el endpoint para actualizar el estado de las órdenes

## Recursos Adicionales

- [Documentación de Mercado Pago](https://www.mercadopago.cl/developers/es/docs)
- [API de Preferencias](https://www.mercadopago.cl/developers/es/reference/preferences/_checkout_preferences/post)
- [Tarjetas de Prueba](https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/test-cards)

## Resumen de Variables

```env
# En Vercel → Settings → Environment Variables

MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Nota:** Reemplaza los valores `xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` con tus credenciales reales de Mercado Pago.

