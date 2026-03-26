# ============================================
# LITFIT - Script de Deploy para Hostinger
# Ejecutar con: npm run deploy
# Genera: litfit-hostinger.zip listo para subir
# ============================================

$root     = Split-Path -Parent $PSScriptRoot
$buildDir = Join-Path $root "dist-build"   # Carpeta temporal de Vite
$outDir   = Join-Path $root "public_html"  # Carpeta final ensamblada
$backend  = Join-Path $root "backend-hostinger"
$zipPath  = Join-Path $root "litfit-hostinger.zip"

Write-Host ""
Write-Host ">> LITFIT Deploy - Generando paquete para Hostinger..." -ForegroundColor Cyan
Write-Host ""

# 1. Limpiar carpetas y zip anteriores
if (Test-Path $buildDir) { Remove-Item -Recurse -Force $buildDir 2>$null }
if (Test-Path $outDir)   { Remove-Item -Recurse -Force $outDir  2>$null }
if (Test-Path $zipPath)  { Remove-Item -Force $zipPath 2>$null }

# 2. Compilar frontend con Vite (salida -> dist-build/)
Write-Host "   [1/5] Compilando frontend React..." -ForegroundColor White
& npm run build

if (-not (Test-Path $buildDir)) {
    Write-Host "   ERROR: El build fallo. Revisa los errores de compilacion." -ForegroundColor Red
    exit 1
}
Write-Host "   OK: Frontend compilado en dist-build/" -ForegroundColor Green

# 3. Copiar frontend compilado a public_html/
Write-Host "   [2/5] Armando public_html/..." -ForegroundColor White
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
Copy-Item -Recurse -Force "$buildDir\*" $outDir
Write-Host "   OK: Frontend copiado a public_html/" -ForegroundColor Green

# 4. Copiar .htaccess
Write-Host "   [3/5] Copiando .htaccess..." -ForegroundColor White
$htaccess = Join-Path $backend "frontend-dist\.htaccess"
if (Test-Path $htaccess) {
    Copy-Item -Force $htaccess (Join-Path $outDir ".htaccess")
    Write-Host "   OK: .htaccess copiado" -ForegroundColor Green
} else {
    Write-Host "   AVISO: No se encontro .htaccess" -ForegroundColor Yellow
}

# 5. Copiar backend PHP
Write-Host "   [4/5] Copiando backend PHP..." -ForegroundColor White
$srcEnvios = Join-Path $backend "envios"
$srcMP     = Join-Path $backend "mercadopago"
if (Test-Path $srcEnvios) {
    Copy-Item -Recurse -Force $srcEnvios (Join-Path $outDir "envios")
    Write-Host "   OK: /envios copiado" -ForegroundColor Green
}
if (Test-Path $srcMP) {
    Copy-Item -Recurse -Force $srcMP (Join-Path $outDir "mercadopago")
    Write-Host "   OK: /mercadopago copiado" -ForegroundColor Green
}

# 6. Crear ZIP
Write-Host "   [5/5] Creando litfit-hostinger.zip..." -ForegroundColor White
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($outDir, $zipPath)
Write-Host "   OK: ZIP creado" -ForegroundColor Green

# Limpiar carpeta temporal de build
Remove-Item -Recurse -Force $buildDir 2>$null

# Resultado
$zipSizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
$structure = Get-ChildItem $outDir -Name

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " LISTO para subir a Hostinger!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host " Archivo: litfit-hostinger.zip ($zipSizeMB MB)" -ForegroundColor White
Write-Host " Ubicacion: $zipPath" -ForegroundColor White
Write-Host ""
Write-Host " Contenido de public_html/:" -ForegroundColor Cyan
foreach ($item in $structure) { Write-Host "   /$item" -ForegroundColor White }
Write-Host ""
Write-Host " Instrucciones Hostinger:" -ForegroundColor Cyan
Write-Host "   1. Abre el Administrador de Archivos de Hostinger" -ForegroundColor White
Write-Host "   2. Navega a public_html/" -ForegroundColor White
Write-Host "   3. Sube litfit-hostinger.zip" -ForegroundColor White
Write-Host "   4. Haz clic derecho -> Extraer aqui" -ForegroundColor White
Write-Host "   5. Elimina el .zip del servidor" -ForegroundColor White
Write-Host ""
