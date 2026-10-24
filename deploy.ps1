param (
    [string]$msg = ""
)

$ErrorActionPreference = "Stop"

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "MathScore Avtomatik Deploy Tizimi" -ForegroundColor Cyan
Write-Host "==================================================`n" -ForegroundColor Cyan

# 1-qadam: Sinxronizatsiya
Write-Host "1. Fayllar sinxronizatsiyasi..." -ForegroundColor Yellow
& "$PSScriptRoot\sync.ps1"

# 2-qadam: Build tekshiruvi
Write-Host "`n2. Frontend loyihasini tekshirish (Build)..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot\mathscore-frontend"
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build xatolik bilan yakunlandi! Push bekor qilindi."
    }
}
finally {
    Pop-Location
}

# 3-qadam: Git commit va push
Write-Host "`n3. Git orqali GitHub ga yuklash..." -ForegroundColor Yellow
git add .

$status = git status --porcelain
if (-not $status) {
    Write-Host "Hech qanday o'zgarish topilmadi. Deploy qilish shart emas." -ForegroundColor Green
    exit 0
}

if (-not $msg) {
    $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $msg = "Auto deploy: $now"
}

git commit -m "$msg"
Write-Host "Git commit amalga oshirildi: $msg" -ForegroundColor Cyan

Write-Host "`n4. GitHub ga push qilinmoqda..." -ForegroundColor Yellow
git push origin main

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "Muvaffaqiyatli GitHub ga yuborildi!" -ForegroundColor Green
Write-Host "Vercel avtomatik deploy qilmoqda: https://mathscore.uz" -ForegroundColor Green
Write-Host "Vercel holati: https://vercel.com/pm-termiz/mathscore-loyiha" -ForegroundColor Green
Write-Host "==================================================`n" -ForegroundColor Green
