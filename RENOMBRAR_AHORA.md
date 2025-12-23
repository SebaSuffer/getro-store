# 🔄 Renombrar Imágenes Localmente - Comandos Directos

## Ejecuta estos comandos en PowerShell (uno por uno o todos juntos):

```powershell
cd "public/images"

# Productos
Rename-Item "DSC05016.jpg" "cadena-pancer-plata-3mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05016.jpg" "cadena-pancer-plata-3mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05015.jpg" "pulsera-capri-plata-4mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05015.jpg" "pulsera-capri-plata-4mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05014.jpg" "anillo-black-2-line-v.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05014.jpg" "anillo-black-2-line-v.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05013.jpg" "cadena-franco-plata-3-7mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05013.jpg" "cadena-franco-plata-3-7mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05012.jpg" "esclava-plata-5mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05012.jpg" "esclava-plata-5mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05010.jpg" "colgante-placa-plata.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05010.jpg" "colgante-placa-plata.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05008.jpg" "aro-argolla-lumiere-plata-12mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05008.jpg" "aro-argolla-lumiere-plata-12mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05007.jpg" "cadena-rope-plata-1-4mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05007.jpg" "cadena-rope-plata-1-4mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05006.jpg" "pulsera-franco-plata-2-5mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05006.jpg" "pulsera-franco-plata-2-5mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05005.jpg" "anillo-plata-solida.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05005.jpg" "anillo-plata-solida.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05004.jpg" "cadena-prisma-plata-2-8mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05004.jpg" "cadena-prisma-plata-2-8mm.jpg" -ErrorAction SilentlyContinue
Rename-Item "DSC05003.jpg" "colgante-cruz-plata.jpg" -ErrorAction SilentlyContinue
Rename-Item "dsc05003.jpg" "colgante-cruz-plata.jpg" -ErrorAction SilentlyContinue

# Logos
Rename-Item "Transbank-1200px-logo.png" "transbank-logo.png" -ErrorAction SilentlyContinue
Rename-Item "transbank-1200px-logo.png" "transbank-logo.png" -ErrorAction SilentlyContinue
Rename-Item "Mercado-Pago-Logo.png" "mercado-pago-logo.png" -ErrorAction SilentlyContinue
Rename-Item "mercado-pago-logo.png" "mercado-pago-logo.png" -ErrorAction SilentlyContinue
Rename-Item "transferencia-logo.png" "transferencia-bancaria-logo.png" -ErrorAction SilentlyContinue

cd ../..
```

## O ejecuta este comando completo:

```powershell
cd "public/images"; @("DSC05016.jpg","dsc05016.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "cadena-pancer-plata-3mm.jpg" -ErrorAction SilentlyContinue } }; @("DSC05015.jpg","dsc05015.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "pulsera-capri-plata-4mm.jpg" -ErrorAction SilentlyContinue } }; @("DSC05014.jpg","dsc05014.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "anillo-black-2-line-v.jpg" -ErrorAction SilentlyContinue } }; @("DSC05013.jpg","dsc05013.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "cadena-franco-plata-3-7mm.jpg" -ErrorAction SilentlyContinue } }; @("DSC05012.jpg","dsc05012.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "esclava-plata-5mm.jpg" -ErrorAction SilentlyContinue } }; @("DSC05010.jpg","dsc05010.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "colgante-placa-plata.jpg" -ErrorAction SilentlyContinue } }; @("DSC05008.jpg","dsc05008.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "aro-argolla-lumiere-plata-12mm.jpg" -ErrorAction SilentlyContinue } }; @("DSC05007.jpg","dsc05007.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "cadena-rope-plata-1-4mm.jpg" -ErrorAction SilentlyContinue } }; @("DSC05006.jpg","dsc05006.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "pulsera-franco-plata-2-5mm.jpg" -ErrorAction SilentlyContinue } }; @("DSC05005.jpg","dsc05005.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "anillo-plata-solida.jpg" -ErrorAction SilentlyContinue } }; @("DSC05004.jpg","dsc05004.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "cadena-prisma-plata-2-8mm.jpg" -ErrorAction SilentlyContinue } }; @("DSC05003.jpg","dsc05003.jpg") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "colgante-cruz-plata.jpg" -ErrorAction SilentlyContinue } }; @("Transbank-1200px-logo.png","transbank-1200px-logo.png") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "transbank-logo.png" -ErrorAction SilentlyContinue } }; @("Mercado-Pago-Logo.png","mercado-pago-logo.png") | ForEach-Object { if (Test-Path $_) { Rename-Item $_ "mercado-pago-logo.png" -ErrorAction SilentlyContinue } }; if (Test-Path "transferencia-logo.png") { Rename-Item "transferencia-logo.png" "transferencia-bancaria-logo.png" -ErrorAction SilentlyContinue }; cd ../..
```

