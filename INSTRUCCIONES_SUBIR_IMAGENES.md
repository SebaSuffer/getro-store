# 📸 Instrucciones para Subir Imágenes Manualmente

## Importante: Nombres de Archivos

**⚠️ CRÍTICO:** Vercel (Linux) distingue mayúsculas/minúsculas, Windows NO.

### Reglas para Nombres de Archivos:

1. ✅ **TODO en minúsculas**: `dsc05016.jpg` (NO `DSC05016.jpg`)
2. ✅ **Sin espacios**: Usa guiones `-` en lugar de espacios
3. ✅ **Sin paréntesis**: `dsc04974-1.png` (NO `dsc04974 (1).png`)
4. ✅ **Sin caracteres especiales**: Solo letras, números, guiones y puntos

### Ejemplos:

**❌ INCORRECTO:**
- `DSC05016.jpg` (mayúsculas)
- `Mercado-Pago-Logo.png` (mayúsculas)
- `DSC04974 (1).png` (espacios y paréntesis)

**✅ CORRECTO:**
- `dsc05016.jpg`
- `mercado-pago-logo.png`
- `dsc04974-1.png`

## Pasos para Subir las Imágenes

### 1. Preparar los Archivos

1. Renombra TODAS las imágenes a minúsculas
2. Elimina espacios y reemplázalos con guiones `-`
3. Elimina paréntesis y caracteres especiales

### 2. Subir a GitHub

**Opción A: Desde GitHub Web Interface**
1. Ve a tu repositorio en GitHub
2. Navega a `public/images/`
3. Haz clic en "Add file" → "Upload files"
4. Arrastra todas las imágenes
5. Haz commit con mensaje: "Agregar imágenes con nombres en minúsculas"

**Opción B: Desde Git Local**
```bash
# Copia las imágenes renombradas a public/images/
git add public/images/
git commit -m "Agregar imágenes con nombres en minúsculas"
git push
```

### 3. Verificar en GitHub

Después de subir, verifica en GitHub que:
- ✅ Todos los nombres están en minúsculas
- ✅ No hay espacios en los nombres
- ✅ No hay paréntesis

## Archivos que Necesitas Subir

Basado en el código, necesitas estas imágenes:

### Productos (12 imágenes):
- `dsc05016.jpg` - Cadena Pancer
- `dsc05015.jpg` - Pulsera Capri
- `dsc05014.jpg` - Anillo Black
- `dsc05013.jpg` - Cadena Franco
- `dsc05012.jpg` - Esclava
- `dsc05010.jpg` - Colgante Placa
- `dsc05008.jpg` - Aro Argolla
- `dsc05007.jpg` - Cadena Rope
- `dsc05006.jpg` - Pulsera Franco
- `dsc05005.jpg` - Anillo Plata
- `dsc05004.jpg` - Cadena Prisma
- `dsc05003.jpg` - Colgante Cruz

### Logos de Pago:
- `transbank-1200px-logo.png`
- `mercado-pago-logo.png`
- `transferencia-logo.png`

### Hero y Categorías:
- `dsc05016.jpg` (usado en hero y categoría Cadenas)
- `dsc05015.jpg` (categoría Pulseras)
- `dsc05014.jpg` (categoría Anillos)
- `dsc05010.jpg` (categoría Colgantes)
- `dsc05008.jpg` (categoría Aros)
- `dsc05012.jpg` (categoría Esclavas)

## Después de Subir

1. **Haz redeploy en Vercel** (automático o manual)
2. **Verifica que las imágenes carguen:**
   - Abre tu sitio
   - DevTools → Network
   - Verifica que las peticiones a `/images/...` devuelvan 200

## Si Aún No Funcionan

Si después de subir manualmente las imágenes siguen sin cargar, procederemos con **Cloudinary** como CDN, que es más confiable para producción.

