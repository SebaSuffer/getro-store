# 🌐 Configurar Dominio gotrachile.com en Vercel

## Opción 1: Usar Nameservers de Vercel (Recomendado)

Esta es la opción más simple y recomendada.

### Paso 1: Agregar Dominio en Vercel

1. Ve a Vercel → Tu proyecto `gotra-joy` → **Settings** → **Domains**
2. Haz clic en **"Add Domain"**
3. Ingresa: `gotrachile.com`
4. Haz clic en **"Add"**

### Paso 2: Obtener Nameservers de Vercel

**IMPORTANTE:** Si agregaste el dominio y está configurado como **"Redirect"** (redirigir a otro dominio), **NO verás los nameservers**. Debes cambiarlo primero:

#### Si el dominio muestra "Invalid Configuration" o "Redirect":

1. Haz clic en el dominio (`gotrachile.com`)
2. Verás dos opciones:
   - ⚪ **"Connect to an environment"** (esta es la que necesitas)
   - ⚫ **"Redirect to Another Domain"** (esta NO muestra nameservers)
3. Si está seleccionada "Redirect", haz clic en **"Edit"** o **"Configure"**
4. Selecciona **"Connect to an environment"**
5. En el dropdown, selecciona **"Production"**
6. Haz clic en **"Save"**

#### Después de cambiar a "Connect to an environment":

1. **Haz clic en "Save"** para guardar los cambios
2. Vercel debería mostrar los nameservers automáticamente
3. **Si aún no los ves después de guardar:**
   - Haz clic en el botón **"Edit"** del dominio nuevamente
   - O busca una sección que diga **"Nameservers"** o **"DNS Configuration"** en la página del dominio
   - A veces aparecen en una pestaña o sección expandible
4. Los nameservers deberían ser algo como:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
5. **Copia estos nameservers** - los necesitarás en el siguiente paso

**Si Vercel NO muestra los nameservers:**
- Puede ser que Vercel esté usando registros DNS en lugar de nameservers
- En ese caso, busca una sección que diga **"DNS Records"** o **"DNS Configuration"**
- Vercel te mostrará los registros CNAME o A que necesitas configurar en tu proveedor de dominio

### Paso 3: Configurar Nameservers en HostingPlus

1. Ve a tu panel de HostingPlus (donde viste la configuración de DNS)
2. En la sección de Nameservers, selecciona **"Usar nameservers personalizados"**
3. Reemplaza los nameservers actuales con los de Vercel:
   - **DNS 1**: `ns1.vercel-dns.com`
   - **DNS 2**: `ns2.vercel-dns.com`
   - **DNS 3**: Déjalo vacío o elimínalo
   - **DNS 4**: Déjalo vacío
   - **DNS 5**: Déjalo vacío
4. Haz clic en **"Cambiar DNS Nameservers"**

### Paso 4: Esperar Propagación

- Los cambios pueden tardar **24-48 horas** en propagarse
- Vercel verificará automáticamente cuando el dominio esté listo
- Recibirás un email cuando esté configurado

---

## Opción 2: Usar Registros DNS (Lo que Vercel está mostrando)

**Vercel está mostrando registros DNS en lugar de nameservers.** Esto significa que debes configurar registros DNS en HostingPlus.

### Paso 1: Ver los Registros DNS en Vercel

1. Ve a Vercel → Tu proyecto → **Settings** → **Domains**
2. Haz clic en el dominio `gotrachile.com`
3. Verás dos pestañas: **"DNS Records"** y **"Vercel DNS"**
4. Haz clic en **"DNS Records"** (debería estar seleccionada por defecto)

### Paso 2: Configurar Registros en HostingPlus

Vercel te mostrará los registros exactos que necesitas. Basándome en lo que veo, necesitas:

#### Para `gotrachile.com` (dominio raíz):
- **Tipo**: `A`
- **Nombre**: `@` (o déjalo vacío, dependiendo de tu panel)
- **Valor**: `216.198.79.1` (o el IP que Vercel te muestre)
- **TTL**: 3600 (o el valor por defecto)

#### Para `www.gotrachile.com`:
- **Tipo**: `CNAME`
- **Nombre**: `www`
- **Valor**: `bdba6edb2a0ec205.vercel-dns-017.com.` (o el CNAME que Vercel te muestre - **incluye el punto final**)
- **TTL**: 3600 (o el valor por defecto)

### Paso 3: Configurar en HostingPlus

1. Ve a tu panel de HostingPlus
2. Busca la sección de **"DNS"** o **"Zona DNS"** o **"Registros DNS"**
3. Agrega los dos registros mencionados arriba
4. **IMPORTANTE**: 
   - Para el registro A, el nombre puede ser `@` o `gotrachile.com` o simplemente vacío
   - Para el CNAME, el valor debe terminar con un punto (`.`) al final
5. Guarda los cambios

### Paso 4: Verificar en Vercel

1. Vuelve a Vercel
2. Haz clic en **"Refresh"** en el dominio
3. Vercel verificará automáticamente cuando los registros estén configurados
4. El estado cambiará de "Invalid Configuration" a "Valid Configuration" cuando esté listo

**Nota:** La propagación DNS puede tardar entre 5 minutos y 48 horas, pero generalmente es menos de 1 hora.

---

## Recomendación

**Vercel está mostrando registros DNS (Opción 2), así que usa esa:**

1. Ve a la pestaña **"DNS Records"** en Vercel
2. Copia los registros exactos que Vercel muestra
3. Configúralos en HostingPlus
4. Espera la propagación (5 minutos a 48 horas)

**Ventajas:**
- ✅ Mantienes tus nameservers actuales de HostingPlus
- ✅ SSL/HTTPS se configura automáticamente
- ✅ Vercel gestiona la verificación automáticamente

---

## Verificación

Una vez configurado:

1. Espera 24-48 horas para la propagación
2. Vercel te notificará cuando esté listo
3. Visita `https://gotrachile.com` para verificar

## Nota sobre SSL

Vercel configurará automáticamente un certificado SSL gratuito (HTTPS) cuando el dominio esté configurado. No necesitas hacer nada adicional.

