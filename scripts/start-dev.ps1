$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "== Tech Calculus Hub - start dev server ==" -ForegroundColor Cyan
Write-Host "Project root: $ProjectRoot"
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js was not found in PATH." -ForegroundColor Red
  Write-Host "Install Node.js LTS from https://nodejs.org, reopen VS Code, and run this script again."
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm was not found in PATH." -ForegroundColor Red
  Write-Host "Reinstall Node.js LTS and keep the PATH option enabled."
  exit 1
}

if (-not (Test-Path "package.json")) {
  Write-Host "package.json was not found. Open the correct project folder in VS Code." -ForegroundColor Red
  Write-Host "Expected folder: $ProjectRoot"
  exit 1
}

if (-not (Test-Path "node_modules")) {
  Write-Host "node_modules not found. Installing dependencies with npm install..." -ForegroundColor Yellow
  & npm install
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

Write-Host ""
Write-Host "Starting Vite. Open http://localhost:8080" -ForegroundColor Green
Write-Host ""

& npm run dev
exit $LASTEXITCODE
