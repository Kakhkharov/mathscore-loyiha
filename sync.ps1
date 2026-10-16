# MathScore Safe Synchronizer
# Alohida papkalardagi (admin, student, landing) o'zgarishlarni mathscore-frontend ga sinxronlaydi

$ErrorActionPreference = "Stop"

Write-Host "🔄 Fayllar mathscore-frontend ga sinxronlanmoqda..." -ForegroundColor Cyan

# Papkalar mavjudligini ta'minlash
$paths = @(
    "mathscore-frontend\src\admin",
    "mathscore-frontend\src\student",
    "mathscore-frontend\src\landing",
    "mathscore-frontend\public"
)
foreach ($p in $paths) {
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
    }
}

# Source fayllarni xavfsiz ko'chirish (mavjud maxsus fayllarga teginmasdan)
if (Test-Path "mathscore-admin\src") {
    Copy-Item "mathscore-admin\src\*" "mathscore-frontend\src\admin\" -Recurse -Force
}
if (Test-Path "mathscore-student\src") {
    Copy-Item "mathscore-student\src\*" "mathscore-frontend\src\student\" -Recurse -Force
}
if (Test-Path "mathscore-landing\src") {
    Copy-Item "mathscore-landing\src\*" "mathscore-frontend\src\landing\" -Recurse -Force
}

# Public assetlarni ko'chirish
if (Test-Path "mathscore-admin\public") { Copy-Item "mathscore-admin\public\*" "mathscore-frontend\public\" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "mathscore-student\public") { Copy-Item "mathscore-student\public\*" "mathscore-frontend\public\" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "mathscore-landing\public") { Copy-Item "mathscore-landing\public\*" "mathscore-frontend\public\" -Recurse -Force -ErrorAction SilentlyContinue }

Write-Host "✅ Sinxronizatsiya muvaffaqiyatli yakunlandi!" -ForegroundColor Green
