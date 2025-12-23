# 🌐 Configurar Dominio gotrachile.com en Vercel

## Opción 1: Usar Nameservers de Vercel (Recomendado)

Esta es la opción más simple y recomendada.

### Paso 1: Agregar Dominio en Vercel

1. Ve a Vercel → Tu proyecto `gotra-joy` → **Settings** → **Domains**
2. Haz clic en **"Add Domain"**
3. Ingresa: `gotrachile.com`
4. Haz clic en **"Add"**

### Paso 2: Obtener Nameservers de Vercel

Después de agregar el dominio, Vercel te mostrará los nameservers que debes usar, algo como:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Copia estos nameservers.**

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

## Opción 2: Usar Registros DNS (Alternativa)

Si prefieres mantener los nameservers de HostingPlus, puedes configurar registros DNS:

### Paso 1: Agregar Dominio en Vercel

1. Ve a Vercel → Tu proyecto → **Settings** → **Domains**
2. Agrega `gotrachile.com`
3. Vercel te mostrará los registros DNS que necesitas configurar

### Paso 2: Configurar Registros en HostingPlus

En HostingPlus, necesitarás agregar estos registros (Vercel te dará los valores exactos):

**Registro A o CNAME:**
- **Tipo**: `CNAME` o `A`
- **Nombre**: `@` o `gotrachile.com`
- **Valor**: El que te dé Vercel (algo como `cname.vercel-dns.com` o una IP)

**Para www:**
- **Tipo**: `CNAME`
- **Nombre**: `www`
- **Valor**: El que te dé Vercel

### Paso 3: Verificar en Vercel

Vercel verificará automáticamente cuando los registros estén configurados correctamente.

---

## Recomendación

**Usa la Opción 1 (Nameservers de Vercel)** porque:
- ✅ Más simple de configurar
- ✅ Vercel gestiona todo automáticamente
- ✅ SSL/HTTPS se configura automáticamente
- ✅ Mejor rendimiento

---

## Verificación

Una vez configurado:

1. Espera 24-48 horas para la propagación
2. Vercel te notificará cuando esté listo
3. Visita `https://gotrachile.com` para verificar

## Nota sobre SSL

Vercel configurará automáticamente un certificado SSL gratuito (HTTPS) cuando el dominio esté configurado. No necesitas hacer nada adicional.

