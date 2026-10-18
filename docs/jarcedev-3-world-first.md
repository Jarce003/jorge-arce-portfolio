# JarceDev 3.0 — Arquitectura world-first

Estado: **implementado en rama de desarrollo**. No constituye aprobación de publicación ni validación visual en dispositivos reales.

## Principio de diseño

Al entrar, el visitante ve el **mundo tridimensional y un camión escalera americano**. Las estaciones representan soluciones reales. Leer es opcional: se puede conducir, seleccionar un proyecto, explorar una imagen y abrir un breve panel. La versión HTML accesible y las fichas compartibles están disponibles fuera del canvas.

En lugar de repetir secciones extensas de "servicios", "proceso", "sobre mí" y "casos", el contenido se reduce a:

1. **Problema** — una frase.
2. **Solución** — una frase.
3. **Previsualización** — una ilustración normalizada.
4. **Acción** — interactuar, contactar o compartir el enlace.

Acreditaciones conserva una **demo visual de su asistente**, con datos ficticios y límites explícitos. No conecta a fuentes privadas ni simula acceso a una API de IA real.

## Fuente única y rutas

| Archivo | Propósito |
|---|---|
| \`src/content/projects.ts\` | Catálogo único de proyectos, traducciones, colores, coordenadas, tipo de edificio y assets |
| \`src/components/projects/project-panel.tsx\` | Panel reutilizable en mundo 3D, galería y URL compartible |
| \`src/components/portfolio/compact-portfolio.tsx\` | Alternativa HTML corta y accesible, con selección interactiva |
| \`src/app/[lang]/projects/[slug]/page.tsx\` | Ficha breve SEO, generada automáticamente para cada proyecto |
| \`src/app/sitemap.ts\` | Rutas ES/EN derivadas de la lista de proyectos |
| \`src/components/world/world-experience.tsx\` | Controles, selección, contacto, cámara, iluminación y conducción |
| \`src/components/world/world-contract.ts\` | Contrato neutral para sustituir el motor en el futuro |
| \`src/components/world/world-renderer.ts\` | Motor WebGL2 actual, con estaciones configurables y día/noche |
| \`public/projects/previews/*.svg\` | Cuatro ilustraciones originales, todas con viewBox 1200×720 |
| \`scripts/check-projects.mjs\` | Prueba de unicidad de proyectos, estaciones, locales, imágenes y límites de mapa |

## Para añadir el quinto proyecto

1. Crea una imagen vectorial de **1200 × 720**, guárdala en \`public/projects/previews/<slug>.svg\`, evitando información privada.
2. Agrega una entrada en \`projectDefinitions\` con \`slug\` único, textos \`es/en\`, color, imagen y tecnologías reales.
3. Define el bloque \`station\` con identificador único, \`x,z\` (dentro del límite actualmente conducible ±23) y \`structure\`. Los tipos existentes son \`academy\`, \`operations\`, \`design-studio\`, \`mapping-hub\` y \`generic\`.
4. Para un edificio nuevo y personalizado, agrega un \`StructureType\` y su implementación a \`drawStation\`. Si no necesita ser único, usa \`generic\`: el mundo crea automáticamente una estructura básica.
5. Ejecuta \`npm run check:projects\`, \`npx tsc --noEmit\`, \`npm run build\`.
6. Inspecciona la vista móvil y la navegación por teclado antes de publicar.

La misma entrada aparece en las tarjetas, estación, panel, URL compartible y sitemap. No se editan textos en múltiples lugares.

### Limitación actual del mapa

El escenario base está diseñado para una plaza y cuatro barrios; añadir estaciones fuera del perímetro o demasiadas estaciones requiere ampliar el trazado de carreteras, la cámara, el límite de conducción y las pruebas. El catálogo es extensible; **la expansión ilimitada del terreno no está implementada**.

## Juego visual: incendios y rescates

- Cada estación aparece con llamas estilizadas mientras no haya sido descubierta.
- Cuando el camión se acerca y se pulsa **Descubrir** (o **E**), se detiene y lanza un arco animado de agua desde el extremo de la escalera hacia el edificio, con salpicaduras; las llamas se apagan progresivamente y se abre la ficha visual del proyecto.
- El recorrido conserva un contador de estaciones recuperadas; **R** o **Reiniciar rescate** restablecen el recorrido y los incendios.
- Para accesibilidad, los visitantes también pueden seleccionar una estación en el directorio; si hace falta, el camión se coloca junto al proyecto antes de la animación.
- Los usuarios con **reducir movimiento** activado ven el proyecto sin fuego animado ni descarga de agua. La interacción no requiere audio.
- Es una metáfora de juego, **no una demostración de tácticas reales de extinción** ni de efectividad de chorros de agua. Las pruebas automatizadas verifican los tiempos y estados; la apariencia y fluidez aún deben revisarse en el navegador móvil.

## Día y noche

- Control visual y tecla **N** para cambiar ambiente.
- El WebGL2 actual interpola color de cielo, niebla y luz ambiental; cambian tonos de pavimento y vegetación.
- Las farolas se destacan en modo nocturno. Las luces del camión se controlan por separado con **L**.
- La iluminación es un sistema **estilizado**, no un motor físico de sombras o PBR. No atribuir sombras realistas al prototipo.
- Se respeta \`prefers-reduced-motion\`, con transiciones de iluminación reducidas.

## Evaluación de tecnologías

### Mantener inmediatamente
**Next.js + React + TypeScript + Tailwind** y el renderizador WebGL2 actual: conserva compatibilidad con los controles táctiles, un coste gráfico moderado y cero dependencias 3D extra. La estructura mejorada ya lo utiliza.

### React Three Fiber v9 + Three.js + Drei — siguiente iteración gráfica
Compatible con React 19; candidatos a migración cuando añadamos modelos glTF/GLB, materiales PBR, sombras reales y escenas con cámaras múltiples. El contrato \`world-contract.ts\` separa el motor de la lógica funcional.

No agregar paquetes sin actualizar y validar \`package-lock.json\`. Migrar una estación y el camión primero en una **rama experimental**, comparar FPS y memoria en móvil; cambiar el motor principal solo si el resultado es mejor. Evitar renderizar continuamente cuando el vehículo esté detenido si el nuevo motor admite \`frameloop="demand"\`.

Documentación: https://r3f.docs.pmnd.rs/getting-started/installation y https://r3f.docs.pmnd.rs/advanced/scaling-performance

### Blender + Python — pipeline de activos, no backend
Crear modelos originales de edificios, camión, farolas y señalización, con materiales PBR y exportación a \`.glb\`. Python puede automatizar escenas en Blender mediante \`bpy\`, fuera del tiempo de ejecución del sitio. Entregar varios niveles de detalle y limitar texturas para teléfonos.

### Herramientas de IA 3D (opcionales)
**Meshy** puede explorar propuestas de edificios y exportar GLB para revisión en Blender. Antes de publicar, validar topología, número de polígonos, licencia comercial, ausencia de marcas de terceros y consistencia de la dirección artística. No incorporar la IA al navegador para servir modelos en tiempo real.

https://www.meshy.ai/features/text-to-3d/

### No introducir por introducir
No necesitamos Python, DuckDB ni un LLM alojado dentro de este portafolio: esas herramientas tienen valor en Acreditaciones, no en representar el mundo 3D. Tampoco se justifica agregar Zustand o GSAP mientras el estado actual y las transiciones de CSS sean manejables.

## Calidad antes de fusionar

- [x] Cuatro ilustraciones nuevas de dimensiones normalizadas.
- [x] Una fuente de verdad para textos ES/EN y posiciones.
- [x] Fichas breves y panel compartido.
- [x] Día/noche, camionera y luz de emergencia existentes.
- [x] Contacto guiado disponible desde el mundo.
- [x] Verificación automatizada de catálogo, encoding, tipos y build.
- [ ] Revisar visualmente los cuatro escenarios de día y de noche.
- [ ] Probar conducción simultánea y paneles en Android/iOS.
- [ ] Medir FPS, carga, accesibilidad y enlaces con herramientas de navegador.
- [ ] Aprobar la vista previa antes de tocar \`main\`.
