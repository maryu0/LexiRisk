# LexiRisk - Start All Services
# This script starts all three services: Frontend, Backend, and ML Service

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LexiRisk - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Function to check if a port is in use
function Test-Port {
    param($port)
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Check if ports are already in use
Write-Host "Checking ports..." -ForegroundColor Yellow
$portsInUse = @()
if (Test-Port 5000) { $portsInUse += "5000 (Backend)" }
if (Test-Port 5173) { $portsInUse += "5173 (Frontend)" }
if (Test-Port 8000) { $portsInUse += "8000 (ML Service)" }

if ($portsInUse.Count -gt 0) {
    Write-Host "Warning: The following ports are already in use:" -ForegroundColor Yellow
    $portsInUse | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne "y") {
        Write-Host "Aborted." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Start ML Service
Write-Host "[1/3] Starting ML Service (Port 8000)..." -ForegroundColor Green
Write-Host "  Location: ml_service/" -ForegroundColor Gray
Write-Host "  Command: python server.py" -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ml_service'; Write-Host '=== ML Service ===' -ForegroundColor Cyan; python server.py"
Start-Sleep -Seconds 2

# Start Backend
Write-Host ""
Write-Host "[2/3] Starting Backend (Port 5000)..." -ForegroundColor Green
Write-Host "  Location: backend/" -ForegroundColor Gray
Write-Host "  Command: npm start" -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '=== Backend Server ===' -ForegroundColor Cyan; npm start"
Start-Sleep -Seconds 2

# Start Frontend
Write-Host ""
Write-Host "[3/3] Starting Frontend (Port 5173)..." -ForegroundColor Green
Write-Host "  Location: frontend/" -ForegroundColor Gray
Write-Host "  Command: npm run dev" -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '=== Frontend Dev Server ===' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the application:" -ForegroundColor Yellow
Write-Host "  Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:    http://localhost:5000" -ForegroundColor White
Write-Host "  ML Service: http://localhost:8000" -ForegroundColor White
Write-Host "  ML Docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Each service is running in a separate window." -ForegroundColor Gray
Write-Host "Close the windows to stop the services." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
