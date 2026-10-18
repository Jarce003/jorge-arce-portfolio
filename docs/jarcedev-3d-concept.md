# JarceDev — Concepto 3D y arquitectura propuesta

> **Estado actualizado (octubre 2026):** ya existe un prototipo 3D funcional en una rama de desarrollo. Se puede conducir el camión escalera y explorar cuatro estaciones, pero **no es la versión artística final ni se ha publicado en main**. El lanzamiento requiere revisión de diseño, jugabilidad, rendimiento y accesibilidad.

## Posicionamiento

Jorge Arce es Ingeniero en Sistemas enfocado en descubrir oportunidades de mejora, definir soluciones, coordinar su implementación con IA y validar resultados. No se atribuye autoría manual de código generado por IA.

La experiencia 3D debe comunicar **cómo identifica y resuelve problemas**, no presentarlo incorrectamente como especialista en gráficos WebGL ni como alguien que programa manualmente.

## Concepto: La ciudad de las soluciones

Un mundo tridimensional en miniatura con una identidad original y reconocible. El visitante conduce un **camión escalera de estilo americano** (American Aerial Ladder Truck) por zonas que representan retos operativos reales. La cabina, el cuerpo largo, los compartimentos y la escalera aérea forman parte del modelo propio, sin emblemas ni marcas de terceros. Cada estación cuenta una historia **antes / decisión / resultado**.

- **Inicio — Observar:** una escena de trabajo con formularios, archivos dispersos y tareas repetitivas. El camión escalera inicia aquí y permite descubrir dónde surge una oportunidad de mejora.
- **FireTrack — Control y trazabilidad:** inventario, inspección, QR, alertas y control por empresas representados mediante objetos y paneles.
- **EvacuaPlan Studio — Herramientas especializadas:** un edificio estilizado cuyo plano puede explorarse visualmente; después, acceso a la demo real.
- **Acreditaciones — Reglas y planificación:** una academia abstracta con tarjetas de bloques, ciclos, prioridades y motor analítico Python. Solo datos ficticios.
- **Hidrantes — Información geográfica:** zona opcional para una fase posterior, sin inventar estado de publicación.
- **Contacto — Empezar un proyecto:** acceso claro, también permanente desde navegación HTML.

Evitar la estética de una ciudad exclusivamente bomberil: la metáfora debe funcionar para procesos empresariales de cualquier industria.

## Interacción

1. Entrada con contenido HTML accesible, propuesta de valor y botones **Explorar en 3D** y **Ver proyectos directamente**.
2. Carga diferida del mundo tras selección explícita y detección de capacidades gráficas.
3. Navegación con teclado (WASD/flechas), mandos táctiles y punteros; interacción por proximidad o clic.
4. Estaciones muestran tarjetas HTML semánticas con problemas, decisiones, alcance y enlaces a estudios completos.
5. Mapa de navegación y botones siempre visibles para saltar a cualquier proyecto sin conducir.
6. Botón para pausar, silenciar y salir del modo 3D; respeta reduced motion.
7. Desactivación automática a vista 2D accesible en dispositivos sin soporte o de bajo rendimiento.

## Tecnología recomendada

- Next.js 16 + React 19 existentes; TypeScript, Tailwind CSS.
- Three.js y React Three Fiber v9 para composición del mundo.
- @react-three/drei para utilidades, control de cámara y GLTF según necesidades.
- Conducción mediante cinemática propia en la etapa inicial, suficiente para el camión escalera y recorridos guiados. @react-three/rapier quedaría para una etapa de física avanzada si el comportamiento lo justifica.
- Blender para diseñar objetos originales exportados a glTF/GLB; primero usar primitivas geométricas antes de producir activos costosos.
- Zustand para estado de juego y elección de estación **solo cuando la complejidad lo exija**.
- Howler.js para sonido opcional y accesible. Sin autoplay.
- Motion o GSAP solamente para transiciones de interfaz/cámara donde se justifique.
- Vercel Preview, Playwright para recorridos funcionales, axe-core para accesibilidad y Lighthouse para medir rendimiento.

No incorporar Python, bases de datos o llamadas a servicios de IA en la experiencia pública sin un caso de uso claro.

## Rendimiento, seguridad y accesibilidad

- Contenido profesional, proyectos y contacto disponibles en HTML; SEO y navegación no dependen del canvas.
- La carga 3D ocurre bajo demanda. Evitar modelos pesados y aplicar LOD, instancing y compresión donde aporte valor.
- Limitar sombras, píxeles renderizados y efectos según dispositivo; monitorizar FPS sin añadir telemetría intrusiva.
- Probar en móvil real de gama media, tablet y escritorio, con teclado y táctil.
- Respetar prefers-reduced-motion, alternativas sin 3D y foco/lectores de pantalla.
- No exponer información privada de las aplicaciones ni datos personales de participantes.
- No copiar modelos, sonidos, logotipos ni composición artística de Bruno Simon; inspiración en la interacción, no clonación del trabajo.

## Estado del prototipo inicial

- Motor WebGL2 propio para perspectiva, iluminación básica, terreno, edificios y estaciones.
- Camión escalera estadounidense original con ruedas orientadas, tres ejes, compartimentos, cabina y escalera.
- Controles táctiles y teclado, cambio de cámara y etiquetas flotantes de estaciones.
- Acceso a proyectos mediante botones, casos de estudio y alternativa HTML.
- Se mantienen builds automatizados en GitHub Actions y Vercel Preview.

**Pendiente:** modelos y texturas artísticas finales, iluminación más avanzada, colisiones robustas, pulido móvil y pruebas visuales en dispositivos reales. La arquitectura puede evolucionar hacia Three.js / React Three Fiber si supera en mantenibilidad y calidad al prototipo WebGL actual.

## Entregas propuestas

### Etapa A — Dirección creativa
Moodboard, paleta, guion del mundo, navegación HTML alternativa, zonas y reglas de interacción.

### Etapa B — Prototipo aislado
Ruta de laboratorio o feature flag, mundo original con un camión escalera estadounidense (cabina + escalera), 2 estaciones, controles móviles y navegación HTML completa.

### Etapa C — Mundo y portafolio
Activos propios, casos de estudio integrados, estaciones restantes, transiciones, sonido opcional y acciones de contacto.

### Etapa D — Calidad y lanzamiento
Pruebas de rendimiento/accesibilidad/funcionalidad, correcciones, vista 2D y aprobación expresa antes de integrar en main.

## Criterios de aceptación

- Puede entenderse quién es Jorge y qué aporta sin entrar al mundo.
- Los proyectos y contacto son accesibles en menos pasos que el recorrido opcional.
- El mundo ilustra **problema → decisión → solución**, no solo una estética llamativa.
- El vehículo es inequívocamente un **camión escalera americano**, no un automóvil genérico.
- Ningún texto atribuye programación manual de código generado por IA.
- El recorrido funciona con táctil y teclado; incluye controles para detener movimiento y audio.
- No aparecen registros reales ni secretos de los proyectos privados.
- La rama main no cambia hasta revisión de contenido y aprobación explícita.
