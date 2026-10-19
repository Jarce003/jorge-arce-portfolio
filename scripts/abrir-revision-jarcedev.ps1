# JarceDev review: run finished Three Fiber candidate in Vite without Turbopack.
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

    Write-Host "Preparando el candidato 3D sin modificar las carpetas anteriores." -ForegroundColor Cyan
    Git-Checked @("-C", $repo, "fetch", "origin", $labBranch) "fetch"

    # Never force-clean or overwrite the previous review folder. Reuse a
    # separate, commit-specific worktree so generated files cannot block the
    # approved candidate and previously edited files are preserved.
    $oldLab = $lab
    $revision = (& git -C $repo rev-parse "origin/$labBranch").Trim()
    if ($LASTEXITCODE -ne 0 -or $revision.Length -lt 10) {
        throw "No se pudo resolver la revision experimental."
    }
    $lab = Join-Path $parent ("jarcedev-candidato-" + $revision.Substring(0, 10))
    if (-not (Test-Path -LiteralPath $lab)) {
        Git-Checked @("-C", $repo, "worktree", "add", "--detach", $lab, $revision) "create independent candidate"
    } else {
        $existingRevision = (& git -C $lab rev-parse HEAD).Trim()
        if ($LASTEXITCODE -ne 0 -or $existingRevision -ne $revision) {
            throw "El directorio de candidato ya existe con otra revision. No se modifico."
        }
        Write-Host "Reutilizando el candidato aislado de esta revision." -ForegroundColor Cyan
    }

    $modelDirectory = Join-Path $lab "public\models\jarcedev\v1"
    foreach ($name in @("ladder-truck.glb", "firetrack-station.glb", "evacuaplan-station.glb", "acreditaciones-station.glb", "hidrantes-station.glb")) {
        if (-not (Test-Path (Join-Path $modelDirectory $name))) { throw "Missing Blender model: $name" }
    }
    # Use 3000 when available, as requested. Do not stop an existing server;
    # fall back to another free port if 3000 becomes occupied.
    $candidatePort = $null
    foreach ($port in (@(3000) + @(3002..3020))) {
        if (-not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) {
            $candidatePort = $port
            break
        }
    }
    if ($null -eq $candidatePort) { throw "No hay puerto libre entre 3000 y 3020." }

    # Vite serves the exact React Three Fiber candidate directly. Avoid
    # Turbopack; only start the Vite server on a currently free port.
    $scene = Join-Path $lab "experiments\r3f"
    $sharedDeps = Join-Path $env:LOCALAPPDATA "JarceDev\r3f-deps"
    $sharedModules = Join-Path $sharedDeps "node_modules"
    $viteBin = Join-Path $scene "node_modules\vite\bin\vite.js"
    $tailwindPlugin = Join-Path $scene "node_modules\@tailwindcss\vite\package.json"

    # Reuse dependencies across ALL review revisions. Installing in the
    # deeply nested worktree caused Windows tar/file-write failures.
    $packageSrc = Join-Path $scene "package.json"
    $packageCache = Join-Path $sharedDeps "package.json"
    $needsDeps = -not (Test-Path -LiteralPath (Join-Path $sharedModules "vite\bin\vite.js")) -or
                 -not (Test-Path -LiteralPath (Join-Path $sharedModules "@tailwindcss\vite\package.json"))
    if (-not $needsDeps -and (Test-Path -LiteralPath $packageCache)) {
        $needsDeps = (Get-Content -LiteralPath $packageSrc -Raw) -ne
                     (Get-Content -LiteralPath $packageCache -Raw)
    }
    if ($needsDeps) {
        New-Item -ItemType Directory -Path $sharedDeps -Force | Out-Null
        Copy-Item -LiteralPath $packageSrc -Destination $packageCache -Force
        Write-Host "Preparando dependencias compartidas en una ruta corta de Windows..." -ForegroundColor Cyan
        Push-Location $sharedDeps
        try {
            & npm.cmd install --no-package-lock --no-audit --no-fund --prefer-offline
            if ($LASTEXITCODE -ne 0) { throw "Fallo npm en carpeta compartida: $sharedDeps" }
        } finally { Pop-Location }
    } else {
        Write-Host "Dependencias 3D compartidas ya listas; sin reinstalacion." -ForegroundColor Green
    }

    $newModules = Join-Path $scene "node_modules"
    if (-not (Test-Path -LiteralPath $newModules)) {
        New-Item -ItemType Junction -Path $newModules -Target $sharedModules -ErrorAction Stop | Out-Null
    } elseif (-not (Test-Path -LiteralPath $viteBin) -or -not (Test-Path -LiteralPath $tailwindPlugin)) {
        # Preserve any partial installation rather than deleting user files.
        $savedModules = Join-Path $scene ("node_modules-parcial-" + (Get-Date -Format "yyyyMMddHHmmss"))
        Rename-Item -LiteralPath $newModules -NewName (Split-Path $savedModules -Leaf) -ErrorAction Stop
        New-Item -ItemType Junction -Path $newModules -Target $sharedModules -ErrorAction Stop | Out-Null
        Write-Host "Instalacion parcial anterior preservada; dependencias reutilizadas." -ForegroundColor Green
    }
    if (-not (Test-Path -LiteralPath $viteBin) -or -not (Test-Path -LiteralPath $tailwindPlugin)) {
        throw "No se pudieron vincular las dependencias 3D compartidas."
    }

    $nodeExe = (Get-Command node.exe).Source
    $labOut = Join-Path $env:TEMP ("jarcedev-vite-" + $candidatePort + ".stdout.log")
    $labErr = Join-Path $env:TEMP ("jarcedev-vite-" + $candidatePort + ".stderr.log")
    Write-Host "Iniciando la version 3D sin Turbopack ni ventanas adicionales..." -ForegroundColor Cyan
    $labProcess = Start-Process -FilePath $nodeExe -WorkingDirectory $scene -ArgumentList ('"{0}" --host 127.0.0.1 --port {1} --strictPort' -f $viteBin, $candidatePort) -WindowStyle Hidden -PassThru -RedirectStandardOutput $labOut -RedirectStandardError $labErr
    $previewBase = "http://127.0.0.1:$candidatePort"
    Wait-Ready "$previewBase/" $labProcess $labErr
    Wait-Ready "$previewBase/models/jarcedev/v1/firetrack-station.glb" $labProcess $labErr

    Write-Host ""
    Write-Host "LISTO. Abre en Chrome:" -ForegroundColor Green
    Write-Host "CANDIDATO 3D:  $previewBase/" -ForegroundColor Yellow
    Write-Host "Referencia web: https://www.jarcedev.com/es" -ForegroundColor Gray
    Write-Host "Para cerrar solo el candidato: Stop-Process -Id $($labProcess.Id)" -ForegroundColor DarkGray
    Write-Host "No se inicio Turbopack ni se cerraron otros servidores." -ForegroundColor DarkGray
    Write-Host "Sin cambios en main ni Vercel." -ForegroundColor DarkGray
} catch {
    Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
