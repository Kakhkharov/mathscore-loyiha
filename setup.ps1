$ErrorActionPreference = "Stop"

if (Test-Path "mathscore-frontend") {
    Remove-Item -Path "mathscore-frontend" -Recurse -Force
}

New-Item -ItemType Directory -Path "mathscore-frontend" | Out-Null
New-Item -ItemType Directory -Path "mathscore-frontend\src" | Out-Null
New-Item -ItemType Directory -Path "mathscore-frontend\src\admin" | Out-Null
New-Item -ItemType Directory -Path "mathscore-frontend\src\student" | Out-Null
New-Item -ItemType Directory -Path "mathscore-frontend\src\landing" | Out-Null
New-Item -ItemType Directory -Path "mathscore-frontend\public" | Out-Null

Copy-Item "mathscore-admin\package.json" "mathscore-frontend\"
Copy-Item "mathscore-admin\vite.config.js" "mathscore-frontend\"
Copy-Item "mathscore-admin\eslint.config.js" "mathscore-frontend\"
Copy-Item "mathscore-admin\index.html" "mathscore-frontend\"

Copy-Item "mathscore-admin\src\*" "mathscore-frontend\src\admin\" -Recurse
Copy-Item "mathscore-student\src\*" "mathscore-frontend\src\student\" -Recurse
Copy-Item "mathscore-landing\src\*" "mathscore-frontend\src\landing\" -Recurse

if (Test-Path "mathscore-admin\public") { Copy-Item "mathscore-admin\public\*" "mathscore-frontend\public\" -Recurse -ErrorAction SilentlyContinue }
if (Test-Path "mathscore-student\public") { Copy-Item "mathscore-student\public\*" "mathscore-frontend\public\" -Recurse -ErrorAction SilentlyContinue }
if (Test-Path "mathscore-landing\public") { Copy-Item "mathscore-landing\public\*" "mathscore-frontend\public\" -Recurse -ErrorAction SilentlyContinue }

Write-Output "Files copied successfully."
