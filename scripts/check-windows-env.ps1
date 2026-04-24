$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "== Tech Calculus Hub - Windows environment check ==" -ForegroundColor Cyan
Write-Host "Project root: $ProjectRoot"
Write-Host ""

$requiredFiles = @(
  "package.json",
  "vite.config.ts",
  "tsconfig.json",
  "tsconfig.app.json",
  "tailwind.config.ts",
  "postcss.config.js"
)

foreach ($file in $requiredFiles) {
  if (Test-Path $file) {
    Write-Host "[OK] $file" -ForegroundColor Green
  } else {
    Write-Host "[MISSING] $file" -ForegroundColor Red
  }
}

Write-Host ""

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$npmCommand = Get-Command npm -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
  Write-Host "[MISSING] node was not found in PATH." -ForegroundColor Red
  Write-Host "Install Node.js LTS from https://nodejs.org, then reopen VS Code."
  exit 1
}

if (-not $npmCommand) {
  Write-Host "[MISSING] npm was not found in PATH." -ForegroundColor Red
  Write-Host "npm is installed with Node.js. Reinstall Node.js LTS and enable PATH."
  exit 1
}

Write-Host "[OK] node: $(& node -v)" -ForegroundColor Green
Write-Host "[OK] npm:  $(& npm -v)" -ForegroundColor Green
Write-Host ""

$package = Get-Content "package.json" -Raw | ConvertFrom-Json
$requiredScripts = @("dev", "build", "preview", "lint")

foreach ($script in $requiredScripts) {
  if ($package.scripts.PSObject.Properties.Name -contains $script) {
    Write-Host "[OK] npm run $script -> $($package.scripts.$script)" -ForegroundColor Green
  } else {
    Write-Host "[MISSING] npm script '$script'" -ForegroundColor Red
  }
}

Write-Host ""

if (Test-Path "package-lock.json") {
  Write-Host "[OK] package-lock.json found. Recommended package manager: npm." -ForegroundColor Green
} elseif (Test-Path "bun.lock") {
  Write-Host "[INFO] bun.lock found. Bun can work, but npm is recommended for this Windows guide." -ForegroundColor Yellow
} else {
  Write-Host "[INFO] No lockfile found. npm install will generate one." -ForegroundColor Yellow
}

if (Test-Path "node_modules") {
  Write-Host "[OK] node_modules exists." -ForegroundColor Green
} else {
  Write-Host "[INFO] node_modules not found. Run: npm install" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next commands:" -ForegroundColor Cyan
Write-Host "  npm install"
Write-Host "  npm run dev"
Write-Host "  npm run build"
Write-Host ""
