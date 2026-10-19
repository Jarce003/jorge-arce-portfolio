# JarceDev candidate review: keep existing WebGL2 on port 3000; start only the candidate.
# Existing worktrees, user edits, main and Vercel remain untouched.
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$parent = Join-Path $env:USERPROFILE "nodeJsProyects\Ejercicios python"
$repo = Join-Path $parent "jorge-arce-portfolio"
$lab = Join-Path $parent "jarcedev-review-blender-r3f"
$labBranch = "experiment/jarcedev-blender-r3f-pilot"

function Git-Checked([string[]]$GitArguments, [string]$Step) {
    & git @GitArguments
    if ($LASTEXITCODE -ne 0) { throw "Git error in $Step (exit $LASTEXITCODE)." }
}
function Ensure-Review([string]$Directory, [string]$Branch) {
    if (-not (Test-Path -LiteralPath $Directory)) {
        Git-Checked @("-C", $repo, "worktree", "add", "--detach", $Directory, "origin/$Branch") "create review directory"
        return
    }
    $existing = (& git -C $Directory rev-parse --show-toplevel 2>$null)
    if ($LASTEXITCODE -ne 0 -or -not $existing) { throw "Review directory is not a Git worktree: $Directory" }
    $normalized = [IO.Path]::GetFullPath(($existing | Select-Object -First 1).Trim()).TrimEnd('\')
    $expected = [IO.Path]::GetFullPath($Directory).TrimEnd('\')
    if (-not [string]::Equals($normalized, $expected, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Unexpected Git directory: $Directory"
    }
    $changes = @(& git -C $Directory status --porcelain)
    if ($LASTEXITCODE -ne 0 -or $changes.Count -gt 0) {
        throw "Uncommitted changes in the isolated review directory: $Directory. Nothing overwritten."
    }
    Git-Checked @("-C", $Directory, "checkout", "--detach", "origin/$Branch") "refresh review directory"
}
function Wait-Ready([string]$Url, [object]$Process, [string]$ErrorLog) {
    for ($attempt = 0; $attempt -lt 75; $attempt++) {
        if ($Process.HasExited) {
            $details = if (Test-Path $ErrorLog) { (Get-Content $ErrorLog -Tail 16) -join [Environment]::NewLine } else { "" }
            throw "Server exited for $Url. $details"
        }
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -eq 200) { return }
        } catch { }
        Start-Sleep -Seconds 1
    }
    $details = if (Test-Path $ErrorLog) { (Get-Content $ErrorLog -Tail 16) -join [Environment]::NewLine } else { "" }
    throw "Server not ready: $Url. $details"
}
try {
    if (-not (Test-Path $repo)) { throw "Base repository not found: $repo" }
    foreach ($app in @("git.exe", "node.exe", "npm.cmd")) {
        if (-not (Get-Command $app -ErrorAction SilentlyContinue)) { throw "Missing requirement: $app" }
    }
    $version = [version]((& node --version).Trim().TrimStart("v"))
    if ($version -lt [version]"22.12.0") { throw "Node 22.12+ required." }

    Write-Host "Preparando revision aislada. Tus carpetas actuales no se modifican." -ForegroundColor Cyan
    Git-Checked @("-C", $repo, "fetch", "origin", $labBranch) "fetch"
    Ensure-Review $lab $labBranch

    $modelDirectory = Join-Path $lab "public\models\jarcedev\v1"
    foreach ($name in @("ladder-truck.glb", "firetrack-station.glb", "evacuaplan-station.glb", "acreditaciones-station.glb", "hidrantes-station.glb")) {
        if (-not (Test-Path (Join-Path $modelDirectory $name))) { throw "Missing Blender model: $name" }
    }
    # Port 3000 belongs to the already-running WebGL2 portfolio.
    # Never stop, reuse, or start another process on that port.
    $candidatePort = $null
    foreach ($port in 3002..3020) {
        if (-not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) {
            $candidatePort = $port
            break
        }
    }
    if ($null -eq $candidatePort) { throw "No free preview port in 3002..3020." }

    $candidateNextBin = Join-Path $lab "node_modules\next\dist\bin\next"
    if (-not (Test-Path $candidateNextBin)) {
        Write-Host "Instalando dependencias del portafolio integrado..." -ForegroundColor Cyan
        Push-Location $lab
        try {
            & npm.cmd ci --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw "Next.js npm ci failed." }
        } finally { Pop-Location }
    }
    Write-Host "Preparando la experiencia 3D integrada..." -ForegroundColor Cyan
    Push-Location $lab
    try {
        & npm.cmd run build:experience
        if ($LASTEXITCODE -ne 0) { throw "3D experience build failed." }
    } finally { Pop-Location }

    $nodeExe = (Get-Command node.exe).Source
    $labOut = Join-Path $env:TEMP "jarcedev-review-final.stdout.log"
    $labErr = Join-Path $env:TEMP "jarcedev-review-final.stderr.log"
    Write-Host "Iniciando solo el candidato, sin abrir nuevas ventanas..." -ForegroundColor Cyan
    $labProcess = Start-Process -FilePath $nodeExe -WorkingDirectory $lab -ArgumentList ('"{0}" dev --hostname 127.0.0.1 -p {1}' -f $candidateNextBin, $candidatePort) -WindowStyle Hidden -PassThru -RedirectStandardOutput $labOut -RedirectStandardError $labErr

    $previewBase = "http://127.0.0.1:$candidatePort"
    Wait-Ready "$previewBase/es" $labProcess $labErr
    Wait-Ready "$previewBase/experience/index.html" $labProcess $labErr
    Write-Host ""
    Write-Host "LISTO. Abre en Chrome:" -ForegroundColor Green
    Write-Host "CANDIDATO BLENDER + R3F: $previewBase/es" -ForegroundColor Yellow
    Write-Host "WEBGL2 EXISTENTE:      http://127.0.0.1:3000/es (sin cambios)" -ForegroundColor Gray
    Write-Host "Para cerrar solo el candidato: Stop-Process -Id $($labProcess.Id)" -ForegroundColor DarkGray
    Write-Host "Ningun proceso del puerto 3000 fue modificado." -ForegroundColor DarkGray
    Write-Host "Sin cambios en main ni Vercel." -ForegroundColor DarkGray
} catch {
    Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
