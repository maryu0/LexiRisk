# LexiRisk - Service Health Check Script
# Run this script to verify all services are running correctly

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  LexiRisk Service Health Check" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Function to test URL
function Test-Service {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Port
    )
    
    Write-Host "Testing $Name..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " [OK] RUNNING" -ForegroundColor Green
            Write-Host "    URL: $Url" -ForegroundColor Gray
            return $true
        }
    } catch {
        Write-Host " [X] NOT RUNNING" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Function to check port
function Test-Port {
    param (
        [string]$Name,
        [int]$Port
    )
    
    $listening = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
    if ($listening) {
        Write-Host "    Port $Port is listening (PID: $($listening.OwningProcess))" -ForegroundColor Gray
        return $true
    } else {
        Write-Host "    Port $Port is NOT listening" -ForegroundColor Red
        return $false
    }
}

# Check ML Service (Port 8000)
Write-Host "1. ML Service (FastAPI/Python)" -ForegroundColor Yellow
$mlRunning = Test-Service -Name "ML API" -Url "http://localhost:8000/api/health" -Port "8000"
if (-not $mlRunning) {
    Test-Port -Name "ML Service" -Port 8000
    Write-Host "  -> Fix: cd ml_service; python server.py" -ForegroundColor Cyan
}
Write-Host ""

# Check Backend (Port 5000)
Write-Host "2. Backend (Node.js/Express)" -ForegroundColor Yellow
$backendRunning = Test-Service -Name "Backend API" -Url "http://localhost:5000/api/health" -Port "5000"
if (-not $backendRunning) {
    Test-Port -Name "Backend" -Port 5000
    Write-Host "  -> Fix: cd backend; npm run dev" -ForegroundColor Cyan
}
Write-Host ""

# Check Frontend (Port 5173)
Write-Host "3. Frontend (React/Vite)" -ForegroundColor Yellow
$frontendRunning = Test-Service -Name "Frontend" -Url "http://localhost:5173" -Port "5173"
if (-not $frontendRunning) {
    Test-Port -Name "Frontend" -Port 5173
    Write-Host "  -> Fix: cd frontend; npm run dev" -ForegroundColor Cyan
}
Write-Host ""

# Check ML Models
Write-Host "4. ML Models" -ForegroundColor Yellow
Write-Host "Checking trained models..." -NoNewline
$modelsPath = "ml_service\models\classification_pipeline.pkl"
if (Test-Path $modelsPath) {
    Write-Host " [OK] EXIST" -ForegroundColor Green
    Write-Host "    Path: $modelsPath" -ForegroundColor Gray
} else {
    Write-Host " [X] NOT FOUND" -ForegroundColor Red
    Write-Host "  -> Fix: cd ml_service; python data_generator.py; python -m src.train" -ForegroundColor Cyan
}
Write-Host ""

# Summary
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host ""

$allRunning = $mlRunning -and $backendRunning -and $frontendRunning

if ($allRunning) {
    Write-Host "[OK] All services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the application at: http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Host "[X] Some services are not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Quick Fix: Run this command to start all services:" -ForegroundColor Yellow
    Write-Host "  .\start-all.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "For detailed logs, check each service terminal window." -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan
