param(
  [string]$ModelZip = "$env:USERPROFILE\Downloads\JarceDev_5_Modelos_Blender.zip"
)

# One side-by-side validation. Never pushes, merges or deploys.
# Windows PowerShell 5.1-safe ASCII only.
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$parent = Join-Path $env:USERPROFILE "nodeJsProyects\Ejercicios python"
$stable = Join-Path $parent "jorge-arce-portfolio"
$lab = Join-Path $parent "jorge-arce-portfolio-r3f"
$labScene = Join-Path $lab "experiments\r3f"

function RunStep([string]$Name, [scriptblock]$Action) {
  Write-Host ""
  Write-Host ("==> " + $Name) -ForegroundColor Cyan
  & $Action
  if ($LASTEXITCODE -ne 0) { throw ($Name + " failed. Exit: " + $LASTEXITCODE) }
}

function RequireCleanTracked([string]$Directory, [string]$Branch) {
  if (-not (Test-Path -LiteralPath $Directory)) {
    throw ("Missing folder: " + $Directory)
  }
  $name = (& git -C $Directory branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0 -or $name -ne $Branch) {
    throw ("Unexpected branch in " + $Directory + ": " + $name)
  }
  & git -C $Directory diff --quiet
  if ($LASTEXITCODE -ne 0) { throw ("Uncommitted changes in: " + $Directory) }
  & git -C $Directory diff --cached --quiet
  if ($LASTEXITCODE -ne 0) { throw ("Staged changes in: " + $Directory) }
}

try {
  RequireCleanTracked $stable "feature/jarcedev-world-first-v3"
  RequireCleanTracked $lab "experiment/jarcedev-blender-r3f-pilot"
  if (-not (Test-Path -LiteralPath $ModelZip)) {
    throw ("Missing five-model ZIP: " + $ModelZip + ". Save it to Downloads.")
  }
  foreach ($port in @(3000,4174)) {
    $active = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($active) {
      throw ("Port " + $port + " busy. Stop previous server with Ctrl+C.")
    }
  }
  RunStep "Update stable feature branch" {
    & git -C $stable pull --ff-only origin feature/jarcedev-world-first-v3
  }
  RunStep "Update isolated R3F branch" {
    & git -C $lab pull --ff-only origin experiment/jarcedev-blender-r3f-pilot
  }
  RunStep "Validate WebGL2 world and production build" {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $stable "scripts\validate-local.ps1") -SkipInstall -NoServer
  }
  RunStep "Validate five Blender models and R3F build" {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $lab "scripts\pilot-3d-local.ps1") -SkipInstall -SkipBlender -NoServer -ModelZip $ModelZip
  }

  Write-Host ""
  Write-Host "Both versions passed local checks." -ForegroundColor Green
  Start-Process -FilePath "powershell.exe" -WorkingDirectory $stable -ArgumentList '-NoProfile -NoExit -Command "npm.cmd run start -- -p 3000"'
  Start-Process -FilePath "powershell.exe" -WorkingDirectory $labScene -ArgumentList '-NoProfile -NoExit -Command "npm.cmd run dev -- --port 4174"'
  Write-Host ""
  Write-Host "Main candidate:  http://localhost:3000/es" -ForegroundColor Yellow
  Write-Host "Blender + R3F:   http://127.0.0.1:4174" -ForegroundColor Yellow
  Write-Host "Both LOCAL. No browser opened, no push, no Vercel." -ForegroundColor DarkGray
} catch {
  Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
  exit 1
}
