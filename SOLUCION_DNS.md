# 🔧 Solución Rápida: Invalid Configuration en Vercel

## Problema Actual
Tus dominios `gotra.cl` y `www.gotra.cl` muestran "Invalid Configuration" en Vercel.

## Solución Paso a Paso

### 1. Obtener los registros DNS de Vercel

En Vercel Dashboard:
1. Haz clic en **"Edit"** en el dominio `www.gotra.cl`
2. Verás los registros DNS que necesitas
3. **Copia el valor exacto** (será algo como `cname.vercel-dns.com` o una IP)

### 2. Configurar en tu proveedor de dominio

**Para www.gotra.cl:**
```
Tipo: CNAME
Host/Nombre: www
Valor/Destino: cname.vercel-dns.com (o el que Vercel te indique)
TTL: 3600
```

**Para gotra.cl (dominio raíz):**
```
Tipo: A
Host/Nombre: @ (o vacío, dependiendo del proveedor)
Valor/Destino: 76.76.21.21 (o la IP que Vercel te indique)
TTL: 3600
```

### 3. Verificar y esperar

1. Guarda los cambios en tu proveedor de dominio
2. Espera 10-15 minutos
3. Verifica en [whatsmydns.net](https://www.whatsmydns.net):
   - Busca `gotra.cl` → debe mostrar la IP de Vercel
   - Busca `www.gotra.cl` → debe mostrar `cname.vercel-dns.com`
4. En Vercel, haz clic en **"Refresh"** en cada dominio

### 4. Si sigue sin funcionar

**Verifica:**
- ✅ Los registros DNS están guardados correctamente
- ✅ No hay otros registros A o CNAME conflictivos
- ✅ El TTL no es muy alto (usa 3600 o automático)
- ✅ Has esperado al menos 15 minutos

**Acción:**
- Haz clic en "Refresh" en Vercel
- Si después de 1 hora sigue igual, verifica con tu proveedor de dominio

## ⚠️ Importante

- El redirect 307 de `gotra.cl` a `www.gotra.cl` es normal si lo configuraste así
- Ambos dominios deben tener sus propios registros DNS configurados
- El certificado SSL se generará automáticamente una vez que los DNS estén correctos



