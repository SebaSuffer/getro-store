# Configuración DNS para gotrachile.com en HostingPlus

## Problema Actual
El dominio muestra error `DNS_PROBE_POSSIBLE` porque los registros DNS no están apuntando a Vercel.

## Solución: Configurar Registros DNS en HostingPlus

### Paso 1: Obtener los valores de Vercel

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Domains**
3. Haz clic en `www.gotrachile.com`
4. Verás las instrucciones de DNS que necesitas configurar

**Valores típicos de Vercel:**
- **Tipo A**: `76.76.21.21` (o similar, Vercel te dará el IP exacto)
- **Tipo CNAME para www**: `cname.vercel-dns.com.` (o similar)

### Paso 2: Configurar en HostingPlus

1. **Accede al panel de HostingPlus**
   - Inicia sesión en tu cuenta de HostingPlus
   - Ve a la sección de **DNS** o **Zona DNS**

2. **Configura los registros DNS:**

   **Para `www.gotrachile.com` (CNAME):**
   ```
   Tipo: CNAME
   Nombre: www
   Valor: cname.vercel-dns.com.
   TTL: 3600 (o Auto)
   ```

   **Para `gotrachile.com` (A Record o CNAME):**
   
   **Opción A - Usar A Record (recomendado):**
   ```
   Tipo: A
   Nombre: @ (o vacío, o "gotrachile.com")
   Valor: 76.76.21.21 (el IP que Vercel te proporcione)
   TTL: 3600
   ```

   **Opción B - Usar CNAME (si HostingPlus lo permite):**
   ```
   Tipo: CNAME
   Nombre: @ (o vacío)
   Valor: cname.vercel-dns.com.
   TTL: 3600
   ```

### Paso 3: Verificar en Vercel

1. Después de configurar los DNS, vuelve a Vercel
2. Haz clic en **Refresh** en el dominio `www.gotrachile.com`
3. Espera unos minutos (puede tardar hasta 24 horas, pero normalmente es más rápido)

### Paso 4: Verificar propagación DNS

Puedes verificar si los DNS se han propagado usando:

- **Herramienta online**: https://dnschecker.org/
- **Comando en terminal**: 
  ```bash
  nslookup www.gotrachile.com
  ```

## Notas Importantes

1. **Propagación DNS**: Los cambios pueden tardar entre 5 minutos y 48 horas en propagarse globalmente
2. **TTL**: Usa 3600 segundos (1 hora) para cambios más rápidos
3. **Verificación**: Vercel mostrará "Valid Configuration" cuando los DNS estén correctos
4. **Redirección**: Vercel ya tiene configurado que `gotrachile.com` redirija a `www.gotrachile.com`

## Si el problema persiste

1. Verifica que los registros DNS estén exactamente como Vercel los solicita
2. Asegúrate de que no haya registros DNS conflictivos
3. Espera al menos 1 hora después de hacer los cambios
4. Limpia la caché DNS de tu computadora:
   - Windows: `ipconfig /flushdns`
   - Mac/Linux: `sudo dscacheutil -flushcache`

## Contacto con HostingPlus

Si tienes problemas configurando los DNS en HostingPlus, contacta a su soporte técnico y diles:
- "Necesito configurar registros DNS para apuntar mi dominio a Vercel"
- "Necesito un registro A para el dominio raíz y un CNAME para www"

