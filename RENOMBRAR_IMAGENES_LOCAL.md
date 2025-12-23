# 📸 Instrucciones para Renombrar Imágenes Localmente

## Pasos para Renombrar las Imágenes

### 1. Ubicación de las Imágenes

Las imágenes originales deben estar en: `public/images/`

### 2. Mapeo de Nombres

Usa este mapeo para renombrar cada imagen:

#### Productos (12 imágenes):

| Imagen Original | Nuevo Nombre |
|----------------|--------------|
| `DSC05016.jpg` | `cadena-pancer-plata-3mm.jpg` |
| `DSC05015.jpg` | `pulsera-capri-plata-4mm.jpg` |
| `DSC05014.jpg` | `anillo-black-2-line-v.jpg` |
| `DSC05013.jpg` | `cadena-franco-plata-3-7mm.jpg` |
| `DSC05012.jpg` | `esclava-plata-5mm.jpg` |
| `DSC05010.jpg` | `colgante-placa-plata.jpg` |
| `DSC05008.jpg` | `aro-argolla-lumiere-plata-12mm.jpg` |
| `DSC05007.jpg` | `cadena-rope-plata-1-4mm.jpg` |
| `DSC05006.jpg` | `pulsera-franco-plata-2-5mm.jpg` |
| `DSC05005.jpg` | `anillo-plata-solida.jpg` |
| `DSC05004.jpg` | `cadena-prisma-plata-2-8mm.jpg` |
| `DSC05003.jpg` | `colgante-cruz-plata.jpg` |

#### Logos de Pago (3 imágenes):

| Imagen Original | Nuevo Nombre |
|----------------|--------------|
| `Transbank-1200px-logo.png` | `transbank-logo.png` |
| `Mercado-Pago-Logo.png` | `mercado-pago-logo.png` |
| `transferencia-logo.png` | `transferencia-bancaria-logo.png` |

### 3. Cómo Renombrar

**Opción A: Manualmente en Windows**
1. Ve a la carpeta `public/images/`
2. Haz clic derecho en cada archivo → "Renombrar"
3. Cambia el nombre según el mapeo
4. **IMPORTANTE**: Asegúrate de que estén en minúsculas

**Opción B: Usando PowerShell (Rápido)**
```powershell
cd public/images

# Renombrar productos
Rename-Item "DSC05016.jpg" "cadena-pancer-plata-3mm.jpg"
Rename-Item "DSC05015.jpg" "pulsera-capri-plata-4mm.jpg"
Rename-Item "DSC05014.jpg" "anillo-black-2-line-v.jpg"
Rename-Item "DSC05013.jpg" "cadena-franco-plata-3-7mm.jpg"
Rename-Item "DSC05012.jpg" "esclava-plata-5mm.jpg"
Rename-Item "DSC05010.jpg" "colgante-placa-plata.jpg"
Rename-Item "DSC05008.jpg" "aro-argolla-lumiere-plata-12mm.jpg"
Rename-Item "DSC05007.jpg" "cadena-rope-plata-1-4mm.jpg"
Rename-Item "DSC05006.jpg" "pulsera-franco-plata-2-5mm.jpg"
Rename-Item "DSC05005.jpg" "anillo-plata-solida.jpg"
Rename-Item "DSC05004.jpg" "cadena-prisma-plata-2-8mm.jpg"
Rename-Item "DSC05003.jpg" "colgante-cruz-plata.jpg"

# Renombrar logos
Rename-Item "Transbank-1200px-logo.png" "transbank-logo.png"
Rename-Item "Mercado-Pago-Logo.png" "mercado-pago-logo.png"
Rename-Item "transferencia-logo.png" "transferencia-bancaria-logo.png"
```

### 4. Verificar

Después de renombrar, verifica que:
- ✅ Todos los nombres están en **minúsculas**
- ✅ No hay **espacios** (solo guiones `-`)
- ✅ No hay **paréntesis** ni caracteres especiales
- ✅ Los nombres coinciden exactamente con el mapeo

### 5. Subir a GitHub

Una vez renombradas, sube las imágenes a GitHub:

**Opción A: GitHub Web Interface**
1. Ve a tu repositorio en GitHub
2. Navega a `public/images/`
3. Haz clic en "Add file" → "Upload files"
4. Arrastra todas las imágenes renombradas
5. Commit con mensaje: "Agregar imágenes con nombres descriptivos"

**Opción B: Git Local**
```bash
git add public/images/
git commit -m "Agregar imágenes con nombres descriptivos"
git push
```

## Notas Importantes

- ⚠️ **Vercel (Linux) distingue mayúsculas/minúsculas**
- ⚠️ **Windows NO distingue mayúsculas/minúsculas**
- ⚠️ Por eso es crítico que todos los nombres estén en **minúsculas**

## Archivos que NO necesitas subir

- `DSC04973.jpg` y otros archivos DSC que no están en el código
- Cualquier archivo que no esté en el mapeo anterior

Solo sube las **15 imágenes** listadas en el mapeo (12 productos + 3 logos).

