# JarceDev — Laboratorio Blender + React Three Fiber

**Estado: experimental y local.** No sustituye el mundo WebGL2 fluido de JarceDev 3.0 y no debe desplegarse en Vercel.

## Qué muestra

Una **estación FireTrack** y un camión escalera americano original con conducción, cámara trasera/aérea, día/noche, luces rojas, llamas, agua en gotas instanciadas, salpicaduras y el panel del proyecto. Incluye FPS aproximados y draw calls. Es arte de juego, **no una simulación real de extinción**.

Se puede alternar entre:
- **Geometría básica:** funciona inmediatamente cuando se instala R3F.
- **Modelos GLB:** solo se habilita cuando Blender haya creado los dos archivos.

Comparación local: mundo actual en `http://localhost:3000/es` y laboratorio en `http://localhost:4174`.

## Primer uso desde Windows

Con tu proyecto Git limpio y el servidor anterior de la prueba detenido o abierto en otro PowerShell:

```powershell
$ErrorActionPreference = 'Stop'
$repo = 'C:\Users\jarce\nodeJsProyects\Ejercicios python\jorge-arce-portfolio'
Set-Location -LiteralPath $repo
if (git status --porcelain) { throw 'Revisa los cambios locales antes de continuar.' }
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Falló git fetch' }
git switch experiment/jarcedev-blender-r3f-pilot
if ($LASTEXITCODE -ne 0) { throw 'Falló git switch' }
git pull --ff-only origin experiment/jarcedev-blender-r3f-pilot
if ($LASTEXITCODE -ne 0) { throw 'Falló git pull' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\scripts\pilot-3d-local.ps1'
```

El script busca Blender (opcional), genera activos si lo encuentra, instala dependencias **solo en experiments/r3f**, valida TypeScript, compila y deja el servidor escuchando exclusivamente en 127.0.0.1:4174. No abre el navegador. No ejecuta npm ci en la app Next.js ni modifica Vercel.

La primera instalación crea `experiments/r3f/package-lock.json` localmente. Revísalo antes de cualquier commit. Para pruebas posteriores puedes usar:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\scripts\pilot-3d-local.ps1' -SkipInstall
```

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

- Solo se reproduce FireTrack; no es una migración.
- Los GLB todavía deben generarse y revisarse localmente mediante Blender.
- No hay simulación física de agua o incendios; se utilizan formas/partículas instanciadas.
- FPS y draw calls son indicadores aproximados, no comparación homogénea con WebGL2.
- El experimento tiene dependencias y compilación separadas para no afectar a Next.js ni al código de producción.
