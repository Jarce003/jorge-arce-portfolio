# JarceDev — Laboratorio Blender + React Three Fiber

**Estado: experimental y local.** No sustituye el mundo WebGL2 fluido de JarceDev 3.0 y no debe desplegarse en Vercel.

## Qué muestra

Las **cuatro estaciones del catálogo principal** (FireTrack, EvacuaPlan, Acreditaciones e Hidrantes), además de un camión escalera americano original, con conducción, cámara trasera/aérea, día/noche, balizas rojas, incendios por estación, agua instanciada y fichas compactas. Acreditaciones conserva acceso a su demostración IA en la versión WebGL principal. Se muestran FPS aproximados y draw calls. Es arte de juego, **no una simulación real de extinción**.

Se puede alternar entre:
- **Geometría básica:** funciona inmediatamente cuando se instala R3F.
- **Modelos GLB:** solo se habilita cuando Blender haya creado los dos archivos.

Comparación local: mundo actual en `http://localhost:3000/es` y laboratorio en `http://localhost:4174`.

## Primer uso desde Windows — dos carpetas independientes

**No cambies de rama en la carpeta estable**: mientras pruebas React Three Fiber, conserva JarceDev 3.0 funcionando en `localhost:3000`. Crea una segunda carpeta mediante `git worktree`, que reutiliza el mismo repositorio Git pero mantiene archivos, paquetes y compilaciones independientes:

```powershell
$ErrorActionPreference = 'Stop'
$stable = 'C:\Users\jarce\nodeJsProyects\Ejercicios python\jorge-arce-portfolio'
$lab = 'C:\Users\jarce\nodeJsProyects\Ejercicios python\jorge-arce-portfolio-r3f'
Set-Location -LiteralPath $stable

git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Falló git fetch' }

if (-not (Test-Path -LiteralPath $lab)) {
    $branch = 'experiment/jarcedev-blender-r3f-pilot'
    git show-ref --verify --quiet "refs/heads/$branch"
    if ($LASTEXITCODE -eq 0) {
        git worktree add "$lab" "$branch"
    } else {
        git worktree add -b "$branch" "$lab" "origin/$branch"
    }
    if ($LASTEXITCODE -ne 0) { throw 'Falló git worktree add' }
} else {
    $actual = (& git -C "$lab" rev-parse --show-toplevel).Trim()
    if ($LASTEXITCODE -ne 0 -or $actual -ne $lab) {
        throw 'La carpeta del laboratorio existe pero no es el worktree esperado.'
    }
    git -C "$lab" pull --ff-only origin experiment/jarcedev-blender-r3f-pilot
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo actualizar la carpeta R3F.' }
}

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$lab\scripts\pilot-3d-local.ps1"
```

El script detecta Blender (opcional), crea los GLB si está disponible, instala dependencias **solo en `jorge-arce-portfolio-r3f\experiments\r3f`**, valida TypeScript y levanta Vite en `127.0.0.1:4174`. No abre el navegador, no despliega ni modifica la carpeta principal.

En el primer uso, npm crea `experiments/r3f/package-lock.json` solo en el laboratorio. Para futuras pruebas añade `-SkipInstall` a su script si no han cambiado las dependencias.

## Blender 4+ / 5+

Si Blender está disponible, el script ejecuta:

```powershell
blender --background --factory-startup --python tools/blender/build_assets.py
```

Y genera:
- `public/models/jarcedev/v1/ladder-truck.glb` — camión original, seis ruedas agrupadas, escalera extensible, pivot y boquilla
- `public/models/jarcedev/v1/firetrack-station.glb` — garaje operativo con tres portones, paneles y detalles de techo
- `tools/blender/output/jarcedev-assets.blend` — archivo editable con ambas piezas

Sin Blender instalado, el laboratorio puede mostrarse mediante geometría básica. El generador usa materiales y mallas originales, sin insignias protegidas, datos privados ni servicios de IA. El exportador debe validarse en Blender real; ChatGPT no ha podido ejecutarlo en el equipo del usuario.

## Controles

| Entrada | Acción |
|---|---|
| W/↑, S/↓ | Avanzar / retroceder |
| A/←, D/→ | Girar |
| E / Descubrir | Lanzar agua y recuperar la estación |
| C | Cambiar cámara |
| N | Día/noche |
| L | Luces rojas |
| R | Reiniciar rescate |

Botones táctiles mantienen dirección y aceleración simultáneas. Con reducir movimiento activado, se omite la secuencia animada.

## ¿Cuándo migrar el mundo principal?

Solo si el nuevo prototipo se ve **claramente mejor** y conserva la fluidez aprobada en Windows y teléfono. Compararemos el mismo hardware, conducción recta y giros, cámara, agua, tiempos de carga, FPS y memoria. Objetivo orientativo: 50–60 FPS en escritorio y ≥30 FPS sostenidos en móviles de gama media.

Se deben completar las cuatro estaciones usando el catálogo compartido y conservar una ruta de retorno a WebGL2. No basta con compilar: hacen falta revisión visual y ensayos táctiles.

### Limitaciones de esta etapa

- Las cuatro estaciones están disponibles, pero esta sigue siendo una rama experimental aislada, no una migración.
- Los GLB todavía deben generarse y revisarse localmente mediante Blender.
- No hay simulación física de agua o incendios; se utilizan formas/partículas instanciadas.
- FPS y draw calls son indicadores aproximados, no comparación homogénea con WebGL2.
- El experimento tiene dependencias y compilación separadas para no afectar a Next.js ni al código de producción.

## Versión candidata con cuatro estructuras (2026-10-18)

La versión **WebGL2** en la rama `feature/jarcedev-world-first-v3` es el producto principal: conserva exactamente la conducción, agua y luces aprobadas, y ya contiene las cuatro estructuras temáticas con recorte de detalle móvil. Este laboratorio tiene los cinco modelos Blender exportados (camión + cuatro estructuras), una escena R3F con esas cuatro estaciones, navegación táctil, descubrir/extinguir y un panel compartido por proyecto mediante `src/content/projects.ts`. Solo se considerará integrar R3F si la **única comparación local** demuestra una mejora visual y de rendimiento frente a WebGL2. No se despliega a Vercel durante las pruebas.
