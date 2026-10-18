param(
  [switch]$NoServer,
  [int]$Port = 3000
)

# JarceDev local-only production-equivalent validation.
# This script DOES NOT pull, commit, push, deploy, or open the browser.
# Windows PowerShell 5.1 / PowerShell 7 compatible.
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-Checked([string]$Title, [scriptblock]$Action) {
  Write-Host ""
  Write-Host ("==> " + $Title) -ForegroundColor Cyan
  & $Action
  if ($LASTEXITCODE -ne 0) {
    throw ("Fallo: " + $Title + ". Codigo de salida: " + $LASTEXITCODE)
  }
}

try {
  $root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  Set-Location -LiteralPath $root
  Write-Host "JarceDev 3.0 - validacion LOCAL (sin Vercel)" -ForegroundColor Green
  Write-Host ("Carpeta: " + $root)
  $expectedBranch = "feature/jarcedev-world-first-v3"
  $branchName = (& git branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0) { throw "No se pudo consultar la rama Git." }
  if ($branchName -ne $expectedBranch) {
    throw ("Rama incorrecta: " + $branchName + ". Cambia primero a " + $expectedBranch)
  }
  Write-Host ("Rama correcta: " + $branchName) -ForegroundColor Green

  $status = & git status --porcelain
  if ($LASTEXITCODE -ne 0) { throw "No se pudo consultar el estado Git." }
  if ($status) {
    Write-Host $status
    throw "Hay archivos locales modificados o sin seguimiento. Revisa y conserva esos cambios antes de validar."
  }

  $nodeVersion = (& node --version).Trim()
  if ($LASTEXITCODE -ne 0) { throw "Node.js no esta disponible." }
  $nodeMajor = [int]($nodeVersion -replace '^v(\d+).*','$1')
  if ($nodeMajor -lt 22) { throw ("Se requiere Node.js 22 o superior. Encontrado: " + $nodeVersion) }
  Write-Host ("Node.js " + $nodeVersion) -ForegroundColor Green

  Invoke-Checked "Instalar dependencias exactas" { npm.cmd ci }
  Invoke-Checked "Verificar codificacion" { npm.cmd run check:encoding }
  Invoke-Checked "Verificar catalogo e ilustraciones" { npm.cmd run check:projects }

  $pythonRunner = Get-Command py -ErrorAction SilentlyContinue
  if ($pythonRunner) {
    Invoke-Checked "Verificar XML de todas las ilustraciones SVG" { py -3 scripts/check-svg-xml.py }
  } elseif (Get-Command python -ErrorAction SilentlyContinue) {
    Invoke-Checked "Verificar XML de todas las ilustraciones SVG" { python scripts/check-svg-xml.py }
  } else {
    Write-Warning "No hay Python en PATH; la prueba XML completa se ejecuta de todos modos en GitHub Actions."
  }

  Invoke-Checked "Validar TypeScript" { npx.cmd tsc --noEmit }
  Invoke-Checked "Compilar version de produccion" { npm.cmd run build }
  Write-Host ""
  Write-Host "RESULTADO: Todas las pruebas locales pasaron." -ForegroundColor Green

  if ($NoServer) {
    Write-Host "Se solicito -NoServer. No se iniciara el servidor."
    exit 0
  }

  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $connect = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    if ($connect.AsyncWaitHandle.WaitOne(250) -and $client.Connected) {
      throw ("Puerto " + $Port + " ocupado. Deten el servidor anterior con Ctrl+C y repite.")
    }
  } finally {
    $client.Close()
  }

  Write-Host ""
  Write-Host ("Servidor: http://localhost:" + $Port + "/es") -ForegroundColor Yellow
  Write-Host ("Proyectos: http://localhost:" + $Port + "/es/portfolio") -ForegroundColor Yellow
  Write-Host ("Imagen FireTrack: http://localhost:" + $Port + "/projects/previews/firetrack.svg") -ForegroundColor Yellow
  Write-Host "No se abrira ningun navegador automaticamente. Ctrl+C detiene el servidor." -ForegroundColor DarkGray
  Invoke-Checked "Iniciar servidor local optimizado" { npm.cmd run start -- -p $Port }
} catch {
  Write-Host ""
  Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
  exit 1
}
