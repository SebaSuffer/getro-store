# Script para renombrar imágenes localmente según el mapeo
# NO hace commit, solo renombra los archivos localmente

$imageDir = "public/images"

Write-Host "Renombrando imágenes en $imageDir..." -ForegroundColor Cyan

# Mapeo de nombres antiguos a nuevos
$mapeo = @{
    # Productos
    "DSC05016.jpg" = "cadena-pancer-plata-3mm.jpg"
    "dsc05016.jpg" = "cadena-pancer-plata-3mm.jpg"
    "DSC05015.jpg" = "pulsera-capri-plata-4mm.jpg"
    "dsc05015.jpg" = "pulsera-capri-plata-4mm.jpg"
    "DSC05014.jpg" = "anillo-black-2-line-v.jpg"
    "dsc05014.jpg" = "anillo-black-2-line-v.jpg"
    "DSC05013.jpg" = "cadena-franco-plata-3-7mm.jpg"
    "dsc05013.jpg" = "cadena-franco-plata-3-7mm.jpg"
    "DSC05012.jpg" = "esclava-plata-5mm.jpg"
    "dsc05012.jpg" = "esclava-plata-5mm.jpg"
    "DSC05010.jpg" = "colgante-placa-plata.jpg"
    "dsc05010.jpg" = "colgante-placa-plata.jpg"
    "DSC05008.jpg" = "aro-argolla-lumiere-plata-12mm.jpg"
    "dsc05008.jpg" = "aro-argolla-lumiere-plata-12mm.jpg"
    "DSC05007.jpg" = "cadena-rope-plata-1-4mm.jpg"
    "dsc05007.jpg" = "cadena-rope-plata-1-4mm.jpg"
    "DSC05006.jpg" = "pulsera-franco-plata-2-5mm.jpg"
    "dsc05006.jpg" = "pulsera-franco-plata-2-5mm.jpg"
    "DSC05005.jpg" = "anillo-plata-solida.jpg"
    "dsc05005.jpg" = "anillo-plata-solida.jpg"
    "DSC05004.jpg" = "cadena-prisma-plata-2-8mm.jpg"
    "dsc05004.jpg" = "cadena-prisma-plata-2-8mm.jpg"
    "DSC05003.jpg" = "colgante-cruz-plata.jpg"
    "dsc05003.jpg" = "colgante-cruz-plata.jpg"
    
    # Logos
    "Transbank-1200px-logo.png" = "transbank-logo.png"
    "transbank-1200px-logo.png" = "transbank-logo.png"
    "Mercado-Pago-Logo.png" = "mercado-pago-logo.png"
    "mercado-pago-logo.png" = "mercado-pago-logo.png"
    "transferencia-logo.png" = "transferencia-bancaria-logo.png"
}

$renombrados = 0
$noEncontrados = @()

if (Test-Path $imageDir) {
    $archivos = Get-ChildItem $imageDir -File
    
    foreach ($archivo in $archivos) {
        $nombreActual = $archivo.Name
        
        if ($mapeo.ContainsKey($nombreActual)) {
            $nombreNuevo = $mapeo[$nombreActual]
            $rutaCompleta = $archivo.FullName
            $nuevaRuta = Join-Path $archivo.DirectoryName $nombreNuevo
            
            # Solo renombrar si el nombre es diferente
            if ($nombreActual -ne $nombreNuevo) {
                # Si el archivo destino ya existe, usar un nombre temporal primero
                if (Test-Path $nuevaRuta) {
                    $tempName = "_temp_" + [System.Guid]::NewGuid().ToString().Substring(0,8) + "_" + $nombreNuevo
                    $tempPath = Join-Path $archivo.DirectoryName $tempName
                    Rename-Item -Path $rutaCompleta -NewName $tempName -ErrorAction SilentlyContinue
                    if (Test-Path $tempPath) {
                        Rename-Item -Path $tempPath -NewName $nombreNuevo -ErrorAction SilentlyContinue
                    }
                } else {
                    Rename-Item -Path $rutaCompleta -NewName $nombreNuevo -ErrorAction SilentlyContinue
                }
                
                if (Test-Path $nuevaRuta) {
                    Write-Host "✓ Renombrado: $nombreActual -> $nombreNuevo" -ForegroundColor Green
                    $renombrados++
                } else {
                    Write-Host "✗ Error al renombrar: $nombreActual" -ForegroundColor Red
                }
            } else {
                Write-Host "→ Ya tiene el nombre correcto: $nombreActual" -ForegroundColor Yellow
            }
        } else {
            $noEncontrados += $nombreActual
        }
    }
    
    Write-Host "`nResumen:" -ForegroundColor Cyan
    Write-Host "  Archivos renombrados: $renombrados" -ForegroundColor Green
    
    if ($noEncontrados.Count -gt 0) {
        Write-Host "  Archivos no encontrados en el mapeo:" -ForegroundColor Yellow
        foreach ($archivo in $noEncontrados) {
            Write-Host "    - $archivo" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Error: La carpeta $imageDir no existe" -ForegroundColor Red
}

Write-Host "`n¡Listo! Los archivos fueron renombrados localmente (NO se hizo commit)." -ForegroundColor Cyan

