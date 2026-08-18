<#
.SYNOPSIS
    PhytoVaria SIH Demo Launcher
.DESCRIPTION
    Starts both the FastAPI backend and Vite frontend for local demonstration.
    Make sure you have run `pip install -r requirements.txt` in genomic-backend
    and `npm install` in phytovaria-frontend/phytovaria-frontend first.
#>

$ErrorActionPreference = "Stop"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   PhytoVaria SIH Demo Launcher" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

$baseDir = $PSScriptRoot
$backendDir = Join-Path $baseDir "genomic-backend"
$frontendDir = Join-Path $baseDir "phytovaria-frontend\phytovaria-frontend"

# Check if directories exist
if (-not (Test-Path $backendDir)) {
    Write-Error "Backend directory not found at $backendDir"
}
if (-not (Test-Path $frontendDir)) {
    Write-Error "Frontend directory not found at $frontendDir"
}

Write-Host "`n[1/2] Starting FastAPI Backend on port 8001..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "uvicorn" -ArgumentList "app.main:app", "--port", "8001", "--reload" -WorkingDirectory $backendDir -PassThru -NoNewWindow
Start-Sleep -Seconds 3

Write-Host "`n[2/2] Starting React Frontend on port 5175..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $frontendDir -PassThru -NoNewWindow
Start-Sleep -Seconds 3

Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "   System is LIVE!" -ForegroundColor Green
Write-Host "   Backend API: http://localhost:8001" -ForegroundColor Green
Write-Host "   Frontend UI: http://localhost:5175" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop both servers." -ForegroundColor Gray

try {
    # Keep script running to hold process handles
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nStopping servers..." -ForegroundColor Yellow
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Done." -ForegroundColor Green
}
