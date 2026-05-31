$projects = @(
    @{ path = "mathscore-backend"; cmd = "npm install && node server.js" },
    @{ path = "mathscore-landing-backend"; cmd = "npm install && node server.js" },
    @{ path = "mathscore-admin"; cmd = "npm install && npm run dev" },
    @{ path = "mathscore-student"; cmd = "npm install && npm run dev" },
    @{ path = "mathscore-landing"; cmd = "npm install && npm run dev" }
)

foreach ($p in $projects) {
    Write-Host "Starting $($p.path)..."
    Start-Process cmd -ArgumentList "/k", "cd `"$($p.path)`" && $($p.cmd)"
}
