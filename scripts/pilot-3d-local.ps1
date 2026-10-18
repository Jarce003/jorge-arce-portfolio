param(
  [switch]$SkipInstall,
  [switch]$SkipBlender,
  [switch]$NoServer,
  [int]$Port = 4174
)

# Dedicated R3F/Blender pilot: no git mutations, no Vercel, no production.
# Requires Windows PowerShell 5.1+ and Node.js 22.12+. Blender 4+ optional.
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Checked([string]$Name, [scriptblock]$Task) {
  Write-Host ""
  Write-Host "==> $Name" -ForegroundColor Cyan
  & $Task
  if ($LASTEXITCODE -ne 0) {
    throw "$Name fallo (codigo $LASTEXITCODE)."
  }
}

function Find-Blender {
  $command = Get-Command blender.exe -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  $base = Join-Path $env:ProgramFiles "Blender Foundation"
  if (Test-Path -LiteralPath $base) {
    $found = Get-ChildItem -LiteralPath $base -Filter blender.exe -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { return $found.FullName }
  }
  return $null
}

try {
  $root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  $experiment = Join-Path $root "experiments\r3f"
  $models = Join-Path $root "public\models\jarcedev\v1"
  $generator = Join-Path $root "tools\blender\build_assets.py"

  Write-Host "JarceDev — Laboratorio Blender + React Three Fiber" -ForegroundColor Green
  Write-Host "Este procedimiento solo crea y ejecuta recursos LOCALES." -ForegroundColor DarkGray
  Set-Location -LiteralPath $root

  $branch = (& git branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0 -or $branch -ne "experiment/jarcedev-blender-r3f-pilot") {
    throw "Cambia primero a la rama experiment/jarcedev-blender-r3f-pilot."
  }

  $node = (& node --version).Trim()
  if ($LASTEXITCODE -ne 0) { throw "Node.js no esta disponible." }
  $version = [version]($node.TrimStart("v"))
  if ($version -lt [version]"22.12.0") {
    throw "Necesitas Node.js 22.12 o superior; encontrado: $node"
  }
  Write-Host "Node: $node" -ForegroundColor Green

  if (-not $SkipBlender) {
    $blender = Find-Blender
    if ($blender) {
      Write-Host "Blender encontrado: $blender" -ForegroundColor Green
      Checked "Generar camion y estacion FireTrack GLB en Blender" {
        & $blender --background --factory-startup --python $generator -- --output $models
      }
    } else {
      Write-Warning "Blender no esta instalado o accesible. La escena 3D funcionara con geometria basica."
      Write-Host "Para generar los GLB instala Blender 4+ y vuelve a ejecutar este script." -ForegroundColor Yellow
    }
  } else {
    Write-Host "Se omite Blender por solicitud." -ForegroundColor DarkGray
  }

  $truckGLB = Join-Path $models "ladder-truck.glb"
  $stationGLB = Join-Path $models "firetrack-station.glb"
  if ((Test-Path -LiteralPath $truckGLB) -and (Test-Path -LiteralPath $stationGLB)) {
    Checked "Validar tamaño, materiales y estructura animable de los dos GLB" {
      & node (Join-Path $root "tools\blender\verify_glb.mjs") $truckGLB $stationGLB
    }
  } else {
    Write-Host "No hay dos GLB todavía. Se utilizaran los modelos geometricos del laboratorio." -ForegroundColor Yellow
  }

  Set-Location -LiteralPath $experiment
  if ($SkipInstall) {
    if (-not (Test-Path -LiteralPath (Join-Path $experiment "node_modules\vite"))) {
      throw "No hay dependencias del laboratorio. Ejecuta sin -SkipInstall la primera vez."
    }
  } else {
    Checked "Instalar dependencias aisladas de R3F (sin modificar Next.js)" {
      npm.cmd install --no-audit --no-fund
    }
  }
  Checked "Validar TypeScript y compilar el laboratorio R3F" {
    npm.cmd run build
  }

  Write-Host ""
  Write-Host "Laboratorio compilado correctamente." -ForegroundColor Green
  if ($NoServer) { exit 0 }

  $portInUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if ($portInUse) {
    throw "Puerto $Port ocupado. Deten el servidor anterior con Ctrl+C y repite."
  }
  Write-Host "Version actual: http://localhost:3000/es" -ForegroundColor Gray
  Write-Host "Prueba React Three Fiber: http://localhost:$Port" -ForegroundColor Green
  Write-Host "Ningun navegador se abrira automaticamente. Ctrl+C detiene este servidor." -ForegroundColor Gray
  Checked "Iniciar laboratorio en 127.0.0.1" {
    npm.cmd run dev -- --port $Port
  }
} catch {
  Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
  exit 1
}
