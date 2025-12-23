# 📘 Guía Completa: Pasarelas de Pago y Dominio

Esta guía te explica cómo configurar las pasarelas de pago (Transbank y Mercado Pago) y conectar tu dominio de nic.cl con Vercel.

---

## Parte 1: Configurar Pasarelas de Pago

**⚠️ IMPORTANTE:** Las credenciales deben ser del CLIENTE, no tuyas. El dinero debe llegar a la cuenta del cliente. Ver `GUIA_CLIENTE_CREDENCIALES.md` para instrucciones que puedes compartir con el cliente.

### 🔵 Mercado Pago

#### Paso 1: Obtener Credenciales del Cliente

El cliente debe crear la aplicación en su cuenta de Mercado Pago y compartirte las credenciales. Ver `GUIA_CLIENTE_CREDENCIALES.md` para las instrucciones completas que puedes enviarle.

#### Paso 2: Crear Aplicación en Mercado Pago (Solo si el cliente te lo pide)

1. Ve a [Mercado Pago Developers](https://www.mercadopago.cl/developers)
2. Inicia sesión con tu cuenta de Mercado Pago
3. Ve a **"Tus integraciones"** → **"Crear nueva aplicación"**
4. Completa:
   - **Nombre**: GOTRA Joyería
   - **Plataforma**: Web
   - **Categoría**: E-commerce
5. Haz clic en **"Crear"**

#### Paso 2: Obtener Credenciales

Una vez creada la aplicación:

1. Ve a la sección **"Credenciales de producción"** (o "Credenciales de prueba" para testing)
2. Copia estos valores:
   - **Access Token**: Token largo que empieza con `APP_USR-...`
   - **Public Key**: Clave pública que empieza con `APP_USR-...`

#### Paso 4: Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings** → **Environment Variables**
3. Agrega estas variables:

   **Variable 1:**
   - Name: `MERCADOPAGO_ACCESS_TOKEN`
   - Value: (tu Access Token)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2 (Opcional - solo si usas SDK frontend):**
   - Name: `PUBLIC_MERCADOPAGO_PUBLIC_KEY`
   - Value: (tu Public Key)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

4. Haz clic en **"Save"**

#### Paso 5: Probar Mercado Pago

1. Ve a tu sitio en Vercel
2. Agrega productos al carrito
3. Ve a checkout
4. Selecciona **"Mercado Pago"**
5. Completa el formulario y haz clic en **"Pagar"**
6. Deberías ser redirigido a Mercado Pago

**Nota:** Para pruebas, usa las credenciales de **"Prueba"** y tarjetas de test:
- Tarjeta: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura

---

### 🟢 Transbank (Webpay Plus)

#### Paso 1: Obtener Credenciales del Cliente

El cliente debe crear el comercio en su cuenta de Transbank y compartirte las credenciales. Ver `GUIA_CLIENTE_CREDENCIALES.md` para las instrucciones completas que puedes enviarle.

#### Paso 2: Crear Cuenta en Transbank (Solo si el cliente te lo pide)

1. Ve a [Transbank Developers](https://www.transbankdevelopers.cl/)
2. Crea una cuenta o inicia sesión
3. Ve a **"Mi Panel"** → **"Comercios"**

#### Paso 2: Crear Comercio de Prueba (Testing)

Para desarrollo y pruebas:

1. En el panel, busca **"Ambiente de Integración"**
2. Crea un nuevo comercio de prueba
3. Obtendrás automáticamente:
   - **API Key (Tbk-Api-Key-Secret)**: Una clave larga
   - **Commerce Code (Tbk-Api-Key-Id)**: Un código numérico

**Nota:** Los comercios de prueba tienen límites y solo funcionan en el ambiente de integración.

#### Paso 3: Crear Comercio de Producción

Para producción real:

1. Contacta a Transbank para crear tu comercio de producción
2. Te enviarán:
   - **API Key de Producción**
   - **Commerce Code de Producción**
   - Instrucciones adicionales

#### Paso 4: Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings** → **Environment Variables**
3. Agrega estas variables:

   **Variable 1:**
   - Name: `TRANSBANK_API_KEY`
   - Value: (tu Tbk-Api-Key-Secret)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Name: `TRANSBANK_COMMERCE_CODE`
   - Value: (tu Tbk-Api-Key-Id / Commerce Code)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 3:**
   - Name: `TRANSBANK_ENVIRONMENT`
   - Value: `integration` (para pruebas) o `production` (para producción)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

4. Haz clic en **"Save"**

#### Paso 6: Probar Transbank

1. Ve a tu sitio en Vercel
2. Agrega productos al carrito
3. Ve a checkout
4. Selecciona **"Transbank (Webpay)"**
5. Completa el formulario y haz clic en **"Pagar"**
6. Deberías ser redirigido a Webpay

**Nota:** En ambiente de integración, usa tarjetas de prueba:
- Tarjeta: `4051885600442`
- CVV: `123`
- Fecha: Cualquier fecha futura

---

## Parte 2: Conectar Dominio de nic.cl con Vercel

### Paso 1: Obtener Información del Dominio

1. Inicia sesión en [nic.cl](https://www.nic.cl/)
2. Ve a **"Mis Dominios"** o **"Panel de Control"**
3. Busca tu dominio (ej: `gotra.cl`)
4. Anota:
   - El dominio exacto
   - Si quieres usar `www.gotra.cl` o solo `gotra.cl` (o ambos)

### Paso 2: Configurar Dominio en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **Domains**
3. Haz clic en **"Add Domain"**
4. Ingresa tu dominio:
   - Si quieres `www.gotra.cl`: ingresa `www.gotra.cl`
   - Si quieres `gotra.cl`: ingresa `gotra.cl`
   - Si quieres ambos: agrega ambos por separado
5. Haz clic en **"Add"**

### Paso 3: Obtener Registros DNS de Vercel

Después de agregar el dominio, Vercel te mostrará los registros DNS que necesitas:

**Para `www.gotra.cl` (subdominio):**
- Tipo: `CNAME`
- Nombre/Host: `www`
- Valor/Destino: `cname.vercel-dns.com` (o el que Vercel te indique)
- TTL: `3600` (o automático)

**Para `gotra.cl` (dominio raíz):**
- Tipo: `A`
- Nombre/Host: `@` (o vacío, dependiendo de tu proveedor)
- Valor/Destino: `76.76.21.21` (o la IP que Vercel te indique)
- TTL: `3600` (o automático)

### Paso 4: Configurar DNS en nic.cl

1. En nic.cl, ve a la sección de **"DNS"** o **"Zona DNS"** de tu dominio
2. Busca la opción para **"Editar registros DNS"** o **"Gestionar DNS"**

**Para `www.gotra.cl`:**
1. Busca si ya existe un registro CNAME para `www`
2. Si existe, edítalo. Si no, créalo:
   - Tipo: `CNAME`
   - Host/Nombre: `www`
   - Valor/Destino: `cname.vercel-dns.com` (o el que Vercel te dio)
   - TTL: `3600`
3. Guarda los cambios

**Para `gotra.cl` (dominio raíz):**
1. Busca si ya existe un registro A para `@` o vacío
2. Si existe, edítalo. Si no, créalo:
   - Tipo: `A`
   - Host/Nombre: `@` (o vacío)
   - Valor/Destino: `76.76.21.21` (o la IP que Vercel te dio)
   - TTL: `3600`
3. Guarda los cambios

**⚠️ Importante:**
- Si ya tienes otros registros A o CNAME para estos nombres, elimínalos o reemplázalos
- No debes tener múltiples registros A o CNAME para el mismo nombre

### Paso 5: Verificar Configuración DNS

1. Espera 10-15 minutos después de guardar los cambios
2. Verifica en [whatsmydns.net](https://www.whatsmydns.net):
   - Busca `gotra.cl` → debe mostrar la IP de Vercel
   - Busca `www.gotra.cl` → debe mostrar `cname.vercel-dns.com`
3. En Vercel, ve a **Settings** → **Domains**
4. Haz clic en el botón **"Refresh"** o **"Verify"** junto a tu dominio
5. Si todo está correcto, verás un ✅ verde

### Paso 6: Configurar Redirect (Opcional)

Si quieres que `gotra.cl` redirija automáticamente a `www.gotra.cl`:

1. En Vercel, ve a **Settings** → **Domains**
2. Haz clic en los tres puntos junto a `gotra.cl`
3. Selecciona **"Redirect"**
4. Configura:
   - Redirect to: `www.gotra.cl`
   - Status Code: `301` (Permanente)
5. Guarda

### Paso 7: Esperar Certificado SSL

Vercel generará automáticamente un certificado SSL (HTTPS) para tu dominio. Esto puede tardar:
- **5-30 minutos** si los DNS están correctos
- Hasta **24 horas** en casos raros

Verás el estado del certificado en **Settings** → **Domains**.

---

## Parte 3: Verificación Final

### Checklist de Pasarelas de Pago

- [ ] Mercado Pago:
  - [ ] Aplicación creada en Mercado Pago Developers
  - [ ] `MERCADOPAGO_ACCESS_TOKEN` configurado en Vercel
  - [ ] `PUBLIC_MERCADOPAGO_PUBLIC_KEY` configurado (si aplica)
  - [ ] Probar checkout con Mercado Pago funciona

- [ ] Transbank:
  - [ ] Comercio creado en Transbank Developers
  - [ ] `TRANSBANK_API_KEY` configurado en Vercel
  - [ ] `TRANSBANK_COMMERCE_CODE` configurado en Vercel
  - [ ] `TRANSBANK_ENVIRONMENT` configurado en Vercel
  - [ ] Probar checkout con Transbank funciona

### Checklist de Dominio

- [ ] Dominio agregado en Vercel
- [ ] Registros DNS configurados en nic.cl:
  - [ ] CNAME para `www` (si aplica)
  - [ ] Registro A para dominio raíz (si aplica)
- [ ] DNS verificado en whatsmydns.net
- [ ] Dominio verificado en Vercel (✅ verde)
- [ ] Certificado SSL generado (HTTPS funcionando)
- [ ] Sitio accesible desde el dominio personalizado

---

## Solución de Problemas

### Las pasarelas de pago no funcionan

1. **Verifica las variables de entorno:**
   - Ve a Vercel → Settings → Environment Variables
   - Asegúrate de que todas las variables estén configuradas
   - Verifica que los valores sean correctos (sin espacios extra)

2. **Verifica que el redeploy se haya hecho:**
   - Después de agregar variables, Vercel debe hacer redeploy automáticamente
   - Si no, haz un redeploy manual

3. **Revisa los logs:**
   - Ve a Vercel → Deployments → Último deployment → Functions
   - Revisa los logs de `/api/mercadopago/create-preference` o `/api/transbank/create-transaction`
   - Busca errores relacionados con credenciales

### El dominio no funciona

1. **Verifica los DNS:**
   - Usa [whatsmydns.net](https://www.whatsmydns.net) para verificar
   - Espera al menos 15 minutos después de cambiar DNS
   - Asegúrate de que no haya registros conflictivos

2. **Verifica en Vercel:**
   - Ve a Settings → Domains
   - Haz clic en "Refresh" o "Verify"
   - Revisa si hay mensajes de error

3. **Limpia caché:**
   - Espera hasta 24 horas para propagación completa
   - Prueba desde diferentes navegadores o en modo incógnito

4. **Contacta soporte:**
   - Si después de 24 horas sigue sin funcionar, contacta a Vercel Support
   - O revisa la documentación de nic.cl para problemas específicos

---

## Recursos Útiles

- [Mercado Pago Developers](https://www.mercadopago.cl/developers)
- [Transbank Developers](https://www.transbankdevelopers.cl/)
- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [whatsmydns.net](https://www.whatsmydns.net) - Verificar propagación DNS
- [nic.cl](https://www.nic.cl/) - Panel de control de dominio

---

## Notas Importantes

1. **Ambiente de Prueba vs Producción:**
   - Usa credenciales de prueba para desarrollo
   - Cambia a credenciales de producción solo cuando estés listo
   - Actualiza `TRANSBANK_ENVIRONMENT` a `production` cuando cambies

2. **Seguridad:**
   - Nunca compartas tus Access Tokens o API Keys
   - No subas las variables de entorno a GitHub
   - Vercel encripta las variables automáticamente

3. **Costos:**
   - Mercado Pago: Consulta sus tarifas
   - Transbank: Consulta sus tarifas
   - Vercel: Plan gratuito incluye dominios personalizados

4. **Soporte:**
   - Para problemas con Mercado Pago: [Soporte Mercado Pago](https://www.mercadopago.cl/developers/es/support)
   - Para problemas con Transbank: [Soporte Transbank](https://www.transbankdevelopers.cl/documentacion/soporte)
   - Para problemas con Vercel: [Vercel Support](https://vercel.com/support)

---

¡Listo! Con esta guía deberías poder configurar tanto las pasarelas de pago como tu dominio personalizado. 🚀

