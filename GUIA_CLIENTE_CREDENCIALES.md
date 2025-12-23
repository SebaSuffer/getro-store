# 📋 Guía para el Cliente: Obtener Credenciales de Pago

Esta guía está dirigida al cliente para que pueda obtener las credenciales necesarias para configurar las pasarelas de pago en su sitio web.

---

## 🔵 Mercado Pago

### Paso 1: Crear Cuenta (si no tiene una)

1. Ve a [Mercado Pago Chile](https://www.mercadopago.cl/)
2. Haz clic en **"Crear cuenta"** o **"Iniciar sesión"**
3. Completa el registro con tus datos personales o de empresa
4. Verifica tu email y completa el proceso de verificación

### Paso 2: Acceder a Mercado Pago Developers

1. Una vez dentro de tu cuenta, ve a [Mercado Pago Developers](https://www.mercadopago.cl/developers)
2. Inicia sesión con tu cuenta de Mercado Pago

### Paso 3: Crear Aplicación

1. En el panel, haz clic en **"Tus integraciones"** o **"Aplicaciones"**
2. Haz clic en **"Crear nueva aplicación"** o **"Crear aplicación"**
3. Completa el formulario:
   - **Nombre de la aplicación**: GOTRA Joyería (o el nombre que prefieras)
   - **Plataforma**: Web
   - **Categoría**: E-commerce / Retail
   - **Descripción**: Tienda online de joyería (opcional)
4. Haz clic en **"Crear"**

### Paso 4: Obtener Credenciales de Prueba

1. Una vez creada la aplicación, verás dos pestañas: **"Prueba"** y **"Producción"**
2. Haz clic en la pestaña **"Prueba"** (para testing inicial)
3. Verás dos credenciales importantes:
   - **Access Token**: Un token largo que empieza con `TEST-...`
   - **Public Key**: Una clave que empieza con `TEST-...`
4. **Copia ambas credenciales** y guárdalas de forma segura

### Paso 5: Obtener Credenciales de Producción (Cuando estés listo)

1. Cuando quieras recibir pagos reales, haz clic en la pestaña **"Producción"**
2. Verás las credenciales de producción:
   - **Access Token**: Empieza con `APP_USR-...`
   - **Public Key**: Empieza con `APP_USR-...`
3. **Copia ambas credenciales** y compártelas de forma segura con tu desarrollador

### Paso 6: Compartir Credenciales

Envía estas dos credenciales a tu desarrollador de forma segura:

```
Access Token: [tu access token aquí]
Public Key: [tu public key aquí]
```

**⚠️ Importante:**
- No compartas estas credenciales por email sin cifrar
- Usa WhatsApp, Telegram o un gestor de contraseñas
- Nunca las publiques en redes sociales o sitios públicos

---

## 🟢 Transbank (Webpay Plus)

### Paso 1: Crear Cuenta en Transbank Developers

1. Ve a [Transbank Developers](https://www.transbankdevelopers.cl/)
2. Haz clic en **"Registrarse"** o **"Crear cuenta"**
3. Completa el registro con tus datos:
   - Nombre completo
   - Email
   - Teléfono
   - Datos de tu empresa (si aplica)
4. Verifica tu email

### Paso 2: Crear Comercio de Prueba (Para Testing)

1. Una vez dentro del panel, ve a **"Mi Panel"** → **"Comercios"**
2. Busca la sección **"Ambiente de Integración"** o **"Comercios de Prueba"**
3. Haz clic en **"Crear Comercio"** o **"Nuevo Comercio"**
4. Completa:
   - **Nombre del comercio**: GOTRA Joyería
   - **Descripción**: Tienda online de joyería
5. Haz clic en **"Crear"**

### Paso 3: Obtener Credenciales de Prueba

Una vez creado el comercio de prueba, Transbank te proporcionará automáticamente:

1. **API Key (Tbk-Api-Key-Secret)**: Una clave larga
2. **Commerce Code (Tbk-Api-Key-Id)**: Un código numérico

**Copia ambas credenciales** y guárdalas de forma segura.

### Paso 4: Crear Comercio de Producción (Cuando estés listo)

Para recibir pagos reales, necesitas crear un comercio de producción:

1. **Contacta a Transbank**:
   - Llama al teléfono de soporte: [Busca en su sitio web]
   - O envía un email a: [soporte@transbank.cl]
   - O usa el formulario de contacto en su sitio web

2. **Solicita crear un comercio de producción**:
   - Menciona que necesitas Webpay Plus para tu tienda online
   - Proporciona los datos de tu empresa
   - Transbank te enviará un proceso de verificación

3. **Una vez aprobado**, recibirás:
   - **API Key de Producción**
   - **Commerce Code de Producción**
   - Instrucciones adicionales

### Paso 5: Compartir Credenciales

Envía estas tres credenciales a tu desarrollador de forma segura:

```
API Key: [tu api key aquí]
Commerce Code: [tu commerce code aquí]
Environment: integration (para pruebas) o production (para producción)
```

**⚠️ Importante:**
- No compartas estas credenciales por email sin cifrar
- Usa WhatsApp, Telegram o un gestor de contraseñas
- Nunca las publiques en redes sociales o sitios públicos

---

## 📝 Resumen de Credenciales Necesarias

### Mercado Pago (2 credenciales):
1. ✅ Access Token
2. ✅ Public Key

### Transbank (3 credenciales):
1. ✅ API Key (Tbk-Api-Key-Secret)
2. ✅ Commerce Code (Tbk-Api-Key-Id)
3. ✅ Environment (`integration` o `production`)

---

## ⏱️ Tiempos Estimados

- **Mercado Pago**: 10-15 minutos (crear cuenta y aplicación)
- **Transbank Prueba**: 10-15 minutos (crear cuenta y comercio de prueba)
- **Transbank Producción**: 1-3 días hábiles (proceso de verificación)

---

## 🔒 Seguridad

1. **Nunca compartas tus credenciales públicamente**
2. **Usa comunicación segura** (WhatsApp, Telegram, gestor de contraseñas)
3. **No las guardes en documentos públicos** (Google Drive público, etc.)
4. **Cambia las credenciales** si sospechas que fueron comprometidas

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar las credenciales de prueba para recibir pagos reales?
No. Las credenciales de prueba solo funcionan con tarjetas de prueba. Para recibir dinero real, necesitas credenciales de producción.

### ¿Cuánto cuesta usar estas pasarelas?
- **Mercado Pago**: Consulta sus tarifas en su sitio web
- **Transbank**: Consulta sus tarifas en su sitio web

### ¿Puedo cambiar las credenciales después?
Sí, puedes actualizar las credenciales en cualquier momento. Solo necesitas comunicarte con tu desarrollador.

### ¿Qué pasa si pierdo mis credenciales?
- **Mercado Pago**: Puedes regenerarlas desde el panel de desarrolladores
- **Transbank**: Contacta a soporte para recuperarlas

---

## 📞 Soporte

Si tienes problemas:

- **Mercado Pago**: [Soporte Mercado Pago](https://www.mercadopago.cl/developers/es/support)
- **Transbank**: [Soporte Transbank](https://www.transbankdevelopers.cl/documentacion/soporte)

---

Una vez que tengas todas las credenciales, compártelas de forma segura con tu desarrollador para que configure el sitio web. 🚀


