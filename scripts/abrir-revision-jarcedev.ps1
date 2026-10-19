# One-command JarceDev side-by-side review; Windows PowerShell 5.1.
# Uses existing Git branches and checked-in GLBs; does not modify main or launch a browser.
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$parent = Join-Path $env:USERPROFILE "nodeJsProyects\Ejercicios python"
$repository = Join-Path $parent "jorge-arce-portfolio"
$webBranch = "feature/jarcedev-world-first-v3"
$labBranch = "experiment/jarcedev-blender-r3f-pilot"
$lab = Join-Path $parent "jorge-arce-portfolio-r3f"

function Git-Checked([string[]]$Args, [string]$Label) {
    & git @Args
    if ($LASTEXITCODE -ne 0) { throw "Git: $Label failed (exit $LASTEXITCODE)." }
}
function Check-Worktree([string]$Directory, [string]$Expected) {
    if (-not (Test-Path -LiteralPath $Directory)) { throw "Missing directory: $Directory" }
    $actual = (& git -C $Directory branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0 -or $actual -ne $Expected) {
        throw "Unexpected branch in $Directory. Expected $Expected, got $actual. Nothing changed."
    }
    $changes = @(& git -C $Directory status --porcelain)
    if ($LASTEXITCODE -ne 0) { throw "Could not inspect Git status: $Directory" }
    if ($changes.Count -gt 0) {
        throw "Uncommitted files in $Directory. Nothing overwritten. Save them before running review."
    }
}
function Ensure-Worktree([string]$Directory, [string]$Branch) {
    if (-not (Test-Path -LiteralPath $Directory)) {
        & git -C $repository show-ref --verify --quiet ("refs/heads/" + $Branch)
        if ($LASTEXITCODE -eq 0) {
            Git-Checked @("-C", $repository, "worktree", "add", $Directory, $Branch) "create worktree"
        } else {
            Git-Checked @("-C", $repository, "worktree", "add", "-b", $Branch, $Directory, ("origin/" + $Branch)) "create worktree"
        }
    }
    Check-Worktree $Directory $Branch
    Git-Checked @("-C", $Directory, "pull", "--ff-only", "origin", $Branch) "update worktree"
}
try {
    if (-not (Test-Path -LiteralPath $repository)) { throw "Base repository missing: $repository" }
    foreach ($app in @("git.exe", "node.exe", "npm.cmd")) {
        if (-not (Get-Command $app -ErrorAction SilentlyContinue)) { throw "Missing prerequisite: $app" }
    }
    $nodeVersion = (& node --version).TrimStart("v")
    if ([version]$nodeVersion -lt [version]"22.12.0") { throw "Node 22.12+ required." }
    Write-Host "Updating review branches..." -ForegroundColor Cyan
    Git-Checked @("-C", $repository, "fetch", "origin", $webBranch, $labBranch) "fetch"
    $current = (& git -C $repository branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0) { throw "Unable to read current branch." }
    $web = $repository
    if ($current -ne $webBranch) { $web = Join-Path $parent "jorge-arce-portfolio-webgl2-review" }
    Ensure-Worktree $web $webBranch
    Ensure-Worktree $lab $labBranch
    $modelDir = Join-Path $lab "public\models\jarcedev\v1"
    foreach ($file in @("ladder-truck.glb", "firetrack-station.glb", "evacuaplan-station.glb", "acreditaciones-station.glb", "hidrantes-station.glb")) {
        if (-not (Test-Path -LiteralPath (Join-Path $modelDir $file))) { throw "Missing GLB: $file" }
    }
    foreach ($port in @(3000, 4174)) {
        $busy = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($busy) { throw "Port $port occupied. Close previous server terminal and retry." }
    }
    if (-not (Test-Path -LiteralPath (Join-Path $web "node_modules\next"))) {
        Push-Location $web
        try {
            & npm.cmd ci --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw "WebGL2 dependency installation failed." }
        } finally { Pop-Location }
    }
    $labScene = Join-Path $lab "experiments\r3f"
    if (-not (Test-Path -LiteralPath (Join-Path $labScene "node_modules\vite"))) {
        Push-Location $labScene
        try {
            & npm.cmd install --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw "R3F dependency installation failed." }
        } finally { Pop-Location }
    }
    Start-Process -FilePath "cmd.exe" -WorkingDirectory $web -ArgumentList @("/k", "npm.cmd run dev -- -p 3000")
    Start-Process -FilePath "cmd.exe" -WorkingDirectory $labScene -ArgumentList @("/k", "npm.cmd run dev -- --host 127.0.0.1 --port 4174 --strictPort")
    Write-Host ""
    Write-Host "WEBGL2:       http://localhost:3000/es" -ForegroundColor Yellow
    Write-Host "BLENDER/R3F:  http://127.0.0.1:4174" -ForegroundColor Yellow
    Write-Host "Open both links manually after server terminals show Ready." -ForegroundColor Gray
    Write-Host "No changes to main or Vercel." -ForegroundColor Gray
} catch {
    Write-Host ("REVIEW ERROR: " + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
