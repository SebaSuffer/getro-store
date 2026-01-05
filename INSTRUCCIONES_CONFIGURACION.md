# Instrucciones de Configuración - Sistema de Pagos y Órdenes

Este documento contiene todas las instrucciones necesarias para configurar el sistema completo de pagos con Mercado Pago, gestión de órdenes y notificaciones por email.

## 📋 Tabla de Contenidos

1. [Migración de Base de Datos](#1-migración-de-base-de-datos)
2. [Configuración de Mercado Pago](#2-configuración-de-mercado-pago)
3. [Configuración de Webhooks](#3-configuración-de-webhooks)
4. [Configuración de Email](#4-configuración-de-email)
5. [Verificación del Sistema](#5-verificación-del-sistema)

---

## 1. Migración de Base de Datos

### Paso 1: Ejecutar el Script de Migración

Necesitas ejecutar el script SQL para agregar los nuevos campos a la tabla `orders`.

**Opción A: Usando Turso CLI**

```bash
# Conectar a tu base de datos Turso
turso db shell <nombre-de-tu-db>

# Ejecutar el script de migración
.read turso/migrate_orders_table.sql
```

**Opción B: Ejecutar manualmente en Turso Dashboard**

1. Ve a tu dashboard de Turso: https://turso.tech
2. Selecciona tu base de datos
3. Abre la consola SQL
4. Copia y pega el contenido de `turso/migrate_orders_table.sql`
5. Ejecuta el script

**Opción C: Usando un script Node.js**

Crea un archivo `migrate.js` en la raíz del proyecto:

```javascript
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sql = readFileSync('./turso/migrate_orders_table.sql', 'utf-8');

async function migrate() {
  try {
    // Ejecutar cada statement por separado
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await client.execute(statement);
        console.log('✓ Ejecutado:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrate();
```

Ejecuta con:
```bash
node migrate.js
```

### Verificación

Después de ejecutar la migración, verifica que los campos se agregaron correctamente:

```sql
PRAGMA table_info(orders);
```

Deberías ver los siguientes campos nuevos:
- `customer_rut`
- `payment_status`
- `shipping_status`
- `mercado_pago_preference_id`
- `mercado_pago_payment_id`

---

## 2. Configuración de Mercado Pago

### Paso 1: Obtener Credenciales

1. Inicia sesión en tu cuenta de Mercado Pago: https://www.mercadopago.cl
2. Ve a **Desarrolladores** > **Tus integraciones**
3. Crea una nueva aplicación o selecciona una existente
4. Copia tu **Access Token** (Token de acceso)

### Paso 2: Configurar Variables de Entorno

Agrega tu Access Token a las variables de entorno:

**En desarrollo local (.env):**
```env
MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_AQUI
```

**En producción (Vercel/Netlify/etc):**
1. Ve a la configuración de tu proyecto
2. Agrega la variable de entorno:
   - Nombre: `MERCADOPAGO_ACCESS_TOKEN`
   - Valor: Tu Access Token de Mercado Pago

### Paso 3: Configurar URLs de Retorno

El sistema ya está configurado para usar las siguientes URLs de retorno:
- **Éxito**: `https://tu-dominio.com/orden-confirmada?status=approved&external_reference={orderId}`
- **Fallo**: `https://tu-dominio.com/orden-confirmada?status=rejected&external_reference={orderId}`
- **Pendiente**: `https://tu-dominio.com/orden-confirmada?status=pending&external_reference={orderId}`

Estas URLs se configuran automáticamente cuando se crea una preferencia de pago.

---

## 3. Configuración de Webhooks

### Paso 1: Configurar Webhook en Mercado Pago

1. Ve a tu cuenta de Mercado Pago
2. Navega a **Desarrolladores** > **Tus integraciones** > **Webhooks**
3. Crea un nuevo webhook con la siguiente URL:
   ```
   https://tu-dominio.com/api/mercadopago/webhook
   ```
4. Selecciona los eventos que quieres recibir:
   - ✅ **Pagos** (payment)
   - ✅ **Preferencias** (preference) - opcional

### Paso 2: Verificar que el Webhook Funciona

**Nota importante**: Para que Mercado Pago pueda enviar webhooks a tu servidor local durante desarrollo, necesitas usar un túnel como ngrok:

```bash
# Instalar ngrok
npm install -g ngrok

# Crear túnel
ngrok http 4321  # o el puerto que uses para desarrollo

# Usar la URL de ngrok en Mercado Pago:
# https://tu-id-ngrok.ngrok.io/api/mercadopago/webhook
```

**En producción**, asegúrate de que:
- Tu servidor esté accesible públicamente
- Tenga un certificado SSL válido (HTTPS)
- El endpoint `/api/mercadopago/webhook` esté funcionando

### Paso 3: Probar el Webhook

1. Realiza una compra de prueba en tu sitio
2. Completa el pago en Mercado Pago (modo test)
3. Verifica en los logs del servidor que el webhook se recibió
4. Verifica en el panel de admin que el estado de la orden se actualizó

---

## 4. Configuración de Email

El sistema soporta dos servicios de email: **Resend** (recomendado) o **SendGrid**.

### Opción A: Usar Resend (Recomendado)

1. **Crear cuenta en Resend**: https://resend.com
2. **Obtener API Key**:
   - Ve a **API Keys** en tu dashboard
   - Crea un nuevo API Key
   - Copia el key
3. **Verificar dominio** (opcional pero recomendado):
   - Agrega los registros DNS que Resend te proporcione
   - Espera la verificación
4. **Configurar variables de entorno**:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=noreply@tu-dominio.com
   ```

### Opción B: Usar SendGrid

1. **Crear cuenta en SendGrid**: https://sendgrid.com
2. **Obtener API Key**:
   - Ve a **Settings** > **API Keys**
   - Crea un nuevo API Key con permisos de "Mail Send"
   - Copia el key
3. **Verificar remitente**:
   - Ve a **Settings** > **Sender Authentication**
   - Verifica un remitente o dominio
4. **Configurar variables de entorno**:
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   EMAIL_FROM=noreply@tu-dominio.com
   ```

### Instalación de Dependencias (Opcional)

Si prefieres usar las librerías nativas en lugar de fetch:

**Para Resend:**
```bash
npm install resend
```

**Para SendGrid:**
```bash
npm install @sendgrid/mail
```

Luego actualiza `src/utils/email.ts` para usar las librerías en lugar de fetch.

### Nota sobre Email

Si no configuras ningún servicio de email, el sistema seguirá funcionando pero:
- Los emails no se enviarán
- Se registrará un warning en los logs
- El webhook seguirá funcionando normalmente
- Las órdenes se seguirán guardando en la base de datos

---

## 5. Verificación del Sistema

### Checklist de Verificación

- [ ] ✅ Migración de base de datos ejecutada
- [ ] ✅ `MERCADOPAGO_ACCESS_TOKEN` configurado
- [ ] ✅ Webhook configurado en Mercado Pago
- [ ] ✅ Servicio de email configurado (Resend o SendGrid)
- [ ] ✅ Variables de entorno configuradas en producción

### Pruebas Recomendadas

1. **Prueba de Checkout Completo**:
   - Agrega productos al carrito
   - Completa el formulario de checkout (incluyendo RUT)
   - Verifica que se crea la orden en la base de datos
   - Verifica que se redirige a Mercado Pago con el monto correcto

2. **Prueba de Pago**:
   - Completa un pago de prueba en Mercado Pago
   - Verifica que se redirige a la página de confirmación
   - Verifica que el webhook actualiza el estado de la orden
   - Verifica que se envía el email de confirmación

3. **Prueba del Panel de Admin**:
   - Inicia sesión en el panel de admin
   - Ve a la pestaña "Órdenes"
   - Verifica que todas las órdenes se muestran correctamente
   - Prueba cambiar el estado de pago y envío
   - Verifica que los detalles de la orden se muestran correctamente

### Solución de Problemas

#### Los precios no se vinculan correctamente en Mercado Pago

**Solución**: Verifica que:
- El `MERCADOPAGO_ACCESS_TOKEN` está configurado correctamente
- Los items del carrito tienen la estructura correcta
- El endpoint `/api/mercadopago/create-preference` está funcionando

#### El webhook no se recibe

**Solución**: 
- Verifica que la URL del webhook es accesible públicamente
- Verifica que el endpoint está en `/api/mercadopago/webhook`
- Revisa los logs del servidor para ver errores
- En desarrollo, usa ngrok para exponer tu servidor local

#### Los emails no se envían

**Solución**:
- Verifica que las variables de entorno están configuradas
- Verifica que el API key es válido
- Revisa los logs del servidor
- Verifica que el dominio/remitente está verificado en el servicio de email

#### Las órdenes no se muestran en el admin

**Solución**:
- Verifica que la migración de base de datos se ejecutó correctamente
- Verifica que el endpoint `/api/orders` está funcionando
- Revisa la consola del navegador para errores

---

## 📝 Notas Adicionales

### Modo Test vs Producción

- **Modo Test**: Usa credenciales de test de Mercado Pago. Los pagos no son reales.
- **Producción**: Usa credenciales de producción. Los pagos son reales.

Para cambiar entre modos, simplemente cambia el `MERCADOPAGO_ACCESS_TOKEN` en tus variables de entorno.

### Seguridad

- **Nunca** expongas tu `MERCADOPAGO_ACCESS_TOKEN` en el código del cliente
- **Siempre** usa HTTPS en producción
- **Valida** los webhooks de Mercado Pago (se puede agregar validación de firma)
- **Mantén** tus credenciales seguras y no las compartas

### Mejoras Futuras

Algunas mejoras que puedes implementar:
- Validación de firma de webhooks de Mercado Pago
- Reintentos automáticos para emails fallidos
- Notificaciones push para nuevas órdenes
- Exportación de órdenes a CSV/Excel
- Dashboard de estadísticas de ventas

---

## 🆘 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs del servidor
2. Verifica que todas las variables de entorno están configuradas
3. Prueba cada componente individualmente
4. Consulta la documentación de Mercado Pago: https://www.mercadopago.cl/developers

---

**Última actualización**: $(date)

