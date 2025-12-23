# Configuración de Dominio en Vercel

## 🔴 Solución para "Invalid Configuration"

Si ves "Invalid Configuration" en tus dominios, sigue estos pasos:

### Paso 1: Ver los registros DNS requeridos

1. En Vercel Dashboard, haz clic en **"Learn more"** o **"Edit"** en el dominio con error
2. Vercel te mostrará los registros DNS exactos que necesitas configurar
3. **Copia estos registros** (son específicos para tu proyecto)

### Paso 2: Configurar DNS en tu proveedor de dominio

Ve a tu proveedor de dominio (donde compraste `gotra.cl`) y agrega los registros:

#### Para `www.gotra.cl` (Subdominio):
```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: 3600 (o automático)
```

#### Para `gotra.cl` (Dominio raíz):
**Opción A - Si tu proveedor soporta Apex CNAME:**
```
Tipo: CNAME
Nombre: @
Valor: cname.vercel-dns.com
```

**Opción B - Si NO soporta Apex CNAME (más común):**
```
Tipo: A
Nombre: @
Valor: 76.76.21.21
```

### Paso 3: Verificar propagación DNS

1. Espera 5-15 minutos después de agregar los registros
2. Verifica en [whatsmydns.net](https://www.whatsmydns.net):
   - Busca `gotra.cl` y verifica que apunte a `76.76.21.21`
   - Busca `www.gotra.cl` y verifica que apunte a `cname.vercel-dns.com`
3. En Vercel, haz clic en **"Refresh"** en cada dominio

### Paso 4: Solución de problemas comunes

**Si sigue mostrando "Invalid Configuration":**

1. **Verifica que los registros DNS estén correctos:**
   - El nombre debe ser exactamente `@` para el dominio raíz o `www` para el subdominio
   - El valor debe ser exactamente el que Vercel te proporcionó

2. **Elimina registros DNS conflictivos:**
   - Si tienes otros registros A o CNAME para estos dominios, elimínalos
   - Solo debe haber UN registro para cada dominio

3. **Espera la propagación:**
   - Los cambios DNS pueden tardar hasta 48 horas
   - Normalmente toma entre 15 minutos y 2 horas

4. **Verifica en Vercel:**
   - Haz clic en "Refresh" después de esperar unos minutos
   - Vercel verificará automáticamente los registros

### Paso 5: Configurar redirect (opcional)

Si quieres que `gotra.cl` redirija a `www.gotra.cl`:
1. En Vercel, edita el dominio `gotra.cl`
2. Configura el redirect a `www.gotra.cl`
3. Esto creará un redirect 307 (temporal) o 308 (permanente)

## ✅ Una vez configurado correctamente

- Verás un check verde ✅ en lugar del triángulo de advertencia
- El estado cambiará a "Valid Configuration"
- El certificado SSL se generará automáticamente
- Tu sitio estará disponible en `https://gotra.cl` y `https://www.gotra.cl`

## 📝 Notas importantes

- **No elimines** los registros DNS hasta que Vercel confirme la conexión
- El redirect 307 que ves es normal si configuraste `gotra.cl` para redirigir a `www.gotra.cl`
- Si tienes problemas, contacta a tu proveedor de dominio para verificar la configuración DNS

