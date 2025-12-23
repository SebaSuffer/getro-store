# 📋 Guía Detallada: Configurar DNS en HostingPlus

## ⚠️ IMPORTANTE: NO cambies los Nameservers

**NO necesitas cambiar los nameservers.** Mantén los nameservers de HostingPlus (`dns1.hostingplus.cl`, etc.) y solo agrega **registros DNS**.

---

## Paso 1: Encontrar la Sección de Registros DNS

1. En HostingPlus, ve a **"Administrar"** → **"Gestionar Cambio de DNS"** (o busca **"Zona DNS"** o **"Registros DNS"**)
2. Si no encuentras esa opción, busca en el menú:
   - **"DNS"**
   - **"Zona DNS"**
   - **"Registros DNS"**
   - **"Gestión DNS"**
   - **"Configuración DNS"**

---

## Paso 2: Agregar el Registro A (para gotrachile.com)

1. En la sección de registros DNS, busca un botón que diga:
   - **"Agregar Registro"**
   - **"Nuevo Registro"**
   - **"Añadir Registro DNS"**
   - O un botón **"+"** o **"Agregar"**

2. Al hacer clic, se abrirá un formulario. Completa así:

   **Tipo de Registro:**
   - Selecciona **"A"** (o **"A Record"**)

   **Nombre/Host:**
   - Escribe: `@`
   - O déjalo **vacío**
   - O escribe: `gotrachile.com`
   - (Depende de tu panel, prueba primero con `@`)

   **Valor/IP:**
   - Escribe: `216.198.79.1`
   - (Este es el IP que Vercel te mostró)

   **TTL:**
   - Déjalo en el valor por defecto (generalmente 3600)
   - O escribe: `3600`

3. Haz clic en **"Guardar"** o **"Agregar"** o **"Aceptar"**

---

## Paso 3: Agregar el Registro CNAME (para www.gotrachile.com)

1. Nuevamente, haz clic en **"Agregar Registro"** o **"Nuevo Registro"**

2. Completa el formulario así:

   **Tipo de Registro:**
   - Selecciona **"CNAME"** (o **"CNAME Record"**)

   **Nombre/Host:**
   - Escribe: `www`
   - **NO escribas** `www.gotrachile.com`, solo `www`

   **Valor/Destino:**
   - Escribe: `bdba6edb2a0ec205.vercel-dns-017.com.`
   - **IMPORTANTE:** Incluye el punto (`.`) al final
   - Este es el valor exacto que Vercel te mostró

   **TTL:**
   - Déjalo en el valor por defecto (generalmente 3600)
   - O escribe: `3600`

3. Haz clic en **"Guardar"** o **"Agregar"** o **"Aceptar"**

---

## Paso 4: Verificar que se Agregaron Correctamente

Después de agregar ambos registros, deberías ver en tu lista de registros DNS algo como:

```
Tipo    Nombre    Valor
A       @         216.198.79.1
CNAME   www       bdba6edb2a0ec205.vercel-dns-017.com.
```

---

## Paso 5: Esperar la Propagación

1. Los cambios pueden tardar entre **5 minutos y 48 horas**
2. Generalmente es menos de 1 hora
3. Vercel verificará automáticamente cuando esté listo
4. Recibirás un email de Vercel cuando el dominio esté configurado

---

## ❓ Si No Encuentras la Opción de Agregar Registros

Si tu panel de HostingPlus no tiene una opción clara para agregar registros DNS:

1. **Contacta a HostingPlus** y pídeles que agreguen estos registros:
   - Registro A: `@` → `216.198.79.1`
   - Registro CNAME: `www` → `bdba6edb2a0ec205.vercel-dns-017.com.`

2. O busca en la documentación de HostingPlus cómo agregar registros DNS

---

## ✅ Verificar en Vercel

1. Ve a Vercel → Tu proyecto → **Settings** → **Domains**
2. Haz clic en **"Refresh"** en el dominio `gotrachile.com`
3. El estado debería cambiar de "Invalid Configuration" a "Valid Configuration" cuando esté listo

---

## 📝 Resumen de lo que Necesitas

**NO cambies los nameservers.** Solo agrega estos 2 registros DNS:

1. **Registro A:**
   - Tipo: A
   - Nombre: `@`
   - Valor: `216.198.79.1`

2. **Registro CNAME:**
   - Tipo: CNAME
   - Nombre: `www`
   - Valor: `bdba6edb2a0ec205.vercel-dns-017.com.` (con punto final)

