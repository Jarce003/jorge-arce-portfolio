# JarceDev visual review: two isolated Git worktrees, one VS Code terminal.
# Existing worktrees, user edits, main and Vercel remain untouched.
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$parent = Join-Path $env:USERPROFILE "nodeJsProyects\Ejercicios python"
$repo = Join-Path $parent "jorge-arce-portfolio"
$web = Join-Path $parent "jarcedev-review-webgl2"
$lab = Join-Path $parent "jarcedev-review-blender-r3f"
$webBranch = "feature/jarcedev-world-first-v3"
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
    Git-Checked @("-C", $repo, "fetch", "origin", $webBranch, $labBranch) "fetch"
    Ensure-Review $web $webBranch
    Ensure-Review $lab $labBranch

    $modelDirectory = Join-Path $lab "public\models\jarcedev\v1"
    foreach ($name in @("ladder-truck.glb", "firetrack-station.glb", "evacuaplan-station.glb", "acreditaciones-station.glb", "hidrantes-station.glb")) {
        if (-not (Test-Path (Join-Path $modelDirectory $name))) { throw "Missing Blender model: $name" }
    }
    foreach ($port in @(3000, 3001)) {
        if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
            throw "Port $port already in use. Stop the other server using this port."
        }
    }

    $nextBin = Join-Path $web "node_modules\next\dist\bin\next"
    if (-not (Test-Path $nextBin)) {
        Write-Host "Instalando dependencias WebGL2..." -ForegroundColor Cyan
        Push-Location $web
        try {
            & npm.cmd ci --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw "WebGL2 npm ci failed." }
        } finally { Pop-Location }
    }
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
    $webOut = Join-Path $env:TEMP "jarcedev-review-webgl2.stdout.log"
    $webErr = Join-Path $env:TEMP "jarcedev-review-webgl2.stderr.log"
    $labOut = Join-Path $env:TEMP "jarcedev-review-final.stdout.log"
    $labErr = Join-Path $env:TEMP "jarcedev-review-final.stderr.log"
    Write-Host "Iniciando portafolio final y referencia WebGL2 sin nuevas ventanas..." -ForegroundColor Cyan
    $webProcess = Start-Process -FilePath $nodeExe -WorkingDirectory $web -ArgumentList ('"{0}" dev --hostname 127.0.0.1 -p 3001' -f $nextBin) -WindowStyle Hidden -PassThru -RedirectStandardOutput $webOut -RedirectStandardError $webErr
    $labProcess = Start-Process -FilePath $nodeExe -WorkingDirectory $lab -ArgumentList ('"{0}" dev --hostname 127.0.0.1 -p 3000' -f $candidateNextBin) -WindowStyle Hidden -PassThru -RedirectStandardOutput $labOut -RedirectStandardError $labErr

    Wait-Ready "http://127.0.0.1:3000/es" $labProcess $labErr
    Wait-Ready "http://127.0.0.1:3001/es" $webProcess $webErr
    Wait-Ready "http://127.0.0.1:3000/experience/index.html" $labProcess $labErr
    Write-Host ""
    Write-Host "LISTO. Abre en Chrome:" -ForegroundColor Green
    Write-Host "CANDIDATO FINAL: http://127.0.0.1:3000/es" -ForegroundColor Yellow
    Write-Host "WEBGL2 ANTERIOR: http://127.0.0.1:3001/es" -ForegroundColor Gray
    Write-Host "Para cerrar: Stop-Process -Id $($webProcess.Id),$($labProcess.Id)" -ForegroundColor DarkGray
    Write-Host "Sin modificar main, tus cambios locales o Vercel." -ForegroundColor DarkGray
} catch {
    Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
